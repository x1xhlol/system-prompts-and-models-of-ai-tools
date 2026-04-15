"""
Dealix Multi-Agent System
=========================
20 specialized AI agents orchestrated through an event-driven
autonomous pipeline with priority-based execution.

Architecture:
─────────────
  Event → Router → Executor → [Memory + LLM + QA Gate] → Dispatcher → Services
                                      ↓
                              Escalation Handler → Human Team

Components:
- router.py — Agent registry + event routing (30 events, 3 execution modes)
- executor.py — LLM execution + output parsing + memory + QA gate
- autonomous_pipeline.py — 11-stage sales state machine
- action_dispatcher.py — 13 action types dispatched to services
- quality_gate.py — Self-correction loop via QA reviewer
- escalation_handler.py — Agent-to-human escalation bridge
- memory.py — Long-term agent context and customer preferences
- manus_orchestrator.py — Multi-agent orchestration
"""

from app.services.agents.router import AgentRouter, AgentConfig, EventConfig, ExecutionMode
from app.services.agents.executor import AgentExecutor, AgentResult

__all__ = [
    "AgentRouter",
    "AgentConfig",
    "EventConfig",
    "ExecutionMode",
    "AgentExecutor",
    "AgentResult",
]
