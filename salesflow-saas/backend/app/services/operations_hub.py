from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.operations import ApprovalRequest, DomainEvent, IntegrationSyncState


async def emit_domain_event(
    db: AsyncSession,
    *,
    tenant_id: UUID,
    event_type: str,
    payload: Dict[str, Any],
    source: str = "api",
    correlation_id: Optional[str] = None,
) -> DomainEvent:
    row = DomainEvent(
        tenant_id=tenant_id,
        event_type=event_type,
        payload=payload,
        source=source,
        correlation_id=correlation_id,
    )
    db.add(row)
    await db.flush()
    return row


async def count_events_since(
    db: AsyncSession,
    tenant_id: UUID,
    hours: int = 24,
) -> int:
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    q = await db.execute(
        select(func.count()).select_from(DomainEvent).where(
            DomainEvent.tenant_id == tenant_id,
            DomainEvent.created_at >= since,
        )
    )
    return int(q.scalar() or 0)


async def count_pending_approvals(db: AsyncSession, tenant_id: UUID) -> int:
    q = await db.execute(
        select(func.count()).select_from(ApprovalRequest).where(
            ApprovalRequest.tenant_id == tenant_id,
            ApprovalRequest.status == "pending",
        )
    )
    return int(q.scalar() or 0)


_DEFAULT_CONNECTORS: List[Dict[str, str]] = [
    {"connector_key": "crm_salesforce", "display_name_ar": "Salesforce CRM", "status": "unknown"},
    {"connector_key": "whatsapp_cloud", "display_name_ar": "واتساب Cloud API", "status": "unknown"},
    {"connector_key": "stripe_billing", "display_name_ar": "Stripe — الفوترة", "status": "unknown"},
    {"connector_key": "email_sync", "display_name_ar": "مزامنة البريد", "status": "unknown"},
]


async def ensure_default_connectors(db: AsyncSession, tenant_id: UUID) -> None:
    existing = (
        await db.execute(select(IntegrationSyncState.connector_key).where(IntegrationSyncState.tenant_id == tenant_id))
    ).scalars().all()
    have = set(existing)
    for row in _DEFAULT_CONNECTORS:
        if row["connector_key"] not in have:
            db.add(
                IntegrationSyncState(
                    tenant_id=tenant_id,
                    connector_key=row["connector_key"],
                    display_name_ar=row["display_name_ar"],
                    status=row["status"],
                )
            )
    await db.flush()


async def list_integration_connectors(db: AsyncSession, tenant_id: UUID) -> List[Dict[str, Any]]:
    await ensure_default_connectors(db, tenant_id)
    q = await db.execute(
        select(IntegrationSyncState).where(IntegrationSyncState.tenant_id == tenant_id).order_by(IntegrationSyncState.connector_key)
    )
    out = []
    for row in q.scalars().all():
        out.append(
            {
                "connector_key": row.connector_key,
                "display_name_ar": row.display_name_ar,
                "status": row.status,
                "last_success_at": row.last_success_at.isoformat() if row.last_success_at else None,
                "last_attempt_at": row.last_attempt_at.isoformat() if row.last_attempt_at else None,
                "last_error": (row.last_error or "")[:500] if row.last_error else None,
            }
        )
    return out


async def upsert_connector_status(
    db: AsyncSession,
    tenant_id: UUID,
    connector_key: str,
    *,
    status: str,
    last_error: Optional[str] = None,
    success: bool = False,
) -> None:
    await ensure_default_connectors(db, tenant_id)
    q = await db.execute(
        select(IntegrationSyncState).where(
            IntegrationSyncState.tenant_id == tenant_id,
            IntegrationSyncState.connector_key == connector_key,
        )
    )
    row = q.scalar_one_or_none()
    now = datetime.now(timezone.utc)
    if not row:
        row = IntegrationSyncState(
            tenant_id=tenant_id,
            connector_key=connector_key,
            status=status,
            last_attempt_at=now,
        )
        if success:
            row.last_success_at = now
        elif last_error is not None:
            row.last_error = last_error
        db.add(row)
    else:
        row.status = status
        row.last_attempt_at = now
        if last_error is not None:
            row.last_error = last_error
        if success:
            row.last_success_at = now
            row.last_error = None
    await db.flush()
