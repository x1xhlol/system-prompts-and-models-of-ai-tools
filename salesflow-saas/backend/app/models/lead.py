from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.models.base import TenantModel


class Lead(TenantModel):
    __tablename__ = "leads"

    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(20))
    email = Column(String(255))
    source = Column(String(100))  # whatsapp, website, referral, social, phone
    status = Column(String(50), default="new")  # new, contacted, qualified, proposal, won, lost
    score = Column(Integer, default=0)
    notes = Column(Text)
    metadata = Column(JSONB, default=dict)  # industry-specific flexible data
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    tenant = relationship("Tenant", back_populates="leads")
    assigned_user = relationship("User", foreign_keys=[assigned_to])
    activities = relationship("Activity", back_populates="lead")
    messages = relationship("Message", back_populates="lead")
    deals = relationship("Deal", back_populates="lead")
