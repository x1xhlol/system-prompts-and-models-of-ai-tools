import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import TenantModel


class DisputeType(str, enum.Enum):
    COMMISSION = "commission"
    ATTRIBUTION = "attribution"
    PAYOUT = "payout"
    GUARANTEE = "guarantee"
    SERVICE = "service"


class DisputeStatus(str, enum.Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    REJECTED = "rejected"
    ESCALATED = "escalated"


class Dispute(TenantModel):
    __tablename__ = "disputes"

    commission_id = Column(UUID(as_uuid=True), ForeignKey("commissions.id"), nullable=True)
    deal_id = Column(UUID(as_uuid=True), ForeignKey("deals.id"), nullable=True)
    affiliate_id = Column(UUID(as_uuid=True), ForeignKey("affiliate_marketers.id"), nullable=False, index=True)
    type = Column(Enum(DisputeType), nullable=False)
    status = Column(Enum(DisputeStatus), default=DisputeStatus.OPEN, nullable=False)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    evidence = Column(JSONB, default={})
    resolution = Column(Text, nullable=True)
    resolved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    escalated_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    commission = relationship("Commission", foreign_keys=[commission_id])
    deal = relationship("Deal")
    affiliate = relationship("AffiliateMarketer")
    resolver = relationship("User", foreign_keys=[resolved_by])
    escalated_user = relationship("User", foreign_keys=[escalated_to])
