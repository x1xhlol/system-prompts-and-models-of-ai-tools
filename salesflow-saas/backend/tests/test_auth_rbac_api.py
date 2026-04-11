"""عزل مندوب على الصفقات والعملاء المحتملين + رموز JWT."""

import uuid
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.api.deps import get_current_user
from app.database import async_session
from app.main import app
from app.models.user import User


@pytest_asyncio.fixture
async def rbac_ctx():
    from app.database import async_session
    from app.models.tenant import Tenant
    from app.models.user import User
    from app.models.deal import Deal
    from app.models.lead import Lead
    suffix = uuid.uuid4().hex[:10]
    async with async_session() as db:
        tenant = Tenant(
            name=f"RBAC Co {suffix}",
            slug=f"rbac-{suffix}",
            email=f"rbac-{suffix}@example.com",
        )
        db.add(tenant)
        await db.flush()
        # JWT tests only — avoid bcrypt/env variance in CI
        stub_hash = "$2b$12$dummyNotForLoginxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        agent1 = User(
            tenant_id=tenant.id,
            email=f"a1-{suffix}@example.com",
            password_hash=stub_hash,
            full_name="Agent One",
            role="agent",
        )
        agent2 = User(
            tenant_id=tenant.id,
            email=f"a2-{suffix}@example.com",
            password_hash=stub_hash,
            full_name="Agent Two",
            role="agent",
        )
        db.add_all([agent1, agent2])
        await db.flush()
        deal = Deal(
            tenant_id=tenant.id,
            assigned_to=agent1.id,
            title="Deal for A1",
            stage="new",
        )
        lead = Lead(tenant_id=tenant.id, assigned_to=agent1.id, name="Lead A1")
        db.add_all([deal, lead])
        await db.commit()

    return {
        "agent1_id": str(agent1.id),
        "agent2_id": str(agent2.id),
        "deal_id": str(deal.id),
        "lead_id": str(lead.id),
    }


def _user_override(user_id: str):
    async def _dep():
        async with async_session() as db:
            row = (await db.execute(select(User).where(User.id == user_id))).scalar_one()
            return row

    return _dep


@pytest.mark.asyncio
async def test_agent_sees_only_assigned_deals(rbac_ctx):
    transport = ASGITransport(app=app)
    app.dependency_overrides[get_current_user] = _user_override(rbac_ctx["agent1_id"])
    try:
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            r1 = await ac.get("/api/v1/deals")
            assert r1.status_code == 200
            assert len(r1.json()) == 1
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    app.dependency_overrides[get_current_user] = _user_override(rbac_ctx["agent2_id"])
    try:
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            r2 = await ac.get("/api/v1/deals")
            assert r2.status_code == 200
            assert len(r2.json()) == 0
    finally:
        app.dependency_overrides.pop(get_current_user, None)


@pytest.mark.asyncio
async def test_agent_cannot_update_other_deal(rbac_ctx):
    transport = ASGITransport(app=app)
    app.dependency_overrides[get_current_user] = _user_override(rbac_ctx["agent2_id"])
    try:
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            r = await ac.put(
                f"/api/v1/deals/{rbac_ctx['deal_id']}",
                json={"notes": "hack"},
            )
            assert r.status_code in (403, 404)
    finally:
        app.dependency_overrides.pop(get_current_user, None)


@pytest.mark.asyncio
async def test_agent_sees_only_assigned_leads(rbac_ctx):
    transport = ASGITransport(app=app)
    app.dependency_overrides[get_current_user] = _user_override(rbac_ctx["agent1_id"])
    try:
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            r1 = await ac.get("/api/v1/leads")
            assert r1.status_code == 200
            assert r1.json()["total"] == 1
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    app.dependency_overrides[get_current_user] = _user_override(rbac_ctx["agent2_id"])
    try:
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            r2 = await ac.get("/api/v1/leads")
            assert r2.status_code == 200
            assert r2.json()["total"] == 0
    finally:
        app.dependency_overrides.pop(get_current_user, None)


@pytest.mark.asyncio
async def test_agent_cannot_read_other_lead(rbac_ctx):
    transport = ASGITransport(app=app)
    app.dependency_overrides[get_current_user] = _user_override(rbac_ctx["agent2_id"])
    try:
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            r = await ac.get(f"/api/v1/leads/{rbac_ctx['lead_id']}")
            assert r.status_code in (403, 404)
    finally:
        app.dependency_overrides.pop(get_current_user, None)
