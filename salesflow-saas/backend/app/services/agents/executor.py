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

            # 7. Log to database
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
                f"status={result.status}"
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

            # Stop chain if escalation needed
            if result.escalation and result.escalation.get("needed"):
                logger.info(f"Agent chain stopped at {agent_id} due to escalation")
                break

        return results

    # ── Prompt Loading ──────────────────────────────

    def _load_prompt(self, agent_type: str) -> str:
        """Load system prompt from the ai-agents/prompts directory."""
        # Map agent_type to filename
        filename_map = {
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
        }

        filename = filename_map.get(agent_type)
        if not filename:
            return f"You are the {agent_type} agent for Dealix. Respond with structured JSON."

        prompt_path = PROMPTS_DIR / filename
        if prompt_path.exists():
            return prompt_path.read_text(encoding="utf-8")
        else:
            logger.warning(f"Prompt file not found: {prompt_path}")
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
        creative = {"outreach_writer": 0.7, "proposal_drafter": 0.5, "sector_strategist": 0.5}
        # Analytical agents need low temperature
        analytical = {
            "lead_qualification": 0.1, "compliance_reviewer": 0.1,
            "fraud_reviewer": 0.1, "revenue_attribution": 0.1,
        }
        return creative.get(agent_type, analytical.get(agent_type, 0.3))

    def _get_max_tokens(self, agent_type: str) -> int:
        """Agent-specific max token settings."""
        verbose = {"proposal_drafter": 4096, "management_summary": 4096, "sector_strategist": 3000}
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

        if agent_type == "lead_qualification":
            score = output.get("score", 50)
            if 40 <= score <= 60:
                return {"needed": True, "reason": "Ambiguous qualification score", "target": "sales_manager"}

        if agent_type == "fraud_reviewer":
            risk_score = output.get("risk_score", 0)
            if risk_score > 80:
                return {"needed": True, "reason": "High fraud risk detected", "target": "admin"}

        return None

    # ── Action Building ───────────────────────────

    def _build_actions(self, agent_type: str, output: dict, input_data: dict) -> list:
        """Build a list of actions to execute based on agent output."""
        actions = []

        if agent_type == "arabic_whatsapp" and output.get("response_message_ar"):
            actions.append({
                "type": "send_whatsapp",
                "message": output["response_message_ar"],
                "phone": input_data.get("contact_phone", ""),
            })

        if agent_type == "meeting_booking" and output.get("meeting_booked", {}).get("confirmed"):
            actions.append({
                "type": "create_meeting",
                "datetime": output["meeting_booked"].get("datetime"),
                "lead_id": input_data.get("lead_id"),
            })

        if agent_type == "outreach_writer" and output.get("draft_message"):
            actions.append({
                "type": "queue_message",
                "channel": input_data.get("channel", "whatsapp"),
                "message": output["draft_message"],
            })

        if agent_type == "lead_qualification":
            actions.append({
                "type": "update_lead_score",
                "lead_id": input_data.get("lead_id"),
                "score": output.get("score", 0),
                "status": output.get("status_recommendation", "contacted"),
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
