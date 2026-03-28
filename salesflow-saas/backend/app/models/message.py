from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import TenantModel


class Message(TenantModel):
    __tablename__ = "messages"

    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)
    channel = Column(String(50), nullable=False)  # whatsapp, email, sms
    direction = Column(String(10), nullable=False)  # inbound, outbound
    content = Column(Text)
    status = Column(String(50), default="pending")  # pending, sent, delivered, read, failed
    sent_at = Column(DateTime(timezone=True))
    metadata = Column(JSONB, default=dict)

    lead = relationship("Lead", back_populates="messages")
    customer = relationship("Customer", back_populates="messages")
