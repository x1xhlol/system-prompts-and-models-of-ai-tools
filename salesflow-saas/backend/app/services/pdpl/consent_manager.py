"""PDPL consent engine -- tracks, validates, and audits consent.
Penalty for violations: up to 5,000,000 SAR per incident.
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from pydantic import BaseModel as Schema
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.consent import (
    PDPLConsent, PDPLConsentAudit, DataRequest,
    ConsentStatusEnum, DataRequestStatus,
)

logger = logging.getLogger(__name__)
DEFAULT_EXPIRY_MONTHS = 12
CROSS_BORDER_ALLOWED = {"SA", "AE", "BH", "KW", "OM", "QA"}


class ConsentGrantInput(Schema):
    contact_id: UUID
    tenant_id: UUID
    purpose: str
    channel: str
    consent_text: Optional[str] = None
    ip_address: Optional[str] = None
    actor_id: Optional[UUID] = None
    expiry_months: int = DEFAULT_EXPIRY_MONTHS


class ConsentRevokeInput(Schema):
    consent_id: UUID
    actor_id: Optional[UUID] = None
    reason: Optional[str] = None
    ip_address: Optional[str] = None


class ConsentCheckResult(Schema):
    allowed: bool
    consent_id: Optional[UUID] = None
    status: Optional[str] = None
    expires_at: Optional[datetime] = None
    message: str = ""
    message_ar: str = ""


class DataRequestInput(Schema):
    contact_id: UUID
    tenant_id: UUID
    request_type: str
    notes: Optional[str] = None
    actor_id: Optional[UUID] = None


class AuditEntry(Schema):
    id: UUID
    consent_id: UUID
    contact_id: UUID
    action: str
    actor_id: Optional[UUID] = None
    channel: str
    purpose: str
    details: dict
    created_at: datetime
    model_config = {"from_attributes": True}


class ConsentManager:
    """Core PDPL consent engine for Dealix CRM."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def grant_consent(self, data: ConsentGrantInput) -> PDPLConsent:
        """Grant consent. Revokes existing active consent for same triplet (re-consent)."""
        now = datetime.now(timezone.utc)
        existing = await self._find_active(data.contact_id, data.purpose, data.channel)
        if existing:
            existing.status = ConsentStatusEnum.REVOKED.value
            existing.revoked_at = now
            await self._audit(
                consent_id=existing.id, contact_id=data.contact_id,
                action="revoked_for_renewal", actor_id=data.actor_id,
                channel=data.channel, purpose=data.purpose,
                details={"reason": "re-consent on purpose change"},
                ip_address=data.ip_address, tenant_id=data.tenant_id,
            )
        consent = PDPLConsent(
            contact_id=data.contact_id, tenant_id=data.tenant_id,
            purpose=data.purpose, channel=data.channel,
            status=ConsentStatusEnum.GRANTED.value, granted_at=now,
            expires_at=now + timedelta(days=30 * data.expiry_months),
            ip_address=data.ip_address, consent_text=data.consent_text,
            granted_by=data.actor_id,
        )
        self.db.add(consent)
        await self.db.flush()
        await self.db.refresh(consent)
        await self._audit(
            consent_id=consent.id, contact_id=data.contact_id,
            action="granted", actor_id=data.actor_id,
            channel=data.channel, purpose=data.purpose,
            details={"expiry_months": data.expiry_months},
            ip_address=data.ip_address, tenant_id=data.tenant_id,
        )
        logger.info("PDPL consent granted: contact=%s purpose=%s", data.contact_id, data.purpose)
        return consent

    async def revoke_consent(self, data: ConsentRevokeInput) -> PDPLConsent:
        """Revoke an existing consent immediately."""
        result = await self.db.execute(select(PDPLConsent).where(PDPLConsent.id == data.consent_id))
        consent = result.scalar_one_or_none()
        if not consent:
            raise ValueError("سجل الموافقة غير موجود")
        now = datetime.now(timezone.utc)
        consent.status = ConsentStatusEnum.REVOKED.value
        consent.revoked_at = now
        await self._audit(
            consent_id=consent.id, contact_id=consent.contact_id,
            action="revoked", actor_id=data.actor_id,
            channel=consent.channel, purpose=consent.purpose,
            details={"reason": data.reason or "user_request"},
            ip_address=data.ip_address, tenant_id=consent.tenant_id,
        )
        logger.info("PDPL consent revoked: id=%s", consent.id)
        return consent

    async def check_consent(self, contact_id: UUID, purpose: str, channel: str) -> ConsentCheckResult:
        """Validate consent before outbound message. 5M SAR penalty per violation."""
        consent = await self._find_active(contact_id, purpose, channel)
        if not consent:
            return ConsentCheckResult(
                allowed=False, message=f"No active consent for {purpose}/{channel}",
                message_ar="لا توجد موافقة فعالة لهذا الغرض والقناة",
            )
        now = datetime.now(timezone.utc)
        if consent.expires_at and consent.expires_at <= now:
            consent.status = ConsentStatusEnum.EXPIRED.value
            await self.db.flush()
            return ConsentCheckResult(
                allowed=False, consent_id=consent.id, status=ConsentStatusEnum.EXPIRED.value,
                expires_at=consent.expires_at, message="Consent expired",
                message_ar="انتهت صلاحية الموافقة -- يلزم تجديد الموافقة",
            )
        return ConsentCheckResult(
            allowed=True, consent_id=consent.id, status=consent.status,
            expires_at=consent.expires_at, message="Consent valid",
            message_ar="الموافقة صالحة",
        )

    async def process_data_request(self, data: DataRequestInput) -> DataRequest:
        """Submit a PDPL data subject rights request."""
        request = DataRequest(
            contact_id=data.contact_id, tenant_id=data.tenant_id,
            request_type=data.request_type, status=DataRequestStatus.PENDING.value,
            requested_at=datetime.now(timezone.utc), notes=data.notes,
            handled_by=data.actor_id,
        )
        self.db.add(request)
        await self.db.flush()
        await self.db.refresh(request)
        logger.info("PDPL data request: type=%s contact=%s", data.request_type, data.contact_id)
        return request

    async def get_consent_audit(
        self, tenant_id: UUID, contact_id: Optional[UUID] = None,
        limit: int = 100, offset: int = 0,
    ) -> list[AuditEntry]:
        """Return consent audit trail."""
        query = (
            select(PDPLConsentAudit).where(PDPLConsentAudit.tenant_id == tenant_id)
            .order_by(PDPLConsentAudit.created_at.desc())
        )
        if contact_id:
            query = query.where(PDPLConsentAudit.contact_id == contact_id)
        result = await self.db.execute(query.offset(offset).limit(limit))
        return [AuditEntry.model_validate(row) for row in result.scalars().all()]

    @staticmethod
    def check_cross_border_transfer(destination_country: str) -> ConsentCheckResult:
        """Check if transfer to destination is PDPL-compliant."""
        code = destination_country.upper().strip()
        if code in CROSS_BORDER_ALLOWED:
            return ConsentCheckResult(
                allowed=True, message=f"Transfer to {code} permitted under GCC adequacy",
                message_ar=f"النقل إلى {code} مسموح بموجب كفاية دول الخليج",
            )
        return ConsentCheckResult(
            allowed=False, message=f"Transfer to {code} requires explicit consent and SDAIA approval",
            message_ar=f"النقل إلى {code} يتطلب موافقة صريحة وموافقة الهيئة",
        )

    async def _find_active(self, contact_id: UUID, purpose: str, channel: str) -> Optional[PDPLConsent]:
        result = await self.db.execute(
            select(PDPLConsent).where(and_(
                PDPLConsent.contact_id == contact_id, PDPLConsent.purpose == purpose,
                PDPLConsent.channel == channel, PDPLConsent.status == ConsentStatusEnum.GRANTED.value,
            )).order_by(PDPLConsent.granted_at.desc()).limit(1)
        )
        return result.scalar_one_or_none()

    async def _audit(self, *, consent_id, contact_id, action, actor_id,
                     channel, purpose, details, ip_address, tenant_id) -> None:
        self.db.add(PDPLConsentAudit(
            consent_id=consent_id, contact_id=contact_id, tenant_id=tenant_id,
            action=action, actor_id=actor_id, channel=channel, purpose=purpose,
            details=details or {}, ip_address=ip_address,
        ))
        await self.db.flush()
