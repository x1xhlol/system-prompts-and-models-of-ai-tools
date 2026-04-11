from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone, timedelta
from typing import Optional
from pydantic import BaseModel as Schema

from app.database import get_db
from app.api.deps import require_role
from app.models.user import User
from app.models.commission import Commission, CommissionStatus
from app.models.dispute import Dispute, DisputeStatus
from app.models.guarantee import GuaranteeClaim, GuaranteeStatus
from app.models.lead import Lead
from app.models.compliance import Consent, ConsentStatus
from app.models.ai_conversation import AIConversation

router = APIRouter()


class QueueItem(Schema):
    queue: str
    count: int
    oldest_at: Optional[datetime] = None


class SupervisorDashboard(Schema):
    queues: list[QueueItem]
    total_action_items: int


@router.get("/dashboard", response_model=SupervisorDashboard)
async def supervisor_dashboard(
    current_user: User = Depends(require_role("admin", "manager", "supervisor")),
    db: AsyncSession = Depends(get_db),
):
    queues = []

    # Pending commissions
    pending_result = await db.execute(
        select(func.count(Commission.id), func.min(Commission.created_at))
        .where(Commission.tenant_id == current_user.tenant_id, Commission.status.in_([CommissionStatus.PENDING, CommissionStatus.DRAFT]))
    )
    row = pending_result.one()
    queues.append(QueueItem(queue="pending_commissions", count=row[0] or 0, oldest_at=row[1]))

    # Open disputes
    disputes_result = await db.execute(
        select(func.count(Dispute.id), func.min(Dispute.created_at))
        .where(Dispute.tenant_id == current_user.tenant_id, Dispute.status.in_([DisputeStatus.OPEN, DisputeStatus.INVESTIGATING, DisputeStatus.ESCALATED]))
    )
    row = disputes_result.one()
    queues.append(QueueItem(queue="disputes", count=row[0] or 0, oldest_at=row[1]))

    # Guarantee claims
    claims_result = await db.execute(
        select(func.count(GuaranteeClaim.id), func.min(GuaranteeClaim.created_at))
        .where(GuaranteeClaim.tenant_id == current_user.tenant_id, GuaranteeClaim.status.in_([GuaranteeStatus.SUBMITTED, GuaranteeStatus.REVIEWING]))
    )
    row = claims_result.one()
    queues.append(QueueItem(queue="guarantee_claims", count=row[0] or 0, oldest_at=row[1]))

    # Stale leads (no update in 7+ days)
    stale_cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    stale_result = await db.execute(
        select(func.count(Lead.id), func.min(Lead.updated_at))
        .where(
            Lead.tenant_id == current_user.tenant_id,
            Lead.status.in_(["new", "contacted"]),
            Lead.updated_at < stale_cutoff,
        )
    )
    row = stale_result.one()
    queues.append(QueueItem(queue="stale_leads", count=row[0] or 0, oldest_at=row[1]))

    # Missing consents
    missing_result = await db.execute(
        select(func.count(Consent.id), func.min(Consent.created_at))
        .where(Consent.tenant_id == current_user.tenant_id, Consent.status == ConsentStatus.PENDING)
    )
    row = missing_result.one()
    queues.append(QueueItem(queue="missing_consents", count=row[0] or 0, oldest_at=row[1]))

    total = sum(q.count for q in queues)
    return SupervisorDashboard(queues=queues, total_action_items=total)


@router.get("/pending-commissions")
async def pending_commissions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role("admin", "manager", "supervisor")),
    db: AsyncSession = Depends(get_db),
):
    query = select(Commission).where(
        Commission.tenant_id == current_user.tenant_id,
        Commission.status.in_([CommissionStatus.PENDING, CommissionStatus.DRAFT]),
    ).order_by(Commission.created_at.asc())
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    result = await db.execute(query.offset((page - 1) * per_page).limit(per_page))
    items = result.scalars().all()
    return {"items": [{"id": str(c.id), "affiliate_id": str(c.affiliate_id), "amount": c.amount, "status": c.status.value, "created_at": c.created_at.isoformat()} for c in items], "total": total}


@router.get("/disputes")
async def open_disputes(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role("admin", "manager", "supervisor")),
    db: AsyncSession = Depends(get_db),
):
    query = select(Dispute).where(
        Dispute.tenant_id == current_user.tenant_id,
        Dispute.status.in_([DisputeStatus.OPEN, DisputeStatus.INVESTIGATING, DisputeStatus.ESCALATED]),
    ).order_by(Dispute.created_at.asc())
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    result = await db.execute(query.offset((page - 1) * per_page).limit(per_page))
    items = result.scalars().all()
    return {"items": [{"id": str(d.id), "type": d.type.value, "subject": d.subject, "status": d.status.value, "created_at": d.created_at.isoformat()} for d in items], "total": total}


@router.get("/guarantee-claims")
async def pending_guarantees(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role("admin", "manager", "supervisor")),
    db: AsyncSession = Depends(get_db),
):
    query = select(GuaranteeClaim).where(
        GuaranteeClaim.tenant_id == current_user.tenant_id,
        GuaranteeClaim.status.in_([GuaranteeStatus.SUBMITTED, GuaranteeStatus.REVIEWING]),
    ).order_by(GuaranteeClaim.created_at.asc())
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    result = await db.execute(query.offset((page - 1) * per_page).limit(per_page))
    items = result.scalars().all()
    return {"items": [{"id": str(g.id), "customer_id": str(g.customer_id), "reason": g.reason, "status": g.status.value, "created_at": g.created_at.isoformat()} for g in items], "total": total}


@router.get("/stale-leads")
async def stale_leads(
    days: int = Query(7, ge=1),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role("admin", "manager", "supervisor")),
    db: AsyncSession = Depends(get_db),
):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    query = select(Lead).where(
        Lead.tenant_id == current_user.tenant_id,
        Lead.status.in_(["new", "contacted"]),
        Lead.updated_at < cutoff,
    ).order_by(Lead.updated_at.asc())
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    result = await db.execute(query.offset((page - 1) * per_page).limit(per_page))
    items = result.scalars().all()
    return {"items": [{"id": str(l.id), "name": l.name, "status": l.status, "updated_at": l.updated_at.isoformat() if l.updated_at else None} for l in items], "total": total}


@router.get("/missing-consents")
async def missing_consents(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role("admin", "manager", "supervisor")),
    db: AsyncSession = Depends(get_db),
):
    query = select(Consent).where(
        Consent.tenant_id == current_user.tenant_id,
        Consent.status == ConsentStatus.PENDING,
    ).order_by(Consent.created_at.asc())
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    result = await db.execute(query.offset((page - 1) * per_page).limit(per_page))
    items = result.scalars().all()
    return {"items": [{"id": str(c.id), "contact_phone": c.contact_phone, "channel": c.channel.value, "created_at": c.created_at.isoformat()} for c in items], "total": total}
