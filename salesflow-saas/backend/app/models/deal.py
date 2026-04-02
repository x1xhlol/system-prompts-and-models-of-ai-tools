from sqlalchemy import Column, String, Integer, Text, DateTime, Date, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.models.base import BaseModel


class Deal(BaseModel):
    __tablename__ = "deals"

    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
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
    payment_link = Column(String(1000), nullable=True)
    payment_status = Column(String(50), default="unpaid") # unpaid, pending, paid, expired
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    lead = relationship("Lead", back_populates="deals", foreign_keys=[lead_id])
    customer = relationship("Customer", foreign_keys=[customer_id])
    assigned_user = relationship("User", foreign_keys=[assigned_to])
    activities = relationship("Activity", back_populates="deal")
    proposals = relationship("Proposal", back_populates="deal")
