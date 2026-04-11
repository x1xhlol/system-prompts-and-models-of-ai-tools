"""
Agent Executor — Loads agent configs/prompts and executes them via LLM.
Agents are defined in ai-agents/prompts/ with a .md prompt file.
"""

import json
import os
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.llm_provider import LLMProvider
from app.ai.saudi_dialect import SaudiDialectProcessor
from app.config import get_settings

settings = get_settings()


class AgentExecutor:
    """
    Executes Dealix AI agents registered in AGENT_REGISTRY.

    Each agent has:
    - A system prompt (from ai-agents/prompts/*.md)
    - An optional config (from ai-agents/*/config.yml or *.json)
    - Input/output schema validation
    - Escalation rules
    - Logging to ai_conversations table
    """

    AGENT_REGISTRY = {
        "lead_qualification": {
            "prompt_file": "lead-qualification-agent.md",
            "description": "Score and qualify inbound leads",
            "model_preference": "openai",  # needs high quality
        },
        "affiliate_evaluator": {
            "prompt_file": "affiliate-recruitment-evaluator.md",
            "description": "Evaluate affiliate applications",
            "model_preference": "openai",
        },
        "onboarding_coach": {
            "prompt_file": "affiliate-onboarding-coach.md",
            "description": "Guide new affiliates through onboarding",
            "model_preference": "groq",  # speed matters
        },
        "integration_concierge": {
            "prompt_file": "customer-integration-concierge.md",
            "description": "B2B customer integration and go-live step-by-step coach",
            "model_preference": "groq",
        },
        "outreach_writer": {
            "prompt_file": "outreach-message-writer.md",
            "description": "Draft personalized outreach messages",
            "model_preference": "openai",
        },
        "arabic_whatsapp": {
            "prompt_file": "arabic-whatsapp-agent.md",
            "description": "Handle Arabic WhatsApp conversations",
            "model_preference": "openai",
        },
        "english_conversation": {
            "prompt_file": "english-conversation-agent.md",
            "description": "Handle English conversations",
            "model_preference": "groq",
        },
        "voice_call": {
            "prompt_file": "voice-call-flow-agent.md",
            "description": "Analyze voice call transcripts",
            "model_preference": "openai",
        },
        "meeting_booking": {
            "prompt_file": "meeting-booking-agent.md",
            "description": "Negotiate and book meetings",
            "model_preference": "openai",
        },
        "sector_strategist": {
            "prompt_file": "sector-sales-strategist.md",
            "description": "Generate sector-specific strategies",
            "model_preference": "openai",
        },
        "objection_handler": {
            "prompt_file": "objection-handling-agent.md",
            "description": "Handle customer objections",
            "model_preference": "openai",
        },
        "proposal_drafter": {
            "prompt_file": "proposal-drafting-agent.md",
            "description": "Generate proposals and pitch decks",
            "model_preference": "openai",
        },
        "qa_reviewer": {
            "prompt_file": "conversation-qa-reviewer.md",
            "description": "Review AI content quality",
            "model_preference": "groq",
        },
        "compliance_reviewer": {
            "prompt_file": "compliance-reviewer.md",
            "description": "Check regulatory compliance",
            "model_preference": "openai",
        },
        "knowledge_retrieval": {
            "prompt_file": "knowledge-retrieval-agent.md",
            "description": "Search knowledge base (RAG)",
            "model_preference": "groq",
        },
        "revenue_attribution": {
            "prompt_file": "revenue-attribution-agent.md",
            "description": "Attribute revenue to sources",
            "model_preference": "openai",
        },
        "fraud_reviewer": {
            "prompt_file": "fraud-reviewer.md",
            "description": "Detect fraudulent patterns",
            "model_preference": "openai",
        },
        "guarantee_reviewer": {
            "prompt_file": "guarantee-claim-reviewer.md",
            "description": "Evaluate guarantee claims",
            "model_preference": "openai",
        },
        "management_summary": {
            "prompt_file": "management-summary-agent.md",
            "description": "Generate executive summaries",
            "model_preference": "openai",
        },
        "closer_agent": {
            "prompt_file": "closer-agent.md",
            "description": "The elite Sales Closer for the Saudi market",
            "model_preference": "openai",
        },
    }

    def __init__(self, db: AsyncSession = None, llm: LLMProvider = None):
        self.db = db
        self.llm = llm or LLMProvider()
        self._prompts_dir = Path(settings.AGENT_PROMPTS_DIR)

    # ── Execute Agent ─────────────────────────────

    async def execute(
        self,
        agent_type: str,
        input_data: dict,
        tenant_id: str = None,
        lead_id: str = None,
        contact_id: str = None,
        conversation_history: list = None,
        override_prompt: str = None,
        json_mode: bool = True,
    ) -> dict:
        """
        Execute an AI agent and return structured results.

        Args:
            agent_type: One of the 18 registered agent types
            input_data: Context data for the agent
            tenant_id: Tenant scope
            lead_id: Optional lead association
            contact_id: Optional contact association
            conversation_history: Previous messages for context
            override_prompt: Override the default system prompt
            json_mode: Request JSON output from LLM

        Returns:
            {
                "agent_type": "lead_qualification",
                "output": { ... structured response ... },
                "raw_content": "...",
                "tokens": { ... },
                "latency_ms": 1234,
                "escalation": { "needed": False },
                "conversation_id": "uuid"
            }
        """
        if agent_type not in self.AGENT_REGISTRY:
            raise ValueError(f"Unknown agent type: {agent_type}. Available: {list(self.AGENT_REGISTRY.keys())}")

        agent_config = self.AGENT_REGISTRY[agent_type]
        start = time.time()

        # Load system prompt
        system_prompt = override_prompt or self._load_prompt(agent_config["prompt_file"])
        if not system_prompt:
            raise FileNotFoundError(f"Prompt file not found: {agent_config['prompt_file']}")

        # 🍯 Strategic Enrichment: Saudi Dialect & Culture
        tone = input_data.get("tone", "professional_friendly")
        sector = input_data.get("sector", "real_estate")
        region = input_data.get("region", "najdi")
        
        saudi_additions = SaudiDialectProcessor.get_system_prompt_additions(
            tone=tone, sector=sector, region=region
        )
        system_prompt = f"{system_prompt}\n\n{saudi_additions}"

        # Build user message from input data
        user_message = self._format_input(agent_type, input_data)

        # Call LLM
        response = await self.llm.chat(
            system_prompt=system_prompt,
            user_message=user_message,
            provider=agent_config.get("model_preference"),
            json_mode=json_mode,
            history=conversation_history,
        )

        # Parse output
        output = self._parse_output(response["content"], json_mode)

        # Check escalation rules
        escalation = self._check_escalation(agent_type, output, input_data)

        total_latency = int((time.time() - start) * 1000)

        # Log to database
        conversation_id = None
        if self.db and tenant_id:
            conversation_id = await self._log_conversation(
                tenant_id=tenant_id,
                agent_type=agent_type,
                lead_id=lead_id,
                contact_id=contact_id,
                input_payload=input_data,
                output_payload=output,
                tokens=response.get("tokens", {}),
                latency=total_latency,
                status="escalated" if escalation.get("needed") else "success",
            )

        return {
            "agent_type": agent_type,
            "output": output,
            "raw_content": response["content"],
            "provider": response.get("provider"),
            "model": response.get("model"),
            "tokens": response.get("tokens", {}),
            "latency_ms": total_latency,
            "escalation": escalation,
            "conversation_id": conversation_id,
            "cached": response.get("cached", False),
        }

    # ── Prompt Loading ────────────────────────────

    def _load_prompt(self, filename: str) -> Optional[str]:
        """Load agent prompt from file system."""
        # Try multiple possible locations
        paths = [
            self._prompts_dir / filename,
            Path("ai-agents") / "prompts" / filename,
            Path("../ai-agents") / "prompts" / filename,
        ]

        for path in paths:
            if path.exists():
                return path.read_text(encoding="utf-8")

        return None

    def get_available_agents(self) -> list:
        """List all available agents and their descriptions."""
        return [
            {
                "type": agent_type,
                "description": config["description"],
                "prompt_file": config["prompt_file"],
                "model_preference": config.get("model_preference", "openai"),
            }
            for agent_type, config in self.AGENT_REGISTRY.items()
        ]

    # ── Input Formatting ──────────────────────────

    def _format_input(self, agent_type: str, data: dict) -> str:
        """Format input data into a structured prompt for the agent."""
        parts = [f"## Agent Request: {agent_type}\n"]
        parts.append(f"**Timestamp:** {datetime.now(timezone.utc).isoformat()}\n")

        if "lead" in data:
            lead = data["lead"]
            parts.append("### Lead Information")
            for k, v in lead.items():
                if v:
                    parts.append(f"- **{k}:** {v}")

        if "conversation" in data:
            parts.append("\n### Conversation History")
            for msg in data["conversation"]:
                role = msg.get("role", "unknown")
                content = msg.get("content", "")
                parts.append(f"- [{role}]: {content}")

        if "context" in data:
            parts.append("\n### Additional Context")
            for k, v in data["context"].items():
                parts.append(f"- **{k}:** {v}")

        if "knowledge_context" in data:
            parts.append("\n### Corporate Knowledge Base (RAG)")
            parts.append("Use the following information to answer accurately:")
            for item in data["knowledge_context"]:
                parts.append(f"\n#### {item.get('title')}")
                parts.append(item.get("content", ""))

        if "properties_context" in data:
            parts.append("\n### Available Real Estate Inventory")
            parts.append("Use these listings to offer specific options to the client:")
            for prop in data["properties_context"]:
                parts.append(f"\n- **{prop.get('title')}**")
                parts.append(f"  Price: {prop.get('price')} | Location: {prop.get('location')} | Area: {prop.get('area')}")
                parts.append(f"  Details: {prop.get('description')}")

        # Add any remaining top-level data
        skip_keys = {"lead", "conversation", "context"}
        remaining = {k: v for k, v in data.items() if k not in skip_keys and v}
        if remaining:
            parts.append("\n### Request Data")
            parts.append(json.dumps(remaining, ensure_ascii=False, indent=2))

        parts.append("\n---\nPlease respond with a structured JSON output.")

        return "\n".join(parts)

    # ── Output Parsing ────────────────────────────

    @staticmethod
    def _parse_output(content: str, json_mode: bool) -> dict:
        """Parse LLM response into structured data."""
        if json_mode:
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                # Try to extract JSON from markdown code blocks
                if "```json" in content:
                    json_str = content.split("```json")[1].split("```")[0].strip()
                    try:
                        return json.loads(json_str)
                    except json.JSONDecodeError:
                        pass
                elif "```" in content:
                    json_str = content.split("```")[1].split("```")[0].strip()
                    try:
                        return json.loads(json_str)
                    except json.JSONDecodeError:
                        pass

        return {"raw_response": content}

    # ── Escalation Rules ──────────────────────────

    def _check_escalation(self, agent_type: str, output: dict, input_data: dict) -> dict:
        """Check if the agent output triggers escalation rules."""
        escalation = {"needed": False, "reason": None, "target": None}

        if agent_type == "lead_qualification":
            score = output.get("qualification_score", output.get("score", 50))
            if isinstance(score, (int, float)) and 40 <= score <= 60:
                escalation = {
                    "needed": True,
                    "reason": "Ambiguous qualification score (40-60 range)",
                    "target": "human_review",
                }

        elif agent_type == "arabic_whatsapp":
            sentiment = output.get("sentiment", "")
            if sentiment == "negative":
                escalation = {
                    "needed": True,
                    "reason": "Negative sentiment detected in conversation",
                    "target": "human_agent",
                }

        elif agent_type == "compliance_reviewer":
            status = output.get("compliance_status", "")
            if status == "non_compliant":
                escalation = {
                    "needed": True,
                    "reason": "Compliance violation detected",
                    "target": "compliance_officer",
                }

        elif agent_type == "fraud_reviewer":
            risk_score = output.get("risk_score", 0)
            if isinstance(risk_score, (int, float)) and risk_score > 80:
                escalation = {
                    "needed": True,
                    "reason": f"High fraud risk score: {risk_score}",
                    "target": "admin",
                }

        elif agent_type == "guarantee_reviewer":
            amount = output.get("amount_claimed", 0)
            if isinstance(amount, (int, float)) and amount > 50000:
                escalation = {
                    "needed": True,
                    "reason": f"High-value guarantee claim: {amount} SAR",
                    "target": "director",
                }

        return escalation

    # ── Database Logging ──────────────────────────

    async def _log_conversation(
        self,
        tenant_id: str,
        agent_type: str,
        lead_id: str = None,
        contact_id: str = None,
        input_payload: dict = None,
        output_payload: dict = None,
        tokens: dict = None,
        latency: int = 0,
        status: str = "success",
    ) -> str:
        from app.models.ai_conversation import AIConversation

        conv = AIConversation(
            id=uuid.uuid4(),
            tenant_id=uuid.UUID(tenant_id),
            agent_type=agent_type,
            lead_id=uuid.UUID(lead_id) if lead_id else None,
            contact_id=uuid.UUID(contact_id) if contact_id else None,
            input_payload=input_payload or {},
            output_payload=output_payload or {},
            tokens_used=tokens.get("total", 0) if tokens else 0,
            latency_ms=latency,
            status=status,
        )
        self.db.add(conv)
        await self.db.flush()
        return str(conv.id)
