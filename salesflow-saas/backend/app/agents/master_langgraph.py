"""
CEO deal orchestration — LangGraph (async-first, merge-safe state).

Uses Annotated reducers so history_log appends across nodes instead of being
clobbered. Async nodes require graph.ainvoke (not invoke).
"""
from __future__ import annotations

import asyncio
import logging
import operator
from typing import Annotated, Any, Dict, List, Optional, TypedDict

try:
    from langgraph.graph import END, StateGraph

    LANGGRAPH_AVAILABLE = True
except ImportError:
    END = None  # type: ignore[misc, assignment]
    StateGraph = None  # type: ignore[misc, assignment]
    LANGGRAPH_AVAILABLE = False

try:
    from langchain_anthropic import ChatAnthropic

    ANTHROPIC_CHAT_AVAILABLE = True
except ImportError:
    ChatAnthropic = None  # type: ignore[misc, assignment]
    ANTHROPIC_CHAT_AVAILABLE = False

import os

from app.flows.self_improvement_flow import self_improvement_flow

try:
    from app.agents.discovery.prospecting_crew import ProspectingCrewRunner

    CREW_AVAILABLE = True
except ImportError:
    CREW_AVAILABLE = False

logger = logging.getLogger("dealix.ceo.langgraph")

GRAPH_VERSION = "2.2.0"


class CEOState(TypedDict):
    tenant_id: str
    deal_id: str
    company_name: str
    decision_maker: str
    industry: str
    city: str
    deal_stage: str
    intent_score: float
    next_action_payload: str
    compliance_approved: bool
    human_intervention_required: bool
    email_sent: bool
    linkedin_sent: bool
    osint_signals: List[Any]
    strategic_tier: str
    history_log: Annotated[List[str], operator.add]


def build_ceo_deal_state(overrides: Optional[Dict[str, Any]] = None) -> CEOState:
    """Canonical initial state for a deal cycle (all keys LangGraph expects)."""
    base: CEOState = {
        "tenant_id": "default_tenant",
        "deal_id": "DEAL-001",
        "company_name": "Unknown",
        "decision_maker": "CEO",
        "industry": "enterprise",
        "city": "Riyadh",
        "deal_stage": "PROSPECTING",
        "intent_score": 0.0,
        "next_action_payload": "",
        "compliance_approved": False,
        "human_intervention_required": False,
        "email_sent": False,
        "linkedin_sent": False,
        "osint_signals": [],
        "strategic_tier": "",
        "history_log": ["Deal initialized."],
    }
    if overrides:
        for k, v in overrides.items():
            if k in base:
                base[k] = v  # type: ignore[literal-required]
    return base


