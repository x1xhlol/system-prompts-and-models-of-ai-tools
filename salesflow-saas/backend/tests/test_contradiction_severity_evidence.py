"""Trust CI: critical / V3 contradictions require evidence."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_contradiction_critical_requires_evidence():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post(
            "/api/v1/contradictions/",
            json={
                "source_a": "a",
                "source_b": "b",
                "claim_a": "x",
                "claim_b": "y",
                "severity": "critical",
                "evidence": None,
            },
        )
        assert r.status_code == 422

        r2 = await client.post(
            "/api/v1/contradictions/",
            json={
                "source_a": "a",
                "source_b": "b",
                "claim_a": "x",
                "claim_b": "y",
                "severity": "critical",
                "evidence": {"receipt": "r1"},
            },
        )
        assert r2.status_code == 200
