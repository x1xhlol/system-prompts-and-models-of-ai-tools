"""Full Auto Ops: لقطة تشغيل، تدقيق، أحداث، موافقات، صحة تكامل."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user, get_optional_user, require_role
from app.models.user import User
from app.models.operations import ApprovalRequest
from app.services.audit_service import list_recent_audits
from app.services.operations_hub import (
    count_events_since,
    count_pending_approvals,
    emit_domain_event,
    list_integration_connectors,
    upsert_connector_status,
)

router = APIRouter(prefix="/operations", tags=["Full Auto Operations"])


def _demo_snapshot() -> Dict[str, Any]:
    return {
        "demo_mode": True,
        "pending_approvals": 0,
        "domain_events_24h": 0,
        "audit_events_24h": 0,
        "connectors": [
            {"connector_key": "crm_salesforce", "display_name_ar": "Salesforce CRM", "status": "unknown", "last_success_at": None, "last_attempt_at": None, "last_error": None},
            {"connector_key": "whatsapp_cloud", "display_name_ar": "واتساب Cloud API", "status": "unknown", "last_success_at": None, "last_attempt_at": None, "last_error": None},
            {"connector_key": "stripe_billing", "display_name_ar": "Stripe — الفوترة", "status": "unknown", "last_success_at": None, "last_attempt_at": None, "last_error": None},
            {"connector_key": "email_sync", "display_name_ar": "مزامنة البريد", "status": "unknown", "last_success_at": None, "last_attempt_at": None, "last_error": None},
        ],
        "note_ar": "وضع توضيحي — سجّل الدخول لرؤية بيانات المستأجر.",
    }


@router.get("/snapshot")
async def operations_snapshot(
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    """لقطة تشغيل: موافقات معلّقة، أحداث، تدقيق، موصلات. بدون JWT: توضيحي."""
    if not user:
        return _demo_snapshot()
    from app.services.audit_service import count_audits_since

    pending = await count_pending_approvals(db, user.tenant_id)
    ev = await count_events_since(db, user.tenant_id, 24)
    aud = await count_audits_since(db, user.tenant_id, 24)
    connectors = await list_integration_connectors(db, user.tenant_id)
    return {
        "demo_mode": False,
        "pending_approvals": pending,
        "domain_events_24h": ev,
        "audit_events_24h": aud,
        "connectors": connectors,
        "note_ar": "حلقة التشغيل: أحداث مسجّلة + تدقيق + موصلات — تُوسَّع مع المزامنة الفعلية.",
    }


@router.get("/audit-logs")
async def get_audit_logs(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("owner", "admin", "manager")),
    limit: int = 80,
):
    items = await list_recent_audits(db, user.tenant_id, limit=limit)
    return {"items": items, "count": len(items)}


@router.get("/domain-events")
async def get_domain_events(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("owner", "admin", "manager")),
    limit: int = 50,
):
    from app.models.operations import DomainEvent

    q = await db.execute(
        select(DomainEvent)
        .where(DomainEvent.tenant_id == user.tenant_id)
        .order_by(DomainEvent.created_at.desc())
        .limit(limit)
    )
    rows = q.scalars().all()
    items: List[Dict[str, Any]] = []
    for e in rows:
        items.append(
            {
                "id": str(e.id),
                "event_type": e.event_type,
                "source": e.source,
                "payload": e.payload,
                "correlation_id": e.correlation_id,
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
        )
    return {"items": items, "count": len(items)}


class ApprovalCreate(BaseModel):
    channel: str = Field(..., description="whatsapp | email | sms")
    resource_type: str
    resource_id: UUID
    payload: Dict[str, Any] = Field(default_factory=dict)


class ApprovalResolve(BaseModel):
    approve: bool
    note: Optional[str] = None


@router.post("/approvals")
async def create_approval(
    body: ApprovalCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """طلب موافقة قبل إرسال — يدخل طابور pending."""
    row = ApprovalRequest(
        tenant_id=user.tenant_id,
        channel=body.channel,
        resource_type=body.resource_type,
        resource_id=body.resource_id,
        payload=body.payload,
        status="pending",
        requested_by_id=user.id,
    )
    db.add(row)
    await db.flush()
    await emit_domain_event(
        db,
        tenant_id=user.tenant_id,
        event_type="approval.requested",
        payload={"approval_id": str(row.id), "channel": body.channel},
        source="api",
    )
    return {"id": str(row.id), "status": row.status}


@router.get("/approvals")
async def list_approvals(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    status: Optional[str] = None,
):
    q = select(ApprovalRequest).where(ApprovalRequest.tenant_id == user.tenant_id)
    if status:
        q = q.where(ApprovalRequest.status == status)
    q = q.order_by(ApprovalRequest.created_at.desc()).limit(100)
    result = await db.execute(q)
    items = []
    for a in result.scalars().all():
        items.append(
            {
                "id": str(a.id),
                "channel": a.channel,
                "resource_type": a.resource_type,
                "resource_id": str(a.resource_id),
                "status": a.status,
                "requested_by_id": str(a.requested_by_id),
                "payload": a.payload,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
        )
    return {"items": items, "count": len(items)}


@router.put("/approvals/{approval_id}")
async def resolve_approval(
    approval_id: UUID,
    body: ApprovalResolve,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("owner", "admin", "manager")),
):
    q = await db.execute(
        select(ApprovalRequest).where(
            ApprovalRequest.id == approval_id,
            ApprovalRequest.tenant_id == user.tenant_id,
        )
    )
    row = q.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Approval not found")
    if row.status != "pending":
        raise HTTPException(status_code=400, detail="Not pending")
    row.status = "approved" if body.approve else "rejected"
    row.reviewed_by_id = user.id
    row.reviewed_at = datetime.now(timezone.utc)
    row.note = body.note
    await db.flush()
    await emit_domain_event(
        db,
        tenant_id=user.tenant_id,
        event_type="approval.resolved",
        payload={"approval_id": str(row.id), "result": row.status},
        source="api",
    )
    return {"id": str(row.id), "status": row.status}


class ConnectorUpdate(BaseModel):
    status: str
    success: bool = False
    last_error: Optional[str] = None


@router.put("/integration-connectors/{connector_key}")
async def update_connector(
    connector_key: str,
    body: ConnectorUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("owner", "admin")),
):
    """تحديث حالة موصل (مزامنة يدوية أو من عامل خلفي)."""
    await upsert_connector_status(
        db,
        user.tenant_id,
        connector_key,
        status=body.status,
        last_error=body.last_error,
        success=body.success,
    )
    return {"connector_key": connector_key, "ok": True}


@router.get("/integration-connectors")
async def get_connectors(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    items = await list_integration_connectors(db, user.tenant_id)
    return {"items": items, "count": len(items)}
