from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.models.base import BaseModel


class Tenant(BaseModel):
    __tablename__ = "tenants"

    name = Column(String(255), nullable=False)
    name_ar = Column(String(255))
    slug = Column(String(100), unique=True, nullable=False, index=True)
    industry = Column(String(100))
    plan = Column(String(50), default="basic")
    logo_url = Column(String(500))
    phone = Column(String(20))
    email = Column(String(255))
    whatsapp_number = Column(String(20))
    settings = Column(JSONB, default=dict)
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="tenant", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="tenant", cascade="all, delete-orphan")
    deals = relationship("Deal", back_populates="tenant", cascade="all, delete-orphan")
