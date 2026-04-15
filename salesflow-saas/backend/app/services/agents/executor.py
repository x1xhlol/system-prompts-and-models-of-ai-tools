"""
Agent Executor — Runs AI agents with LLM calls, input validation,
output parsing, escalation checks, and action dispatch.

This is the engine that powers every single AI agent in Dealix.
"""

import time
import uuid
import json
import logging
from typing import Optional
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.llm.provider import get_llm, LLMResponse
from app.services.agents.router import AgentRouter

logger = logging.getLogger("dealix.agents.executor")

# Load prompt files path
PROMPTS_DIR = Path(__file__).parent.parent.parent.parent.parent / "ai-agents" / "prompts"


class AgentResult:
    """Standardized agent execution result."""
    def __init__(self, agent_type: str, output: dict, tokens_used: int = 0,
                 latency_ms: int = 0, status: str = "success",
                 escalation: dict = None, actions: list = None):
        self.agent_type = agent_type
        self.output = output
        self.tokens_used = tokens_used
        self.latency_ms = latency_ms
        self.status = status  # success, error, escalated
        self.escalation = escalation  # {needed: bool, reason: str, target: str}
        self.actions = actions or []  # [{type: "send_message", ...}, ...]

    def to_dict(self) -> dict:
        return {
            "agent_type": self.agent_type,
            "output": self.output,
            "tokens_used": self.tokens_used,
            "latency_ms": self.latency_ms,
            "status": self.status,
            "escalation": self.escalation,
            "actions": self.actions,
        }


