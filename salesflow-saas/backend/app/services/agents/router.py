"""
Agent Router v2.0 — Determines which AI agent handles which event.
The central nervous system of Dealix's AI engine.

Features:
- Priority-based agent ordering
- Parallel vs sequential execution modes
- Retry policies per agent
- Agent metadata (model preference, temperature, timeout)
"""

import logging
from typing import Optional
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger("dealix.agents")


class ExecutionMode(str, Enum):
    SEQUENTIAL = "sequential"  # Agents run one after another
    PARALLEL = "parallel"      # Agents run simultaneously
    PIPELINE = "pipeline"      # Output of one feeds into the next


@dataclass
class RetryPolicy:
    max_retries: int = 2
    backoff_seconds: float = 1.0
    backoff_multiplier: float = 2.0  # Exponential backoff


@dataclass
class AgentConfig:
    """Configuration for a single agent in an event mapping."""
    agent_id: str
    priority: int = 1            # Lower = higher priority (1 runs first)
    required: bool = True        # If True, failure stops the chain
    timeout_seconds: int = 30    # Max execution time
    model_preference: str = ""   # Override LLM model (e.g., "groq_fast")
    retry_policy: RetryPolicy = field(default_factory=RetryPolicy)


@dataclass
class EventConfig:
    """Configuration for an event type."""
    agents: list[AgentConfig]
    execution_mode: ExecutionMode = ExecutionMode.SEQUENTIAL
    description: str = ""


# ── Event → Agent Mapping (v2.0 with priority & config) ──────

