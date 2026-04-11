"""PDPL Compliance API -- consent management, data subject requests, and SDAIA audit reports."""

import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel as Schema
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.consent import (
    PDPLConsent, PDPLConsentAudit, DataRequest,
    ConsentStatusEnum, DataRequestStatus,
)
from app.services.pdpl.consent_manager import (
    ConsentManager, ConsentGrantInput, ConsentRevokeInput,
    ConsentCheckResult, DataRequestInput, AuditEntry,
)
from app.services.pdpl.data_rights import DataRightsHandler, ComplianceReport

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/compliance", tags=["PDPL Compliance"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ConsentCreateRequest(Schema):
    contact_id: UUID
    purpose: str  # marketing, sales, service, analytics
    channel: str  # whatsapp, email, sms, phone
    consent_text: Optional[str] = None
    ip_address: Optional[str] = None
    expiry_months: int = 12


class ConsentResponse(Schema):
    id: UUID
    contact_id: UUID
    tenant_id: UUID
    purpose: str
    channel: str
    status: str
    granted_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ConsentListResponse(Schema):
    items: list[ConsentResponse]
    total: int
    page: int
    per_page: int


class DataRequestCreateRequest(Schema):
    contact_id: UUID
    request_type: str  # access, correction, deletion, restriction
    notes: Optional[str] = None


class DataRequestResponse(Schema):
    id: UUID
    contact_id: UUID
    request_type: str
    status: str
    requested_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    response_data: Optional[dict] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AuditListResponse(Schema):
    items: list[AuditEntry]
    total: int
    page: int
    per_page: int


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/consents", response_model=ConsentListResponse)
async def list_consents(
    purpose: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    consent_status: Optional[str] = Query(None, alias="status"),
    contact_id: Optional[UUID] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List PDPL consents with filters."""

    query = select(PDPLConsent).where(PDPLConsent.tenant_id == current_user.tenant_id)
    if purpose:
        query = query.where(PDPLConsent.purpose == purpose)
    if channel:
        query = query.where(PDPLConsent.channel == channel)
    if consent_status:
        query = query.where(PDPLConsent.status == consent_status)
    if contact_id:
        query = query.where(PDPLConsent.contact_id == contact_id)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    rows = await db.execute(
        query.order_by(PDPLConsent.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    )
    items = [ConsentResponse.model_validate(c) for c in rows.scalars().all()]
    return ConsentListResponse(items=items, total=total, page=page, per_page=per_page)


@router.post("/consent", response_model=ConsentResponse, status_code=status.HTTP_201_CREATED)
async def record_consent(
    data: ConsentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Record a new PDPL consent."""

    mgr = ConsentManager(db)
    consent = await mgr.grant_consent(ConsentGrantInput(
        contact_id=data.contact_id,
        tenant_id=current_user.tenant_id,
        purpose=data.purpose,
        channel=data.channel,
        consent_text=data.consent_text,
        ip_address=data.ip_address,
        actor_id=current_user.id,
        expiry_months=data.expiry_months,
    ))
    return ConsentResponse.model_validate(consent)


@router.delete("/consent/{consent_id}", status_code=status.HTTP_200_OK)
async def revoke_consent(
    consent_id: UUID,
    reason: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Revoke a PDPL consent."""

    mgr = ConsentManager(db)
    try:
        consent = await mgr.revoke_consent(ConsentRevokeInput(
            consent_id=consent_id,
            actor_id=current_user.id,
            reason=reason,
        ))
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return {"detail": "تم إلغاء الموافقة بنجاح", "consent_id": str(consent.id)}


@router.post("/data-request", response_model=DataRequestResponse, status_code=status.HTTP_201_CREATED)
async def submit_data_request(
    data: DataRequestCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a data subject rights request (access, correction, deletion, restriction)."""

    valid_types = {"access", "correction", "deletion", "restriction"}
    if data.request_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"نوع الطلب غير صالح. الأنواع المسموحة: {', '.join(valid_types)}")

    mgr = ConsentManager(db)
    request = await mgr.process_data_request(DataRequestInput(
        contact_id=data.contact_id,
        tenant_id=current_user.tenant_id,
        request_type=data.request_type,
        notes=data.notes,
        actor_id=current_user.id,
    ))
    return DataRequestResponse.model_validate(request)


@router.get("/data-request/{request_id}", response_model=DataRequestResponse)
async def get_data_request(
    request_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Check data request status."""

    result = await db.execute(
        select(DataRequest).where(
            DataRequest.id == request_id,
            DataRequest.tenant_id == current_user.tenant_id,
        )
    )
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="طلب البيانات غير موجود")
    return DataRequestResponse.model_validate(req)


@router.get("/audit", response_model=AuditListResponse)
async def get_audit_trail(
    contact_id: Optional[UUID] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Consent audit trail for compliance review."""

    query = select(PDPLConsentAudit).where(PDPLConsentAudit.tenant_id == current_user.tenant_id)
    if contact_id:
        query = query.where(PDPLConsentAudit.contact_id == contact_id)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    mgr = ConsentManager(db)
    items = await mgr.get_consent_audit(
        tenant_id=current_user.tenant_id,
        contact_id=contact_id,
        limit=per_page,
        offset=(page - 1) * per_page,
    )
    return AuditListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/report", response_model=ComplianceReport)
async def generate_compliance_report(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate SDAIA-ready PDPL compliance report."""

    handler = DataRightsHandler(db)
    return await handler.generate_compliance_report(current_user.tenant_id)
