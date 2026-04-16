"""Structured Output Schemas — Decision Plane.

All critical decision outputs must conform to these schemas.
No free-text outputs in approval/commitment paths.
Every output carries provenance, freshness, and confidence.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ── Provenance Mixin ─────────────────────────────────────────

class Provenance(BaseModel):
    """Attached to every structured output for traceability."""
    generated_at: datetime = Field(default_factory=lambda: datetime.now())
    generated_by: str = Field(description="Agent or service that produced this output")
    model_provider: Optional[str] = Field(default=None, description="LLM provider used")
    model_id: Optional[str] = Field(default=None, description="Specific model ID")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="0.0-1.0 confidence score")
    freshness_hours: float = Field(default=0.0, description="Hours since source data was collected")
    trace_id: Optional[str] = Field(default=None, description="Correlation/trace ID for audit")


# ── Revenue Track ────────────────────────────────────────────

class LeadScoreCard(BaseModel):
    """Qualification score + signals + recommendation."""
    lead_id: str
    tenant_id: str
    score: int = Field(ge=0, le=100)
    tier: str = Field(description="hot | warm | cold")
    signals: List[Dict[str, Any]] = Field(default_factory=list)
    company_size_score: float = Field(default=0.0)
    industry_fit_score: float = Field(default=0.0)
    engagement_score: float = Field(default=0.0)
    budget_signal_score: float = Field(default=0.0)
    timing_score: float = Field(default=0.0)
    recommendation: str = Field(description="qualify | nurture | disqualify | escalate")
    reasoning: str
    provenance: Provenance


class QualificationMemo(BaseModel):
    """Structured deal qualification with evidence."""
    deal_id: str
    tenant_id: str
    lead_score_card: LeadScoreCard
    qualification_status: str = Field(description="qualified | not_qualified | needs_info")
    decision_factors: List[str]
    risks: List[str]
    next_steps: List[str]
    provenance: Provenance


class ProposalPack(BaseModel):
    """Pricing + terms + value proposition."""
    deal_id: str
    tenant_id: str
    proposal_version: int
    title: str
    title_ar: Optional[str] = None
    value_proposition: str
    value_proposition_ar: Optional[str] = None
    line_items: List[Dict[str, Any]]
    total_value_sar: float
    discount_percent: float = 0.0
    discount_requires_approval: bool = False
    payment_terms: str
    validity_days: int = 30
    provenance: Provenance


class PricingDecisionRecord(BaseModel):
    """Pricing rationale + approval status."""
    deal_id: str
    tenant_id: str
    base_price_sar: float
    final_price_sar: float
    discount_percent: float
    discount_reason: str
    approval_required: bool
    approval_status: Optional[str] = Field(default=None, description="pending | approved | rejected")
    approved_by: Optional[str] = None
    policy_class: str = Field(description="A | B")
    provenance: Provenance


class HandoffChecklist(BaseModel):
    """Sales-to-onboarding transition."""
    deal_id: str
    tenant_id: str
    items: List[Dict[str, Any]]  # {item, status, owner, due_date}
    all_complete: bool
    blockers: List[str]
    provenance: Provenance


# ── Expansion Track ──────────────────────────────────────────

class PartnerDossier(BaseModel):
    """Strategic partner evaluation."""
    partner_name: str
    partner_name_ar: Optional[str] = None
    partner_type: str = Field(description="referral | distribution | technology | strategic | government")
    strategic_fit_score: float = Field(ge=0.0, le=100.0)
    revenue_potential_sar: float
    risk_assessment: List[str]
    saudization_status: Optional[str] = None
    cr_verified: bool = False
    recommendation: str = Field(description="proceed | hold | reject")
    provenance: Provenance


class EconomicsModel(BaseModel):
    """Partnership or deal economics."""
    entity_id: str
    entity_type: str = Field(description="partnership | acquisition | expansion")
    revenue_upside_sar: float
    cost_sar: float
    net_value_sar: float
    payback_months: float
    irr_percent: Optional[float] = None
    assumptions: List[str]
    sensitivity_scenarios: List[Dict[str, Any]]
    provenance: Provenance


class ApprovalPacket(BaseModel):
    """Structured approval request for any Class B action."""
    action: str
    action_class: str = "B"
    resource_type: str
    resource_id: str
    tenant_id: str
    requested_by: str
    priority: str = Field(description="critical | high | normal | low")
    sla_hours: int
    context: Dict[str, Any]
    risk_summary: str
    reversibility: str = Field(description="reversible | partially_reversible | irreversible")
    provenance: Provenance


# ── M&A Track ────────────────────────────────────────────────

class TargetProfile(BaseModel):
    """Acquisition target screening."""
    company_name: str
    company_name_ar: Optional[str] = None
    sector: str
    revenue_sar: float
    employee_count: int
    geographic_fit: str
    strategic_fit_score: float = Field(ge=0.0, le=100.0)
    saudization_ratio: Optional[float] = None
    cr_number: Optional[str] = None
    recommendation: str = Field(description="short_list | watch | reject")
    provenance: Provenance


class DDPlan(BaseModel):
    """Due diligence plan."""
    target_id: str
    workstreams: List[Dict[str, Any]]  # {name, owner, deadline, status}
    total_workstreams: int
    completed: int
    critical_findings: List[str]
    provenance: Provenance


class ValuationMemo(BaseModel):
    """Valuation range for acquisition."""
    target_id: str
    methodology: str = Field(description="dcf | comparable | precedent | blended")
    low_sar: float
    mid_sar: float
    high_sar: float
    key_assumptions: List[str]
    sensitivity: List[Dict[str, Any]]
    provenance: Provenance


class SynergyModel(BaseModel):
    """Revenue and cost synergies."""
    target_id: str
    revenue_synergies_sar: float
    cost_synergies_sar: float
    integration_costs_sar: float
    net_synergy_sar: float
    realization_months: int
    risk_factors: List[str]
    provenance: Provenance


class ICMemo(BaseModel):
    """Investment Committee memo."""
    target_id: str
    recommendation: str = Field(description="proceed | conditional | hold | reject")
    valuation: ValuationMemo
    synergies: SynergyModel
    key_risks: List[str]
    key_mitigants: List[str]
    conditions: List[str]
    vote_required: str = Field(description="board | ic | ceo")
    provenance: Provenance


class BoardPackDraft(BaseModel):
    """Board pack executive summary."""
    period: str
    sections: List[Dict[str, Any]]  # {title, title_ar, content, data}
    revenue_actual_sar: float
    revenue_forecast_sar: float
    key_risks: List[str]
    decisions_required: List[str]
    provenance: Provenance


# ── Expansion ────────────────────────────────────────────────

class ExpansionPlan(BaseModel):
    """Market expansion plan."""
    market: str
    market_ar: Optional[str] = None
    phase: str = Field(description="scan | prioritize | ready | canary | scale")
    regulatory_complexity: str = Field(description="low | medium | high | very_high")
    dialect_support: str
    gtm_strategy: str
    canary_criteria: List[str]
    stop_loss_triggers: List[Dict[str, Any]]
    provenance: Provenance


class StopLossPolicy(BaseModel):
    """Automated stop-loss triggers for expansion."""
    market: str
    metrics: List[Dict[str, Any]]  # {metric, threshold, action, evaluation_period_days}
    active: bool = True
    provenance: Provenance


# ── PMI ──────────────────────────────────────────────────────

class PMIProgramPlan(BaseModel):
    """Post-merger integration program."""
    acquisition_id: str
    phases: List[Dict[str, Any]]  # {name, start, end, milestones, owner}
    critical_path: List[str]
    risk_register: List[Dict[str, Any]]
    synergy_targets: SynergyModel
    provenance: Provenance


class ExecWeeklyPack(BaseModel):
    """Executive weekly summary."""
    week_of: str
    overall_rag: str = Field(description="red | amber | green")
    completed_this_week: List[str]
    planned_next_week: List[str]
    blockers: List[str]
    synergy_actual_sar: float
    synergy_target_sar: float
    people_update: str
    risk_summary: List[str]
    provenance: Provenance
