from sqlalchemy import Column, String, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import TenantModel


class Customer(TenantModel):
    __tablename__ = "customers"

    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(20))
    email = Column(String(255))
    company_name = Column(String(255))
    extra_metadata = Column(JSONB, default=dict)
    lifetime_value = Column(Numeric(12, 2), default=0)

    lead = relationship("Lead", foreign_keys=[lead_id])
    messages = relationship("Message", back_populates="customer", foreign_keys="[Message.customer_id]")
