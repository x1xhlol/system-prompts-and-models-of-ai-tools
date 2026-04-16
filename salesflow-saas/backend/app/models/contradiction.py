"""Contradiction Engine — tracks conflicts between documents, policies, and system behavior."""

from __future__ import annotations

import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.models.base import TenantModel


class ContradictionType(str, enum.Enum):
    FACTUAL = "factual"
    TEMPORAL = "temporal"
    SCOPE = "scope"
    POLICY = "policy"


class ContradictionSeverity(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ContradictionStatus(str, enum.Enum):
    DETECTED = "detected"
    REVIEWING = "reviewing"
    RESOLVED = "resolved"
    ACCEPTED = "accepted"


class Contradiction(TenantModel):
    __tablename__ = "contradictions"

    source_a = Column(String(255), nullable=False)
    source_b = Column(String(255), nullable=False)
    claim_a = Column(Text, nullable=False)
    claim_b = Column(Text, nullable=False)
    contradiction_type = Column(
        Enum(ContradictionType), nullable=False, default=ContradictionType.FACTUAL
    )
    severity = Column(
        Enum(ContradictionSeverity), nullable=False, default=ContradictionSeverity.MEDIUM
    )
    status = Column(
        Enum(ContradictionStatus), nullable=False, default=ContradictionStatus.DETECTED
    )
    detected_by = Column(String(50), nullable=False, default="manual")  # manual, ai_scan, runtime
    resolution = Column(Text, nullable=True)
    evidence = Column(JSONB, default=dict)
    resolved_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    resolved_by = relationship("User", foreign_keys=[resolved_by_id])
