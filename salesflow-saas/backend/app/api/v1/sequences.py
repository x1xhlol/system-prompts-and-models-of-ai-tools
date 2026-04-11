"""Sequences API -- create, manage, and analyze multi-channel outreach sequences."""

import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel as Schema
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.sequence import Sequence, SequenceStep, SequenceEnrollment
from app.services.sequence_engine import (
    SequenceEngine, SequenceCreateInput, EnrollInput, SequenceAnalytics,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/sequences", tags=["Sequences"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class StepSchema(Schema):
    channel: str
    delay_minutes: int = 0
    template_content: str
    template_content_ar: Optional[str] = None
    variant: Optional[str] = None
    conditions: dict = {}


class SequenceCreateRequest(Schema):
    name: str
    name_ar: Optional[str] = None
    description: Optional[str] = None
    trigger_event: Optional[str] = None
    steps: list[StepSchema] = []


class SequenceUpdateRequest(Schema):
    name: Optional[str] = None
    name_ar: Optional[str] = None
    description: Optional[str] = None
    trigger_event: Optional[str] = None
    is_active: Optional[bool] = None


class SequenceResponse(Schema):
    id: UUID
    name: str
    name_ar: Optional[str] = None
    description: Optional[str] = None
    trigger_event: Optional[str] = None
    is_active: bool
    created_at: object
    step_count: int = 0
    enrollment_count: int = 0

    model_config = {"from_attributes": True}


class SequenceListResponse(Schema):
    items: list[SequenceResponse]
    total: int


class EnrollRequest(Schema):
    lead_id: UUID


class EnrollmentResponse(Schema):
    id: UUID
    sequence_id: UUID
    lead_id: UUID
    current_step: int
    status: str
    enrolled_at: object

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("", response_model=SequenceListResponse)
async def list_sequences(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List sequences with analytics summary."""

    tid = current_user.tenant_id
    total = (await db.execute(
        select(func.count()).where(Sequence.tenant_id == tid)
    )).scalar() or 0

    rows = await db.execute(
        select(Sequence)
        .where(Sequence.tenant_id == tid)
        .order_by(Sequence.created_at.desc())
        .offset((page - 1) * per_page).limit(per_page)
    )
    sequences = rows.scalars().all()

    items = []
    for seq in sequences:
        step_count = (await db.execute(
            select(func.count()).where(SequenceStep.sequence_id == seq.id)
        )).scalar() or 0
        enroll_count = (await db.execute(
            select(func.count()).where(SequenceEnrollment.sequence_id == seq.id)
        )).scalar() or 0
        resp = SequenceResponse.model_validate(seq)
        resp.step_count = step_count
        resp.enrollment_count = enroll_count
        items.append(resp)

    return SequenceListResponse(items=items, total=total)


@router.post("", response_model=SequenceResponse, status_code=status.HTTP_201_CREATED)
async def create_sequence(
    data: SequenceCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new sequence with steps."""

    engine = SequenceEngine(db)
    seq = await engine.create_sequence(SequenceCreateInput(
        tenant_id=current_user.tenant_id,
        name=data.name,
        name_ar=data.name_ar,
        description=data.description,
        trigger_event=data.trigger_event,
        created_by=current_user.id,
        steps=[s.model_dump() for s in data.steps],
    ))

    resp = SequenceResponse.model_validate(seq)
    resp.step_count = len(data.steps)
    return resp


@router.put("/{sequence_id}", response_model=SequenceResponse)
async def update_sequence(
    sequence_id: UUID,
    data: SequenceUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update sequence metadata."""

    seq = (await db.execute(
        select(Sequence).where(Sequence.id == sequence_id, Sequence.tenant_id == current_user.tenant_id)
    )).scalar_one_or_none()
    if not seq:
        raise HTTPException(status_code=404, detail="التسلسل غير موجود")

    for field, val in data.model_dump(exclude_none=True).items():
        setattr(seq, field, val)
    await db.flush()
    await db.refresh(seq)
    logger.info("Sequence updated: id=%s", sequence_id)
    return SequenceResponse.model_validate(seq)


@router.post("/{sequence_id}/enroll", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
async def enroll_lead(
    sequence_id: UUID,
    data: EnrollRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Enroll a lead into a sequence."""

    seq = (await db.execute(
        select(Sequence).where(Sequence.id == sequence_id, Sequence.tenant_id == current_user.tenant_id)
    )).scalar_one_or_none()
    if not seq:
        raise HTTPException(status_code=404, detail="التسلسل غير موجود")
    if not seq.is_active:
        raise HTTPException(status_code=400, detail="التسلسل غير نشط")

    engine = SequenceEngine(db)
    try:
        enrollment = await engine.enroll_lead(EnrollInput(sequence_id=sequence_id, lead_id=data.lead_id))
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))
    return EnrollmentResponse.model_validate(enrollment)


@router.delete("/{sequence_id}/enrollments/{enrollment_id}", status_code=status.HTTP_200_OK)
async def stop_enrollment(
    sequence_id: UUID,
    enrollment_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Stop an active enrollment."""

    enrollment = (await db.execute(
        select(SequenceEnrollment).where(
            SequenceEnrollment.id == enrollment_id,
            SequenceEnrollment.sequence_id == sequence_id,
        )
    )).scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=404, detail="التسجيل غير موجود")

    engine = SequenceEngine(db)
    await engine.stop_enrollment(enrollment_id)
    return {"detail": "تم إيقاف التسجيل بنجاح", "enrollment_id": str(enrollment_id)}


@router.get("/{sequence_id}/analytics", response_model=SequenceAnalytics)
async def get_analytics(
    sequence_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Detailed analytics for a sequence."""

    seq = (await db.execute(
        select(Sequence).where(Sequence.id == sequence_id, Sequence.tenant_id == current_user.tenant_id)
    )).scalar_one_or_none()
    if not seq:
        raise HTTPException(status_code=404, detail="التسلسل غير موجود")

    engine = SequenceEngine(db)
    return await engine.get_sequence_analytics(sequence_id)
