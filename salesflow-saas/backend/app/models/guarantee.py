import enum
from sqlalchemy import Column, String, Integer, Text, DateTime, Float, Boolean, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import TenantModel


class GuaranteeStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    REVIEWING = "reviewing"
    APPROVED = "approved"
    REJECTED = "rejected"
    REFUNDED = "refunded"


class GuaranteeClaim(TenantModel):
    __tablename__ = "guarantee_claims"

    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False, index=True)
    deal_id = Column(UUID(as_uuid=True), ForeignKey("deals.id"), nullable=False)
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("subscriptions.id"), nullable=True)
    status = Column(Enum(GuaranteeStatus), default=GuaranteeStatus.SUBMITTED, nullable=False)
    reason = Column(Text, nullable=False)
    evidence = Column(JSONB, default={})
    leads_entered = Column(Integer, default=0)
    messages_sent = Column(Integer, default=0)
    active_days = Column(Integer, default=0)
    onboarding_completed = Column(Boolean, default=False)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    decision_notes = Column(Text, nullable=True)
    refund_amount = Column(Float, nullable=True)
    refunded_at = Column(DateTime(timezone=True), nullable=True)

    customer = relationship("Customer")
    deal = relationship("Deal")
    subscription = relationship("Subscription")
    reviewer = relationship("User")
