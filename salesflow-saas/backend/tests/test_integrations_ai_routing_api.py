"""Smoke tests for CRM status and AI routing (JWT bypass via dependency override)."""

import uuid

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.api.deps import get_current_user
from app.database import async_session
from app.main import app
from app.models.tenant import Tenant
from app.models.user import User


@pytest_asyncio.fixture
async def owner_user_id():
    suffix = uuid.uuid4().hex[:10]
    async with async_session() as db:
        tenant = Tenant(
            name=f"IntTest {suffix}",
            slug=f"inttest-{suffix}",
            email=f"tenant-{suffix}@example.com",
        )
        db.add(tenant)
        await db.flush()
        user = User(
            tenant_id=tenant.id,
            email=f"owner-{suffix}@example.com",
            password_hash="$2b$12$dummyNotForLoginxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
            full_name="Owner",
            role="owner",
        )
        db.add(user)
        await db.commit()
        uid = str(user.id)
    yield uid


def _user_override(user_id: str):
    async def _dep():
        async with async_session() as db:
            row = (await db.execute(select(User).where(User.id == user_id))).scalar_one()
            return row

    return _dep


@pytest.mark.asyncio
async def test_integrations_crm_status_shape(owner_user_id):
    app.dependency_overrides[get_current_user] = _user_override(owner_user_id)
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            r = await ac.get("/api/v1/integrations/crm/status")
            assert r.status_code == 200, r.text
            data = r.json()
            assert "salesforce" in data and "hubspot" in data
            assert "env_refresh_configured" in data["salesforce"]
            assert "docs" in data
    finally:
        app.dependency_overrides.pop(get_current_user, None)


@pytest.mark.asyncio
async def test_ai_routing_shape(owner_user_id):
    app.dependency_overrides[get_current_user] = _user_override(owner_user_id)
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            r = await ac.get("/api/v1/ai/routing")
            assert r.status_code == 200, r.text
            data = r.json()
            assert "effective" in data
            assert "available_providers" in data
            assert isinstance(data["effective"], dict)
            assert "note_ar" in data
    finally:
        app.dependency_overrides.pop(get_current_user, None)
