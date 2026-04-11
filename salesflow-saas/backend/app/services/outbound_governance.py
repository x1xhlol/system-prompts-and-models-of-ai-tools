"""
حوكمة الإرسال: عند تفعيلها في tenant.settings["governance"] لا يُرسل واتساب آلياً
بل يُنشأ طلب موافقة ويُسجَّل حدث نطاق.
"""

from __future__ import annotations

from typing import Any, Dict, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations.whatsapp import send_whatsapp_message
from app.models.operations import ApprovalRequest
from app.models.tenant import Tenant
from app.models.user import User
from app.services.operations_hub import emit_domain_event


def _governance_whatsapp_approval_required(settings: Optional[dict]) -> bool:
    if not isinstance(settings, dict):
        return False
    gov = settings.get("governance") or {}
    return bool(gov.get("whatsapp_outbound_requires_approval"))


async def send_whatsapp_with_governance(
    db: AsyncSession,
    *,
    tenant_id: UUID,
    phone: str,
    message: str,
    lead_id: UUID,
) -> Dict[str, Any]:
    t_result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = t_result.scalar_one_or_none()
    settings = tenant.settings if tenant and isinstance(tenant.settings, dict) else {}

    if not _governance_whatsapp_approval_required(settings):
        out = await send_whatsapp_message(phone, message)
        return {"sent": True, "result": out}

    u_result = await db.execute(
        select(User)
        .where(User.tenant_id == tenant_id, User.role.in_(["owner", "admin"]))
        .order_by(User.created_at.asc())
        .limit(1)
    )
    actor = u_result.scalar_one_or_none()
    if not actor:
        u_result = await db.execute(
            select(User).where(User.tenant_id == tenant_id).order_by(User.created_at.asc()).limit(1)
        )
        actor = u_result.scalar_one_or_none()
    if not actor:
        out = await send_whatsapp_message(phone, message)
        return {"sent": True, "result": out, "note": "no user for approval queue; sent anyway"}

    row = ApprovalRequest(
        tenant_id=tenant_id,
        channel="whatsapp",
        resource_type="lead",
        resource_id=lead_id,
        payload={"phone": phone, "message_preview": (message or "")[:2000], "kind": "ai_inbound_reply"},
        status="pending",
        requested_by_id=actor.id,
    )
    db.add(row)
    await db.flush()
    await emit_domain_event(
        db,
        tenant_id=tenant_id,
        event_type="whatsapp.outbound.deferred_for_approval",
        payload={"approval_id": str(row.id), "lead_id": str(lead_id)},
        source="webhook",
    )
    return {"sent": False, "pending_approval": True, "approval_id": str(row.id)}
