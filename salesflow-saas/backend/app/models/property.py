from sqlalchemy import Column, String, Integer, Text, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.models.base import TenantModel


class Property(TenantModel):
    __tablename__ = "properties"

    title = Column(String(255), nullable=False)
    title_ar = Column(String(255))
    property_type = Column(String(50))  # apartment, villa, land, office, commercial
    status = Column(String(50), default="available")  # available, reserved, sold, rented
    price = Column(Numeric(14, 2))
    currency = Column(String(3), default="SAR")
    area_sqm = Column(Numeric(10, 2))
    bedrooms = Column(Integer)
    bathrooms = Column(Integer)
    district = Column(String(100))  # حي النرجس، حي الياسمين، etc.
    city = Column(String(100), default="الرياض")
    address = Column(Text)
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    images = Column(JSONB, default=list)
    features = Column(JSONB, default=list)  # مسبح، حديقة، مصعد، etc.
    description = Column(Text)
    description_ar = Column(Text)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    assigned_user = relationship("User", foreign_keys=[assigned_to])
