from app.openclaw.hooks import before_agent_reply


def test_before_agent_reply_blocks_sensitive_without_approval():
    result = before_agent_reply(
        action="send_whatsapp",
        payload={},
        tenant_id="tenant_1",
    )
    assert result["allowed"] is False
    assert "approval_required" in result["reason"]


def test_before_agent_reply_allows_safe_action():
    result = before_agent_reply(
        action="read_status",
        payload={},
        tenant_id="tenant_1",
    )
    assert result == {"allowed": True, "reason": "ok"}
