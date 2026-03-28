from sqlalchemy import Column, String, Integer, Text, DateTime, Date, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.models.base import TenantModel


class Deal(TenantModel):
    __tablename__ = "deals"

    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    value = Column(Numeric(12, 2))
    currency = Column(String(3), default="SAR")
    stage = Column(String(50), default="new")  # new, negotiation, proposal, closed_won, closed_lost
    probability = Column(Integer, default=0)
    expected_close_date = Column(Date)
    closed_at = Column(DateTime(timezone=True))
    notes = Column(Text)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    tenant = relationship("Tenant", back_populates="deals")
    lead = relationship("Lead", back_populates="deals")
    customer = relationship("Customer")
    assigned_user = relationship("User", foreign_keys=[assigned_to])
    activities = relationship("Activity", back_populates="deal")
    proposals = relationship("Proposal", back_populates="deal")
