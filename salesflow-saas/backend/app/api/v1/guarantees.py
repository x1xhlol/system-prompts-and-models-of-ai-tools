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
from app.models.guarantee import GuaranteeClaim, GuaranteeStatus

router = APIRouter()


class GuaranteeCreate(Schema):
    customer_id: UUID
    deal_id: UUID
    subscription_id: Optional[UUID] = None
    reason: str
    evidence: Optional[dict] = None
    leads_entered: int = 0
    messages_sent: int = 0
    active_days: int = 0
    onboarding_completed: bool = False


class GuaranteeUpdate(Schema):
    reason: Optional[str] = None
    evidence: Optional[dict] = None
    leads_entered: Optional[int] = None
    messages_sent: Optional[int] = None
    active_days: Optional[int] = None
    onboarding_completed: Optional[bool] = None


class GuaranteeResponse(Schema):
    id: UUID
    tenant_id: UUID
    customer_id: UUID
    deal_id: UUID
    subscription_id: Optional[UUID] = None
    status: str
    reason: str
    evidence: Optional[dict] = None
    leads_entered: int
    messages_sent: int
    active_days: int
    onboarding_completed: bool
    reviewer_id: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None
    decision_notes: Optional[str] = None
    refund_amount: Optional[float] = None
    refunded_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class GuaranteeListResponse(Schema):
    items: list[GuaranteeResponse]
    total: int
    page: int
    per_page: int


class ReviewDecision(Schema):
    decision_notes: Optional[str] = None


class RefundRequest(Schema):
    refund_amount: float


@router.get("", response_model=GuaranteeListResponse)
async def list_guarantees(
    customer_id: UUID = Query(None),
    status: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(GuaranteeClaim).where(GuaranteeClaim.tenant_id == current_user.tenant_id)
    if customer_id:
        query = query.where(GuaranteeClaim.customer_id == customer_id)
    if status:
        query = query.where(GuaranteeClaim.status == status)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.order_by(GuaranteeClaim.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = [GuaranteeResponse.model_validate(g) for g in result.scalars().all()]
    return GuaranteeListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/{claim_id}", response_model=GuaranteeResponse)
async def get_guarantee(
    claim_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GuaranteeClaim).where(GuaranteeClaim.id == claim_id, GuaranteeClaim.tenant_id == current_user.tenant_id)
    )
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Guarantee claim not found")
    return GuaranteeResponse.model_validate(claim)


@router.post("", response_model=GuaranteeResponse, status_code=201)
async def create_guarantee(
    data: GuaranteeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    claim = GuaranteeClaim(
        tenant_id=current_user.tenant_id,
        **data.model_dump(exclude_none=True),
    )
    db.add(claim)
    await db.flush()
    await db.refresh(claim)
    return GuaranteeResponse.model_validate(claim)


@router.put("/{claim_id}", response_model=GuaranteeResponse)
async def update_guarantee(
    claim_id: UUID,
    data: GuaranteeUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GuaranteeClaim).where(GuaranteeClaim.id == claim_id, GuaranteeClaim.tenant_id == current_user.tenant_id)
    )
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Guarantee claim not found")
    if claim.status != GuaranteeStatus.SUBMITTED:
        raise HTTPException(status_code=400, detail="Can only update submitted claims")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(claim, field, value)
    await db.flush()
    await db.refresh(claim)
    return GuaranteeResponse.model_validate(claim)


@router.post("/{claim_id}/review", response_model=GuaranteeResponse)
async def review_guarantee(
    claim_id: UUID,
    current_user: User = Depends(require_role("admin", "manager")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GuaranteeClaim).where(GuaranteeClaim.id == claim_id, GuaranteeClaim.tenant_id == current_user.tenant_id)
    )
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Guarantee claim not found")
    if claim.status != GuaranteeStatus.SUBMITTED:
        raise HTTPException(status_code=400, detail="Claim is not in submitted status")
    claim.status = GuaranteeStatus.REVIEWING
    claim.reviewer_id = current_user.id
    await db.flush()
    await db.refresh(claim)
    return GuaranteeResponse.model_validate(claim)


@router.post("/{claim_id}/approve", response_model=GuaranteeResponse)
async def approve_guarantee(
    claim_id: UUID,
    data: ReviewDecision,
    current_user: User = Depends(require_role("admin", "manager")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GuaranteeClaim).where(GuaranteeClaim.id == claim_id, GuaranteeClaim.tenant_id == current_user.tenant_id)
    )
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Guarantee claim not found")
    if claim.status not in (GuaranteeStatus.SUBMITTED, GuaranteeStatus.REVIEWING):
        raise HTTPException(status_code=400, detail="Claim cannot be approved in current status")
    claim.status = GuaranteeStatus.APPROVED
    claim.reviewer_id = current_user.id
    claim.reviewed_at = datetime.now(timezone.utc)
    claim.decision_notes = data.decision_notes
    await db.flush()
    await db.refresh(claim)
    return GuaranteeResponse.model_validate(claim)


@router.post("/{claim_id}/reject", response_model=GuaranteeResponse)
async def reject_guarantee(
    claim_id: UUID,
    data: ReviewDecision,
    current_user: User = Depends(require_role("admin", "manager")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GuaranteeClaim).where(GuaranteeClaim.id == claim_id, GuaranteeClaim.tenant_id == current_user.tenant_id)
    )
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Guarantee claim not found")
    if claim.status not in (GuaranteeStatus.SUBMITTED, GuaranteeStatus.REVIEWING):
        raise HTTPException(status_code=400, detail="Claim cannot be rejected in current status")
    claim.status = GuaranteeStatus.REJECTED
    claim.reviewer_id = current_user.id
    claim.reviewed_at = datetime.now(timezone.utc)
    claim.decision_notes = data.decision_notes
    await db.flush()
    await db.refresh(claim)
    return GuaranteeResponse.model_validate(claim)


@router.post("/{claim_id}/refund", response_model=GuaranteeResponse)
async def refund_guarantee(
    claim_id: UUID,
    data: RefundRequest,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GuaranteeClaim).where(GuaranteeClaim.id == claim_id, GuaranteeClaim.tenant_id == current_user.tenant_id)
    )
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Guarantee claim not found")
    if claim.status != GuaranteeStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Claim must be approved before refund")
    claim.status = GuaranteeStatus.REFUNDED
    claim.refund_amount = data.refund_amount
    claim.refunded_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(claim)
    return GuaranteeResponse.model_validate(claim)


@router.delete("/{claim_id}", status_code=204)
async def delete_guarantee(
    claim_id: UUID,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GuaranteeClaim).where(GuaranteeClaim.id == claim_id, GuaranteeClaim.tenant_id == current_user.tenant_id)
    )
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Guarantee claim not found")
    if claim.status != GuaranteeStatus.SUBMITTED:
        raise HTTPException(status_code=400, detail="Can only delete submitted claims")
    await db.delete(claim)
    await db.flush()