class AgentExecutor:
    """
    Executes AI agents by:
    1. Loading the agent's system prompt
    2. Building context from input data
    3. Calling the LLM
    4. Parsing structured output
    5. Checking escalation rules
    6. Dispatching actions (DB updates, messages, bookings)
    7. Logging to ai_conversations
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.llm = get_llm()
        self.router = AgentRouter()

    async def execute(self, agent_type: str, input_data: dict,
                      tenant_id: str = None, lead_id: str = None,
                      conversation_id: str = None) -> AgentResult:
        """Execute an AI agent and return structured result."""
        start = time.time()

        try:
            # 1. Load system prompt
            system_prompt = self._load_prompt(agent_type)

            # 1b. Enrich input with memory context
            if lead_id:
                try:
                    from app.services.agents.memory import agent_memory
                    input_data = await agent_memory.build_agent_context(
                        lead_id, agent_type, input_data
                    )
                except Exception:
                    pass  # Memory is optional enhancement

            # 2. Build user message from input data
            user_message = self._build_user_message(agent_type, input_data)

            # 3. Call LLM
            llm_response = await self.llm.complete(
                system_prompt=system_prompt,
                user_message=user_message,
                json_mode=True,
                temperature=self._get_temperature(agent_type),
                max_tokens=self._get_max_tokens(agent_type),
            )

            # 4. Parse output
            output = llm_response.parse_json()
            if output is None:
                output = {"raw_response": llm_response.content}

            # 4b. Store output in memory
            if lead_id:
                try:
                    from app.services.agents.memory import agent_memory
                    await agent_memory.remember(
                        lead_id=lead_id,
                        agent_type=agent_type,
                        event="agent_execution",
                        data=output,
                        tenant_id=tenant_id or "",
                    )
                except Exception:
                    pass  # Memory storage is optional

            # 5. Check escalation
            escalation = self._check_escalation(agent_type, output, input_data)

            # 6. Build actions
            actions = self._build_actions(agent_type, output, input_data)

            latency = int((time.time() - start) * 1000)

            result = AgentResult(
                agent_type=agent_type,
                output=output,
                tokens_used=llm_response.tokens_used,
                latency_ms=latency,
                status="escalated" if escalation and escalation.get("needed") else "success",
                escalation=escalation,
                actions=actions,
            )

            # 7. Quality gate for customer-facing agents
            try:
                from app.services.agents.quality_gate import QualityGate
                gate = QualityGate(self.db)
                final_output, qa_result = await gate.check_and_correct(
                    agent_type, output, input_data, tenant_id
                )
                if final_output != output:
                    output = final_output
                    result.output = output
                    result.output["_qa_applied"] = True
                result.output["_qa_score"] = qa_result.get("qa_score", 100)
            except Exception as qe:
                logger.debug(f"Quality gate skipped: {qe}")

            # 8. Dispatch actions to external services
            if actions:
                try:
                    from app.services.agents.action_dispatcher import ActionDispatcher
                    dispatcher = ActionDispatcher(self.db)
                    dispatch_results = await dispatcher.dispatch(actions, tenant_id)
                    result.output["_dispatch_results"] = dispatch_results
                except Exception as de:
                    logger.warning(f"Action dispatch partial failure: {de}")

            # 7b. Handle escalations formally
            if escalation and escalation.get("needed"):
                try:
                    from app.services.agents.escalation_handler import handle_agent_escalation
                    await handle_agent_escalation(
                        agent_type=agent_type,
                        escalation=escalation,
                        input_data=input_data,
                        output=output,
                        tenant_id=tenant_id or "",
                        lead_id=lead_id or "",
                    )
                except Exception as ee:
                    logger.warning(f"Escalation handler error: {ee}")

            # 8. Log to database
            await self._log_conversation(
                tenant_id=tenant_id,
                agent_type=agent_type,
                lead_id=lead_id,
                input_data=input_data,
                output=result.to_dict(),
                tokens_used=llm_response.tokens_used,
                latency_ms=latency,
                status=result.status,
            )

            logger.info(
                f"Agent {agent_type} executed: "
                f"tokens={llm_response.tokens_used} "
                f"latency={latency}ms "
                f"status={result.status} "
                f"actions={len(actions)}"
            )

            return result

        except Exception as e:
            latency = int((time.time() - start) * 1000)
            logger.error(f"Agent {agent_type} failed: {e}")

            result = AgentResult(
                agent_type=agent_type,
                output={"error": str(e)},
                latency_ms=latency,
                status="error",
            )

            await self._log_conversation(
                tenant_id=tenant_id,
                agent_type=agent_type,
                lead_id=lead_id,
                input_data=input_data,
                output=result.to_dict(),
                tokens_used=0,
                latency_ms=latency,
                status="error",
            )

            return result

    async def execute_event(self, event_type: str, input_data: dict,
                            tenant_id: str = None, **kwargs) -> list[AgentResult]:
        """Execute all agents registered for an event type."""
        from app.services.agents.router import ExecutionMode
        import asyncio

        exec_mode = self.router.get_execution_mode(event_type)
        agent_configs = self.router.get_agents_config_for_event(event_type)

        if not agent_configs:
            agent_ids = self.router.get_agents_for_event(event_type)
            results = []
            for agent_id in agent_ids:
                result = await self.execute(
                    agent_type=agent_id,
                    input_data=input_data,
                    tenant_id=tenant_id,
                    **kwargs,
                )
                results.append(result)
                if result.escalation and result.escalation.get("needed"):
                    break
            return results

        if exec_mode == ExecutionMode.PARALLEL:
            return await self._execute_event_parallel(agent_configs, input_data, tenant_id, **kwargs)
        else:
            return await self._execute_event_sequential(agent_configs, input_data, tenant_id, **kwargs)

    async def _execute_event_sequential(self, agent_configs, input_data: dict,
                                         tenant_id: str, **kwargs) -> list[AgentResult]:
        """Execute agents one after another, chaining outputs."""
        results = []
        chain_data = dict(input_data)

        for agent_cfg in agent_configs:
            try:
                import asyncio
                result = await asyncio.wait_for(
                    self.execute(
                        agent_type=agent_cfg.agent_id,
                        input_data=chain_data,
                        tenant_id=tenant_id,
                        **kwargs,
                    ),
                    timeout=agent_cfg.timeout_seconds,
                )
                results.append(result)

                # Chain output into next agent's input
                if result.output and isinstance(result.output, dict):
                    chain_data = {**chain_data, f"{agent_cfg.agent_id}_output": result.output}

                # Stop on escalation
                if result.escalation and result.escalation.get("needed"):
                    logger.info(f"Sequential chain stopped at {agent_cfg.agent_id} — escalation")
                    break

                # Stop on required agent failure
                if result.status == "error" and agent_cfg.required:
                    logger.error(f"Required agent {agent_cfg.agent_id} failed, stopping chain")
                    break

            except Exception as e:
                logger.error(f"Agent {agent_cfg.agent_id} error in chain: {e}")
                if agent_cfg.required:
                    break

        return results

    async def _execute_event_parallel(self, agent_configs, input_data: dict,
                                       tenant_id: str, **kwargs) -> list[AgentResult]:
        """Execute agents simultaneously."""
        import asyncio

        async def _run(agent_cfg):
            try:
                return await asyncio.wait_for(
                    self.execute(
                        agent_type=agent_cfg.agent_id,
                        input_data=input_data,
                        tenant_id=tenant_id,
                        **kwargs,
                    ),
                    timeout=agent_cfg.timeout_seconds,
                )
            except Exception as e:
                logger.error(f"Parallel agent {agent_cfg.agent_id} failed: {e}")
                return AgentResult(
                    agent_type=agent_cfg.agent_id,
                    output={"error": str(e)},
                    status="error",
                )

        tasks = [_run(cfg) for cfg in agent_configs]
        results = await asyncio.gather(*tasks, return_exceptions=False)
        return list(results)

    # ── Prompt Loading ──────────────────────────────

    def _load_prompt(self, agent_type: str) -> str:
        """Load system prompt from the ai-agents/prompts directory."""
        # Map agent_type to filename
        filename_map = {
            "closer_agent": "closer-agent.md",
            "lead_qualification": "lead-qualification-agent.md",
            "arabic_whatsapp": "arabic-whatsapp-agent.md",
            "english_conversation": "english-conversation-agent.md",
            "outreach_writer": "outreach-message-writer.md",
            "meeting_booking": "meeting-booking-agent.md",
            "objection_handler": "objection-handling-agent.md",
            "proposal_drafter": "proposal-drafting-agent.md",
            "sector_strategist": "sector-sales-strategist.md",
            "knowledge_retrieval": "knowledge-retrieval-agent.md",
            "compliance_reviewer": "compliance-reviewer.md",
            "fraud_reviewer": "fraud-reviewer.md",
            "revenue_attribution": "revenue-attribution-agent.md",
            "management_summary": "management-summary-agent.md",
            "qa_reviewer": "conversation-qa-reviewer.md",
            "affiliate_evaluator": "affiliate-recruitment-evaluator.md",
            "onboarding_coach": "affiliate-onboarding-coach.md",
            "guarantee_reviewer": "guarantee-claim-reviewer.md",
            "voice_call": "voice-call-flow-agent.md",
            "ai_rehearsal": "ai-rehearsal-agent.md",
        }

        filename = filename_map.get(agent_type)
        if not filename:
            return f"You are the {agent_type} agent for Dealix. Respond with structured JSON."

        # Check primary prompts dir
        prompt_path = PROMPTS_DIR / filename
        if prompt_path.exists():
            return prompt_path.read_text(encoding="utf-8")
        
        # Check fallback backend prompts dir
        backend_prompts_dir = Path(__file__).parent.parent.parent / "ai" / "prompts"
        fallback_path = backend_prompts_dir / filename
        if fallback_path.exists():
            return fallback_path.read_text(encoding="utf-8")
        
        logger.warning(f"Prompt file not found for {agent_type}: {filename}")
        return f"You are the {agent_type} agent for Dealix. Respond with structured JSON."

    def _build_user_message(self, agent_type: str, input_data: dict) -> str:
        """Build the user message from input data."""
        # General format: JSON dump of input data with clear instructions
        context = json.dumps(input_data, ensure_ascii=False, indent=2, default=str)

        return f"""## Input Data
{context}

