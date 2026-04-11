from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import TenantModel


class Activity(TenantModel):
    __tablename__ = "activities"

    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=True)
    deal_id = Column(UUID(as_uuid=True), ForeignKey("deals.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    type = Column(String(50), nullable=False)  # call, email, whatsapp, meeting, note, follow_up
    subject = Column(String(255))
    description = Column(Text)
    scheduled_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    is_automated = Column(Boolean, default=False)

    lead = relationship("Lead", back_populates="activities", foreign_keys=[lead_id])
    deal = relationship("Deal", back_populates="activities", foreign_keys=[deal_id])
    user = relationship("User", back_populates="activities", foreign_keys=[user_id])
