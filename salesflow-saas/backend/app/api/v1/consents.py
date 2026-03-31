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
from app.models.compliance import Consent, ConsentStatus

router = APIRouter()


class ConsentCreate(Schema):
    lead_id: Optional[UUID] = None
    customer_id: Optional[UUID] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    channel: str
    source: Optional[str] = None
    ip_address: Optional[str] = None
    metadata: Optional[dict] = None


class ConsentUpdate(Schema):
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    source: Optional[str] = None
    metadata: Optional[dict] = None


class ConsentResponse(Schema):
    id: UUID
    tenant_id: Optional[UUID] = None
    lead_id: Optional[UUID] = None
    customer_id: Optional[UUID] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    channel: str
    status: str
    opted_in_at: Optional[datetime] = None
    opted_out_at: Optional[datetime] = None
    source: Optional[str] = None
    ip_address: Optional[str] = None
    metadata: Optional[dict] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ConsentListResponse(Schema):
    items: list[ConsentResponse]
    total: int
    page: int
    per_page: int


class ConsentCheck(Schema):
    has_consent: bool
    channel: str
    status: Optional[str] = None
    opted_in_at: Optional[datetime] = None


@router.get("", response_model=ConsentListResponse)
async def list_consents(
    channel: str = Query(None),
    status: str = Query(None),
    contact_phone: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Consent).where(Consent.tenant_id == current_user.tenant_id)
    if channel:
        query = query.where(Consent.channel == channel)
    if status:
        query = query.where(Consent.status == status)
    if contact_phone:
        query = query.where(Consent.contact_phone == contact_phone)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.order_by(Consent.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = [ConsentResponse.model_validate(c) for c in result.scalars().all()]
    return ConsentListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/check", response_model=ConsentCheck)
async def check_consent(
    contact_phone: str = Query(...),
    channel: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Consent).where(
            Consent.contact_phone == contact_phone,
            Consent.channel.in_([channel, "all"]),
            Consent.status == ConsentStatus.OPTED_IN,
        ).order_by(Consent.created_at.desc()).limit(1)
    )
    consent = result.scalar_one_or_none()
    if consent:
        return ConsentCheck(has_consent=True, channel=channel, status="opted_in", opted_in_at=consent.opted_in_at)
    return ConsentCheck(has_consent=False, channel=channel)


@router.get("/{consent_id}", response_model=ConsentResponse)
async def get_consent(
    consent_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Consent).where(Consent.id == consent_id))
    consent = result.scalar_one_or_none()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent record not found")
    return ConsentResponse.model_validate(consent)


@router.post("", response_model=ConsentResponse, status_code=201)
async def create_consent(
    data: ConsentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    consent = Consent(
        tenant_id=current_user.tenant_id,
        status=ConsentStatus.PENDING,
        **data.model_dump(exclude_none=True),
    )
    db.add(consent)
    await db.flush()
    await db.refresh(consent)
    return ConsentResponse.model_validate(consent)


@router.post("/{consent_id}/opt-in", response_model=ConsentResponse)
async def opt_in(
    consent_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Consent).where(Consent.id == consent_id))
    consent = result.scalar_one_or_none()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent record not found")
    consent.status = ConsentStatus.OPTED_IN
    consent.opted_in_at = datetime.now(timezone.utc)
    consent.opted_out_at = None
    await db.flush()
    await db.refresh(consent)
    return ConsentResponse.model_validate(consent)


@router.post("/{consent_id}/opt-out", response_model=ConsentResponse)
async def opt_out(
    consent_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Consent).where(Consent.id == consent_id))
    consent = result.scalar_one_or_none()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent record not found")
    consent.status = ConsentStatus.OPTED_OUT
    consent.opted_out_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(consent)
    return ConsentResponse.model_validate(consent)


@router.put("/{consent_id}", response_model=ConsentResponse)
async def update_consent(
    consent_id: UUID,
    data: ConsentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Consent).where(Consent.id == consent_id))
    consent = result.scalar_one_or_none()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent record not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(consent, field, value)
    await db.flush()
    await db.refresh(consent)
    return ConsentResponse.model_validate(consent)


@router.delete("/{consent_id}", status_code=204)
async def delete_consent(
    consent_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Consent).where(Consent.id == consent_id))
    consent = result.scalar_one_or_none()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent record not found")
    await db.delete(consent)
    await db.flush()
