"""Compliance Control — live Saudi/GCC regulatory controls for compliance matrix."""

from __future__ import annotations

import enum

from sqlalchemy import Column, DateTime, Enum, String, Text
from sqlalchemy.dialects.postgresql import JSONB

from app.models.base import TenantModel


class ComplianceCategory(str, enum.Enum):
    PDPL = "pdpl"
    ZATCA = "zatca"
    SDAIA = "sdaia"
    NCA = "nca"
    SECTOR_SPECIFIC = "sector_specific"


class ComplianceStatus(str, enum.Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    PARTIAL = "partial"
    NOT_APPLICABLE = "not_applicable"


class RiskLevel(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ComplianceControl(TenantModel):
    __tablename__ = "compliance_controls"

    control_id = Column(String(20), nullable=False, index=True)  # e.g. PDPL-C01
    control_name = Column(String(255), nullable=False)
    control_name_ar = Column(String(255), nullable=True)
    category = Column(Enum(ComplianceCategory), nullable=False)
    status = Column(Enum(ComplianceStatus), nullable=False, default=ComplianceStatus.PARTIAL)
    evidence_source = Column(String(255), nullable=True)  # which service provides the live check
    last_checked_at = Column(DateTime(timezone=True), nullable=True)
    last_result = Column(JSONB, default=dict)
    remediation_plan = Column(Text, nullable=True)
    owner = Column(String(100), nullable=True)
    risk_level = Column(Enum(RiskLevel), nullable=False, default=RiskLevel.MEDIUM)
