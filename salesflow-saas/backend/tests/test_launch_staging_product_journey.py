"""
Staging / CI — مسار منتج واحد + دخان قناة (بريد عبر outreach بدون إرسال SMTP).

يُكمّل test_new_subscriber_journey ويُثبت أن القنوات تستجيب بعد تسجيل مستخدم.
"""

from __future__ import annotations

import uuid

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.launch
@pytest.mark.asyncio
async def test_staging_happy_path_dashboard_and_email_channel_draft():
    suffix = uuid.uuid4().hex[:14]
    email = f"staging_path_{suffix}@dealix.journey.test"
    password = "Staging_Secure_Pass_9"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        reg = await ac.post(
            "/api/v1/auth/register",
            json={
                "company_name": f"Staging Path Co {suffix}",
                "company_name_ar": "شركة مسار الاختبار",
                "full_name": "مالك الاختبار",
                "email": email,
                "password": password,
                "phone": "0501112233",
                "industry": "real_estate",
            },
        )
        assert reg.status_code == 200, reg.text
        token = reg.json()["access_token"]

        dash = await ac.get(
            "/api/v1/dashboard/overview",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert dash.status_code == 200

        outreach = await ac.post(
            "/api/v1/outreach",
            json={
                "channel": "email",
                "lead": {
                    "name": "عميل تجريبي",
                    "company": "عقار الرياض",
                    "sector": "عقار",
                },
                "campaign_type": "cold_intro",
                "language": "ar",
            },
        )
        assert outreach.status_code == 200, outreach.text
        body = outreach.json()
        assert body.get("channel") == "email"
        assert "subject" in body and "body" in body
        assert len(body["subject"]) > 0 and len(body["body"]) > 0
