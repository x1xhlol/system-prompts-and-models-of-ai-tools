"""Class B decision bundle endpoint (Tier-1 Master Closure)."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.services.core_os.decision_plane_contracts import validate_class_b_bundle


@pytest.mark.asyncio
async def test_class_b_decision_bundle_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/v1/approval-center/class-b-decision-bundle")
    assert r.status_code == 200, r.text
    data = r.json()
    validate_class_b_bundle(data)
    assert "memo_json" in data
    assert data["approval_packet_json"]["approval_class"] == "A2"


@pytest.mark.asyncio
async def test_validate_class_b_bundle_endpoint_rejects_bad_correlation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/v1/approval-center/class-b-decision-bundle")
        bundle = r.json()
        bad = dict(bundle)
        bad["execution_intent_json"] = dict(bundle["execution_intent_json"])
        bad["execution_intent_json"]["correlation_id"] = ""
        v = await client.post("/api/v1/approval-center/validate-class-b-bundle", json=bad)
    assert v.status_code == 422


@pytest.mark.asyncio
async def test_approve_with_invalid_bundle_returns_422():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/v1/approval-center/class-b-decision-bundle")
        bundle = r.json()
        bad = dict(bundle)
        bad["execution_intent_json"] = dict(bundle["execution_intent_json"])
        bad["execution_intent_json"]["correlation_id"] = ""
        a = await client.post(
            "/api/v1/approval-center/x/approve",
            json={"decision_bundle": bad},
        )
    assert a.status_code == 422
