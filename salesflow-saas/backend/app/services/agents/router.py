"""
Agent Router — Determines which AI agent handles which event.
The central nervous system of Dealix's AI engine.
"""

import logging
from typing import Optional
from uuid import UUID

logger = logging.getLogger("dealix.agents")


# ── Event → Agent Mapping ─────────────────────────────────────

AGENT_REGISTRY = {
    # Lead lifecycle
    "lead_created": ["lead_qualification"],
    "lead_score_updated": ["lead_qualification"],
    "lead_qualified": ["closer_agent", "outreach_writer", "meeting_booking"],

    # Communication
    "whatsapp_inbound": ["closer_agent", "arabic_whatsapp"],
    "whatsapp_outbound": ["outreach_writer"],
    "email_inbound": ["english_conversation"],
    "email_outbound": ["outreach_writer"],
    "voice_call_completed": ["voice_call"],

    # Meeting lifecycle
    "meeting_requested": ["meeting_booking"],
    "meeting_confirmed": ["ai_rehearsal"],
    "meeting_upcoming": ["ai_rehearsal"],

    # Deal lifecycle
    "deal_created": ["sector_strategist"],
    "deal_stage_changed": ["proposal_drafter"],
    "deal_proposal_requested": ["proposal_drafter"],

    # Quality & Compliance
    "content_review": ["qa_reviewer"],
    "compliance_check": ["compliance_reviewer"],
    "objection_detected": ["objection_handler"],

    # Affiliate lifecycle
    "affiliate_applied": ["affiliate_evaluator"],
    "affiliate_approved": ["onboarding_coach"],

    # Analytics
    "revenue_attribution": ["revenue_attribution"],
    "fraud_check": ["fraud_reviewer"],
    "guarantee_claim": ["guarantee_reviewer"],
    "management_report": ["management_summary"],

    # Knowledge
    "knowledge_query": ["knowledge_retrieval"],
    "sector_strategy": ["sector_strategist"],
}


class AgentRouter:
    """Routes events to the appropriate AI agent(s)."""

    def get_agents_for_event(self, event_type: str) -> list[str]:
        """Return list of agent IDs that should handle this event."""
        agents = AGENT_REGISTRY.get(event_type, [])
        if not agents:
            logger.warning(f"No agent registered for event: {event_type}")
        return agents

    def get_primary_agent(self, event_type: str) -> Optional[str]:
        """Return the primary (first) agent for an event."""
        agents = self.get_agents_for_event(event_type)
        return agents[0] if agents else None

    def list_all_agents(self) -> list[dict]:
        """List all registered agents with their event triggers."""
        agent_events = {}
        for event, agents in AGENT_REGISTRY.items():
            for agent in agents:
                if agent not in agent_events:
                    agent_events[agent] = []
                agent_events[agent].append(event)

        return [
            {"agent_id": agent_id, "events": events}
            for agent_id, events in agent_events.items()
        ]
