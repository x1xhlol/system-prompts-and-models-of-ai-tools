"""Evidence Pack — assembled proof for audit, board review, and compliance."""

from __future__ import annotations

import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.models.base import TenantModel


class EvidencePackType(str, enum.Enum):
    DEAL_CLOSURE = "deal_closure"
    COMPLIANCE_AUDIT = "compliance_audit"
    QUARTERLY_REVIEW = "quarterly_review"
    INCIDENT_RESPONSE = "incident_response"
    BOARD_REPORT = "board_report"


class EvidencePackStatus(str, enum.Enum):
    ASSEMBLING = "assembling"
    READY = "ready"
    REVIEWED = "reviewed"
    ARCHIVED = "archived"


class EvidencePack(TenantModel):
    __tablename__ = "evidence_packs"

    title = Column(String(255), nullable=False)
    title_ar = Column(String(255), nullable=True)
    pack_type = Column(Enum(EvidencePackType), nullable=False)
    entity_type = Column(String(80), nullable=True)  # deal, lead, tenant, etc.
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    assembled_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    status = Column(Enum(EvidencePackStatus), nullable=False, default=EvidencePackStatus.ASSEMBLING)
    contents = Column(JSONB, default=list)  # list of evidence items
    metadata_ = Column("metadata", JSONB, default=dict)
    reviewed_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    hash_signature = Column(String(64), nullable=True)  # SHA256 of contents

    assembled_by = relationship("User", foreign_keys=[assembled_by_id])
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id])
