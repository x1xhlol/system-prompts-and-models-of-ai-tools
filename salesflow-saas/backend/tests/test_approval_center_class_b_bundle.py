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
