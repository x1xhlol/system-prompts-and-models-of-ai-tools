"""Dashboard-facing OpenClaw canary policy context (per-tenant, read-only)."""

from __future__ import annotations

from typing import Any, Dict, List

from app.config import get_settings


def get_canary_dashboard_context(tenant_id: str) -> Dict[str, Any]:
    """Summarize canary list and whether this tenant may run Class-A auto actions without extra approval."""
    tid = (tenant_id or "").strip()
    s = get_settings()
    raw = (s.OPENCLAW_CANARY_TENANTS or "").strip()
    canary_list: List[str] = [x.strip() for x in raw.split(",") if x.strip()]
    enforced = bool(s.OPENCLAW_CANARY_ENFORCE_AUTO_ACTIONS)
    # Empty list = all tenants treated as canary for auto (no extra gate).
    in_canary = not canary_list or tid in canary_list
    auto_class_a_requires_extra = enforced and bool(canary_list) and not in_canary
    return {
        "enforced": enforced,
        "tenant_in_canary": in_canary,
        "canary_tenant_ids": canary_list,
        "canary_count": len(canary_list),
        "auto_class_a_requires_extra_approval": auto_class_a_requires_extra,
        "hint_ar": (
            "هذا المستأجر ضمن كناري التشغيل التلقائي — الإجراءات الآمنة (Class A) تمر بدون موافقة إضافية."
            if in_canary or not canary_list
            else "خارج قائمة الكناري — الإجراءات التلقائية الآمنة تتطلب موافقة أو رمز موافقة حتى مع سياسة الكناري."
        ),
    }
