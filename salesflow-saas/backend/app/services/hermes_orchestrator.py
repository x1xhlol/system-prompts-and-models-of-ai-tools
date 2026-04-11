"""
Hermes Orchestrator -- Dealix AI Revenue OS -- محرك هيرمس المنسق
Top-level agent brain: coordinates profiles, backends, skills, receipts,
memory, and security across the entire Dealix platform.
"""
from __future__ import annotations

import asyncio
import fnmatch
import logging
import uuid
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field

from app.services.skill_registry import (
    SkillRegistry, SkillRuntime, UserContext, SkillResult, ExecutionStatus,
    build_default_registry,
)
from app.services.tool_receipts import (
    ToolReceipt, PreExecutionPolicy, ReceiptStore, TrustAnalytics,
    PolicyDecisionType, VerificationVerdict,
    pre_execution_policy, receipt_store, trust_analytics,
)
from app.services.memory_engine import MemoryItem, memory_adapter
from app.services.escalation import EscalationService, EscalationPacket, EscalationPriority, EscalationReason

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Profile definitions
# ---------------------------------------------------------------------------

class HermesProfile(BaseModel):
    """Agent profile with isolated config, memory scope, and permissions."""
    id: str
    name: str
    name_ar: str
    mission: str
    mission_ar: str
    allowed_skills: list[str] = []
    forbidden_skills: list[str] = []
    allowed_backends: list[str] = []
    memory_scope: str = ""
    cost_limit_daily: float = 5.0
    requires_approval_for: list[str] = []
    escalation_path: str = "founder"


PROFILES: dict[str, HermesProfile] = {
    "growth": HermesProfile(
        id="growth",
        name="Growth Agent",
        name_ar="وكيل النمو",
        mission="Drive customer acquisition and revenue growth",
        mission_ar="قيادة اكتساب العملاء ونمو الإيرادات",
        allowed_skills=["crm.lead.*", "messaging.*", "analytics.*", "content.*"],
        forbidden_skills=["admin.*", "compliance.data.delete"],
        allowed_backends=["claude", "openclaude"],
        memory_scope="customer,prospect,growth",
        cost_limit_daily=5.0,
        requires_approval_for=["bulk_send", "campaign_launch"],
        escalation_path="founder",
    ),
    "sales": HermesProfile(
        id="sales",
        name="Sales Agent",
        name_ar="وكيل المبيعات",
        mission="Manage pipeline, close deals, forecast revenue",
        mission_ar="إدارة خط الأنابيب وإغلاق الصفقات والتنبؤ بالإيرادات",
        allowed_skills=["crm.*", "messaging.whatsapp.*", "messaging.sequence.*", "analytics.pipeline.*"],
        forbidden_skills=["admin.*", "compliance.data.delete"],
        allowed_backends=["claude", "openclaude"],
        memory_scope="customer,deal,pipeline",
        cost_limit_daily=5.0,
        requires_approval_for=["discount_over_20", "contract_send"],
        escalation_path="founder",
    ),
    "security": HermesProfile(
        id="security",
        name="Security Agent",
        name_ar="وكيل الأمان",
        mission="Protect the platform and ensure compliance",
        mission_ar="حماية المنصة وضمان الامتثال",
        allowed_skills=["compliance.*", "admin.audit"],
        forbidden_skills=["messaging.*", "crm.lead.delete"],
        allowed_backends=["claude"],
        memory_scope="security,compliance",
        cost_limit_daily=2.0,
        requires_approval_for=["pentest_run", "data_export"],
        escalation_path="ops",
    ),
    "ops": HermesProfile(
        id="ops",
        name="Operations Agent",
        name_ar="وكيل العمليات",
        mission="Manage deployments, infrastructure, and system health",
        mission_ar="إدارة النشر والبنية التحتية وصحة النظام",
        allowed_skills=["admin.*", "analytics.system.*"],
        forbidden_skills=["crm.lead.delete", "compliance.data.delete"],
        allowed_backends=["claude", "goose"],
        memory_scope="ops,infrastructure",
        cost_limit_daily=3.0,
        requires_approval_for=["production_deploy", "database_migration"],
        escalation_path="founder",
    ),
    "knowledge": HermesProfile(
        id="knowledge",
        name="Knowledge Agent",
        name_ar="وكيل المعرفة",
        mission="Maintain wiki, memory, and organizational knowledge",
        mission_ar="إدارة الويكي والذاكرة والمعرفة التنظيمية",
        allowed_skills=["content.*", "analytics.*"],
        forbidden_skills=["admin.*", "messaging.*", "compliance.data.delete"],
        allowed_backends=["claude", "openclaude"],
        memory_scope="project,knowledge,wiki",
        cost_limit_daily=2.0,
        requires_approval_for=["knowledge_purge"],
        escalation_path="ops",
    ),
    "founder": HermesProfile(
        id="founder",
        name="Founder Agent",
        name_ar="وكيل المؤسس",
        mission="Executive strategy, full platform oversight, final approvals",
        mission_ar="الاستراتيجية التنفيذية والإشراف الكامل والموافقات النهائية",
        allowed_skills=["*"],
        forbidden_skills=[],
        allowed_backends=["claude", "openclaude", "goose"],
        memory_scope="*",
        cost_limit_daily=20.0,
        requires_approval_for=[],
        escalation_path="founder",
    ),
}


