from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.models.base import BaseModel


class Lead(BaseModel):
    __tablename__ = "leads"

    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(20))
    email = Column(String(255))
    source = Column(String(100))  # whatsapp, website, referral, social, phone
    status = Column(String(50), default="new")  # new, contacted, qualified, proposal, won, lost
    score = Column(Integer, default=0)
    notes = Column(Text)
    extra_metadata = Column(JSONB, default=dict)  # industry-specific flexible data
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    assigned_user = relationship("User", foreign_keys=[assigned_to])
    activities = relationship("Activity", back_populates="lead", foreign_keys="[Activity.lead_id]")
    messages = relationship("Message", back_populates="lead", foreign_keys="[Message.lead_id]")
    deals = relationship("Deal", back_populates="lead", foreign_keys="[Deal.lead_id]")
