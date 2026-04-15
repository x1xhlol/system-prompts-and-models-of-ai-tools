"""
Autonomous Pipeline Engine — The Brain of Dealix
=================================================
State machine that automatically moves leads through the full sales pipeline:

Lead → Qualify → Score → Outreach → Meeting → Prepare → Close → Post-Sale

Features:
- Event-driven state transitions
- Parallel agent execution
- Retry with exponential backoff
- Metrics logging per stage
- Automatic escalation
"""

import asyncio
import time
import logging
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional
from dataclasses import dataclass, field

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.agents.router import AgentRouter, ExecutionMode
from app.services.agents.executor import AgentExecutor, AgentResult

logger = logging.getLogger("dealix.pipeline")


class PipelineStage(str, Enum):
    """The autonomous sales pipeline stages."""
    NEW = "new"
    QUALIFYING = "qualifying"
    QUALIFIED = "qualified"
    OUTREACH = "outreach"
    MEETING_SCHEDULED = "meeting_scheduled"
    MEETING_PREP = "meeting_prep"
    NEGOTIATION = "negotiation"
    CLOSING = "closing"
    WON = "won"
    LOST = "lost"
    NURTURING = "nurturing"


# ── Stage Transition Rules ────────────────────────

STAGE_TRANSITIONS: dict[PipelineStage, dict] = {
    PipelineStage.NEW: {
        "event": "pipeline_lead_new",
        "auto_advance": True,
        "next_stage_rules": {
            "score >= 80": PipelineStage.QUALIFIED,
            "score >= 40": PipelineStage.OUTREACH,
            "score < 40": PipelineStage.NURTURING,
        },
        "timeout_hours": 1,
        "fallback_stage": PipelineStage.NURTURING,
    },
    PipelineStage.QUALIFYING: {
        "event": "lead_score_updated",
        "auto_advance": True,
        "next_stage_rules": {
            "score >= 70": PipelineStage.QUALIFIED,
            "score < 70": PipelineStage.OUTREACH,
        },
        "timeout_hours": 24,
        "fallback_stage": PipelineStage.NURTURING,
    },
    PipelineStage.QUALIFIED: {
        "event": "pipeline_lead_qualified",
        "auto_advance": True,
        "next_stage_rules": {
            "meeting_booked": PipelineStage.MEETING_SCHEDULED,
            "default": PipelineStage.OUTREACH,
        },
        "timeout_hours": 48,
        "fallback_stage": PipelineStage.OUTREACH,
    },
    PipelineStage.OUTREACH: {
        "event": "whatsapp_outbound",
        "auto_advance": False,  # Wait for client response
        "next_stage_rules": {
            "positive_response": PipelineStage.MEETING_SCHEDULED,
            "objection": PipelineStage.NEGOTIATION,
            "no_response_7d": PipelineStage.NURTURING,
        },
        "timeout_hours": 168,  # 7 days
        "fallback_stage": PipelineStage.NURTURING,
    },
    PipelineStage.MEETING_SCHEDULED: {
        "event": "pipeline_meeting_prep",
        "auto_advance": True,
        "next_stage_rules": {
            "meeting_completed": PipelineStage.NEGOTIATION,
            "meeting_cancelled": PipelineStage.OUTREACH,
        },
        "timeout_hours": 72,
        "fallback_stage": PipelineStage.OUTREACH,
    },
    PipelineStage.NEGOTIATION: {
        "event": "objection_detected",
        "auto_advance": False,
        "next_stage_rules": {
            "ready_to_close": PipelineStage.CLOSING,
            "needs_proposal": PipelineStage.MEETING_PREP,
            "lost_interest": PipelineStage.LOST,
        },
        "timeout_hours": 336,  # 14 days
        "fallback_stage": PipelineStage.NURTURING,
    },
    PipelineStage.CLOSING: {
        "event": "pipeline_closing",
        "auto_advance": False,
        "next_stage_rules": {
            "deal_signed": PipelineStage.WON,
            "deal_rejected": PipelineStage.LOST,
        },
        "timeout_hours": 168,
        "fallback_stage": PipelineStage.NEGOTIATION,
    },
}