# ---------------------------------------------------------------------------
# Run state tracking
# ---------------------------------------------------------------------------

class RunStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    ABORTED = "aborted"


class RunState(BaseModel):
    run_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    profile_id: str
    task: str
    params: dict[str, Any] = {}
    status: RunStatus = RunStatus.QUEUED
    backend: str = ""
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    result: dict[str, Any] = {}
    error: Optional[str] = None
    cost_usd: float = 0.0


class HermesResult(BaseModel):
    run_id: str
    profile_id: str
    task: str
    status: str
    backend: str = ""
    data: dict[str, Any] = {}
    evidence: list[str] = []
    receipt_id: Optional[str] = None
    cost_usd: float = 0.0
    duration_ms: int = 0
    error: Optional[str] = None
    message_ar: str = ""


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------

class HermesOrchestrator:
    """Top-level orchestrator -- the brain that coordinates all agents."""

    def __init__(self) -> None:
        self.profiles: dict[str, HermesProfile] = dict(PROFILES)
        self.active_runs: dict[str, RunState] = {}
        self.completed_runs: list[RunState] = []
        self.cost_tracker: dict[str, float] = defaultdict(float)
        self._max_completed = 10_000
        self._registry, self._runtime = build_default_registry()
        self._policy = pre_execution_policy
        self._receipt_store = receipt_store
        self._trust = trust_analytics
        self._escalation = EscalationService()
        logger.info("هيرمس: تم تهيئة المنسق — %d ملفات شخصية", len(self.profiles))

    # -- Main execution pipeline -------------------------------------------

    async def execute(
        self,
        profile_id: str,
        task: str,
        params: dict[str, Any],
        user_context: dict[str, Any],
    ) -> HermesResult:
        start = datetime.now(timezone.utc)
        run_id = str(uuid.uuid4())

        # 1. Load profile
        profile = self.profiles.get(profile_id)
        if not profile:
            return self._error_result(run_id, profile_id, task, f"ملف شخصي غير موجود: {profile_id}")

        # 2. Validate task against permissions
        skill_id = params.get("skill_id", task)
        if not self._skill_allowed(profile, skill_id):
            return self._error_result(
                run_id, profile_id, task,
                f"المهارة '{skill_id}' غير مسموحة لملف '{profile_id}'",
            )

        # 3. Check cost budget
        if self.cost_tracker[profile_id] >= profile.cost_limit_daily:
            return self._error_result(
                run_id, profile_id, task,
                f"تجاوز الميزانية اليومية: ${self.cost_tracker[profile_id]:.2f} / ${profile.cost_limit_daily:.2f}",
            )

        # 4. Route to appropriate backend
        task_type = params.get("task_class", "internal")
        backend = await self.route_to_backend(profile, task_type)

        # 5. Pre-execution policy (ToolProof)
        policy_ctx = {
            "user_id": user_context.get("user_id", "hermes"),
            "role": user_context.get("role", "agent"),
            "session_id": user_context.get("session_id", run_id),
            "has_consent": user_context.get("has_consent", True),
        }
        policy = self._policy.evaluate(
            params.get("tool_name", skill_id), params, policy_ctx,
        )
        if policy.decision == PolicyDecisionType.BLOCK:
            return self._error_result(run_id, profile_id, task, f"محظور بالسياسة: {policy.reason_ar}")

        # Track run
        run_state = RunState(
            run_id=run_id, profile_id=profile_id, task=task,
            params=params, status=RunStatus.RUNNING, backend=backend,
        )
        self.active_runs[run_id] = run_state

        # 6. Execute via skill_registry or direct
        evidence: list[str] = []
        data: dict[str, Any] = {}
        error: Optional[str] = None
        status_str = "success"
        cost = 0.0

        try:
            command = params.get("command", task)
            uc = UserContext(
                user_id=user_context.get("user_id", "hermes"),
                tenant_id=user_context.get("tenant_id", "default"),
                role=user_context.get("role", "agent"),
                permissions=user_context.get("permissions", []),
            )
            skill_result = await self._runtime.execute(skill_id, command, params, uc)

            if skill_result.status == ExecutionStatus.SUCCESS:
                data = skill_result.data
                evidence = skill_result.evidence
                cost = params.get("cost_estimate", 0.01)
            elif skill_result.status == ExecutionStatus.PENDING_APPROVAL:
                status_str = "pending_approval"
                evidence = skill_result.evidence
                data = {"approval_request_id": skill_result.approval_request_id}
            else:
                status_str = "failed"
                error = skill_result.error
                evidence = skill_result.evidence

        except Exception as exc:
            logger.exception("[Hermes] خطأ run=%s: %s", run_id, exc)
            status_str = "failed"
            error = str(exc)

        # 7. Create receipt
        receipt = ToolReceipt(
            run_id=run_id,
            agent_id=profile_id,
            tool_name=skill_id,
            parameters=params,
            execution_result=str(data) if data else (error or ""),
            policy_decision=policy.decision,
            cost_estimate=cost,
            tenant_id=user_context.get("tenant_id", "default"),
        )
        if status_str == "success":
            receipt.verification_verdict = VerificationVerdict.VERIFIED
        receipt_id = self._receipt_store.store(receipt)

        # 8. Update cost
        self.cost_tracker[profile_id] += cost
        self._policy.record_cost(policy_ctx["session_id"], cost)

        # 9. Update memory if relevant
        if status_str == "success" and data:
            try:
                await memory_adapter.store(MemoryItem(
                    domain=profile.memory_scope.split(",")[0] if profile.memory_scope != "*" else "project",
                    content=f"[Hermes:{profile_id}] {task}: {str(data)[:500]}",
                    metadata={"run_id": run_id, "profile": profile_id, "task": task},
                    source=f"hermes/{profile_id}",
                    confidence=0.8,
                    tenant_id=user_context.get("tenant_id", "default"),
                ))
            except Exception as mem_exc:
                logger.warning("[Hermes] فشل حفظ الذاكرة: %s", mem_exc)

        # 10. Finalize run state
        now = datetime.now(timezone.utc)
        duration_ms = int((now - start).total_seconds() * 1000)
        run_state.status = RunStatus.COMPLETED if status_str == "success" else RunStatus.FAILED
        run_state.completed_at = now
        run_state.duration_ms = duration_ms
        run_state.result = data
        run_state.error = error
        run_state.cost_usd = cost
        self.active_runs.pop(run_id, None)
        self.completed_runs.append(run_state)
        if len(self.completed_runs) > self._max_completed:
            self.completed_runs = self.completed_runs[-self._max_completed:]

        msg_ar = "تم التنفيذ بنجاح" if status_str == "success" else f"فشل: {error or 'خطأ غير معروف'}"
        logger.info(
            "[Hermes] %s run=%s profile=%s task=%s backend=%s %dms $%.4f",
            status_str, run_id, profile_id, task, backend, duration_ms, cost,
        )

        return HermesResult(
            run_id=run_id, profile_id=profile_id, task=task,
            status=status_str, backend=backend, data=data,
            evidence=evidence, receipt_id=receipt_id,
            cost_usd=cost, duration_ms=duration_ms,
            error=error, message_ar=msg_ar,
        )

    # -- Backend routing ---------------------------------------------------

    async def route_to_backend(self, profile: HermesProfile, task_type: str) -> str:
        """Select the best execution backend for the given task."""
        routing = {
            "code_change": "claude",
            "code_review": "claude",
            "test_generation": "claude",
            "security_scan": "claude",
            "research": "goose",
            "local_ops": "goose",
            "content_generation": "openclaude",
            "analysis": "openclaude",
            "data_processing": "internal",
            "customer_communication": "internal",
        }
        preferred = routing.get(task_type, "internal")
        if preferred in profile.allowed_backends:
            return preferred
        # Fallback: first allowed backend, or internal
        return profile.allowed_backends[0] if profile.allowed_backends else "internal"

    # -- Permission check --------------------------------------------------

    def _skill_allowed(self, profile: HermesProfile, skill_id: str) -> bool:
        """Check if the skill matches allowed patterns and not forbidden."""
        for pattern in profile.forbidden_skills:
            if fnmatch.fnmatch(skill_id, pattern):
                return False
        if not profile.allowed_skills:
            return False
        for pattern in profile.allowed_skills:
            if pattern == "*" or fnmatch.fnmatch(skill_id, pattern):
                return True
        return False

    # -- Accessors ---------------------------------------------------------

    async def get_profile(self, profile_id: str) -> Optional[HermesProfile]:
        return self.profiles.get(profile_id)

    async def list_profiles(self) -> list[HermesProfile]:
        return list(self.profiles.values())

    async def get_cost_report(self, period: str = "daily") -> dict[str, Any]:
        items: list[dict[str, Any]] = []
        total = 0.0
        for pid, cost in self.cost_tracker.items():
            profile = self.profiles.get(pid)
            limit = profile.cost_limit_daily if profile else 0.0
            items.append({
                "profile_id": pid,
                "spent_usd": round(cost, 4),
                "limit_usd": limit,
                "remaining_usd": round(max(0, limit - cost), 4),
                "utilization_pct": round((cost / limit * 100) if limit > 0 else 0, 2),
            })
            total += cost
        return {
            "period": period,
            "total_usd": round(total, 4),
            "by_profile": items,
            "message_ar": f"إجمالي التكلفة: ${total:.2f}",
        }

    async def get_active_runs(self) -> list[RunState]:
        return list(self.active_runs.values())

    async def abort_run(self, run_id: str) -> bool:
        run = self.active_runs.pop(run_id, None)
        if not run:
            return False
        run.status = RunStatus.ABORTED
        run.completed_at = datetime.now(timezone.utc)
        self.completed_runs.append(run)
        logger.info("[Hermes] إلغاء التشغيل: %s", run_id)
        return True

    def reset_daily_costs(self) -> None:
        """Reset daily cost counters (call from scheduler at midnight)."""
        self.cost_tracker.clear()
        logger.info("[Hermes] تم إعادة تعيين التكاليف اليومية")

    # -- Helpers -----------------------------------------------------------

    def _error_result(
        self, run_id: str, profile_id: str, task: str, error: str,
    ) -> HermesResult:
        logger.warning("[Hermes] رفض: %s — %s", task, error)
        return HermesResult(
            run_id=run_id, profile_id=profile_id, task=task,
            status="rejected", error=error,
            message_ar=error,
        )


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

hermes_orchestrator = HermesOrchestrator()
