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
from app.models.commission import Commission, CommissionStatus

router = APIRouter()


class CommissionCreate(Schema):
    affiliate_id: UUID
    deal_id: UUID
    amount: float
    rate: float
    plan_type: Optional[str] = None
    notes: Optional[str] = None


class CommissionUpdate(Schema):
    amount: Optional[float] = None
    rate: Optional[float] = None
    plan_type: Optional[str] = None
    notes: Optional[str] = None


class CommissionResponse(Schema):
    id: UUID
    tenant_id: UUID
    affiliate_id: UUID
    deal_id: UUID
    payout_id: Optional[UUID] = None
    amount: float
    rate: float
    plan_type: Optional[str] = None
    status: str
    approved_by: Optional[UUID] = None
    approved_at: Optional[datetime] = None
    held_reason: Optional[str] = None
    paid_at: Optional[datetime] = None
    payment_reference: Optional[str] = None
    dispute_id: Optional[UUID] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CommissionListResponse(Schema):
    items: list[CommissionResponse]
    total: int
    page: int
    per_page: int


class HoldRequest(Schema):
    reason: str


class ClawbackRequest(Schema):
    reason: str


@router.get("", response_model=CommissionListResponse)
async def list_commissions(
    affiliate_id: UUID = Query(None),
    status: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Commission).where(Commission.tenant_id == current_user.tenant_id)
    if affiliate_id:
        query = query.where(Commission.affiliate_id == affiliate_id)
    if status:
        query = query.where(Commission.status == status)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.order_by(Commission.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = [CommissionResponse.model_validate(c) for c in result.scalars().all()]
    return CommissionListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/{commission_id}", response_model=CommissionResponse)
async def get_commission(
    commission_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Commission).where(Commission.id == commission_id, Commission.tenant_id == current_user.tenant_id)
    )
    commission = result.scalar_one_or_none()
    if not commission:
        raise HTTPException(status_code=404, detail="Commission not found")
    return CommissionResponse.model_validate(commission)


@router.post("", response_model=CommissionResponse, status_code=201)
async def create_commission(
    data: CommissionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    commission = Commission(
        tenant_id=current_user.tenant_id,
        status=CommissionStatus.DRAFT,
        **data.model_dump(exclude_none=True),
    )
    db.add(commission)
    await db.flush()
    await db.refresh(commission)
    return CommissionResponse.model_validate(commission)


@router.put("/{commission_id}", response_model=CommissionResponse)
async def update_commission(
    commission_id: UUID,
    data: CommissionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Commission).where(Commission.id == commission_id, Commission.tenant_id == current_user.tenant_id)
    )
    commission = result.scalar_one_or_none()
    if not commission:
        raise HTTPException(status_code=404, detail="Commission not found")
    if commission.status not in (CommissionStatus.DRAFT, CommissionStatus.PENDING):
        raise HTTPException(status_code=400, detail="Cannot update commission in current status")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(commission, field, value)
    await db.flush()
    await db.refresh(commission)
    return CommissionResponse.model_validate(commission)


@router.post("/{commission_id}/approve", response_model=CommissionResponse)
async def approve_commission(
    commission_id: UUID,
    current_user: User = Depends(require_role("admin", "manager")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Commission).where(Commission.id == commission_id, Commission.tenant_id == current_user.tenant_id)
    )
    commission = result.scalar_one_or_none()
    if not commission:
        raise HTTPException(status_code=404, detail="Commission not found")
    if commission.status not in (CommissionStatus.DRAFT, CommissionStatus.PENDING):
        raise HTTPException(status_code=400, detail=f"Cannot approve commission with status '{commission.status.value}'")
    commission.status = CommissionStatus.APPROVED
    commission.approved_by = current_user.id
    commission.approved_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(commission)
    return CommissionResponse.model_validate(commission)


@router.post("/{commission_id}/hold", response_model=CommissionResponse)
async def hold_commission(
    commission_id: UUID,
    data: HoldRequest,
    current_user: User = Depends(require_role("admin", "manager")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Commission).where(Commission.id == commission_id, Commission.tenant_id == current_user.tenant_id)
    )
    commission = result.scalar_one_or_none()
    if not commission:
        raise HTTPException(status_code=404, detail="Commission not found")
    commission.status = CommissionStatus.HELD
    commission.held_reason = data.reason
    await db.flush()
    await db.refresh(commission)
    return CommissionResponse.model_validate(commission)


@router.post("/{commission_id}/pay", response_model=CommissionResponse)
async def pay_commission(
    commission_id: UUID,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Commission).where(Commission.id == commission_id, Commission.tenant_id == current_user.tenant_id)
    )
    commission = result.scalar_one_or_none()
    if not commission:
        raise HTTPException(status_code=404, detail="Commission not found")
    if commission.status != CommissionStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Commission must be approved before payment")
    commission.status = CommissionStatus.PAID
    commission.paid_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(commission)
    return CommissionResponse.model_validate(commission)


@router.post("/{commission_id}/dispute", response_model=CommissionResponse)
async def dispute_commission(
    commission_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Commission).where(Commission.id == commission_id, Commission.tenant_id == current_user.tenant_id)
    )
    commission = result.scalar_one_or_none()
    if not commission:
        raise HTTPException(status_code=404, detail="Commission not found")
    commission.status = CommissionStatus.DISPUTED
    await db.flush()
    await db.refresh(commission)
    return CommissionResponse.model_validate(commission)


@router.post("/{commission_id}/clawback", response_model=CommissionResponse)
async def clawback_commission(
    commission_id: UUID,
    data: ClawbackRequest,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Commission).where(Commission.id == commission_id, Commission.tenant_id == current_user.tenant_id)
    )
    commission = result.scalar_one_or_none()
    if not commission:
        raise HTTPException(status_code=404, detail="Commission not found")
    if commission.status != CommissionStatus.PAID:
        raise HTTPException(status_code=400, detail="Can only clawback paid commissions")
    commission.status = CommissionStatus.CLAWBACK
    commission.notes = f"Clawback: {data.reason}" + (f"\n{commission.notes}" if commission.notes else "")
    await db.flush()
    await db.refresh(commission)
    return CommissionResponse.model_validate(commission)


@router.delete("/{commission_id}", status_code=204)
async def delete_commission(
    commission_id: UUID,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Commission).where(Commission.id == commission_id, Commission.tenant_id == current_user.tenant_id)
    )
    commission = result.scalar_one_or_none()
    if not commission:
        raise HTTPException(status_code=404, detail="Commission not found")
    if commission.status not in (CommissionStatus.DRAFT,):
        raise HTTPException(status_code=400, detail="Can only delete draft commissions")
    await db.delete(commission)
    await db.flush()
