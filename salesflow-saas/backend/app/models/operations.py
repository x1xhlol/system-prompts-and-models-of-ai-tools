"""Full Auto Ops: domain events, approval queue, integration connector health."""

from __future__ import annotations

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.models.base import TenantModel


class DomainEvent(TenantModel):
    __tablename__ = "domain_events"

    event_type = Column(String(120), nullable=False, index=True)
    payload = Column(JSONB, default=dict)
    source = Column(String(50), nullable=False, default="api")  # api, webhook, worker
    correlation_id = Column(String(80), nullable=True, index=True)


class ApprovalRequest(TenantModel):
    __tablename__ = "approval_requests"

    channel = Column(String(40), nullable=False)  # whatsapp, email, sms
    resource_type = Column(String(80), nullable=False)
    resource_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    payload = Column(JSONB, default=dict)
    status = Column(String(20), nullable=False, default="pending")  # pending, approved, rejected
    requested_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    reviewed_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    note = Column(Text, nullable=True)

    requested_by = relationship("User", foreign_keys=[requested_by_id])
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id])


class IntegrationSyncState(TenantModel):
    __tablename__ = "integration_sync_states"
    __table_args__ = (UniqueConstraint("tenant_id", "connector_key", name="uq_tenant_connector"),)

    connector_key = Column(String(80), nullable=False, index=True)
    display_name_ar = Column(String(255), nullable=True)
    last_success_at = Column(DateTime(timezone=True), nullable=True)
    last_attempt_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), nullable=False, default="unknown")  # ok, degraded, error, unknown
    last_error = Column(Text, nullable=True)