AGENT_REGISTRY: dict[str, EventConfig] = {
    # ── Lead Lifecycle ───────────────────────────────
    "lead_created": EventConfig(
        agents=[
            AgentConfig("lead_qualification", priority=1, required=True),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="New lead enters the system — qualify immediately",
    ),
    "lead_score_updated": EventConfig(
        agents=[
            AgentConfig("lead_qualification", priority=1, required=True),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Lead score changed — re-evaluate qualification",
    ),
    "lead_qualified": EventConfig(
        agents=[
            AgentConfig("outreach_writer", priority=1, required=True),
            AgentConfig("meeting_booking", priority=2, required=False),
            AgentConfig("closer_agent", priority=3, required=False),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Lead qualified — start outreach sequence",
    ),

    # ── Communication ────────────────────────────────
    "whatsapp_inbound": EventConfig(
        agents=[
            AgentConfig("arabic_whatsapp", priority=1, required=True, timeout_seconds=15),
            AgentConfig("closer_agent", priority=2, required=False),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Incoming WhatsApp message — respond in Arabic",
    ),
    "whatsapp_outbound": EventConfig(
        agents=[
            AgentConfig("outreach_writer", priority=1, required=True),
            AgentConfig("compliance_reviewer", priority=2, required=True),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Outgoing WhatsApp — write + compliance check",
    ),
    "email_inbound": EventConfig(
        agents=[
            AgentConfig("english_conversation", priority=1, required=True),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Incoming email — handle in English",
    ),
    "email_outbound": EventConfig(
        agents=[
            AgentConfig("outreach_writer", priority=1, required=True),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Outgoing email — craft professional message",
    ),
    "voice_call_completed": EventConfig(
        agents=[
            AgentConfig("voice_call", priority=1, required=True),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Voice call ended — analyze and log",
    ),

    # ── Meeting Lifecycle ────────────────────────────
    "meeting_requested": EventConfig(
        agents=[
            AgentConfig("meeting_booking", priority=1, required=True),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Meeting requested — find best slot",
    ),
    "meeting_confirmed": EventConfig(
        agents=[
            AgentConfig("ai_rehearsal", priority=1, required=True),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Meeting confirmed — prepare briefing",
    ),
    "meeting_upcoming": EventConfig(
        agents=[
            AgentConfig("ai_rehearsal", priority=1, required=True),
            AgentConfig("knowledge_retrieval", priority=2, required=False),
        ],
        execution_mode=ExecutionMode.PARALLEL,
        description="Meeting in 24h — final preparation",
    ),

    # ── Deal Lifecycle ───────────────────────────────
    "deal_created": EventConfig(
        agents=[
            AgentConfig("sector_strategist", priority=1, required=True),
            AgentConfig("knowledge_retrieval", priority=1, required=False),
        ],
        execution_mode=ExecutionMode.PARALLEL,
        description="New deal — sector analysis + knowledge lookup",
    ),
    "deal_stage_changed": EventConfig(
        agents=[
            AgentConfig("proposal_drafter", priority=1, required=False),
            AgentConfig("management_summary", priority=2, required=False),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Deal progression — update proposal if needed",
    ),
    "deal_proposal_requested": EventConfig(
        agents=[
            AgentConfig("proposal_drafter", priority=1, required=True, timeout_seconds=60),
            AgentConfig("compliance_reviewer", priority=2, required=True),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Proposal requested — draft + compliance review",
    ),

    # ── Quality & Compliance ─────────────────────────
    "content_review": EventConfig(
        agents=[
            AgentConfig("qa_reviewer", priority=1, required=True),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Content needs QA review",
    ),
    "compliance_check": EventConfig(
        agents=[
            AgentConfig("compliance_reviewer", priority=1, required=True),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Compliance verification required",
    ),
    "objection_detected": EventConfig(
        agents=[
            AgentConfig("objection_handler", priority=1, required=True),
            AgentConfig("closer_agent", priority=2, required=False),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Client objection detected — handle + attempt close",
    ),

    # ── Affiliate Lifecycle ──────────────────────────
    "affiliate_applied": EventConfig(
        agents=[
            AgentConfig("affiliate_evaluator", priority=1, required=True),
            AgentConfig("fraud_reviewer", priority=1, required=True),
        ],
        execution_mode=ExecutionMode.PARALLEL,
        description="New affiliate application — evaluate + fraud check simultaneously",
    ),
    "affiliate_approved": EventConfig(
        agents=[
            AgentConfig("onboarding_coach", priority=1, required=True),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Affiliate approved — start onboarding",
    ),

    # ── Analytics ────────────────────────────────────
    "revenue_attribution": EventConfig(
        agents=[
            AgentConfig("revenue_attribution", priority=1, required=True),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Revenue needs attribution analysis",
    ),
    "fraud_check": EventConfig(
        agents=[
            AgentConfig("fraud_reviewer", priority=1, required=True),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Fraud check triggered",
    ),
    "guarantee_claim": EventConfig(
        agents=[
            AgentConfig("guarantee_reviewer", priority=1, required=True),
            AgentConfig("fraud_reviewer", priority=2, required=False),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Guarantee claim — review then fraud check",
    ),
    "management_report": EventConfig(
        agents=[
            AgentConfig("management_summary", priority=1, required=True, timeout_seconds=60),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Generate management report",
    ),

    # ── Knowledge ────────────────────────────────────
    "knowledge_query": EventConfig(
        agents=[
            AgentConfig("knowledge_retrieval", priority=1, required=True),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Knowledge base query",
    ),
    "sector_strategy": EventConfig(
        agents=[
            AgentConfig("sector_strategist", priority=1, required=True),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Sector strategy analysis",
    ),

    # ── Autonomous Pipeline Events ───────────────────
    "pipeline_lead_new": EventConfig(
        agents=[
            AgentConfig("lead_qualification", priority=1, required=True),
            AgentConfig("knowledge_retrieval", priority=1, required=False),
        ],
        execution_mode=ExecutionMode.PARALLEL,
        description="Autonomous: new lead → qualify + gather knowledge",
    ),
    "pipeline_lead_qualified": EventConfig(
        agents=[
            AgentConfig("outreach_writer", priority=1, required=True),
            AgentConfig("sector_strategist", priority=1, required=False),
        ],
        execution_mode=ExecutionMode.PARALLEL,
        description="Autonomous: qualified → outreach + strategy",
    ),
    "pipeline_meeting_prep": EventConfig(
        agents=[
            AgentConfig("ai_rehearsal", priority=1, required=True),
            AgentConfig("proposal_drafter", priority=1, required=False),
            AgentConfig("knowledge_retrieval", priority=1, required=False),
        ],
        execution_mode=ExecutionMode.PARALLEL,
        description="Autonomous: pre-meeting full preparation",
    ),
    "pipeline_closing": EventConfig(
        agents=[
            AgentConfig("closer_agent", priority=1, required=True),
            AgentConfig("compliance_reviewer", priority=2, required=True),
        ],
        execution_mode=ExecutionMode.SEQUENTIAL,
        description="Autonomous: closing stage → close + compliance",
    ),
}


class AgentRouter:
    """Routes events to the appropriate AI agent(s) with priority and config."""

    def get_event_config(self, event_type: str) -> Optional[EventConfig]:
        """Return the full event configuration."""
        config = AGENT_REGISTRY.get(event_type)
        if not config:
            logger.warning(f"No agent registered for event: {event_type}")
        return config

    def get_agents_for_event(self, event_type: str) -> list[str]:
        """Return list of agent IDs sorted by priority."""
        config = self.get_event_config(event_type)
        if not config:
            return []
        sorted_agents = sorted(config.agents, key=lambda a: a.priority)
        return [a.agent_id for a in sorted_agents]

    def get_agents_config_for_event(self, event_type: str) -> list[AgentConfig]:
        """Return agent configs sorted by priority."""
        config = self.get_event_config(event_type)
        if not config:
            return []
        return sorted(config.agents, key=lambda a: a.priority)

    def get_execution_mode(self, event_type: str) -> ExecutionMode:
        """Return execution mode for an event."""
        config = self.get_event_config(event_type)
        return config.execution_mode if config else ExecutionMode.SEQUENTIAL

    def get_primary_agent(self, event_type: str) -> Optional[str]:
        """Return the primary (highest priority) agent for an event."""
        agents = self.get_agents_for_event(event_type)
        return agents[0] if agents else None

    def list_all_agents(self) -> list[dict]:
        """List all registered agents with their event triggers."""
        agent_events: dict[str, list[str]] = {}
        for event, config in AGENT_REGISTRY.items():
            for agent_cfg in config.agents:
                if agent_cfg.agent_id not in agent_events:
                    agent_events[agent_cfg.agent_id] = []
                agent_events[agent_cfg.agent_id].append(event)

        return [
            {"agent_id": agent_id, "events": events, "event_count": len(events)}
            for agent_id, events in sorted(agent_events.items())
        ]

    def list_all_events(self) -> list[dict]:
        """List all registered events with their agent configs."""
        return [
            {
                "event_type": event_type,
                "description": config.description,
                "execution_mode": config.execution_mode.value,
                "agents": [
                    {
                        "agent_id": a.agent_id,
                        "priority": a.priority,
                        "required": a.required,
                        "timeout_seconds": a.timeout_seconds,
                    }
                    for a in sorted(config.agents, key=lambda x: x.priority)
                ],
            }
            for event_type, config in sorted(AGENT_REGISTRY.items())
        ]

    def get_agent_count(self) -> int:
        """Return total number of unique agents."""
        agents = set()
        for config in AGENT_REGISTRY.values():
            for a in config.agents:
                agents.add(a.agent_id)
        return len(agents)
