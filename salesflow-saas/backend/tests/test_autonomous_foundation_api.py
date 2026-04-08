import pytest


@pytest.mark.asyncio
async def test_executive_roi_endpoint(client):
    response = await client.post(
        "/api/v1/autonomous-foundation/dashboard/executive-roi",
        json={
            "baseline": {"revenue": 100000},
            "current": {
                "revenue": 130000,
                "win_rate": 0.31,
                "pipeline_velocity_days": 19,
                "manual_work_reduction_percent": 72,
            },
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["revenue_lift_percent"] == 30.0
    assert payload["manual_work_reduction_percent"] == 72


@pytest.mark.asyncio
async def test_connectivity_endpoint(client):
    response = await client.post(
        "/api/v1/autonomous-foundation/integrations/connectivity-test",
        json={},
    )
    assert response.status_code == 200
    payload = response.json()
    assert "salesforce" in payload
    assert "whatsapp" in payload
    assert "stripe" in payload
    assert "summary" in payload
    assert payload["salesforce"].get("status") in ("ok", "error")


@pytest.mark.asyncio
async def test_live_readiness_endpoint(client):
    response = await client.get("/api/v1/autonomous-foundation/integrations/live-readiness")
    assert response.status_code == 200
    payload = response.json()
    assert "overall" in payload
    assert "checks" in payload
    assert "salesforce_client_id" in payload["checks"]
    assert "readiness_percent" in payload
    assert "missing" in payload
    assert "summary" in payload
    assert "cli_examples" in payload
    assert "powershell" in payload["cli_examples"]
    assert payload.get("launch_mode") == "full_commercial"
    assert "categories" in payload
    assert "blocking" in payload
    assert "integration_docs" in payload


@pytest.mark.asyncio
async def test_go_live_gate_returns_403_with_report_when_not_fully_ready(client):
    response = await client.get("/api/v1/autonomous-foundation/integrations/go-live-gate")
    payload = response.json()
    assert "gate" in payload
    assert payload["gate"] == "go_live"
    assert "launch_allowed" in payload
    assert "missing" in payload
    assert "checks" in payload
    assert "readiness_percent" in payload
    assert "summary" in payload
    assert "cli_examples" in payload
    assert "warnings" in payload
    if not payload["launch_allowed"]:
        assert response.status_code == 403
        assert payload["readiness_percent"] < 100.0
        assert isinstance(payload["missing"], list)
        assert payload["missing_count"] == len(payload["missing"])
    else:
        assert response.status_code == 200
        assert payload["readiness_percent"] == 100.0
        assert payload["missing_count"] == 0


@pytest.mark.asyncio
async def test_openclaw_safe_core_endpoints(client):
    h = await client.get("/api/v1/autonomous-foundation/openclaw/health")
    assert h.status_code == 200
    hj = h.json()
    assert "safe_core_enabled" in hj
    assert "registered_task_types" in hj

    pol = await client.post(
        "/api/v1/autonomous-foundation/openclaw/policy/check",
        json={"tenant_id": "t_policy", "action": "send_whatsapp", "payload": {}},
    )
    assert pol.status_code == 200
    pj = pol.json()
    assert pj["gate"]["requires_approval"] is True

    mem = await client.post(
        "/api/v1/autonomous-foundation/openclaw/memory/promote",
        json={
            "tenant_id": "t_mem",
            "domain": "revenue",
            "content": "Follow-up within 10 minutes improved close rate",
            "signal_count": 3,
            "repetition_count": 2,
            "impact_score": 30,
        },
    )
    assert mem.status_code == 200
    assert mem.json()["promoted"]["promoted"] is True

    mem_list = await client.get("/api/v1/autonomous-foundation/openclaw/memory?tenant_id=t_mem&promoted_only=true")
    assert mem_list.status_code == 200
    assert len(mem_list.json()["items"]) >= 1

    draft = await client.post(
        "/api/v1/autonomous-foundation/openclaw/media/drafts",
        json={"tenant_id": "t_media", "media_type": "video", "prompt": "Saudi launch ad teaser"},
    )
    assert draft.status_code == 200
    assert draft.json()["draft"]["status"] == "draft_pending_approval"

    runs = await client.get("/api/v1/autonomous-foundation/openclaw/runs?tenant_id=t_mem")
    assert runs.status_code == 200
    assert "items" in runs.json()
