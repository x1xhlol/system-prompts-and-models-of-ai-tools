"""Revenue discovery / Dealix master paths used by the workspace UI."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_channel_drafts_governed_linkedin():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.post(
            "/api/v1/dealix/channel-drafts",
            json={"company_name": "شركة اختبار", "partnership_angle_ar": "تكامل تقني"},
        )
    assert r.status_code == 200
    data = r.json()
    assert data["linkedin"]["human_in_loop_required"] is True
    assert "policy_note_ar" in data["linkedin"]
    assert "لا يُرسل هذا النص تلقائياً" in data["linkedin"]["policy_note_ar"]
    assert data["governance"]["approval_recommended"] is True
    assert "whatsapp_draft_ar" in data


@pytest.mark.asyncio
async def test_ai_eval_golden_loads():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get("/api/v1/dealix/ai-eval/golden")
    assert r.status_code == 200
    data = r.json()
    assert "channel_drafts" in data or data.get("version") == 0


@pytest.mark.asyncio
async def test_enrich_async_returns_job():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.post(
            "/api/v1/dealix/enrich-exploration/async",
            json={"sector": "الصحة", "city": "الرياض", "lead": {"company_name": "اختبار مهمة"}},
        )
        assert r.status_code == 200
        data = r.json()
        assert "job_id" in data
        jid = data["job_id"]
        r2 = await client.get(f"/api/v1/dealix/enrich-exploration/jobs/{jid}")
        assert r2.status_code == 200
        body = r2.json()
        assert body.get("status") in ("pending", "running", "done", "error")


@pytest.mark.asyncio
async def test_intelligence_flags_public():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get("/api/v1/dealix/intelligence-flags")
    assert r.status_code == 200
    data = r.json()
    assert "licensed_web_search_allowed" in data
    assert "enrich_idempotent_daily" in data


@pytest.mark.asyncio
async def test_enrich_exploration_returns_provenance_shape():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.post(
            "/api/v1/dealix/enrich-exploration",
            json={
                "sector": "الصحة",
                "city": "الرياض",
                "lead": {"company_name": "مختبر تجريبي"},
                "icp_notes_ar": "اختبار",
            },
        )
    assert r.status_code == 200
    body = r.json()
    assert "provenance" in body
    assert isinstance(body["provenance"], list)
