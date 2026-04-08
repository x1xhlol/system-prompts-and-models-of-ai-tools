from __future__ import annotations

import pytest

from app.config import get_settings
from app.openclaw.approval_bridge import approval_bridge
from app.openclaw.gateway import openclaw_gateway
from app.openclaw.memory_bridge import memory_bridge
from app.openclaw.media_bridge import media_bridge
from app.openclaw.policy import classify_action
from app.openclaw.task_router import task_router


def test_policy_classification_a_b_c():
    assert classify_action("collect_signals").action_class == "A"
    assert classify_action("send_whatsapp").action_class == "B"
    c = classify_action("exfiltrate_secrets")
    assert c.action_class == "C"
    assert c.allowed is False


def test_approval_bridge_requires_token_for_class_b():
    gate = approval_bridge.evaluate(action="send_email", payload={}, tenant_id="t1")
    assert gate["allowed"] is False
    assert gate["requires_approval"] is True
    gate_ok = approval_bridge.evaluate(
        action="send_email",
        payload={"approval_token": "ok"},
        tenant_id="t1",
    )
    assert gate_ok["allowed"] is True


def test_canary_enforces_auto_action_approval_outside_canary():
    settings = get_settings()
    old_list = settings.OPENCLAW_CANARY_TENANTS
    old_flag = settings.OPENCLAW_CANARY_ENFORCE_AUTO_ACTIONS
    try:
        settings.OPENCLAW_CANARY_TENANTS = "tenant_canary"
        settings.OPENCLAW_CANARY_ENFORCE_AUTO_ACTIONS = True
        # class A action but tenant خارج canary => requires approval
        blocked = approval_bridge.evaluate(action="collect_signals", payload={}, tenant_id="tenant_other")
        assert blocked["allowed"] is False
        assert blocked["requires_approval"] is True
        assert "outside_canary" in blocked["reason"]
        allowed = approval_bridge.evaluate(
            action="collect_signals",
            payload={"approval_token": "mgr-ok"},
            tenant_id="tenant_other",
        )
        assert allowed["allowed"] is True
    finally:
        settings.OPENCLAW_CANARY_TENANTS = old_list
        settings.OPENCLAW_CANARY_ENFORCE_AUTO_ACTIONS = old_flag


def test_memory_collect_score_promote():
    item = memory_bridge.collect(tenant_id="tm", domain="revenue", content="subject line B converts higher")
    mid = item["memory_id"]
    scored = memory_bridge.score(mid, signal_count=3, repetition_count=2, impact_score=30)
    assert scored["score"] > 0
    promoted = memory_bridge.promote(mid, threshold=40)
    assert promoted["promoted"] is True
    rows = memory_bridge.list_items(tenant_id="tm", promoted_only=True)
    assert any(r["memory_id"] == mid for r in rows)


def test_media_draft_video_music():
    v = media_bridge.create_draft(tenant_id="tm2", media_type="video", prompt="launch teaser")
    m = media_bridge.create_draft(tenant_id="tm2", media_type="music", prompt="upbeat ad track")
    assert v["media_type"] == "video"
    assert m["media_type"] == "music"
    rows = media_bridge.list_drafts(tenant_id="tm2")
    assert len(rows) >= 2


@pytest.mark.asyncio
async def test_gateway_executes_registered_task():
    async def _handler(tenant_id: str, payload: dict):
        return {"tenant_id": tenant_id, "echo": payload.get("x")}

    task_router.register("unit_task", _handler)
    out = await openclaw_gateway.execute(
        tenant_id="t3",
        task_type="unit_task",
        action="collect_signals",
        payload={"x": 7},
    )
    assert out["status"] == "completed"
    assert out["result"]["echo"] == 7
