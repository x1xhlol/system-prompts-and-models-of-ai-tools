from __future__ import annotations

from typing import Any, Dict

from app.openclaw.approval_bridge import approval_bridge


SENSITIVE_ACTIONS = {
    "send_whatsapp",
    "send_email",
    "send_linkedin",
    "trigger_voice_call",
    "sync_salesforce",
    "create_contract",
    "send_contract_for_signature",
    "create_charge",
}


def before_agent_reply(action: str, payload: Dict[str, Any], tenant_id: str) -> Dict[str, Any]:
    """
    OpenClaw-style governance hook.
    Blocks sensitive actions when tenant isolation or approvals are missing.
    """
    gate = approval_bridge.evaluate(action=action, payload=payload, tenant_id=tenant_id)
    # Keep old response contract for compatibility with existing tests/callers.
    return {"allowed": gate["allowed"], "reason": gate["reason"]}
