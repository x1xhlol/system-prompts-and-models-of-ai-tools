from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel as Schema

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.activity import Activity

router = APIRouter()


class MeetingCreate(Schema):
    lead_id: Optional[UUID] = None
    contact_id: Optional[UUID] = None
    title: str
    description: Optional[str] = None
    scheduled_at: datetime
    duration_minutes: int = 30
    location: Optional[str] = None
    meeting_url: Optional[str] = None
    notes: Optional[str] = None


class MeetingUpdate(Schema):
    title: Optional[str] = None
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    meeting_url: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class MeetingResponse(Schema):
    id: UUID
    tenant_id: UUID
    lead_id: Optional[UUID] = None
    title: Optional[str] = None
    description: Optional[str] = None
    type: str
    status: Optional[str] = None
    notes: Optional[str] = None
    metadata: Optional[dict] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MeetingListResponse(Schema):
    items: list[MeetingResponse]
    total: int
    page: int
    per_page: int


@router.get("", response_model=MeetingListResponse)
async def list_meetings(
    lead_id: UUID = Query(None),
    status: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Activity).where(
        Activity.tenant_id == current_user.tenant_id,
        Activity.type == "meeting",
    )
    if lead_id:
        query = query.where(Activity.lead_id == lead_id)
    if status:
        query = query.where(Activity.status == status)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.order_by(Activity.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = [MeetingResponse.model_validate(a) for a in result.scalars().all()]
    return MeetingListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Activity).where(Activity.id == meeting_id, Activity.tenant_id == current_user.tenant_id, Activity.type == "meeting")
    )
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return MeetingResponse.model_validate(meeting)


@router.post("", response_model=MeetingResponse, status_code=201)
async def create_meeting(
    data: MeetingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    meeting = Activity(
        tenant_id=current_user.tenant_id,
        lead_id=data.lead_id,
        user_id=current_user.id,
        type="meeting",
        title=data.title,
        description=data.description,
        status="scheduled",
        notes=data.notes,
        metadata={
            "scheduled_at": data.scheduled_at.isoformat(),
            "duration_minutes": data.duration_minutes,
            "location": data.location,
            "meeting_url": data.meeting_url,
            "contact_id": str(data.contact_id) if data.contact_id else None,
        },
    )
    db.add(meeting)
    await db.flush()
    await db.refresh(meeting)
    return MeetingResponse.model_validate(meeting)


@router.put("/{meeting_id}", response_model=MeetingResponse)
async def update_meeting(
    meeting_id: UUID,
    data: MeetingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Activity).where(Activity.id == meeting_id, Activity.tenant_id == current_user.tenant_id, Activity.type == "meeting")
    )
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    update_fields = data.model_dump(exclude_none=True)
    meta_fields = {"scheduled_at", "duration_minutes", "location", "meeting_url"}
    current_meta = meeting.metadata or {}
    for key in meta_fields:
        if key in update_fields:
            val = update_fields.pop(key)
            current_meta[key] = val.isoformat() if isinstance(val, datetime) else val
    if current_meta:
        meeting.metadata = current_meta
    for field, value in update_fields.items():
        setattr(meeting, field, value)
    await db.flush()
    await db.refresh(meeting)
    return MeetingResponse.model_validate(meeting)


@router.post("/{meeting_id}/confirm", response_model=MeetingResponse)
async def confirm_meeting(
    meeting_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Activity).where(Activity.id == meeting_id, Activity.tenant_id == current_user.tenant_id, Activity.type == "meeting")
    )
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting.status = "confirmed"
    await db.flush()
    await db.refresh(meeting)
    return MeetingResponse.model_validate(meeting)


@router.post("/{meeting_id}/no-show", response_model=MeetingResponse)
async def mark_no_show(
    meeting_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Activity).where(Activity.id == meeting_id, Activity.tenant_id == current_user.tenant_id, Activity.type == "meeting")
    )
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting.status = "no_show"
    await db.flush()
    await db.refresh(meeting)
    return MeetingResponse.model_validate(meeting)


@router.delete("/{meeting_id}", status_code=204)
async def delete_meeting(
    meeting_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Activity).where(Activity.id == meeting_id, Activity.tenant_id == current_user.tenant_id, Activity.type == "meeting")
    )
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    await db.delete(meeting)
    await db.flush()
