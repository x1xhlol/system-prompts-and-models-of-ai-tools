"""
Skill Governance — Dealix AI Revenue OS (Antigravity Pattern)
Governed skill admission, bundles, and lifecycle management.
Skills are admitted through rubric, not mass-installed.
"""
import logging
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class AdmissionDecision(str, Enum):
    ADMIT_NOW = "admit_now"
    ADMIT_LATER = "admit_later"
    DO_NOT_ADMIT = "do_not_admit"
    REIMPLEMENT_LOCALLY = "reimplement_locally"
    DESIGN_REFERENCE = "design_reference"


class SkillCandidate(BaseModel):
    id: str
    name: str
    source: str  # "antigravity", "community", "internal", "mkhlab"
    category: str
    description: str
    relevance_score: float = 0.0  # 0-1
    safety_risk: str = "low"  # low, medium, high
    maintenance_burden: str = "low"
    overlap_with_existing: list[str] = []
    measurable_roi: str = ""
    license: str = "MIT"
    decision: Optional[AdmissionDecision] = None
    decision_reason: str = ""
    evaluated_at: Optional[datetime] = None


class SkillBundle(BaseModel):
    id: str
    name: str
    name_ar: str
    description: str
    skills: list[str]  # skill IDs
    target_profile: str  # Hermes profile this bundle serves
    priority: str = "medium"


# Admission rubric weights
RUBRIC = {
    "relevance": 0.30,       # Direct project relevance
    "safety": 0.20,          # Safety risk (inverted)
    "maintenance": 0.15,     # Maintenance burden (inverted)
    "roi": 0.15,             # Measurable ROI
    "overlap": 0.10,         # Low overlap with existing (inverted)
    "deterministic": 0.10,   # Deterministic utility
}

SAFETY_SCORES = {"low": 1.0, "medium": 0.5, "high": 0.1}
MAINTENANCE_SCORES = {"low": 1.0, "medium": 0.6, "high": 0.2}

# Pre-defined bundles for Dealix
DEFAULT_BUNDLES: list[dict] = [
    {
        "id": "bundle-repo-audit",
        "name": "Repo Audit", "name_ar": "فحص المستودع",
        "description": "Code quality, architecture review, dependency check",
        "skills": ["repo-audit", "architecture-review", "dependency-check"],
        "target_profile": "ops", "priority": "high",
    },
    {
        "id": "bundle-release",
        "name": "Release Hardening", "name_ar": "تقوية الإصدار",
        "description": "Release prep, canary check, rollback planning",
        "skills": ["release-prep", "canary-check", "rollback-plan", "security-preflight"],
        "target_profile": "ops", "priority": "high",
    },
    {
        "id": "bundle-growth",
        "name": "Growth & SEO", "name_ar": "النمو والسيو",
        "description": "Content generation, SEO audit, competitor analysis",
        "skills": ["content-gen", "seo-audit", "competitor-scan"],
        "target_profile": "growth", "priority": "medium",
    },
    {
        "id": "bundle-sales",
        "name": "Sales Research", "name_ar": "بحث المبيعات",
        "description": "Lead research, proposal drafting, call prep",
        "skills": ["lead-research", "proposal-draft", "call-prep", "objection-handler"],
        "target_profile": "sales", "priority": "high",
    },
    {
        "id": "bundle-arabic",
        "name": "Arabic Market Ops", "name_ar": "عمليات السوق العربي",
        "description": "Arabic summarization, dialect detection, RTL checks",
        "skills": ["arabic-summarize", "dialect-detect", "rtl-check", "arabizi-convert"],
        "target_profile": "arabic-ops", "priority": "high",
    },
    {
        "id": "bundle-qa",
        "name": "QA & Testing", "name_ar": "ضمان الجودة",
        "description": "Test generation, browser QA, regression check",
        "skills": ["generate-tests", "browser-qa", "regression-check"],
        "target_profile": "delivery", "priority": "medium",
    },
    {
        "id": "bundle-knowledge",
        "name": "Documentation & Knowledge", "name_ar": "التوثيق والمعرفة",
        "description": "Wiki maintenance, runbook generation, API docs",
        "skills": ["wiki-update", "runbook-gen", "api-docs", "glossary-update"],
        "target_profile": "knowledge", "priority": "medium",
    },
]


