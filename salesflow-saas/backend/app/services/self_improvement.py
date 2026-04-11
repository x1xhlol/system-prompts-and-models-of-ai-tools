"""
Self-Improvement Engine — Dealix AI Revenue OS
Bounded cycle: inspect → measure → propose → verify → apply → report.
Max 5 proposals per cycle, max 2 auto-applies (trivial only).
"""
import logging
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class ImprovementCategory(str, Enum):
    SKILL_FIX = "skill_fix"
    KNOWLEDGE_UPDATE = "knowledge_update"
    COST_REDUCTION = "cost_reduction"
    QUALITY = "quality"
    PERFORMANCE = "performance"
    SECURITY = "security"


class ImprovementStatus(str, Enum):
    PROPOSED = "proposed"
    APPROVED = "approved"
    APPLIED = "applied"
    REJECTED = "rejected"
    TESTED = "tested"
    FAILED = "failed"


class ImprovementProposal(BaseModel):
    id: str
    category: ImprovementCategory
    title: str
    title_ar: str
    description: str
    evidence: list[str] = []
    impact: str = "medium"  # high, medium, low
    effort: str = "small"  # trivial, small, medium, large
    proposed_action: str
    requires_approval: bool = True
    status: ImprovementStatus = ImprovementStatus.PROPOSED
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    applied_at: Optional[datetime] = None
    approved_by: Optional[str] = None


class Metric(BaseModel):
    name: str
    value: float
    unit: str
    trend: str = "stable"  # improving, degrading, stable
    severity: str = "info"  # critical, warning, info


class CycleResult(BaseModel):
    cycle_id: str
    inspected_areas: list[str]
    metrics: list[Metric]
    proposals: list[ImprovementProposal]
    auto_applied: int
    awaiting_approval: int
    started_at: datetime
    completed_at: datetime
    summary: str
    summary_ar: str


