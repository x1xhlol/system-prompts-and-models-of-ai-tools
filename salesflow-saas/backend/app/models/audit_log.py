from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from app.models.base import TenantModel


class AuditLog(TenantModel):
    __tablename__ = "audit_logs"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String(100))
    entity_type = Column(String(100))
    entity_id = Column(UUID(as_uuid=True))
    changes = Column(JSONB)
    ip_address = Column(INET)
