import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import TenantModel, BaseModel


class CommissionStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING = "pending"
    APPROVED = "approved"
    HELD = "held"
    PAID = "paid"
    REJECTED = "rejected"
    DISPUTED = "disputed"
    CLAWBACK = "clawback"


class PayoutStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    PAID = "paid"
    FAILED = "failed"


class Commission(TenantModel):
    __tablename__ = "commissions"

    affiliate_id = Column(UUID(as_uuid=True), ForeignKey("affiliate_marketers.id"), nullable=False, index=True)
    deal_id = Column(UUID(as_uuid=True), ForeignKey("deals.id"), nullable=False, index=True)
    payout_id = Column(UUID(as_uuid=True), ForeignKey("payouts.id"), nullable=True)
    amount = Column(Float, nullable=False)
    rate = Column(Float, nullable=False)
    plan_type = Column(String(50), nullable=True)
    status = Column(Enum(CommissionStatus), default=CommissionStatus.DRAFT, nullable=False)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    held_reason = Column(Text, nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    payment_reference = Column(String(100), nullable=True)
    dispute_id = Column(UUID(as_uuid=True), ForeignKey("disputes.id"), nullable=True)
    notes = Column(Text, nullable=True)

    affiliate = relationship("AffiliateMarketer")
    deal = relationship("Deal")
    payout = relationship("Payout", back_populates="commissions")
    approved_user = relationship("User", foreign_keys=[approved_by])


class Payout(BaseModel):
    __tablename__ = "payouts"

    affiliate_id = Column(UUID(as_uuid=True), ForeignKey("affiliate_marketers.id"), nullable=False, index=True)
    total_amount = Column(Float, nullable=False)
    commissions_count = Column(Integer, default=0)
    status = Column(Enum(PayoutStatus), default=PayoutStatus.PENDING, nullable=False)
    bank_name = Column(String(100), nullable=True)
    bank_account = Column(String(50), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    payment_reference = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)

    affiliate = relationship("AffiliateMarketer")
    commissions = relationship("Commission", back_populates="payout")
