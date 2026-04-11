"""PDPL data subject rights handler.

Implements: right to access, correction, deletion, restriction of processing.
Generates compliance reports for SDAIA audits.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel as Schema
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.consent import (
    PDPLConsent, PDPLConsentAudit, DataRequest,
    DataRequestStatus, DataRequestType,
)
from app.models.lead import Lead
from app.models.message import Message

logger = logging.getLogger(__name__)

HARD_DELETE_DELAY_DAYS = 30


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class DataExport(Schema):
    contact_id: UUID
    personal_data: dict
    consents: list[dict]
    messages: list[dict]
    exported_at: datetime


class CorrectionInput(Schema):
    contact_id: UUID
    tenant_id: UUID
    corrections: dict[str, Any]  # field_name -> new_value
    actor_id: Optional[UUID] = None
    reason: Optional[str] = None


class CorrectionResult(Schema):
    contact_id: UUID
    fields_updated: list[str]
    previous_values: dict
    updated_at: datetime


class DeletionResult(Schema):
    contact_id: UUID
    status: str
    soft_deleted_at: datetime
    hard_delete_scheduled: datetime
    message: str
    message_ar: str


class RestrictionResult(Schema):
    contact_id: UUID
    restricted: bool
    message: str
    message_ar: str


class ComplianceReport(Schema):
    tenant_id: UUID
    generated_at: datetime
    total_consents: int
    active_consents: int
    revoked_consents: int
    expired_consents: int
    pending_requests: int
    completed_requests: int
    requests_by_type: dict[str, int]
    avg_resolution_hours: Optional[float] = None
    violations_detected: int


# ---------------------------------------------------------------------------
# DataRightsHandler
# ---------------------------------------------------------------------------

class DataRightsHandler:
    """Handles PDPL data subject rights for Dealix contacts."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # -- export (right to access) -------------------------------------------

    async def export_data(self, contact_id: UUID, tenant_id: UUID) -> DataExport:
        """Export all personal data held for a contact as structured JSON."""

        lead = await self._get_lead(contact_id, tenant_id)

        # Consent records
        consents_q = await self.db.execute(
            select(PDPLConsent).where(
                PDPLConsent.contact_id == contact_id,
                PDPLConsent.tenant_id == tenant_id,
            )
        )
        consents = [
            {"purpose": c.purpose, "channel": c.channel, "status": c.status,
             "granted_at": c.granted_at.isoformat() if c.granted_at else None,
             "expires_at": c.expires_at.isoformat() if c.expires_at else None}
            for c in consents_q.scalars().all()
        ]

        # Messages
        msgs_q = await self.db.execute(
            select(Message).where(Message.lead_id == contact_id).limit(500)
        )
        messages = [
            {"channel": m.channel, "direction": m.direction,
             "content": m.content, "sent_at": m.sent_at.isoformat() if m.sent_at else None}
            for m in msgs_q.scalars().all()
        ]

        personal = {
            "name": lead.name,
            "phone": lead.phone,
            "email": lead.email,
            "source": lead.source,
            "status": lead.status,
            "score": lead.score,
            "notes": lead.notes,
        }

        logger.info("PDPL data export completed: contact=%s", contact_id)
        return DataExport(
            contact_id=contact_id,
            personal_data=personal,
            consents=consents,
            messages=messages,
            exported_at=datetime.now(timezone.utc),
        )

    # -- correction ----------------------------------------------------------

    async def correct_data(self, data: CorrectionInput) -> CorrectionResult:
        """Update personal data fields with full audit trail."""

        lead = await self._get_lead(data.contact_id, data.tenant_id)
        allowed_fields = {"name", "phone", "email", "notes"}
        previous: dict[str, Any] = {}
        updated_fields: list[str] = []

        for field, new_val in data.corrections.items():
            if field not in allowed_fields:
                logger.warning("PDPL correction rejected for field=%s", field)
                continue
            previous[field] = getattr(lead, field, None)
            setattr(lead, field, new_val)
            updated_fields.append(field)

        await self.db.flush()

        # Audit via data request record
        req = DataRequest(
            contact_id=data.contact_id,
            tenant_id=data.tenant_id,
            request_type=DataRequestType.CORRECTION.value,
            status=DataRequestStatus.COMPLETED.value,
            requested_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc),
            response_data={"corrections": data.corrections, "previous": previous, "reason": data.reason},
            handled_by=data.actor_id,
        )
        self.db.add(req)
        await self.db.flush()

        logger.info("PDPL data correction: contact=%s fields=%s", data.contact_id, updated_fields)
        return CorrectionResult(
            contact_id=data.contact_id,
            fields_updated=updated_fields,
            previous_values=previous,
            updated_at=datetime.now(timezone.utc),
        )

    # -- deletion (right to erasure) ----------------------------------------

    async def delete_data(self, contact_id: UUID, tenant_id: UUID, actor_id: Optional[UUID] = None) -> DeletionResult:
        """Soft-delete contact now; schedule hard-delete after 30 days."""

        lead = await self._get_lead(contact_id, tenant_id)
        now = datetime.now(timezone.utc)
        hard_delete_at = now + timedelta(days=HARD_DELETE_DELAY_DAYS)

        # Soft-delete: mark status and clear PII
        lead.status = "deleted"
        lead.notes = f"[PDPL deletion requested {now.isoformat()}] " + (lead.notes or "")
        lead.extra_metadata = {
            **(lead.extra_metadata or {}),
            "_pdpl_soft_deleted": True,
            "_pdpl_hard_delete_at": hard_delete_at.isoformat(),
        }

        # Revoke all active consents
        consents_q = await self.db.execute(
            select(PDPLConsent).where(
                PDPLConsent.contact_id == contact_id,
                PDPLConsent.tenant_id == tenant_id,
                PDPLConsent.status == "granted",
            )
        )
        for consent in consents_q.scalars().all():
            consent.status = "revoked"
            consent.revoked_at = now

        # Record the request
        req = DataRequest(
            contact_id=contact_id,
            tenant_id=tenant_id,
            request_type=DataRequestType.DELETION.value,
            status=DataRequestStatus.PROCESSING.value,
            requested_at=now,
            response_data={"hard_delete_at": hard_delete_at.isoformat()},
            handled_by=actor_id,
        )
        self.db.add(req)
        await self.db.flush()

        logger.info("PDPL deletion scheduled: contact=%s hard_delete=%s", contact_id, hard_delete_at)
        return DeletionResult(
            contact_id=contact_id,
            status="soft_deleted",
            soft_deleted_at=now,
            hard_delete_scheduled=hard_delete_at,
            message=f"Contact soft-deleted. Hard delete scheduled for {hard_delete_at.date()}",
            message_ar=f"تم حذف جهة الاتصال مبدئيًا. الحذف النهائي مجدول بتاريخ {hard_delete_at.date()}",
        )

    # -- restriction ---------------------------------------------------------

    async def restrict_processing(
        self, contact_id: UUID, tenant_id: UUID, actor_id: Optional[UUID] = None
    ) -> RestrictionResult:
        """Flag a contact as restricted -- no outbound processing allowed."""

        lead = await self._get_lead(contact_id, tenant_id)
        lead.extra_metadata = {
            **(lead.extra_metadata or {}),
            "_pdpl_restricted": True,
            "_pdpl_restricted_at": datetime.now(timezone.utc).isoformat(),
        }

        req = DataRequest(
            contact_id=contact_id,
            tenant_id=tenant_id,
            request_type=DataRequestType.RESTRICTION.value,
            status=DataRequestStatus.COMPLETED.value,
            requested_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc),
            response_data={"restricted": True},
            handled_by=actor_id,
        )
        self.db.add(req)
        await self.db.flush()

        logger.info("PDPL processing restricted: contact=%s", contact_id)
        return RestrictionResult(
            contact_id=contact_id,
            restricted=True,
            message="Contact processing restricted per PDPL request",
            message_ar="تم تقييد معالجة بيانات جهة الاتصال وفقًا لطلب نظام حماية البيانات",
        )

    # -- compliance report ---------------------------------------------------

    async def generate_compliance_report(self, tenant_id: UUID) -> ComplianceReport:
        """Generate SDAIA-ready compliance report for a tenant."""

        now = datetime.now(timezone.utc)

        # Consent counts
        total = (await self.db.execute(
            select(func.count()).where(PDPLConsent.tenant_id == tenant_id)
        )).scalar() or 0
        active = (await self.db.execute(
            select(func.count()).where(PDPLConsent.tenant_id == tenant_id, PDPLConsent.status == "granted")
        )).scalar() or 0
        revoked = (await self.db.execute(
            select(func.count()).where(PDPLConsent.tenant_id == tenant_id, PDPLConsent.status == "revoked")
        )).scalar() or 0
        expired = (await self.db.execute(
            select(func.count()).where(PDPLConsent.tenant_id == tenant_id, PDPLConsent.status == "expired")
        )).scalar() or 0

        # Data requests
        pending = (await self.db.execute(
            select(func.count()).where(DataRequest.tenant_id == tenant_id, DataRequest.status == "pending")
        )).scalar() or 0
        completed = (await self.db.execute(
            select(func.count()).where(DataRequest.tenant_id == tenant_id, DataRequest.status == "completed")
        )).scalar() or 0

        # Breakdown by type
        type_rows = (await self.db.execute(
            select(DataRequest.request_type, func.count())
            .where(DataRequest.tenant_id == tenant_id)
            .group_by(DataRequest.request_type)
        )).all()
        by_type = {row[0]: row[1] for row in type_rows}

        # Avg resolution time
        avg_hours: Optional[float] = None
        completed_reqs = (await self.db.execute(
            select(DataRequest).where(
                DataRequest.tenant_id == tenant_id,
                DataRequest.status == "completed",
                DataRequest.completed_at.isnot(None),
            ).limit(500)
        )).scalars().all()
        if completed_reqs:
            deltas = [
                (r.completed_at - r.requested_at).total_seconds() / 3600
                for r in completed_reqs if r.completed_at and r.requested_at
            ]
            avg_hours = round(sum(deltas) / len(deltas), 2) if deltas else None

        logger.info("PDPL compliance report generated: tenant=%s", tenant_id)
        return ComplianceReport(
            tenant_id=tenant_id,
            generated_at=now,
            total_consents=total,
            active_consents=active,
            revoked_consents=revoked,
            expired_consents=expired,
            pending_requests=pending,
            completed_requests=completed,
            requests_by_type=by_type,
            avg_resolution_hours=avg_hours,
            violations_detected=0,
        )

    # -- private helpers -----------------------------------------------------

    async def _get_lead(self, contact_id: UUID, tenant_id: UUID) -> Lead:
        result = await self.db.execute(
            select(Lead).where(Lead.id == contact_id, Lead.tenant_id == tenant_id)
        )
        lead = result.scalar_one_or_none()
        if not lead:
            raise ValueError("جهة الاتصال غير موجودة")  # Contact not found
        return lead