class CEOLangGraphOrchestrator:
    """
    Layer 1: Master orchestration — LangGraph DAG with compliance, HITL, outreach,
    CRM sync, and self-improvement tail.
    """

    def __init__(self) -> None:
        self.llm = None
        self.crew_runner = None
        self.graph = None

        if LANGGRAPH_AVAILABLE:
            self.llm = self._init_llm()
            self.crew_runner = ProspectingCrewRunner() if CREW_AVAILABLE else None
            self.graph = self._build_graph()

    def _init_llm(self):
        if not ANTHROPIC_CHAT_AVAILABLE or not ChatAnthropic:
            return None
        api_key = os.getenv("ANTHROPIC_API_KEY", "")
        if not api_key:
            return None
        return ChatAnthropic(
            model="claude-3-opus-20240229",
            temperature=0.7,
            anthropic_api_key=api_key,
        )

    async def prospecting_node(self, state: CEOState) -> Dict[str, Any]:
        from app.agents.discovery.lead_engine import LeadEngine

        company = state["company_name"]
        logger.info("LangGraph node: prospecting for %s", company)
        try:
            engine = LeadEngine()
            discovery_task = {
                "action": "discover",
                "sector": state.get("industry", "enterprise"),
                "city": state.get("city", "Riyadh"),
                "lead_name": company,
            }
            result = await engine.execute(discovery_task)
            leads = result.get("leads") or []
            matching = next((l for l in leads if l.get("name") == company), None)
            if matching:
                return {
                    "osint_signals": matching.get("social_signals") or [],
                    "intent_score": float(matching.get("discovery_score", 70.0)),
                    "next_action_payload": matching.get("personalized_opener") or "Ready to scale.",
                    "deal_stage": "QUALIFIED",
                    "history_log": [
                        f"Prospecting OK: {len(matching.get('social_signals') or [])} signals for {company}."
                    ],
                }
            return {
                "osint_signals": [],
                "intent_score": 50.0,
                "next_action_payload": f"Standard B2B outreach for {company}",
                "deal_stage": "QUALIFIED",
                "history_log": [f"Prospecting: no exact lead match; defaulting intent for {company}."],
            }
        except Exception as e:
            logger.exception("prospecting_node failed")
            return {
                "osint_signals": [],
                "intent_score": 45.0,
                "next_action_payload": f"Fallback outreach plan for {company}",
                "deal_stage": "QUALIFIED",
                "history_log": [f"Prospecting error (continuing): {e}"],
            }

    def strategic_gate_node(self, state: CEOState) -> Dict[str, Any]:
        score = float(state.get("intent_score") or 0.0)
        if score < 35:
            tier = "nurture"
        elif score < 72:
            tier = "engage"
        else:
            tier = "accelerate"
        return {
            "strategic_tier": tier,
            "history_log": [f"Strategic gate: tier={tier} (intent={score:.1f})."],
        }

    def compliance_node(self, state: CEOState) -> Dict[str, Any]:
        logger.info("LangGraph node: compliance")
        payload = (state.get("next_action_payload") or "").lower()
        blocked = any(
            x in payload
            for x in (
                "free forever",
                "guaranteed 100%",
                "guaranteed win",
                "unlimited money back",
            )
        )
        if blocked:
            return {
                "compliance_approved": False,
                "history_log": ["Compliance blocked: unauthorized claims in payload."],
            }
        return {
            "compliance_approved": True,
            "history_log": ["Compliance approved."],
        }

    def human_handoff_node(self, state: CEOState) -> Dict[str, Any]:
        logger.info("LangGraph node: human handoff routing")
        score = float(state.get("intent_score") or 0.0)
        need_hitl = not state.get("compliance_approved", False) or score > 90.0
        if need_hitl:
            return {
                "human_intervention_required": True,
                "history_log": ["Human handoff: compliance block or very high intent (>90)."],
            }
        return {
            "human_intervention_required": False,
            "history_log": ["Human handoff: auto-proceed to outreach."],
        }

    def email_outreach_node(self, state: CEOState) -> Dict[str, Any]:
        from app.services.email_service import email_service

        company = state["company_name"]
        logger.info("LangGraph node: email outreach -> %s", company)
        try:
            email_service.send_outreach_email(company)
            return {"email_sent": True, "history_log": ["Email outreach executed."]}
        except Exception as e:
            logger.exception("email_outreach_node")
            return {"email_sent": False, "history_log": [f"Email outreach failed: {e}"]}

    def linkedin_outreach_node(self, state: CEOState) -> Dict[str, Any]:
        from app.services.linkedin_service import linkedin_service

        company = state["company_name"]
        logger.info("LangGraph node: linkedin outreach -> %s", company)
        try:
            linkedin_service.send_connection_request(company)
            return {"linkedin_sent": True, "history_log": ["LinkedIn connection request sent."]}
        except Exception as e:
            logger.exception("linkedin_outreach_node")
            return {"linkedin_sent": False, "history_log": [f"LinkedIn outreach failed: {e}"]}

    def sync_salesforce_node(self, state: CEOState) -> Dict[str, Any]:
        logger.info("LangGraph node: salesforce sync (stub/log)")
        return {"history_log": ["Synced to Salesforce Agentforce (log)."]}

    async def self_improve_node(self, state: CEOState) -> Dict[str, Any]:
        try:
            result = await self_improvement_flow.run(state.get("tenant_id", "default_tenant"), None)
            rid = result.get("cycle_id", result.get("run_id", "n/a"))
            return {"history_log": [f"Self-improve loop completed: cycle_id={rid}"]}
        except Exception as e:
            logger.exception("self_improve_node")
            return {"history_log": [f"Self-improve loop error: {e}"]}

    def _build_graph(self):
        workflow = StateGraph(CEOState)

        workflow.add_node("prospecting", self.prospecting_node)
        workflow.add_node("strategic_gate", self.strategic_gate_node)
        workflow.add_node("compliance", self.compliance_node)
        workflow.add_node("human_handoff", self.human_handoff_node)
        workflow.add_node("email_outreach", self.email_outreach_node)
        workflow.add_node("linkedin_outreach", self.linkedin_outreach_node)
        workflow.add_node("salesforce_sync", self.sync_salesforce_node)
        workflow.add_node("self_improve", self.self_improve_node)

        workflow.set_entry_point("prospecting")
        workflow.add_edge("prospecting", "strategic_gate")
        workflow.add_edge("strategic_gate", "compliance")
        workflow.add_edge("compliance", "human_handoff")

        def routing_logic(state: CEOState) -> str:
            return "END" if state.get("human_intervention_required") else "outreach"

        workflow.add_conditional_edges(
            "human_handoff",
            routing_logic,
            {"outreach": "email_outreach", "END": END},
        )

        workflow.add_edge("email_outreach", "linkedin_outreach")
        workflow.add_edge("linkedin_outreach", "salesforce_sync")
        workflow.add_edge("salesforce_sync", "self_improve")
        workflow.add_edge("self_improve", END)
        return workflow.compile()

    async def run_deal_cycle_async(self, initial_state: CEOState) -> Dict[str, Any]:
        """Execute full deal DAG (must use this from async code paths)."""
        if not self.graph:
            return {
                "error": "LangGraph not available. Install langgraph and ensure imports succeed.",
                "graph_engine": "none",
            }
        try:
            final = await self.graph.ainvoke(initial_state)
            out = dict(final) if isinstance(final, dict) else {"raw": final}
            out["graph_engine"] = "langgraph"
            out["graph_version"] = GRAPH_VERSION
            return out
        except Exception as e:
            logger.exception("run_deal_cycle_async failed")
            return {"error": str(e), "graph_engine": "langgraph", "graph_version": GRAPH_VERSION}

    def run_deal_cycle(self, initial_state: CEOState) -> Dict[str, Any]:
        """Sync wrapper for CLI/tests only — uses asyncio.run when no loop is running."""
        if not self.graph:
            return {
                "error": "LangGraph not available. Install langgraph and ensure imports succeed.",
                "graph_engine": "none",
            }
        try:
            asyncio.get_running_loop()
        except RuntimeError:
            return asyncio.run(self.run_deal_cycle_async(initial_state))
        raise RuntimeError(
            "run_deal_cycle() cannot be used inside a running event loop; "
            "await run_deal_cycle_async() instead."
        )

    def describe(self) -> Dict[str, Any]:
        return {
            "graph_version": GRAPH_VERSION,
            "langgraph_available": LANGGRAPH_AVAILABLE,
            "graph_compiled": self.graph is not None,
            "anthropic_llm_configured": self.llm is not None,
            "prospecting_crew": self.crew_runner is not None,
            "nodes": [
                "prospecting",
                "strategic_gate",
                "compliance",
                "human_handoff",
                "email_outreach",
                "linkedin_outreach",
                "salesforce_sync",
                "self_improve",
            ],
        }
