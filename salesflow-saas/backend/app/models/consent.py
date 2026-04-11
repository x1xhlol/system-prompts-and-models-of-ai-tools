"""PDPL consent and data request models for Dealix CRM."""

import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.models.base import TenantModel
from app.models.compat import UUID, JSONB


class ConsentPurpose(str, enum.Enum):
    MARKETING = "marketing"
    SALES = "sales"
    SERVICE = "service"
    ANALYTICS = "analytics"


class ConsentChannel(str, enum.Enum):
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    SMS = "sms"
    PHONE = "phone"


class ConsentStatusEnum(str, enum.Enum):
    GRANTED = "granted"
    REVOKED = "revoked"
    EXPIRED = "expired"


class DataRequestType(str, enum.Enum):
    ACCESS = "access"
    CORRECTION = "correction"
    DELETION = "deletion"
    RESTRICTION = "restriction"


class DataRequestStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    REJECTED = "rejected"


class PDPLConsent(TenantModel):
    """Tracks PDPL consent per contact, purpose, and channel."""

    __tablename__ = "pdpl_consents"
    __table_args__ = (
        Index("ix_pdpl_consent_contact_purpose", "contact_id", "purpose"),
        Index("ix_pdpl_consent_tenant_status", "tenant_id", "status"),
        Index("ix_pdpl_consent_expires", "expires_at"),
    )

    contact_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=False, index=True)
    purpose = Column(String(50), nullable=False)
    channel = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default=ConsentStatusEnum.GRANTED.value)
    granted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    ip_address = Column(String(45), nullable=True)
    consent_text = Column(Text, nullable=True)
    granted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    contact = relationship("Lead", foreign_keys=[contact_id])
    granting_user = relationship("User", foreign_keys=[granted_by])


class PDPLConsentAudit(TenantModel):
    """Immutable audit trail for every consent change."""

    __tablename__ = "pdpl_consent_audit"
    __table_args__ = (
        Index("ix_pdpl_audit_consent", "consent_id"),
        Index("ix_pdpl_audit_contact", "contact_id"),
    )

    consent_id = Column(UUID(as_uuid=True), ForeignKey("pdpl_consents.id"), nullable=False)
    contact_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=False)
    action = Column(String(50), nullable=False)  # granted, revoked, expired, renewed
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    channel = Column(String(50), nullable=False)
    purpose = Column(String(50), nullable=False)
    details = Column(JSONB, default=dict)
    ip_address = Column(String(45), nullable=True)

    consent = relationship("PDPLConsent", foreign_keys=[consent_id])
    contact = relationship("Lead", foreign_keys=[contact_id])
    actor = relationship("User", foreign_keys=[actor_id])


class DataRequest(TenantModel):
    """Data subject rights requests under PDPL."""

    __tablename__ = "pdpl_data_requests"
    __table_args__ = (
        Index("ix_pdpl_dr_contact", "contact_id"),
        Index("ix_pdpl_dr_status", "status"),
    )

    contact_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=False, index=True)
    request_type = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default=DataRequestStatus.PENDING.value)
    requested_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    response_data = Column(JSONB, default=dict)
    handled_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)

    contact = relationship("Lead", foreign_keys=[contact_id])
    handler = relationship("User", foreign_keys=[handled_by])
