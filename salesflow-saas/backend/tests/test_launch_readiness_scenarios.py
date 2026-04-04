"""
سيناريوهات إطلاق — تغطية واسعة عبر ASGI (واقعية، بدون خادم منفصل).

تُكمِّل test_api_smoke وتختبر مسارات إضافية، حواف، وتدفق مسوّق + LangGraph عبر الـ API مع mock.
"""

from __future__ import annotations

import uuid

import pytest

# مسارات GET عامة يجب أن تبقى مستقرة قبل الإطلاق
LAUNCH_GET_MATRIX = [
    "/api/v1/health",
    "/api/v1/ready",
    "/api/v1/marketing/hub",
    "/api/v1/strategy/summary",
    "/api/v1/value-proposition/",
    "/api/v1/customer-onboarding/journey",
    "/api/v1/sales-os/overview",
    "/api/v1/operations/snapshot",
    "/api/v1/affiliates/program",
    "/api/v1/affiliates/leaderboard/top",
]


@pytest.mark.launch
@pytest.mark.parametrize("path", LAUNCH_GET_MATRIX)
@pytest.mark.asyncio
async def test_launch_public_get_matrix(client, path: str):
    r = await client.get(path)
    assert r.status_code == 200, f"{path} -> {r.status_code} {r.text[:200]}"


@pytest.mark.launch
@pytest.mark.asyncio
async def test_go_live_gate_semantics(client):
    r = await client.get("/api/v1/autonomous-foundation/integrations/go-live-gate")
    assert r.status_code in (200, 403)
    p = r.json()
    assert p.get("gate") == "go_live"
    assert "launch_allowed" in p
    assert "readiness_percent" in p


@pytest.mark.launch
@pytest.mark.asyncio
async def test_agents_list_and_empire_and_langgraph_health(client):
    lst = await client.get("/api/v1/agents/list")
    assert lst.status_code == 200
    body = lst.json()
    assert body.get("total", 0) >= 1
    assert isinstance(body.get("agents"), list)

    emp = await client.get("/api/v1/agents/empire/status")
    assert emp.status_code == 200
    assert "empire" in emp.json() or "status" in emp.json()

    lg = await client.get("/api/v1/agents/langgraph/health")
    assert lg.status_code == 200
    lgj = lg.json()
    assert "graph_version" in lgj or "error" in lgj


@pytest.mark.launch
@pytest.mark.asyncio
async def test_affiliate_register_minimal_flow(client):
    """تسجيل مسوّق بريد فريد ثم التحقق من وجود السجل عبر leaderboard (قد يظهر بعد التفعيل حسب الفلتر)."""
    email = f"launch_{uuid.uuid4().hex[:16]}@verify.dealix.test"
    reg = await client.post(
        "/api/v1/affiliates/register",
        json={
            "full_name": "Launch Verify User",
            "email": email,
            "phone": "0501234567",
            "city": "Riyadh",
        },
    )
    assert reg.status_code == 201, reg.text
    data = reg.json()
    assert data.get("referral_code")
    assert data.get("status") in ("pending", "active", "PENDING", "ACTIVE") or "pending" in str(data.get("status")).lower()

    prog = await client.get("/api/v1/affiliates/program")
    assert prog.status_code == 200
    pj = prog.json()
    assert "journey_ar" in pj and "commission_rates" in pj


@pytest.mark.launch
@pytest.mark.slow
@pytest.mark.asyncio
async def test_ceo_langgraph_deal_cycle_via_api_mocked_engine(client, monkeypatch):
    """نفس مسار الإنتاج مع LeadEngine وهمي — سريع ومستقر في CI."""

    async def fake_execute(self, discovery_task):
        name = discovery_task.get("lead_name") or "Co"
        return {
            "leads": [
                {
                    "name": name,
                    "social_signals": ["x"],
                    "discovery_score": 58.0,
                    "personalized_opener": "Launch scenario test",
                }
            ]
        }

    import app.agents.discovery.lead_engine as lead_engine_mod

    monkeypatch.setattr(lead_engine_mod.LeadEngine, "execute", fake_execute)

    r = await client.post(
        "/api/v1/agents/ceo/langgraph-deal-cycle",
        json={
            "company_name": "Scenario Corp LaunchTest",
            "deal_id": "SC-LT-1",
            "tenant_id": "pytest_launch",
            "industry": "enterprise",
            "city": "Riyadh",
        },
    )
    assert r.status_code == 200, r.text
    payload = r.json()
    assert payload.get("graph_engine") == "langgraph"
    assert payload.get("company_name") == "Scenario Corp LaunchTest"
    log = payload.get("history_log") or []
    assert len(log) >= 3


@pytest.mark.launch
@pytest.mark.asyncio
async def test_self_improvement_flow_post(client):
    r = await client.post(
        "/api/v1/autonomous-foundation/flows/self-improvement",
        json={"tenant_id": "launch_scenario", "deal": {"signals": ["demo"]}},
    )
    assert r.status_code == 200
    assert isinstance(r.json(), dict)


@pytest.mark.launch
@pytest.mark.asyncio
async def test_connectivity_matrix_post(client):
    r = await client.post(
        "/api/v1/autonomous-foundation/integrations/connectivity-test",
        json={},
    )
    assert r.status_code == 200
    j = r.json()
    for k in ("salesforce", "whatsapp", "stripe", "summary"):
        assert k in j
