"""
Agent Memory Service — Long-Term Context for AI Agents
=======================================================
Maintains conversation history, customer preferences, deal context,
and learned patterns across agent invocations.

This gives agents access to:
1. Previous interactions with the same lead
2. Customer preferences and objections history
3. Deal progression context
4. What strategies worked/failed for similar leads
"""

import logging
from datetime import datetime, timezone
from typing import Any, Optional
from collections import defaultdict

logger = logging.getLogger("dealix.agents.memory")


class AgentMemory:
    """
    In-memory agent context store with per-lead and per-tenant memory.
    In production, this should be backed by Redis or PostgreSQL.
    """

    def __init__(self):
        # lead_id → list of memory entries
        self._lead_memory: dict[str, list[dict]] = defaultdict(list)
        # tenant_id → global patterns/learnings  
        self._tenant_patterns: dict[str, list[dict]] = defaultdict(list)
        # lead_id → preferences
        self._preferences: dict[str, dict] = {}
        # Conversation continuity
        self._active_contexts: dict[str, dict] = {}
        # Max entries per lead
        self._max_entries = 100

    async def remember(
        self,
        lead_id: str,
        agent_type: str,
        event: str,
        data: dict,
        tenant_id: str = "",
    ) -> None:
        """Store a memory entry for a lead."""
        entry = {
            "agent_type": agent_type,
            "event": event,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "tenant_id": tenant_id,
        }

        self._lead_memory[lead_id].append(entry)

        # Trim if too many entries
        if len(self._lead_memory[lead_id]) > self._max_entries:
            self._lead_memory[lead_id] = self._lead_memory[lead_id][-self._max_entries:]

        logger.debug(f"Memory stored: lead={lead_id} agent={agent_type} event={event}")

    async def recall(
        self,
        lead_id: str,
        agent_type: str = None,
        limit: int = 10,
    ) -> list[dict]:
        """Recall memories for a lead, optionally filtered by agent type."""
        entries = self._lead_memory.get(lead_id, [])

        if agent_type:
            entries = [e for e in entries if e["agent_type"] == agent_type]

        return entries[-limit:]

    async def recall_context(self, lead_id: str) -> dict:
        """Get a compiled context summary for a lead."""
        entries = self._lead_memory.get(lead_id, [])
        if not entries:
            return {"has_history": False}

        # Extract key information
        agents_used = list(set(e["agent_type"] for e in entries))
        events_seen = list(set(e["event"] for e in entries))

        # Find qualification score if any
        qual_score = None
        for e in reversed(entries):
            if e["agent_type"] == "lead_qualification":
                qual_score = e["data"].get("score")
                if qual_score:
                    break

        # Find objections
        objections = []
        for e in entries:
            if e["agent_type"] == "objection_handler":
                obj = e["data"].get("objections_detected", [])
                objections.extend(obj)

        # Find preferred language
        language = "ar"
        for e in entries:
            if "language" in e.get("data", {}):
                language = e["data"]["language"]

        return {
            "has_history": True,
            "total_interactions": len(entries),
            "agents_used": agents_used,
            "events_seen": events_seen,
            "qualification_score": qual_score,
            "known_objections": list(set(objections)),
            "preferred_language": language,
            "first_contact": entries[0]["timestamp"],
            "last_contact": entries[-1]["timestamp"],
            "preferences": self._preferences.get(lead_id, {}),
        }

    async def set_preference(
        self,
        lead_id: str,
        key: str,
        value: Any,
    ) -> None:
        """Set a customer preference."""
        if lead_id not in self._preferences:
            self._preferences[lead_id] = {}
        self._preferences[lead_id][key] = value

    async def get_preferences(self, lead_id: str) -> dict:
        """Get all customer preferences."""
        return self._preferences.get(lead_id, {})

    async def learn_pattern(
        self,
        tenant_id: str,
        pattern_type: str,
        pattern_data: dict,
    ) -> None:
        """Store a learned pattern at the tenant level."""
        self._tenant_patterns[tenant_id].append({
            "type": pattern_type,
            "data": pattern_data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    async def get_patterns(
        self,
        tenant_id: str,
        pattern_type: str = None,
    ) -> list[dict]:
        """Get learned patterns for a tenant."""
        patterns = self._tenant_patterns.get(tenant_id, [])
        if pattern_type:
            patterns = [p for p in patterns if p["type"] == pattern_type]
        return patterns[-20:]

    async def set_active_context(
        self,
        lead_id: str,
        context: dict,
    ) -> None:
        """Set the active conversation context for a lead."""
        self._active_contexts[lead_id] = {
            **context,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

    async def get_active_context(self, lead_id: str) -> Optional[dict]:
        """Get the active conversation context for a lead."""
        return self._active_contexts.get(lead_id)

    async def build_agent_context(
        self,
        lead_id: str,
        agent_type: str,
        input_data: dict,
    ) -> dict:
        """
        Build enriched context for an agent invocation.
        Combines current input with all available memory.
        """
        context = dict(input_data)

        # Add history context
        history = await self.recall_context(lead_id)
        if history.get("has_history"):
            context["_memory"] = {
                "previous_interactions": history["total_interactions"],
                "agents_used_before": history["agents_used"],
                "qualification_score": history["qualification_score"],
                "known_objections": history["known_objections"],
                "preferred_language": history["preferred_language"],
                "customer_preferences": history["preferences"],
            }

        # Add recent same-agent history
        recent = await self.recall(lead_id, agent_type=agent_type, limit=3)
        if recent:
            context["_previous_outputs"] = [
                {
                    "event": r["event"],
                    "timestamp": r["timestamp"],
                    "summary": str(r["data"])[:200],
                }
                for r in recent
            ]

        # Add active context
        active = await self.get_active_context(lead_id)
        if active:
            context["_active_context"] = active

        return context

    def get_stats(self) -> dict:
        """Get memory usage statistics."""
        total_entries = sum(len(v) for v in self._lead_memory.values())
        return {
            "leads_tracked": len(self._lead_memory),
            "total_entries": total_entries,
            "preferences_stored": len(self._preferences),
            "active_contexts": len(self._active_contexts),
            "patterns_learned": sum(len(v) for v in self._tenant_patterns.values()),
        }


# Global singleton
agent_memory = AgentMemory()
