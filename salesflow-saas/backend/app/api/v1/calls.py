from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel as Schema

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.call import Call

router = APIRouter()


class CallCreate(Schema):
    lead_id: Optional[UUID] = None
    contact_id: Optional[UUID] = None
    affiliate_id: Optional[UUID] = None
    direction: str
    channel: str = "phone"
    notes: Optional[str] = None


class CallUpdate(Schema):
    status: Optional[str] = None
    outcome: Optional[str] = None
    duration_seconds: Optional[int] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    sentiment_score: Optional[float] = None
    recording_url: Optional[str] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    notes: Optional[str] = None


class CallResponse(Schema):
    id: UUID
    tenant_id: UUID
    lead_id: Optional[UUID] = None
    contact_id: Optional[UUID] = None
    affiliate_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    direction: str
    channel: str
    duration_seconds: Optional[int] = None
    status: str
    outcome: Optional[str] = None
    summary: Optional[str] = None
    sentiment_score: Optional[float] = None
    recording_url: Optional[str] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CallListResponse(Schema):
    items: list[CallResponse]
    total: int
    page: int
    per_page: int


@router.get("", response_model=CallListResponse)
async def list_calls(
    lead_id: UUID = Query(None),
    contact_id: UUID = Query(None),
    status: str = Query(None),
    outcome: str = Query(None),
    direction: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Call).where(Call.tenant_id == current_user.tenant_id)
    if lead_id:
        query = query.where(Call.lead_id == lead_id)
    if contact_id:
        query = query.where(Call.contact_id == contact_id)
    if status:
        query = query.where(Call.status == status)
    if outcome:
        query = query.where(Call.outcome == outcome)
    if direction:
        query = query.where(Call.direction == direction)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.order_by(Call.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = [CallResponse.model_validate(c) for c in result.scalars().all()]
    return CallListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/outcomes", response_model=dict)
async def get_call_outcomes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Call.outcome, func.count(Call.id))
        .where(Call.tenant_id == current_user.tenant_id, Call.outcome.isnot(None))
        .group_by(Call.outcome)
    )
    return {"outcomes": {row[0]: row[1] for row in result.all()}}


@router.get("/{call_id}", response_model=CallResponse)
async def get_call(
    call_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Call).where(Call.id == call_id, Call.tenant_id == current_user.tenant_id))
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return CallResponse.model_validate(call)


@router.post("", response_model=CallResponse, status_code=201)
async def create_call(
    data: CallCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    call = Call(tenant_id=current_user.tenant_id, user_id=current_user.id, **data.model_dump(exclude_none=True))
    db.add(call)
    await db.flush()
    await db.refresh(call)
    return CallResponse.model_validate(call)


@router.put("/{call_id}", response_model=CallResponse)
async def update_call(
    call_id: UUID,
    data: CallUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Call).where(Call.id == call_id, Call.tenant_id == current_user.tenant_id))
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(call, field, value)
    await db.flush()
    await db.refresh(call)
    return CallResponse.model_validate(call)


@router.delete("/{call_id}", status_code=204)
async def delete_call(
    call_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Call).where(Call.id == call_id, Call.tenant_id == current_user.tenant_id))
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    await db.delete(call)
    await db.flush()