## Instructions
Process this input according to your role and return a structured JSON response.
Include all required output fields as defined in your schema.
Use Arabic where appropriate (especially for client-facing content).
Respond ONLY with valid JSON."""

    # ── Configuration per Agent ────────────────────

    def _get_temperature(self, agent_type: str) -> float:
        """Agent-specific temperature settings."""
        # Creative agents need higher temperature
        creative = {
            "outreach_writer": 0.7, "proposal_drafter": 0.5,
            "sector_strategist": 0.5, "objection_handler": 0.4,
            "closer_agent": 0.4, "onboarding_coach": 0.5,
            "ai_rehearsal": 0.4,
        }
        # Analytical agents need low temperature
        analytical = {
            "lead_qualification": 0.1, "compliance_reviewer": 0.1,
            "fraud_reviewer": 0.1, "revenue_attribution": 0.1,
            "guarantee_reviewer": 0.1, "qa_reviewer": 0.2,
            "affiliate_evaluator": 0.2,
        }
        return creative.get(agent_type, analytical.get(agent_type, 0.3))

    def _get_max_tokens(self, agent_type: str) -> int:
        """Agent-specific max token settings."""
        verbose = {
            "proposal_drafter": 4096, "management_summary": 4096,
            "sector_strategist": 3000, "ai_rehearsal": 3000,
            "objection_handler": 2500, "closer_agent": 2500,
            "onboarding_coach": 3000,
        }
        return verbose.get(agent_type, 2048)

    # ── Escalation Rules ──────────────────────────

    def _check_escalation(self, agent_type: str, output: dict, input_data: dict) -> Optional[dict]:
        """Check if the agent output requires escalation to a human."""
        escalation = output.get("escalation", {})
        if isinstance(escalation, dict) and escalation.get("needed"):
            return escalation

        # Agent-specific checks
        if agent_type == "arabic_whatsapp":
            confidence = output.get("confidence", 1.0)
            if confidence < 0.5:
                return {"needed": True, "reason": "Low confidence response", "target": "human_agent"}
            sentiment = output.get("sentiment", "neutral")
            if sentiment == "negative":
                return {"needed": True, "reason": "Negative client sentiment detected", "target": "human_agent"}

        if agent_type == "lead_qualification":
            score = output.get("score", 50)
            if 40 <= score <= 60:
                return {"needed": True, "reason": "Ambiguous qualification score", "target": "sales_manager"}
            if score >= 90:
                return {"needed": True, "reason": "VIP lead detected — immediate human attention", "target": "vip_handler"}

        if agent_type == "fraud_reviewer":
            risk_score = output.get("risk_score", 0)
            if risk_score > 80:
                return {"needed": True, "reason": "High fraud risk detected", "target": "admin"}

        if agent_type == "compliance_reviewer":
            overall_risk = output.get("overall_risk", "low")
            if overall_risk in ("high", "critical"):
                return {"needed": True, "reason": f"Compliance risk: {overall_risk}", "target": "legal_team"}

        if agent_type == "guarantee_reviewer":
            claim_amount = output.get("claim_amount_sar", 0)
            if claim_amount > 50000:
                return {"needed": True, "reason": "Guarantee claim > 50K SAR", "target": "ceo"}
            elif claim_amount > 5000:
                return {"needed": True, "reason": "Guarantee claim > 5K SAR", "target": "finance"}

        if agent_type == "objection_handler":
            severity = output.get("objection_severity", "low")
            if severity == "deal_breaker":
                return {"needed": True, "reason": "Deal-breaking objection detected", "target": "sales_manager"}

        return None

    # ── Action Building ───────────────────────────

    def _build_actions(self, agent_type: str, output: dict, input_data: dict) -> list:
        """Build a list of actions to execute based on agent output."""
        actions = []

        # ── WhatsApp Response ────────────────────────
        if agent_type == "arabic_whatsapp" and output.get("response_message_ar"):
            actions.append({
                "type": "send_whatsapp",
                "message": output["response_message_ar"],
                "phone": input_data.get("contact_phone", ""),
            })

        # ── English Response ─────────────────────────
        if agent_type == "english_conversation" and output.get("response_message_en"):
            actions.append({
                "type": "send_email",
                "message": output["response_message_en"],
                "email": input_data.get("contact_email", ""),
            })

        # ── Meeting Booking ──────────────────────────
        if agent_type == "meeting_booking" and output.get("meeting_booked", {}).get("confirmed"):
            meeting = output["meeting_booked"]
            actions.append({
                "type": "create_meeting",
                "datetime": meeting.get("datetime"),
                "duration_minutes": meeting.get("duration_minutes", 30),
                "location": meeting.get("location", "google_meet"),
                "lead_id": input_data.get("lead_id"),
            })
            # Send confirmation via WhatsApp
            if output.get("confirmation_message_ar"):
                actions.append({
                    "type": "send_whatsapp",
                    "message": output["confirmation_message_ar"],
                    "phone": input_data.get("contact_phone", ""),
                })

        # ── Outreach Writer ──────────────────────────
        if agent_type == "outreach_writer" and output.get("draft_message"):
            channel = output.get("channel", input_data.get("channel", "whatsapp"))
            actions.append({
                "type": "queue_message",
                "channel": channel,
                "message": output["draft_message"],
                "optimal_send_time": output.get("optimal_send_time"),
            })
            # Queue A/B variant if available
            if output.get("draft_message_alt"):
                actions.append({
                    "type": "queue_ab_variant",
                    "channel": channel,
                    "message": output["draft_message_alt"],
                })

        # ── Lead Qualification ───────────────────────
        if agent_type == "lead_qualification":
            actions.append({
                "type": "update_lead_score",
                "lead_id": input_data.get("lead_id"),
                "score": output.get("score", 0),
                "classification": output.get("classification", "cold"),
                "status": output.get("status_recommendation", "contacted"),
                "priority": output.get("priority", "medium"),
            })
            # Auto-route hot leads
            if output.get("score", 0) >= 80:
                actions.append({
                    "type": "trigger_event",
                    "event": "lead_qualified",
                    "lead_id": input_data.get("lead_id"),
                })

        # ── Closer Agent ─────────────────────────────
        if agent_type == "closer_agent":
            if output.get("response_message_ar"):
                actions.append({
                    "type": "send_whatsapp",
                    "message": output["response_message_ar"],
                    "phone": input_data.get("contact_phone", ""),
                })
            if output.get("payment_link_needed"):
                actions.append({
                    "type": "generate_payment_link",
                    "lead_id": input_data.get("lead_id"),
                    "amount_sar": output.get("amount_sar", 0),
                })

        # ── Proposal Drafter ─────────────────────────
        if agent_type == "proposal_drafter" and output.get("proposal"):
            actions.append({
                "type": "create_proposal",
                "proposal_data": output["proposal"],
                "lead_id": input_data.get("lead_id"),
            })

        # ── Compliance Reviewer ──────────────────────
        if agent_type == "compliance_reviewer":
            if not output.get("compliant", True):
                actions.append({
                    "type": "block_action",
                    "reason": "Compliance check failed",
                    "issues": output.get("issues", []),
                })

        # ── Fraud Reviewer ───────────────────────────
        if agent_type == "fraud_reviewer":
            risk = output.get("risk_score", 0)
            if risk > 60:
                actions.append({
                    "type": "suspend_entity",
                    "entity_type": output.get("fraud_type", "unknown"),
                    "risk_score": risk,
                    "affected": output.get("affected_entities", {}),
                })

        # ── Objection Handler ────────────────────────
        if agent_type == "objection_handler" and output.get("response_ar"):
            actions.append({
                "type": "send_whatsapp",
                "message": output["response_ar"],
                "phone": input_data.get("contact_phone", ""),
            })

        # ── Guarantee Reviewer ───────────────────────
        if agent_type == "guarantee_reviewer":
            decision = output.get("decision", "")
            if decision == "approved":
                actions.append({
                    "type": "process_refund",
                    "amount_sar": output.get("approved_amount_sar", 0),
                    "customer_id": input_data.get("customer_id"),
                })
            # Try retention offer first
            retention = output.get("retention_offer", {})
            if retention.get("offered"):
                actions.append({
                    "type": "send_retention_offer",
                    "offer": retention,
                    "customer_id": input_data.get("customer_id"),
                })

        return actions

    # ── Database Logging ──────────────────────────

    async def _log_conversation(self, tenant_id: str, agent_type: str,
                                 lead_id: str, input_data: dict, output: dict,
                                 tokens_used: int, latency_ms: int, status: str):
        """Log agent execution to ai_conversations table."""
        try:
            from app.models.ai_conversation import AIConversation

            log_entry = AIConversation(
                tenant_id=uuid.UUID(tenant_id) if tenant_id else None,
                contact_name=input_data.get("contact_name"),
                contact_phone=input_data.get("contact_phone"),
                channel="system",
                status=status,
                lead_id=uuid.UUID(lead_id) if lead_id else None,
                context={
                    "agent_type": agent_type,
                    "input": input_data,
                    "output": output,
                    "tokens_used": tokens_used,
                    "latency_ms": latency_ms,
                },
            )
            self.db.add(log_entry)
            await self.db.flush()
        except Exception as e:
            logger.error(f"Failed to log agent conversation: {e}")
