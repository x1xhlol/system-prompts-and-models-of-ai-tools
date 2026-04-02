from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import TenantModel


class User(TenantModel):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("tenant_id", "email", name="uq_user_tenant_email"),)

    email = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    full_name_ar = Column(String(255))
    role = Column(String(50), nullable=False, default="agent")  # owner, manager, agent, admin
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True))

    activities = relationship("Activity", back_populates="user")
