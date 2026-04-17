"""Tier-1 golden path: Partner intake → Class B → Executive snapshot (contract test)."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.schemas.structured_outputs import ExecWeeklyGovernanceContract
from app.services.core_os.decision_plane_contracts import validate_class_b_bundle


@pytest.mark.asyncio
async def test_tier1_golden_path_partner_demo_chain():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r1 = await client.get("/api/v1/approval-center/class-b-decision-bundle")
        assert r1.status_code == 200
        bundle = r1.json()
        validate_class_b_bundle(bundle)

        r2 = await client.post("/api/v1/approval-center/validate-class-b-bundle", json=bundle)
        assert r2.status_code == 200
        assert r2.json().get("status") == "valid"
        assert r2.json().get("correlation_id") == bundle["execution_intent_json"]["correlation_id"]

        bad = dict(bundle)
        bad["execution_intent_json"] = dict(bundle["execution_intent_json"])
        bad["execution_intent_json"]["correlation_id"] = "   "
        r3 = await client.post("/api/v1/approval-center/validate-class-b-bundle", json=bad)
        assert r3.status_code == 422

        r4 = await client.post(
            "/api/v1/approval-center/demo-1/approve",
            json={"hitl": "approve", "decision_bundle": bundle},
        )
        assert r4.status_code == 200

        r5 = await client.get("/api/v1/executive-room/snapshot")
        assert r5.status_code == 200
        snap = r5.json()
        tier1 = snap.get("tier1_exec_surface") or {}
        parsed = ExecWeeklyGovernanceContract.model_validate(tier1)
        assert parsed.provenance.trace_id == bundle["execution_intent_json"]["correlation_id"]
        assert list(parsed.pending_decisions) == list(bundle["memo_json"]["required_approvals"])

        r6 = await client.get("/api/v1/evidence-packs/tier1-demo")
        assert r6.status_code == 200
        assert r6.json().get("verification_status")

        r7 = await client.get("/api/v1/connectors/governance")
        assert r7.status_code == 200
        assert "tier1_connector_surface" in r7.json()
