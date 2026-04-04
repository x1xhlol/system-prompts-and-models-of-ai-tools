"""
مسار مشترك جديد — واقعي: تسجيل شركة، اشتراك trial، JWT، لوحة تحكم، ثم تسجيل دخول لاحق.
يُكمّل test_launch_readiness_scenarios ويُحاكي ما يفعله عميل يضغط «اشترك».
"""

from __future__ import annotations

import uuid

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.launch
@pytest.mark.asyncio
async def test_new_company_full_subscribe_login_dashboard_affiliate_surface():
    """1) تسجيل 2) لوحة محمية 3) login نفس الحساب 4) سطح تسويق عام 5) برنامج مسوّق."""
    suffix = uuid.uuid4().hex[:14]
    email = f"new_sub_{suffix}@dealix.journey.test"
    password = "Journey_Secure_Pass_9"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        reg = await ac.post(
            "/api/v1/auth/register",
            json={
                "company_name": f"Journey Test Co {suffix}",
                "company_name_ar": "شركة رحلة الاختبار",
                "full_name": "مالك الاختبار",
                "email": email,
                "password": password,
                "phone": "0501112233",
                "industry": "saas",
            },
        )
        assert reg.status_code == 200, reg.text
        rj = reg.json()
        assert rj.get("role") == "owner"
        assert rj.get("access_token")
        assert rj.get("tenant_id")
        token = rj["access_token"]

        dash = await ac.get(
            "/api/v1/dashboard/overview",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert dash.status_code == 200
        overview = dash.json()
        assert "total_leads" in overview
        assert "conversion_rate" in overview
        assert overview["total_leads"] >= 0

        login = await ac.post(
            "/api/v1/auth/login",
            json={"email": email, "password": password},
        )
        assert login.status_code == 200
        lj = login.json()
        assert lj.get("access_token")
        assert lj.get("user_id") == rj.get("user_id")

        hub = await ac.get("/api/v1/marketing/hub")
        assert hub.status_code == 200

        prog = await ac.get("/api/v1/affiliates/program")
        assert prog.status_code == 200
        assert "journey_ar" in prog.json()


@pytest.mark.launch
@pytest.mark.asyncio
async def test_new_subscriber_refresh_token_roundtrip():
    suffix = uuid.uuid4().hex[:14]
    email = f"refresh_{suffix}@dealix.journey.test"
    password = "Refresh_Pass_8"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        reg = await ac.post(
            "/api/v1/auth/register",
            json={
                "company_name": f"Refresh Co {suffix}",
                "full_name": "User",
                "email": email,
                "password": password,
            },
        )
        assert reg.status_code == 200
        refresh = reg.json()["refresh_token"]

        ref = await ac.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh},
        )
        assert ref.status_code == 200
        nj = ref.json()
        assert nj.get("access_token")
        assert nj.get("refresh_token")
