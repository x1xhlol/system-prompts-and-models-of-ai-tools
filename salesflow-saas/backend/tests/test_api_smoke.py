"""Broad smoke tests for core public JSON and health endpoints."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_health_ready_strategy_value_prop():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        h = await ac.get("/api/v1/health")
        assert h.status_code == 200

        r = await ac.get("/api/v1/ready")
        assert r.status_code == 200
        assert r.json().get("status") in ("ready", "not_ready")

        s = await ac.get("/api/v1/strategy/summary")
        assert s.status_code == 200
        assert s.json().get("product") == "Dealix"

        v = await ac.get("/api/v1/value-proposition/")
        assert v.status_code == 200
        body = v.json()
        assert len(body.get("pillars", [])) >= 4

        m = await ac.get("/api/v1/marketing/hub")
        assert m.status_code == 200

        j = await ac.get("/api/v1/customer-onboarding/journey")
        assert j.status_code == 200
        assert j.json().get("phases")
