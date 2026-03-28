from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import TenantModel


class Notification(TenantModel):
    __tablename__ = "notifications"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(String(50))
    title = Column(String(255))
    body = Column(Text)
    is_read = Column(Boolean, default=False)
    metadata = Column(JSONB, default=dict)
