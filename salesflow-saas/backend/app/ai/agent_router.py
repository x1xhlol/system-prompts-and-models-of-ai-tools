"""
Agent Router — Maps events to the correct agent(s) and handles multi-agent chaining.
"""

from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.agent_executor import AgentExecutor
from app.ai.llm_provider import LLMProvider


# Event type → Agent(s) mapping
EVENT_AGENT_MAP = {
    # Lead events
    "lead.created": ["lead_qualification"],
    "lead.qualified": ["outreach_writer"],
    "lead.contacted": ["arabic_whatsapp"],
    "lead.replied": ["arabic_whatsapp", "objection_handler"],
    "lead.meeting_ready": ["meeting_booking"],

    # Message events
    "message.inbound.whatsapp.ar": ["arabic_whatsapp"],
    "message.inbound.whatsapp.en": ["english_conversation"],
    "message.closer.whatsapp.ar": ["closer_agent"],
    "message.closer.whatsapp.en": ["closer_agent"],
    "message.inbound.email": ["english_conversation"],
    "message.objection_detected": ["objection_handler"],

    # Call events
    "call.completed": ["voice_call"],
    "call.transcript_ready": ["voice_call"],

    # Meeting events
    "meeting.requested": ["meeting_booking"],
    "meeting.confirmed": ["proposal_drafter"],
    "meeting.prep_needed": ["sector_strategist", "proposal_drafter"],

    # Deal events
    "deal.created": ["sector_strategist"],
    "deal.proposal_needed": ["proposal_drafter"],
    "deal.closed_won": ["revenue_attribution", "management_summary"],
    "deal.closed_lost": ["management_summary"],

    # Affiliate events
    "affiliate.applied": ["affiliate_evaluator"],
    "affiliate.approved": ["onboarding_coach"],
    "affiliate.fraud_suspected": ["fraud_reviewer"],

    # Compliance events
    "content.review_needed": ["qa_reviewer"],
    "compliance.check_needed": ["compliance_reviewer"],

    # Guarantee events
    "guarantee.claimed": ["guarantee_reviewer"],

    # Knowledge events
    "knowledge.query": ["knowledge_retrieval"],

    # Reporting events
    "report.daily": ["management_summary"],
    "report.weekly": ["management_summary"],
}


class AgentRouter:
    """
    Routes incoming events to the appropriate AI agent(s).
    Supports single-agent, multi-agent, and chained execution.
    """

    def __init__(self, db: AsyncSession, llm: LLMProvider = None):
        self.db = db
        self.llm = llm or LLMProvider()
        self.executor = AgentExecutor(db=db, llm=self.llm)

    async def route(
        self,
        event_type: str,
        event_data: dict,
        tenant_id: str,
        lead_id: str = None,
        contact_id: str = None,
    ) -> dict:
        """
        Route an event to the appropriate agent(s).

        Returns:
            {
                "event": "lead.created",
                "agents_invoked": ["lead_qualification"],
                "results": [ { ...agent output... } ],
                "escalations": [ ... ],
            }
        """
        agents = EVENT_AGENT_MAP.get(event_type, [])
        if not agents:
            return {
                "event": event_type,
                "agents_invoked": [],
                "results": [],
                "error": f"No agent mapped for event: {event_type}",
            }

        results = []
        escalations = []

        for agent_type in agents:
            try:
                result = await self.executor.execute(
                    agent_type=agent_type,
                    input_data=event_data,
                    tenant_id=tenant_id,
                    lead_id=lead_id,
                    contact_id=contact_id,
                )
                results.append(result)

                if result.get("escalation", {}).get("needed"):
                    escalations.append({
                        "agent": agent_type,
                        "reason": result["escalation"]["reason"],
                        "target": result["escalation"]["target"],
                    })

            except Exception as e:
                results.append({
                    "agent_type": agent_type,
                    "error": str(e),
                    "status": "failed",
                })

        return {
            "event": event_type,
            "agents_invoked": agents,
            "results": results,
            "escalations": escalations,
        }

    async def chain(
        self,
        agent_sequence: list,
        initial_data: dict,
        tenant_id: str,
        lead_id: str = None,
    ) -> dict:
        """
        Execute agents in sequence, passing output of each to the next.

        Example chain: ["lead_qualification", "outreach_writer", "meeting_booking"]
        """
        chain_results = []
        current_data = initial_data.copy()

        for agent_type in agent_sequence:
            try:
                result = await self.executor.execute(
                    agent_type=agent_type,
                    input_data=current_data,
                    tenant_id=tenant_id,
                    lead_id=lead_id,
                )
                chain_results.append(result)

                # Pass output to next agent as context
                if result.get("output"):
                    current_data["previous_agent"] = agent_type
                    current_data["previous_output"] = result["output"]

                # Stop chain if escalation is needed
                if result.get("escalation", {}).get("needed"):
                    break

            except Exception as e:
                chain_results.append({
                    "agent_type": agent_type,
                    "error": str(e),
                    "status": "failed",
                })
                break

        return {
            "chain": agent_sequence,
            "completed": len(chain_results),
            "results": chain_results,
        }

    def get_event_types(self) -> list:
        """List all supported event types."""
        return list(EVENT_AGENT_MAP.keys())

    def get_agents_for_event(self, event_type: str) -> list:
        """Get agents mapped to an event type."""
        return EVENT_AGENT_MAP.get(event_type, [])
