from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel as Schema

from app.database import get_db
from app.api.deps import get_current_user, require_role
from app.models.user import User
from app.models.dispute import Dispute, DisputeStatus

router = APIRouter()


class DisputeCreate(Schema):
    affiliate_id: UUID
    commission_id: Optional[UUID] = None
    deal_id: Optional[UUID] = None
    type: str
    subject: str
    description: Optional[str] = None
    evidence: Optional[dict] = None


class DisputeUpdate(Schema):
    subject: Optional[str] = None
    description: Optional[str] = None
    evidence: Optional[dict] = None


class DisputeResponse(Schema):
    id: UUID
    tenant_id: UUID
    commission_id: Optional[UUID] = None
    deal_id: Optional[UUID] = None
    affiliate_id: UUID
    type: str
    status: str
    subject: str
    description: Optional[str] = None
    evidence: Optional[dict] = None
    resolution: Optional[str] = None
    resolved_by: Optional[UUID] = None
    resolved_at: Optional[datetime] = None
    escalated_to: Optional[UUID] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DisputeListResponse(Schema):
    items: list[DisputeResponse]
    total: int
    page: int
    per_page: int


class ResolveRequest(Schema):
    resolution: str


class EscalateRequest(Schema):
    escalate_to: UUID


@router.get("", response_model=DisputeListResponse)
async def list_disputes(
    affiliate_id: UUID = Query(None),
    status: str = Query(None),
    type: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Dispute).where(Dispute.tenant_id == current_user.tenant_id)
    if affiliate_id:
        query = query.where(Dispute.affiliate_id == affiliate_id)
    if status:
        query = query.where(Dispute.status == status)
    if type:
        query = query.where(Dispute.type == type)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.order_by(Dispute.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = [DisputeResponse.model_validate(d) for d in result.scalars().all()]
    return DisputeListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/{dispute_id}", response_model=DisputeResponse)
async def get_dispute(
    dispute_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Dispute).where(Dispute.id == dispute_id, Dispute.tenant_id == current_user.tenant_id)
    )
    dispute = result.scalar_one_or_none()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    return DisputeResponse.model_validate(dispute)


@router.post("", response_model=DisputeResponse, status_code=201)
async def create_dispute(
    data: DisputeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dispute = Dispute(
        tenant_id=current_user.tenant_id,
        status=DisputeStatus.OPEN,
        **data.model_dump(exclude_none=True),
    )
    db.add(dispute)
    await db.flush()
    await db.refresh(dispute)
    return DisputeResponse.model_validate(dispute)


@router.put("/{dispute_id}", response_model=DisputeResponse)
async def update_dispute(
    dispute_id: UUID,
    data: DisputeUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Dispute).where(Dispute.id == dispute_id, Dispute.tenant_id == current_user.tenant_id)
    )
    dispute = result.scalar_one_or_none()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    if dispute.status in (DisputeStatus.RESOLVED, DisputeStatus.REJECTED):
        raise HTTPException(status_code=400, detail="Cannot update a closed dispute")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(dispute, field, value)
    await db.flush()
    await db.refresh(dispute)
    return DisputeResponse.model_validate(dispute)


@router.post("/{dispute_id}/resolve", response_model=DisputeResponse)
async def resolve_dispute(
    dispute_id: UUID,
    data: ResolveRequest,
    current_user: User = Depends(require_role("admin", "manager")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Dispute).where(Dispute.id == dispute_id, Dispute.tenant_id == current_user.tenant_id)
    )
    dispute = result.scalar_one_or_none()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    if dispute.status in (DisputeStatus.RESOLVED, DisputeStatus.REJECTED):
        raise HTTPException(status_code=400, detail="Dispute is already closed")
    dispute.status = DisputeStatus.RESOLVED
    dispute.resolution = data.resolution
    dispute.resolved_by = current_user.id
    dispute.resolved_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(dispute)
    return DisputeResponse.model_validate(dispute)


@router.post("/{dispute_id}/escalate", response_model=DisputeResponse)
async def escalate_dispute(
    dispute_id: UUID,
    data: EscalateRequest,
    current_user: User = Depends(require_role("admin", "manager")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Dispute).where(Dispute.id == dispute_id, Dispute.tenant_id == current_user.tenant_id)
    )
    dispute = result.scalar_one_or_none()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    if dispute.status in (DisputeStatus.RESOLVED, DisputeStatus.REJECTED):
        raise HTTPException(status_code=400, detail="Cannot escalate a closed dispute")
    dispute.status = DisputeStatus.ESCALATED
    dispute.escalated_to = data.escalate_to
    await db.flush()
    await db.refresh(dispute)
    return DisputeResponse.model_validate(dispute)


@router.delete("/{dispute_id}", status_code=204)
async def delete_dispute(
    dispute_id: UUID,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Dispute).where(Dispute.id == dispute_id, Dispute.tenant_id == current_user.tenant_id)
    )
    dispute = result.scalar_one_or_none()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    if dispute.status != DisputeStatus.OPEN:
        raise HTTPException(status_code=400, detail="Can only delete open disputes")
    await db.delete(dispute)
    await db.flush()
