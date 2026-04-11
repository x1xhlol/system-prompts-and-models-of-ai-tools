"""Phase 2.5: SLA escalation labels, canary snapshot context, alert dispatch guards."""

from __future__ import annotations

import uuid

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.services.sla_escalation_alerts import _escalation_level, _level_label_ar


def test_escalation_level_boundaries():
    assert _escalation_level(1.0, warn_h=4, breach_h=24, l3_mult=2.0) == 0
    assert _escalation_level(10.0, warn_h=4, breach_h=24, l3_mult=2.0) == 1
    assert _escalation_level(30.0, warn_h=4, breach_h=24, l3_mult=2.0) == 2
    assert _escalation_level(60.0, warn_h=4, breach_h=24, l3_mult=2.0) == 3


def test_level_labels_ar_non_empty():
    for i in range(4):
        assert len(_level_label_ar(i)) > 3


@pytest.mark.asyncio
async def test_operations_snapshot_includes_canary_and_escalation_keys():
    suffix = uuid.uuid4().hex[:12]
    email = f"sla25_{suffix}@dealix.test"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        reg = await ac.post(
            "/api/v1/auth/register",
            json={
                "company_name": f"SLA25 {suffix}",
                "full_name": "Owner",
                "email": email,
                "password": "Sla25_Secure_8",
            },
        )
        assert reg.status_code == 200, reg.text
        token = reg.json()["access_token"]

        snap = await ac.get(
            "/api/v1/operations/snapshot",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert snap.status_code == 200
        body = snap.json()
        oc = body.get("openclaw") or {}
        assert "canary" in oc
        assert "tenant_in_canary" in oc["canary"]
        sla = oc.get("approval_sla") or {}
        assert "escalation_by_level" in sla
        assert "alert_dispatch" in sla
        assert "alerts_config" in sla
