"""LangGraph CEO orchestrator: async path, state merge, and graph shape."""

from __future__ import annotations

import pytest

from app.agents.master_langgraph import (
    CEOLangGraphOrchestrator,
    GRAPH_VERSION,
    LANGGRAPH_AVAILABLE,
    build_ceo_deal_state,
)


@pytest.mark.skipif(not LANGGRAPH_AVAILABLE, reason="langgraph not installed")
@pytest.mark.asyncio
async def test_langgraph_deal_cycle_async_happy_path(monkeypatch):
    orch = CEOLangGraphOrchestrator()
    if orch.graph is None:
        pytest.skip("graph not compiled")

    async def fake_execute(self, discovery_task):
        name = discovery_task.get("lead_name") or "Co"
        return {
            "leads": [
                {
                    "name": name,
                    "social_signals": ["signal_a"],
                    "discovery_score": 55.0,
                    "personalized_opener": "Hello from test",
                }
            ]
        }

    import app.agents.discovery.lead_engine as lead_engine_mod

    monkeypatch.setattr(lead_engine_mod.LeadEngine, "execute", fake_execute)

    state = build_ceo_deal_state(
        {
            "company_name": "Acme Test SA",
            "deal_id": "T-1",
            "tenant_id": "pytest",
        }
    )
    out = await orch.run_deal_cycle_async(state)

    assert "error" not in out, out
    assert out.get("graph_engine") == "langgraph"
    assert out.get("graph_version") == GRAPH_VERSION
    assert out.get("company_name") == "Acme Test SA"
    assert out.get("deal_stage") == "QUALIFIED"
    assert out.get("strategic_tier") in ("nurture", "engage", "accelerate")
    log = out.get("history_log") or []
    assert len(log) >= 4
    assert any("Compliance" in x for x in log)
    assert out.get("email_sent") is True or any("Email" in x for x in log)


@pytest.mark.skipif(not LANGGRAPH_AVAILABLE, reason="langgraph not installed")
def test_describe_includes_nodes():
    orch = CEOLangGraphOrchestrator()
    d = orch.describe()
    assert d["graph_version"] == GRAPH_VERSION
    assert "prospecting" in d["nodes"]
    assert "strategic_gate" in d["nodes"]


def test_build_ceo_deal_state_defaults():
    s = build_ceo_deal_state({"company_name": "X"})
    assert s["company_name"] == "X"
    assert s["industry"] == "enterprise"
    assert s["city"] == "Riyadh"
    assert s["strategic_tier"] == ""
    assert s["history_log"] == ["Deal initialized."]