class SkillGovernance:
    """Governed skill admission and lifecycle management."""

    def __init__(self):
        self._candidates: list[SkillCandidate] = []
        self._admitted: list[str] = []
        self._rejected: list[str] = []
        self._bundles = [SkillBundle(**b) for b in DEFAULT_BUNDLES]

    def evaluate_candidate(self, candidate: SkillCandidate) -> SkillCandidate:
        safety_score = SAFETY_SCORES.get(candidate.safety_risk, 0.5)
        maint_score = MAINTENANCE_SCORES.get(candidate.maintenance_burden, 0.5)
        overlap_score = 1.0 - min(len(candidate.overlap_with_existing) * 0.3, 1.0)
        roi_score = 0.8 if candidate.measurable_roi else 0.2
        deterministic_score = 0.7  # Default moderate

        total = (
            candidate.relevance_score * RUBRIC["relevance"]
            + safety_score * RUBRIC["safety"]
            + maint_score * RUBRIC["maintenance"]
            + roi_score * RUBRIC["roi"]
            + overlap_score * RUBRIC["overlap"]
            + deterministic_score * RUBRIC["deterministic"]
        )

        if total >= 0.7:
            candidate.decision = AdmissionDecision.ADMIT_NOW
            candidate.decision_reason = f"Score {total:.2f} — high fit, safe, low overlap"
        elif total >= 0.5:
            candidate.decision = AdmissionDecision.ADMIT_LATER
            candidate.decision_reason = f"Score {total:.2f} — moderate fit, review later"
        elif candidate.overlap_with_existing:
            candidate.decision = AdmissionDecision.REIMPLEMENT_LOCALLY
            candidate.decision_reason = f"Score {total:.2f} — overlaps with existing: {candidate.overlap_with_existing}"
        elif total >= 0.3:
            candidate.decision = AdmissionDecision.DESIGN_REFERENCE
            candidate.decision_reason = f"Score {total:.2f} — use as design pattern only"
        else:
            candidate.decision = AdmissionDecision.DO_NOT_ADMIT
            candidate.decision_reason = f"Score {total:.2f} — low relevance or high risk"

        candidate.evaluated_at = datetime.now(timezone.utc)
        self._candidates.append(candidate)

        if candidate.decision == AdmissionDecision.ADMIT_NOW:
            self._admitted.append(candidate.id)
        elif candidate.decision == AdmissionDecision.DO_NOT_ADMIT:
            self._rejected.append(candidate.id)

        logger.info(
            f"Skill evaluated: {candidate.name} → {candidate.decision.value} "
            f"({candidate.decision_reason})"
        )
        return candidate

    def get_bundle(self, bundle_id: str) -> Optional[SkillBundle]:
        return next((b for b in self._bundles if b.id == bundle_id), None)

    def get_bundles_for_profile(self, profile: str) -> list[SkillBundle]:
        return [b for b in self._bundles if b.target_profile == profile]

    def list_bundles(self) -> list[SkillBundle]:
        return self._bundles

    def get_admitted(self) -> list[str]:
        return self._admitted

    def get_rejected(self) -> list[str]:
        return self._rejected

    def get_candidates(self, decision: AdmissionDecision = None) -> list[SkillCandidate]:
        if decision:
            return [c for c in self._candidates if c.decision == decision]
        return self._candidates

    def get_admission_stats(self) -> dict:
        total = len(self._candidates)
        return {
            "total_evaluated": total,
            "admitted": len(self._admitted),
            "rejected": len(self._rejected),
            "pending": total - len(self._admitted) - len(self._rejected),
            "bundles": len(self._bundles),
            "admission_rate": round(len(self._admitted) / total * 100, 1) if total else 0,
        }


skill_governance = SkillGovernance()
