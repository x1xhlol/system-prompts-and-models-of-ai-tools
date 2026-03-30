import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, Enum, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class AffiliateStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    EMPLOYED = "employed"
    TERMINATED = "terminated"


class AffiliateMarketer(BaseModel):
    __tablename__ = "affiliate_marketers"

    # Personal Info
    full_name = Column(String(255), nullable=False)
    full_name_ar = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=False, index=True)
    whatsapp = Column(String(20), nullable=True)
    city = Column(String(100), nullable=True)
    national_id = Column(String(20), nullable=True)

    # Status
    status = Column(Enum(AffiliateStatus), default=AffiliateStatus.PENDING, nullable=False)
    onboarded_at = Column(DateTime(timezone=True), nullable=True)
    employed_at = Column(DateTime(timezone=True), nullable=True)

    # Agreement
    agreement_signed = Column(Boolean, default=False)
    agreement_signed_at = Column(DateTime(timezone=True), nullable=True)

    # Performance tracking
    total_leads_generated = Column(Integer, default=0)
    total_deals_closed = Column(Integer, default=0)
    total_commission_earned = Column(Float, default=0.0)
    current_month_deals = Column(Integer, default=0)

    # Referral
    referred_by = Column(UUID(as_uuid=True), ForeignKey("affiliate_marketers.id"), nullable=True)
    referral_code = Column(String(20), unique=True, nullable=True)

    # Notes
    notes = Column(Text, nullable=True)
    metadata = Column(JSONB, default={})

    # Relationships
    performances = relationship("AffiliatePerformance", back_populates="affiliate")
    deals = relationship("AffiliateDeal", back_populates="affiliate")


class AffiliatePerformance(BaseModel):
    __tablename__ = "affiliate_performances"

    affiliate_id = Column(UUID(as_uuid=True), ForeignKey("affiliate_marketers.id"), nullable=False, index=True)
    month = Column(String(7), nullable=False)  # Format: YYYY-MM
    year = Column(Integer, nullable=False)

    # Monthly metrics
    leads_generated = Column(Integer, default=0)
    calls_made = Column(Integer, default=0)
    meetings_booked = Column(Integer, default=0)
    deals_closed = Column(Integer, default=0)
    revenue_generated = Column(Float, default=0.0)
    commission_earned = Column(Float, default=0.0)
    bonus_earned = Column(Float, default=0.0)

    # Commission breakdown
    basic_plan_sales = Column(Integer, default=0)
    professional_plan_sales = Column(Integer, default=0)
    enterprise_plan_sales = Column(Integer, default=0)

    # Payment
    payment_status = Column(String(20), default="pending")  # pending, paid, processing
    paid_at = Column(DateTime(timezone=True), nullable=True)
    payment_reference = Column(String(100), nullable=True)

    # Relationships
    affiliate = relationship("AffiliateMarketer", back_populates="performances")


class AffiliateDeal(BaseModel):
    __tablename__ = "affiliate_deals"

    affiliate_id = Column(UUID(as_uuid=True), ForeignKey("affiliate_marketers.id"), nullable=False, index=True)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=True)
    deal_id = Column(UUID(as_uuid=True), ForeignKey("deals.id"), nullable=True)

    # Client info
    client_company = Column(String(255), nullable=False)
    client_contact = Column(String(255), nullable=True)
    client_phone = Column(String(20), nullable=True)
    client_email = Column(String(255), nullable=True)

    # Deal info
    plan_type = Column(String(20), nullable=False)  # basic, professional, enterprise
    plan_price = Column(Float, nullable=False)
    commission_rate = Column(Float, nullable=False)
    commission_amount = Column(Float, nullable=False)
    is_recurring = Column(Boolean, default=True)

    # Status
    status = Column(String(20), default="pending")  # pending, confirmed, paid, cancelled
    confirmed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    affiliate = relationship("AffiliateMarketer", back_populates="deals")
