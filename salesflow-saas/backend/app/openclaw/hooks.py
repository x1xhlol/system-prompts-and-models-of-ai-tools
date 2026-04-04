from __future__ import annotations

from typing import Any, Dict


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
    if not tenant_id:
        return {"allowed": False, "reason": "missing_tenant_id"}

    if action in SENSITIVE_ACTIONS:
        if not payload.get("approval_token"):
            return {"allowed": False, "reason": f"approval_required:{action}"}
        if payload.get("cross_tenant_context"):
            return {"allowed": False, "reason": "cross_tenant_context_blocked"}

    return {"allowed": True, "reason": "ok"}
