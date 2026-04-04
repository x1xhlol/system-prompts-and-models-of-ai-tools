from __future__ import annotations

from typing import Any, Dict, Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


async def record_audit(
    db: AsyncSession,
    *,
    tenant_id: UUID,
    user_id: Optional[UUID],
    action: str,
    entity_type: str,
    entity_id: Optional[UUID],
    changes: Optional[Dict[str, Any]] = None,
    ip: Optional[str] = None,
) -> AuditLog:
    row = AuditLog(
        tenant_id=tenant_id,
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        changes=changes or {},
        ip_address=ip,
    )
    db.add(row)
    await db.flush()
    return row


async def count_audits_since(
    db: AsyncSession,
    tenant_id: UUID,
    hours: int = 24,
) -> int:
    from datetime import datetime, timedelta, timezone

    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    q = await db.execute(
        select(func.count()).select_from(AuditLog).where(
            AuditLog.tenant_id == tenant_id,
            AuditLog.created_at >= since,
        )
    )
    return int(q.scalar() or 0)


async def list_recent_audits(
    db: AsyncSession,
    tenant_id: UUID,
    *,
    limit: int = 50,
):
    q = await db.execute(
        select(AuditLog)
        .where(AuditLog.tenant_id == tenant_id)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
    )
    rows = q.scalars().all()
    out = []
    for a in rows:
        out.append(
            {
                "id": str(a.id),
                "action": a.action,
                "entity_type": a.entity_type,
                "entity_id": str(a.entity_id) if a.entity_id else None,
                "user_id": str(a.user_id) if a.user_id else None,
                "changes": a.changes,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
        )
    return out
