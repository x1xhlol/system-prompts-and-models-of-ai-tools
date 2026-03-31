import enum
from sqlalchemy import Column, String, Integer, Text, DateTime, Boolean, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class ConsentChannel(str, enum.Enum):
    WHATSAPP = "whatsapp"
    SMS = "sms"
    EMAIL = "email"
    VOICE = "voice"
    ALL = "all"


class ConsentStatus(str, enum.Enum):
    OPTED_IN = "opted_in"
    OPTED_OUT = "opted_out"
    PENDING = "pending"


class ComplaintType(str, enum.Enum):
    SERVICE = "service"
    BILLING = "billing"
    PRIVACY = "privacy"
    AFFILIATE = "affiliate"
    OTHER = "other"


class ComplaintStatus(str, enum.Enum):
    RECEIVED = "received"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    ESCALATED = "escalated"


class Consent(BaseModel):
    __tablename__ = "consents"

    tenant_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)
    contact_phone = Column(String(20), nullable=True, index=True)
    contact_email = Column(String(255), nullable=True)
    channel = Column(Enum(ConsentChannel), nullable=False)
    status = Column(Enum(ConsentStatus), default=ConsentStatus.PENDING, nullable=False)
    opted_in_at = Column(DateTime(timezone=True), nullable=True)
    opted_out_at = Column(DateTime(timezone=True), nullable=True)
    source = Column(String(100), nullable=True)
    ip_address = Column(String(45), nullable=True)
    metadata = Column(JSONB, default={})

    lead = relationship("Lead")
    customer = relationship("Customer")


class Complaint(BaseModel):
    __tablename__ = "complaints"

    tenant_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    complainant_name = Column(String(255), nullable=False)
    complainant_phone = Column(String(20), nullable=True)
    complainant_email = Column(String(255), nullable=True)
    type = Column(Enum(ComplaintType), nullable=False)
    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.RECEIVED, nullable=False)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    resolution = Column(Text, nullable=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    assigned_user = relationship("User")


class Policy(BaseModel):
    __tablename__ = "policies"

    key = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    title_ar = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    content_ar = Column(Text, nullable=True)
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
