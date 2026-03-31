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
from app.models.commission import Payout, PayoutStatus, Commission, CommissionStatus

router = APIRouter()


class PayoutCreate(Schema):
    affiliate_id: UUID
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None
    notes: Optional[str] = None


class PayoutUpdate(Schema):
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None
    notes: Optional[str] = None


class PayoutResponse(Schema):
    id: UUID
    affiliate_id: UUID
    total_amount: float
    commissions_count: int
    status: str
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None
    paid_at: Optional[datetime] = None
    payment_reference: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PayoutListResponse(Schema):
    items: list[PayoutResponse]
    total: int
    page: int
    per_page: int


@router.get("", response_model=PayoutListResponse)
async def list_payouts(
    affiliate_id: UUID = Query(None),
    status: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Payout)
    if affiliate_id:
        query = query.where(Payout.affiliate_id == affiliate_id)
    if status:
        query = query.where(Payout.status == status)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.order_by(Payout.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = [PayoutResponse.model_validate(p) for p in result.scalars().all()]
    return PayoutListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/{payout_id}", response_model=PayoutResponse)
async def get_payout(
    payout_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Payout).where(Payout.id == payout_id))
    payout = result.scalar_one_or_none()
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")
    return PayoutResponse.model_validate(payout)


@router.post("", response_model=PayoutResponse, status_code=201)
async def create_payout(
    data: PayoutCreate,
    current_user: User = Depends(require_role("admin", "manager")),
    db: AsyncSession = Depends(get_db),
):
    approved = await db.execute(
        select(Commission).where(
            Commission.affiliate_id == data.affiliate_id,
            Commission.status == CommissionStatus.APPROVED,
            Commission.payout_id.is_(None),
        )
    )
    commissions = approved.scalars().all()
    if not commissions:
        raise HTTPException(status_code=400, detail="No approved commissions available for payout")

    total_amount = sum(c.amount for c in commissions)
    payout = Payout(
        affiliate_id=data.affiliate_id,
        total_amount=total_amount,
        commissions_count=len(commissions),
        status=PayoutStatus.PENDING,
        bank_name=data.bank_name,
        bank_account=data.bank_account,
        notes=data.notes,
    )
    db.add(payout)
    await db.flush()

    for c in commissions:
        c.payout_id = payout.id

    await db.flush()
    await db.refresh(payout)
    return PayoutResponse.model_validate(payout)


@router.put("/{payout_id}", response_model=PayoutResponse)
async def update_payout(
    payout_id: UUID,
    data: PayoutUpdate,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Payout).where(Payout.id == payout_id))
    payout = result.scalar_one_or_none()
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")
    if payout.status != PayoutStatus.PENDING:
        raise HTTPException(status_code=400, detail="Can only update pending payouts")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(payout, field, value)
    await db.flush()
    await db.refresh(payout)
    return PayoutResponse.model_validate(payout)


@router.post("/{payout_id}/process", response_model=PayoutResponse)
async def process_payout(
    payout_id: UUID,
    payment_reference: str = Query(...),
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Payout).where(Payout.id == payout_id))
    payout = result.scalar_one_or_none()
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")
    if payout.status != PayoutStatus.PENDING:
        raise HTTPException(status_code=400, detail="Payout is not in pending status")

    payout.status = PayoutStatus.PROCESSING
    await db.flush()

    payout.status = PayoutStatus.PAID
    payout.paid_at = datetime.now(timezone.utc)
    payout.payment_reference = payment_reference

    commissions_result = await db.execute(
        select(Commission).where(Commission.payout_id == payout_id)
    )
    for c in commissions_result.scalars().all():
        c.status = CommissionStatus.PAID
        c.paid_at = payout.paid_at
        c.payment_reference = payment_reference

    await db.flush()
    await db.refresh(payout)
    return PayoutResponse.model_validate(payout)


@router.delete("/{payout_id}", status_code=204)
async def delete_payout(
    payout_id: UUID,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Payout).where(Payout.id == payout_id))
    payout = result.scalar_one_or_none()
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")
    if payout.status != PayoutStatus.PENDING:
        raise HTTPException(status_code=400, detail="Can only delete pending payouts")

    commissions_result = await db.execute(
        select(Commission).where(Commission.payout_id == payout_id)
    )
    for c in commissions_result.scalars().all():
        c.payout_id = None

    await db.delete(payout)
    await db.flush()