@dataclass
class PipelineExecution:
    """Tracks a single pipeline run for a lead."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    lead_id: str = ""
    tenant_id: str = ""
    current_stage: PipelineStage = PipelineStage.NEW
    started_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    stage_history: list[dict] = field(default_factory=list)
    agent_results: list[dict] = field(default_factory=list)
    total_tokens_used: int = 0
    total_latency_ms: int = 0
    status: str = "running"  # running, completed, stalled, error


class AutonomousPipeline:
    """
    The autonomous sales pipeline engine.
    Orchestrates agents through the full lead lifecycle.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.router = AgentRouter()
        self.executor = AgentExecutor(db)

    async def process_new_lead(self, tenant_id: str, lead_data: dict) -> dict:
        """
        Main entry point: Process a new lead through the full autonomous pipeline.
        This is where the magic happens.
        """
        execution = PipelineExecution(
            lead_id=lead_data.get("lead_id", str(uuid.uuid4())),
            tenant_id=tenant_id,
        )

        logger.info(
            f"🚀 Pipeline started for lead {execution.lead_id} "
            f"(tenant: {tenant_id})"
        )

        try:
            # Stage 1: Qualify the lead
            qualification_result = await self._execute_stage(
                execution, PipelineStage.NEW, lead_data
            )

            # Determine next stage based on qualification score
            score = self._extract_score(qualification_result)
            lead_data["qualification_score"] = score

            if score >= 80:
                # Hot lead → fast track to outreach + meeting
                next_stage = PipelineStage.QUALIFIED
            elif score >= 40:
                # Warm lead → outreach sequence
                next_stage = PipelineStage.OUTREACH
            else:
                # Cold lead → nurturing
                next_stage = PipelineStage.NURTURING
                execution.status = "completed"
                execution.current_stage = PipelineStage.NURTURING
                self._log_stage_transition(execution, PipelineStage.NEW, next_stage, score)
                return self._build_result(execution, lead_data)

            self._log_stage_transition(execution, PipelineStage.NEW, next_stage, score)

            # Stage 2: Execute qualified/outreach stage
            stage_result = await self._execute_stage(
                execution, next_stage, lead_data
            )

            # If qualified, attempt to book meeting
            if next_stage == PipelineStage.QUALIFIED and stage_result:
                meeting_booked = self._check_meeting_booked(stage_result)
                if meeting_booked:
                    self._log_stage_transition(
                        execution, PipelineStage.QUALIFIED,
                        PipelineStage.MEETING_SCHEDULED, score
                    )
                    # Stage 3: Meeting preparation
                    await self._execute_stage(
                        execution, PipelineStage.MEETING_SCHEDULED, lead_data
                    )

            execution.status = "completed"
            logger.info(
                f"✅ Pipeline completed for lead {execution.lead_id}: "
                f"stage={execution.current_stage.value}, "
                f"tokens={execution.total_tokens_used}, "
                f"latency={execution.total_latency_ms}ms"
            )

        except Exception as e:
            execution.status = "error"
            logger.error(f"❌ Pipeline error for lead {execution.lead_id}: {e}")

        return self._build_result(execution, lead_data)

    async def advance_stage(
        self, tenant_id: str, lead_id: str,
        current_stage: str, trigger: str, context: dict = None
    ) -> dict:
        """
        Manually advance a lead to the next stage based on a trigger.
        Used for events that can't be auto-detected (e.g., meeting completed).
        """
        try:
            stage = PipelineStage(current_stage)
        except ValueError:
            return {"error": f"Invalid stage: {current_stage}"}

        transition = STAGE_TRANSITIONS.get(stage)
        if not transition:
            return {"error": f"No transitions defined for stage: {current_stage}"}

        next_stage_rules = transition.get("next_stage_rules", {})
        next_stage = next_stage_rules.get(trigger)

        if not next_stage:
            next_stage = next_stage_rules.get("default", transition.get("fallback_stage"))

        if not next_stage:
            return {"error": f"No next stage for trigger: {trigger}"}

        execution = PipelineExecution(
            lead_id=lead_id,
            tenant_id=tenant_id,
            current_stage=next_stage,
        )

        input_data = {
            "lead_id": lead_id,
            "previous_stage": current_stage,
            "trigger": trigger,
            **(context or {}),
        }

        result = await self._execute_stage(execution, next_stage, input_data)

        return {
            "lead_id": lead_id,
            "previous_stage": current_stage,
            "new_stage": next_stage.value if isinstance(next_stage, PipelineStage) else str(next_stage),
            "trigger": trigger,
            "agent_results": execution.agent_results,
            "tokens_used": execution.total_tokens_used,
        }

    async def _execute_stage(
        self, execution: PipelineExecution,
        stage: PipelineStage, input_data: dict
    ) -> list[AgentResult]:
        """Execute all agents for a pipeline stage."""
        transition = STAGE_TRANSITIONS.get(stage, {})
        event_type = transition.get("event") if isinstance(transition, dict) else None

        if not event_type:
            logger.warning(f"No event mapped for stage {stage}")
            return []

        execution.current_stage = stage

        # Get execution mode
        exec_mode = self.router.get_execution_mode(event_type)

        if exec_mode == ExecutionMode.PARALLEL:
            results = await self._execute_parallel(event_type, input_data, execution)
        else:
            results = await self._execute_sequential(event_type, input_data, execution)

        return results

    async def _execute_sequential(
        self, event_type: str, input_data: dict, execution: PipelineExecution
    ) -> list[AgentResult]:
        """Execute agents sequentially (output chains into next)."""
        results = []
        agent_configs = self.router.get_agents_config_for_event(event_type)

        for agent_cfg in agent_configs:
            try:
                result = await asyncio.wait_for(
                    self.executor.execute(
                        agent_type=agent_cfg.agent_id,
                        input_data=input_data,
                        tenant_id=execution.tenant_id,
                        lead_id=execution.lead_id,
                    ),
                    timeout=agent_cfg.timeout_seconds,
                )

                results.append(result)
                execution.agent_results.append(result.to_dict())
                execution.total_tokens_used += result.tokens_used
                execution.total_latency_ms += result.latency_ms

                # Chain output as input for next agent
                if result.output and isinstance(result.output, dict):
                    input_data = {**input_data, f"{agent_cfg.agent_id}_result": result.output}

                # Stop chain on escalation
                if result.escalation and result.escalation.get("needed"):
                    logger.info(f"Chain stopped at {agent_cfg.agent_id} — escalation needed")
                    break

                # Stop chain on critical failure for required agents
                if result.status == "error" and agent_cfg.required:
                    logger.error(f"Required agent {agent_cfg.agent_id} failed, stopping chain")
                    break

            except asyncio.TimeoutError:
                logger.warning(f"Agent {agent_cfg.agent_id} timed out after {agent_cfg.timeout_seconds}s")
                if agent_cfg.required:
                    break
            except Exception as e:
                logger.error(f"Agent {agent_cfg.agent_id} error: {e}")
                if agent_cfg.required:
                    break

        return results

    async def _execute_parallel(
        self, event_type: str, input_data: dict, execution: PipelineExecution
    ) -> list[AgentResult]:
        """Execute agents in parallel (fire simultaneously)."""
        agent_configs = self.router.get_agents_config_for_event(event_type)

        async def _run_agent(agent_cfg):
            try:
                return await asyncio.wait_for(
                    self.executor.execute(
                        agent_type=agent_cfg.agent_id,
                        input_data=input_data,
                        tenant_id=execution.tenant_id,
                        lead_id=execution.lead_id,
                    ),
                    timeout=agent_cfg.timeout_seconds,
                )
            except asyncio.TimeoutError:
                logger.warning(f"Parallel agent {agent_cfg.agent_id} timed out")
                return AgentResult(
                    agent_type=agent_cfg.agent_id,
                    output={"error": "timeout"},
                    status="error",
                )
            except Exception as e:
                logger.error(f"Parallel agent {agent_cfg.agent_id} error: {e}")
                return AgentResult(
                    agent_type=agent_cfg.agent_id,
                    output={"error": str(e)},
                    status="error",
                )

        tasks = [_run_agent(cfg) for cfg in agent_configs]
        results = await asyncio.gather(*tasks, return_exceptions=False)

        for result in results:
            execution.agent_results.append(result.to_dict())
            execution.total_tokens_used += result.tokens_used
            execution.total_latency_ms += result.latency_ms

        return list(results)

    # ── Helpers ───────────────────────────────────

    def _extract_score(self, results: list) -> int:
        """Extract qualification score from agent results."""
        if not results:
            return 0
        for result in results:
            if hasattr(result, "output") and isinstance(result.output, dict):
                score = result.output.get("score", 0)
                if isinstance(score, (int, float)):
                    return int(score)
        return 0

    def _check_meeting_booked(self, results: list) -> bool:
        """Check if a meeting was booked in the results."""
        if not results:
            return False
        for result in results:
            if hasattr(result, "output") and isinstance(result.output, dict):
                meeting = result.output.get("meeting_booked", {})
                if isinstance(meeting, dict) and meeting.get("confirmed"):
                    return True
                # Check actions
                if hasattr(result, "actions"):
                    for action in result.actions:
                        if action.get("type") == "create_meeting":
                            return True
        return False

    def _log_stage_transition(
        self, execution: PipelineExecution,
        from_stage: PipelineStage, to_stage: PipelineStage,
        score: int = 0
    ):
        """Log a stage transition."""
        execution.stage_history.append({
            "from": from_stage.value,
            "to": to_stage.value if isinstance(to_stage, PipelineStage) else str(to_stage),
            "score": score,
            "timestamp": datetime.utcnow().isoformat(),
        })

    def _build_result(self, execution: PipelineExecution, lead_data: dict) -> dict:
        """Build the final pipeline result."""
        return {
            "pipeline_id": execution.id,
            "lead_id": execution.lead_id,
            "tenant_id": execution.tenant_id,
            "final_stage": execution.current_stage.value,
            "status": execution.status,
            "stage_history": execution.stage_history,
            "agent_results_count": len(execution.agent_results),
            "total_tokens_used": execution.total_tokens_used,
            "total_latency_ms": execution.total_latency_ms,
            "qualification_score": lead_data.get("qualification_score", 0),
            "started_at": execution.started_at,
            "completed_at": datetime.utcnow().isoformat(),
        }

    # ── Pipeline Status ──────────────────────────

    def get_pipeline_stages(self) -> list[dict]:
        """Return all pipeline stages with configs."""
        return [
            {
                "stage": stage.value,
                "event": config.get("event") if isinstance(config, dict) else None,
                "auto_advance": config.get("auto_advance", False) if isinstance(config, dict) else False,
                "timeout_hours": config.get("timeout_hours", 0) if isinstance(config, dict) else 0,
                "next_stages": list(
                    (config.get("next_stage_rules", {}) if isinstance(config, dict) else {}).keys()
                ),
            }
            for stage, config in STAGE_TRANSITIONS.items()
        ]

    def get_pipeline_summary(self) -> dict:
        """Return a summary of the pipeline configuration."""
        return {
            "total_stages": len(PipelineStage),
            "active_stages": len(STAGE_TRANSITIONS),
            "total_agents": self.router.get_agent_count(),
            "total_events": len(self.router.list_all_events()),
            "stages": [s.value for s in PipelineStage],
        }
