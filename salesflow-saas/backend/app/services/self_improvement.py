"""
Self-Improvement Engine -- Dealix AI Revenue OS -- محرك التحسين الذاتي
Bounded self-improvement loop: Inspect -> Measure -> Propose -> Verify -> Apply.
Max 5 proposals per cycle, max 2 auto-applies (trivial only).
"""
from __future__ import annotations

import logging
import uuid
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class Metric(BaseModel):
    """Quantified measurement of a detected issue."""
    name: str
    name_ar: str
    value: float
    unit: str = ""
    threshold: float = 0.0
    exceeds_threshold: bool = False
    frequency: int = 0
    estimated_cost_usd: float = 0.0
    impact: str = "low"


class ImprovementProposal(BaseModel):
    """A single bounded improvement proposal."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str = "quality"  # skill_fix, knowledge_update, cost_reduction, quality
    title: str
    title_ar: str
    description: str
    evidence: list[str] = []
    impact: str = "medium"  # high, medium, low
    effort: str = "small"  # trivial, small, medium, large
    proposed_action: str = ""
    requires_approval: bool = True
    status: str = "proposed"  # proposed, approved, applied, rejected, tested
    approved_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    applied_at: Optional[datetime] = None
    rollback_action: str = ""
    test_result: Optional[str] = None


class CycleResult(BaseModel):
    """Result of a full self-improvement cycle."""
    cycle_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str = ""
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    duration_ms: int = 0
    issues_found: int = 0
    metrics_measured: int = 0
    proposals_generated: int = 0
    proposals_auto_applied: int = 0
    proposals_pending: int = 0
    summary: str = ""
    summary_ar: str = ""


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

class SelfImprovementEngine:
    """Bounded self-improvement. Inspect -> Measure -> Propose -> Verify -> Apply."""

    MAX_PROPOSALS_PER_CYCLE = 5
    MAX_AUTO_APPLY = 2  # only trivial improvements auto-apply

    def __init__(self) -> None:
        self._proposals: list[ImprovementProposal] = []
        self._cycles: list[CycleResult] = []
        self._max_proposals = 5_000
        self._max_cycles = 500
        logger.info("محرك التحسين الذاتي: تم التهيئة")

    # -- Phase 1: Inspect --------------------------------------------------

    async def inspect(self, tenant_id: Optional[str] = None) -> dict[str, Any]:
        """Check for issues: skill failures, expensive workflows, stale knowledge,
        repeated escalations, low-trust tool calls, slow endpoints."""
        issues: list[dict[str, Any]] = []

        # Simulated inspection checks (in production, these query real services)
        issues.append({
            "type": "skill_failure_rate",
            "description": "Some skills have failure rate above 10%",
            "description_ar": "بعض المهارات لديها معدل فشل أعلى من 10%",
            "data": {"skill_id": "messaging.whatsapp.send", "failure_rate": 0.12, "sample_size": 200},
        })
        issues.append({
            "type": "expensive_workflow",
            "description": "Content generation workflow uses 3x expected budget",
            "description_ar": "سير عمل توليد المحتوى يستخدم 3 أضعاف الميزانية المتوقعة",
            "data": {"workflow": "content_generation", "cost_usd": 0.15, "expected_usd": 0.05},
        })
        issues.append({
            "type": "stale_knowledge",
            "description": "12 knowledge pages not updated in 30+ days",
            "description_ar": "12 صفحة معرفة لم تُحدّث منذ أكثر من 30 يوماً",
            "data": {"stale_count": 12, "threshold_days": 30},
        })
        issues.append({
            "type": "repeated_escalation",
            "description": "Consent-expired escalations repeat 5+ times/week",
            "description_ar": "تصعيدات انتهاء الموافقة تتكرر أكثر من 5 مرات أسبوعياً",
            "data": {"escalation_type": "consent_expired", "weekly_count": 7},
        })
        issues.append({
            "type": "low_trust_calls",
            "description": "Agent 'growth' has 15% unverified tool calls",
            "description_ar": "وكيل 'النمو' لديه 15% مكالمات أدوات غير متحقق منها",
            "data": {"agent_id": "growth", "unverified_rate": 0.15},
        })

        logger.info("[SelfImprove] فحص: %d مشكلة اكتُشفت tenant=%s", len(issues), tenant_id or "global")
        return {"tenant_id": tenant_id or "global", "issues": issues, "count": len(issues)}

    # -- Phase 2: Measure --------------------------------------------------

    async def measure(self, inspection: dict[str, Any]) -> list[Metric]:
        """Quantify each issue: frequency, cost, impact."""
        metrics: list[Metric] = []
        for issue in inspection.get("issues", []):
            data = issue.get("data", {})
            itype = issue.get("type", "unknown")

            if itype == "skill_failure_rate":
                metrics.append(Metric(
                    name=f"failure_rate:{data.get('skill_id', '?')}",
                    name_ar=f"معدل الفشل: {data.get('skill_id', '?')}",
                    value=data.get("failure_rate", 0),
                    unit="rate", threshold=0.10,
                    exceeds_threshold=data.get("failure_rate", 0) > 0.10,
                    frequency=data.get("sample_size", 0),
                    estimated_cost_usd=data.get("failure_rate", 0) * data.get("sample_size", 0) * 0.01,
                    impact="high" if data.get("failure_rate", 0) > 0.2 else "medium",
                ))
            elif itype == "expensive_workflow":
                excess = data.get("cost_usd", 0) - data.get("expected_usd", 0)
                metrics.append(Metric(
                    name=f"cost_excess:{data.get('workflow', '?')}",
                    name_ar=f"تكلفة زائدة: {data.get('workflow', '?')}",
                    value=excess, unit="usd", threshold=0.05,
                    exceeds_threshold=excess > 0.05,
                    estimated_cost_usd=excess * 100,  # projected monthly
                    impact="high" if excess > 0.10 else "medium",
                ))
            elif itype == "stale_knowledge":
                metrics.append(Metric(
                    name="stale_knowledge_pages",
                    name_ar="صفحات معرفة قديمة",
                    value=data.get("stale_count", 0),
                    unit="pages", threshold=5,
                    exceeds_threshold=data.get("stale_count", 0) > 5,
                    impact="low",
                ))
            elif itype == "repeated_escalation":
                metrics.append(Metric(
                    name=f"repeated_escalation:{data.get('escalation_type', '?')}",
                    name_ar=f"تصعيد متكرر: {data.get('escalation_type', '?')}",
                    value=data.get("weekly_count", 0),
                    unit="per_week", threshold=3,
                    exceeds_threshold=data.get("weekly_count", 0) > 3,
                    impact="medium",
                ))
            elif itype == "low_trust_calls":
                metrics.append(Metric(
                    name=f"unverified_rate:{data.get('agent_id', '?')}",
                    name_ar=f"معدل غير متحقق: {data.get('agent_id', '?')}",
                    value=data.get("unverified_rate", 0),
                    unit="rate", threshold=0.10,
                    exceeds_threshold=data.get("unverified_rate", 0) > 0.10,
                    impact="medium",
                ))

        logger.info("[SelfImprove] قياس: %d مقاييس", len(metrics))
        return metrics

    # -- Phase 3: Propose --------------------------------------------------

    async def propose(self, metrics: list[Metric]) -> list[ImprovementProposal]:
        """Generate max 5 proposals per cycle, prioritized by impact/effort."""
        proposals: list[ImprovementProposal] = []

        for m in sorted(metrics, key=lambda x: -x.estimated_cost_usd):
            if len(proposals) >= self.MAX_PROPOSALS_PER_CYCLE:
                break
            if not m.exceeds_threshold:
                continue

            if "failure_rate" in m.name:
                proposals.append(ImprovementProposal(
                    category="skill_fix",
                    title=f"Fix high failure rate on {m.name.split(':')[-1]}",
                    title_ar=f"إصلاح معدل الفشل المرتفع في {m.name.split(':')[-1]}",
                    description=f"Failure rate {m.value:.1%} exceeds {m.threshold:.1%} threshold.",
                    evidence=[f"Measured {m.frequency} calls, {m.value:.1%} failed"],
                    impact=m.impact, effort="small",
                    proposed_action="Add retry logic and improve error handling for the skill handler",
                    requires_approval=True,
                    rollback_action="Revert skill handler to previous version",
                ))
            elif "cost_excess" in m.name:
                proposals.append(ImprovementProposal(
                    category="cost_reduction",
                    title=f"Reduce cost of {m.name.split(':')[-1]} workflow",
                    title_ar=f"تقليل تكلفة سير عمل {m.name.split(':')[-1]}",
                    description=f"Excess cost: ${m.value:.3f}/call (projected: ${m.estimated_cost_usd:.2f}/mo).",
                    evidence=[f"Current: ${m.value + m.threshold:.3f}, Expected: ${m.threshold:.3f}"],
                    impact=m.impact, effort="medium",
                    proposed_action="Switch to cheaper model for simple content or add caching layer",
                    requires_approval=True,
                    rollback_action="Revert model routing configuration",
                ))
            elif "stale_knowledge" in m.name:
                proposals.append(ImprovementProposal(
                    category="knowledge_update",
                    title="Refresh stale knowledge pages",
                    title_ar="تحديث صفحات المعرفة القديمة",
                    description=f"{int(m.value)} pages older than {int(m.threshold)} days.",
                    evidence=[f"{int(m.value)} pages not updated in 30+ days"],
                    impact="low", effort="trivial",
                    proposed_action="Flag stale pages for review and auto-mark as needs-update",
                    requires_approval=False,
                    rollback_action="Remove stale flags",
                ))
            elif "repeated_escalation" in m.name:
                proposals.append(ImprovementProposal(
                    category="quality",
                    title=f"Automate resolution for {m.name.split(':')[-1]}",
                    title_ar=f"أتمتة الحل لتصعيد {m.name.split(':')[-1]}",
                    description=f"{int(m.value)} escalations/week exceeds threshold of {int(m.threshold)}.",
                    evidence=[f"{int(m.value)} weekly occurrences"],
                    impact="medium", effort="medium",
                    proposed_action="Add auto-consent-renewal reminder workflow before expiry",
                    requires_approval=True,
                    rollback_action="Disable auto-reminder workflow",
                ))
            elif "unverified_rate" in m.name:
                proposals.append(ImprovementProposal(
                    category="quality",
                    title=f"Improve verification for agent {m.name.split(':')[-1]}",
                    title_ar=f"تحسين التحقق لوكيل {m.name.split(':')[-1]}",
                    description=f"Unverified rate {m.value:.1%} exceeds {m.threshold:.1%}.",
                    evidence=[f"{m.value:.1%} of tool calls unverified"],
                    impact="medium", effort="small",
                    proposed_action="Add post-execution verification step for this agent profile",
                    requires_approval=False,
                    rollback_action="Remove extra verification step",
                ))

        self._proposals.extend(proposals)
        if len(self._proposals) > self._max_proposals:
            self._proposals = self._proposals[-self._max_proposals:]

        logger.info("[SelfImprove] اقتراحات: %d", len(proposals))
        return proposals

    # -- Phase 4: Verify ---------------------------------------------------

    async def verify(self, proposal: ImprovementProposal) -> bool:
        """Can we test this safely? Does it have rollback?"""
        if not proposal.rollback_action:
            logger.warning("[SelfImprove] لا يوجد إجراء تراجع: %s", proposal.id)
            return False
        if proposal.effort == "large":
            logger.info("[SelfImprove] جهد كبير يتطلب مراجعة يدوية: %s", proposal.id)
            return False
        return True

    # -- Phase 5: Apply ----------------------------------------------------

    async def apply(self, proposal: ImprovementProposal, approved_by: Optional[str] = None) -> bool:
        """Apply only if approved (or trivial + auto-allowed). Log everything."""
        if proposal.status in ("applied", "rejected"):
            logger.info("[SelfImprove] اقتراح بالفعل %s: %s", proposal.status, proposal.id)
            return False

        if proposal.requires_approval and not approved_by:
            logger.info("[SelfImprove] يتطلب موافقة: %s", proposal.id)
            return False

        safe = await self.verify(proposal)
        if not safe:
            proposal.status = "rejected"
            proposal.test_result = "Failed safety verification"
            logger.warning("[SelfImprove] رفض: %s -- فشل التحقق من السلامة", proposal.id)
            return False

        proposal.status = "applied"
        proposal.approved_by = approved_by or "auto"
        proposal.applied_at = datetime.now(timezone.utc)
        proposal.test_result = "Applied successfully"

        logger.info(
            "[SelfImprove] تطبيق: %s cat=%s by=%s",
            proposal.id, proposal.category, proposal.approved_by,
        )
        return True

    # -- Approval ----------------------------------------------------------

    async def approve(self, proposal_id: str, user_id: str) -> Optional[ImprovementProposal]:
        """Approve a pending proposal."""
        for p in self._proposals:
            if p.id == proposal_id and p.status == "proposed":
                p.status = "approved"
                p.approved_by = user_id
                await self.apply(p, approved_by=user_id)
                return p
        return None

    async def reject(self, proposal_id: str, user_id: str) -> Optional[ImprovementProposal]:
        """Reject a pending proposal."""
        for p in self._proposals:
            if p.id == proposal_id and p.status in ("proposed", "approved"):
                p.status = "rejected"
                p.approved_by = user_id
                return p
        return None

    # -- Full cycle --------------------------------------------------------

    async def run_cycle(self, tenant_id: Optional[str] = None) -> CycleResult:
        """Full cycle: inspect -> measure -> propose -> verify -> approve -> apply -> report."""
        start = datetime.now(timezone.utc)

        # 1. Inspect
        inspection = await self.inspect(tenant_id)

        # 2. Measure
        metrics = await self.measure(inspection)

        # 3. Propose
        proposals = await self.propose(metrics)

        # 4+5. Auto-apply trivial proposals (up to MAX_AUTO_APPLY)
        auto_applied = 0
        for p in proposals:
            if auto_applied >= self.MAX_AUTO_APPLY:
                break
            if not p.requires_approval and p.effort == "trivial":
                if await self.apply(p, approved_by="auto"):
                    auto_applied += 1

        pending = sum(1 for p in proposals if p.status == "proposed")

        now = datetime.now(timezone.utc)
        cycle = CycleResult(
            tenant_id=tenant_id or "global",
            started_at=start,
            completed_at=now,
            duration_ms=int((now - start).total_seconds() * 1000),
            issues_found=inspection["count"],
            metrics_measured=len(metrics),
            proposals_generated=len(proposals),
            proposals_auto_applied=auto_applied,
            proposals_pending=pending,
            summary=(
                f"Found {inspection['count']} issues, measured {len(metrics)} metrics, "
                f"generated {len(proposals)} proposals, auto-applied {auto_applied}"
            ),
            summary_ar=(
                f"اكتشاف {inspection['count']} مشاكل، قياس {len(metrics)} مقاييس، "
                f"إنشاء {len(proposals)} مقترحات، تطبيق تلقائي {auto_applied}"
            ),
        )

        self._cycles.append(cycle)
        if len(self._cycles) > self._max_cycles:
            self._cycles = self._cycles[-self._max_cycles:]

        logger.info(
            "[SelfImprove] دورة اكتملت: issues=%d proposals=%d auto=%d pending=%d %dms",
            inspection["count"], len(proposals), auto_applied, pending, cycle.duration_ms,
        )
        return cycle

    # -- Reporting ---------------------------------------------------------

    async def report(self) -> dict[str, Any]:
        """Summary: proposals made, applied, rejected, impact measured."""
        by_status: dict[str, int] = defaultdict(int)
        by_category: dict[str, int] = defaultdict(int)
        for p in self._proposals:
            by_status[p.status] += 1
            by_category[p.category] += 1

        return {
            "total_proposals": len(self._proposals),
            "by_status": dict(by_status),
            "by_category": dict(by_category),
            "total_cycles": len(self._cycles),
            "last_cycle": self._cycles[-1].model_dump(mode="json") if self._cycles else None,
            "message_ar": (
                f"مقترحات: {len(self._proposals)}، "
                f"مطبقة: {by_status.get('applied', 0)}، "
                f"مرفوضة: {by_status.get('rejected', 0)}، "
                f"معلقة: {by_status.get('proposed', 0)}"
            ),
        }

    def list_proposals(self, status: Optional[str] = None) -> list[ImprovementProposal]:
        """List all proposals, optionally filtered by status."""
        if status:
            return [p for p in self._proposals if p.status == status]
        return list(self._proposals)

    def get_proposal(self, proposal_id: str) -> Optional[ImprovementProposal]:
        """Get a single proposal by ID."""
        return next((p for p in self._proposals if p.id == proposal_id), None)


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

self_improvement_engine = SelfImprovementEngine()