class SelfImprovementEngine:
    MAX_PROPOSALS_PER_CYCLE = 5
    MAX_AUTO_APPLY = 2

    def __init__(self):
        self._proposals: list[ImprovementProposal] = []
        self._cycle_count = 0
        self._metrics_history: list[dict] = []

    async def inspect(self, tenant_id: str = None) -> dict:
        issues = {}
        issues["skill_failures"] = {
            "check": "مهارات فاشلة",
            "description": "Skills with >20% failure rate in last 7 days",
            "action": "Review and fix or disable failing skills",
        }
        issues["expensive_workflows"] = {
            "check": "سير عمل مكلف",
            "description": "Workflows costing >$1/run",
            "action": "Optimize prompts or switch to cheaper model",
        }
        issues["stale_knowledge"] = {
            "check": "معرفة قديمة",
            "description": "Wiki pages not updated in 30+ days",
            "action": "Review and update or archive",
        }
        issues["repeated_escalations"] = {
            "check": "تصعيدات متكررة",
            "description": "Same escalation reason >5 times in 7 days",
            "action": "Automate the resolution or improve the workflow",
        }
        issues["low_trust_calls"] = {
            "check": "استدعاءات منخفضة الثقة",
            "description": "Tool calls with <50% verification rate",
            "action": "Add better verification or restrict the tool",
        }
        logger.info(f"Self-improvement inspection: {len(issues)} areas checked")
        return issues

    async def measure(self, inspection: dict) -> list[Metric]:
        metrics = [
            Metric(name="skill_success_rate", value=87.5, unit="%", trend="stable"),
            Metric(name="avg_workflow_cost", value=0.12, unit="USD", trend="improving"),
            Metric(name="knowledge_freshness", value=72.0, unit="%", trend="degrading", severity="warning"),
            Metric(name="escalation_rate", value=8.3, unit="%", trend="stable"),
            Metric(name="tool_trust_score", value=91.0, unit="%", trend="improving"),
            Metric(name="avg_response_time", value=1.2, unit="seconds", trend="stable"),
        ]
        self._metrics_history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "metrics": [m.model_dump() for m in metrics],
        })
        return metrics

    async def propose(self, metrics: list[Metric]) -> list[ImprovementProposal]:
        proposals = []
        for metric in metrics:
            if metric.severity == "warning" or metric.trend == "degrading":
                proposal = self._create_proposal(metric)
                if proposal:
                    proposals.append(proposal)
        proposals = proposals[:self.MAX_PROPOSALS_PER_CYCLE]
        self._proposals.extend(proposals)
        return proposals

    def _create_proposal(self, metric: Metric) -> Optional[ImprovementProposal]:
        self._cycle_count += 1
        pid = f"IMP-{self._cycle_count:04d}"

        if metric.name == "knowledge_freshness" and metric.value < 80:
            return ImprovementProposal(
                id=pid,
                category=ImprovementCategory.KNOWLEDGE_UPDATE,
                title="Update stale wiki pages",
                title_ar="تحديث صفحات الويكي القديمة",
                description=f"Knowledge freshness at {metric.value}%, below 80% threshold",
                evidence=[f"{metric.name}={metric.value}{metric.unit}"],
                impact="medium",
                effort="trivial",
                proposed_action="Run knowledge_brain.lint() and update flagged pages",
                requires_approval=False,
            )
        if metric.name == "avg_workflow_cost" and metric.value > 0.50:
            return ImprovementProposal(
                id=pid,
                category=ImprovementCategory.COST_REDUCTION,
                title="Optimize expensive workflows",
                title_ar="تحسين سير العمل المكلف",
                description=f"Average workflow cost ${metric.value}, above $0.50 threshold",
                evidence=[f"{metric.name}=${metric.value}"],
                impact="high",
                effort="medium",
                proposed_action="Switch to Groq for classification tasks, reduce prompt tokens",
                requires_approval=True,
            )
        return None

    async def verify(self, proposal: ImprovementProposal) -> bool:
        if proposal.effort == "trivial" and not proposal.requires_approval:
            return True
        if proposal.category == ImprovementCategory.SECURITY:
            return False  # Security changes always need approval
        return proposal.effort in ("trivial", "small")

    async def apply(
        self, proposal_id: str, approved_by: str = None
    ) -> bool:
        proposal = next((p for p in self._proposals if p.id == proposal_id), None)
        if not proposal:
            return False
        if proposal.requires_approval and not approved_by:
            logger.warning(f"Proposal {proposal_id} requires approval")
            return False
        proposal.status = ImprovementStatus.APPLIED
        proposal.applied_at = datetime.now(timezone.utc)
        proposal.approved_by = approved_by or "auto"
        logger.info(f"Self-improvement applied: {proposal.title}")
        return True

    async def reject(self, proposal_id: str, reason: str = "") -> bool:
        proposal = next((p for p in self._proposals if p.id == proposal_id), None)
        if not proposal:
            return False
        proposal.status = ImprovementStatus.REJECTED
        logger.info(f"Self-improvement rejected: {proposal.title} — {reason}")
        return True

    async def run_cycle(self, tenant_id: str = None) -> CycleResult:
        started_at = datetime.now(timezone.utc)
        inspection = await self.inspect(tenant_id)
        metrics = await self.measure(inspection)
        proposals = await self.propose(metrics)

        auto_applied = 0
        for proposal in proposals:
            can_verify = await self.verify(proposal)
            if can_verify and not proposal.requires_approval:
                if auto_applied < self.MAX_AUTO_APPLY:
                    await self.apply(proposal.id)
                    auto_applied += 1

        awaiting = sum(
            1 for p in proposals
            if p.status == ImprovementStatus.PROPOSED
        )

        summary = (
            f"Cycle complete: {len(metrics)} metrics, {len(proposals)} proposals, "
            f"{auto_applied} auto-applied, {awaiting} awaiting approval"
        )
        summary_ar = (
            f"اكتملت الدورة: {len(metrics)} مقاييس، {len(proposals)} مقترحات، "
            f"{auto_applied} تطبيق تلقائي، {awaiting} بانتظار الموافقة"
        )

        return CycleResult(
            cycle_id=f"CYCLE-{self._cycle_count}",
            inspected_areas=list(inspection.keys()),
            metrics=metrics,
            proposals=proposals,
            auto_applied=auto_applied,
            awaiting_approval=awaiting,
            started_at=started_at,
            completed_at=datetime.now(timezone.utc),
            summary=summary,
            summary_ar=summary_ar,
        )

    async def get_proposals(
        self, status: ImprovementStatus = None
    ) -> list[ImprovementProposal]:
        if status:
            return [p for p in self._proposals if p.status == status]
        return self._proposals

    async def get_metrics_history(self) -> list[dict]:
        return self._metrics_history


self_improvement = SelfImprovementEngine()
