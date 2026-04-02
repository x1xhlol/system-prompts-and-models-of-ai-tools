import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Boolean, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import TenantModel


class CompanySize(str, enum.Enum):
    MICRO = "micro"
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"


class Company(TenantModel):
    __tablename__ = "companies"

    name = Column(String(255), nullable=False, index=True)
    name_ar = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    industry = Column(String(100), nullable=True, index=True)
    size = Column(Enum(CompanySize), nullable=True)
    city = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    source = Column(String(50), nullable=True)
    affiliate_id = Column(UUID(as_uuid=True), ForeignKey("affiliate_marketers.id"), nullable=True)
    notes = Column(Text, nullable=True)
    extra_metadata = Column(JSONB, default={})
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    contacts = relationship("Contact", back_populates="company")
    affiliate = relationship("AffiliateMarketer")


class Contact(TenantModel):
    __tablename__ = "contacts"

    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True, index=True)
    email = Column(String(255), nullable=True, index=True)
    is_decision_maker = Column(Boolean, default=False)
    preferred_language = Column(String(10), default="ar")
    preferred_channel = Column(String(20), default="whatsapp")
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    company = relationship("Company", back_populates="contacts")
