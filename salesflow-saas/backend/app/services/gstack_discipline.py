"""
gstack Planning Discipline — Dealix AI Revenue OS
Enforces structured planning before execution.
Dispatch tiers: Simple → Medium → Heavy → Full → Plan
"""
import logging
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class DispatchTier(str, Enum):
    SIMPLE = "simple"    # One-file, obvious, no planning needed
    MEDIUM = "medium"    # Multi-file, needs gstack-lite (5-line plan)
    HEAVY = "heavy"      # Requires specific skill/workflow
    FULL = "full"        # End-to-end: plan → review → implement → test → ship
    PLAN = "plan"        # Planning only, no implementation


class TaskPlan(BaseModel):
    plan_id: str
    tier: DispatchTier
    task_description: str
    files_to_read: list[str] = []
    plan_steps: list[str] = []  # Max 5 for MEDIUM, unlimited for FULL
    ambiguities: list[str] = []
    resolved_ambiguities: list[str] = []
    self_review_notes: str = ""
    completion_report: str = ""
    status: str = "planning"  # planning, executing, reviewing, complete, failed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None


class TaskClassification(BaseModel):
    tier: DispatchTier
    reason: str
    reason_ar: str
    files_involved: int
    estimated_complexity: str  # trivial, low, medium, high, critical
    requires_tests: bool
    requires_review: bool
    requires_rollback_plan: bool


# Classification rules
TIER_RULES = {
    "single_file_edit": DispatchTier.SIMPLE,
    "config_change": DispatchTier.SIMPLE,
    "typo_fix": DispatchTier.SIMPLE,
    "multi_file_edit": DispatchTier.MEDIUM,
    "new_api_endpoint": DispatchTier.MEDIUM,
    "bug_fix_multi_file": DispatchTier.MEDIUM,
    "new_service": DispatchTier.HEAVY,
    "new_feature": DispatchTier.HEAVY,
    "database_migration": DispatchTier.HEAVY,
    "integration": DispatchTier.HEAVY,
    "new_module": DispatchTier.FULL,
    "architecture_change": DispatchTier.FULL,
    "release": DispatchTier.FULL,
    "launch": DispatchTier.FULL,
    "research": DispatchTier.PLAN,
    "architecture_review": DispatchTier.PLAN,
    "strategy": DispatchTier.PLAN,
}


class GstackDiscipline:
    """
    Enforces planning discipline on all task execution.
    gstack-lite: read → plan(5 lines) → resolve ambiguity → self-review → report
    gstack-full: plan → review → implement → test → ship → report
    """

    def __init__(self):
        self._plans: list[TaskPlan] = []
        self._plan_count = 0

    def classify_task(
        self, description: str, files_count: int = 1, task_type: str = None
    ) -> TaskClassification:
        if task_type and task_type in TIER_RULES:
            tier = TIER_RULES[task_type]
        elif files_count <= 1:
            tier = DispatchTier.SIMPLE
        elif files_count <= 5:
            tier = DispatchTier.MEDIUM
        elif files_count <= 15:
            tier = DispatchTier.HEAVY
        else:
            tier = DispatchTier.FULL

        tier_configs = {
            DispatchTier.SIMPLE: {
                "reason": "Single-file or trivial change",
                "reason_ar": "تعديل بسيط على ملف واحد",
                "complexity": "trivial",
                "tests": False, "review": False, "rollback": False,
            },
            DispatchTier.MEDIUM: {
                "reason": "Multi-file change requiring lightweight planning",
                "reason_ar": "تعديل متعدد الملفات يحتاج خطة بسيطة",
                "complexity": "low",
                "tests": True, "review": False, "rollback": False,
            },
            DispatchTier.HEAVY: {
                "reason": "Complex task requiring specific skill/workflow",
                "reason_ar": "مهمة معقدة تحتاج مهارة أو سير عمل محدد",
                "complexity": "medium",
                "tests": True, "review": True, "rollback": True,
            },
            DispatchTier.FULL: {
                "reason": "End-to-end delivery requiring full pipeline",
                "reason_ar": "تسليم شامل يحتاج خط أنابيب كامل",
                "complexity": "high",
                "tests": True, "review": True, "rollback": True,
            },
            DispatchTier.PLAN: {
                "reason": "Planning/research only, no implementation",
                "reason_ar": "تخطيط وبحث فقط، بدون تنفيذ",
                "complexity": "medium",
                "tests": False, "review": True, "rollback": False,
            },
        }

        config = tier_configs[tier]
        return TaskClassification(
            tier=tier,
            reason=config["reason"],
            reason_ar=config["reason_ar"],
            files_involved=files_count,
            estimated_complexity=config["complexity"],
            requires_tests=config["tests"],
            requires_review=config["review"],
            requires_rollback_plan=config["rollback"],
        )

    def create_plan(
        self, tier: DispatchTier, description: str, files_to_read: list[str] = None
    ) -> TaskPlan:
        self._plan_count += 1
        plan = TaskPlan(
            plan_id=f"PLAN-{self._plan_count:04d}",
            tier=tier,
            task_description=description,
            files_to_read=files_to_read or [],
        )
        self._plans.append(plan)
        logger.info(f"gstack plan created: {plan.plan_id} tier={tier.value}")
        return plan

    def set_plan_steps(self, plan_id: str, steps: list[str]) -> bool:
        plan = self._get_plan(plan_id)
        if not plan:
            return False
        max_steps = 5 if plan.tier == DispatchTier.MEDIUM else 20
        plan.plan_steps = steps[:max_steps]
        plan.status = "executing"
        return True

    def add_ambiguity(self, plan_id: str, ambiguity: str) -> bool:
        plan = self._get_plan(plan_id)
        if not plan:
            return False
        plan.ambiguities.append(ambiguity)
        return True

    def resolve_ambiguity(self, plan_id: str, ambiguity: str, resolution: str) -> bool:
        plan = self._get_plan(plan_id)
        if not plan:
            return False
        plan.resolved_ambiguities.append(f"{ambiguity} → {resolution}")
        if ambiguity in plan.ambiguities:
            plan.ambiguities.remove(ambiguity)
        return True

    def self_review(self, plan_id: str, notes: str) -> bool:
        plan = self._get_plan(plan_id)
        if not plan:
            return False
        plan.self_review_notes = notes
        plan.status = "reviewing"
        return True

    def complete(self, plan_id: str, report: str) -> bool:
        plan = self._get_plan(plan_id)
        if not plan:
            return False
        if plan.ambiguities:
            logger.warning(
                f"Plan {plan_id} completing with {len(plan.ambiguities)} "
                f"unresolved ambiguities"
            )
        plan.completion_report = report
        plan.status = "complete"
        plan.completed_at = datetime.now(timezone.utc)
        logger.info(f"gstack plan completed: {plan_id}")
        return True

    def fail(self, plan_id: str, reason: str) -> bool:
        plan = self._get_plan(plan_id)
        if not plan:
            return False
        plan.completion_report = f"FAILED: {reason}"
        plan.status = "failed"
        plan.completed_at = datetime.now(timezone.utc)
        return True

    def validate_ready_to_execute(self, plan_id: str) -> tuple[bool, str]:
        plan = self._get_plan(plan_id)
        if not plan:
            return False, "Plan not found"
        if not plan.files_to_read and plan.tier != DispatchTier.SIMPLE:
            return False, "يجب قراءة الملفات المتعلقة أولاً"
        if not plan.plan_steps and plan.tier != DispatchTier.SIMPLE:
            return False, "يجب كتابة خطة قبل التنفيذ"
        if plan.ambiguities:
            return False, f"يوجد {len(plan.ambiguities)} غموض غير محلول"
        return True, "جاهز للتنفيذ"

    def get_lite_prompt(self, task: str) -> str:
        """Generate gstack-lite prompt for MEDIUM tasks."""
        return (
            f"## gstack-lite Planning\n\n"
            f"Task: {task}\n\n"
            f"Before writing ANY code:\n"
            f"1. Read all relevant files first\n"
            f"2. Write a 5-line plan\n"
            f"3. Resolve any ambiguity before editing\n"
            f"4. Self-review before declaring done\n"
            f"5. Write a completion report\n\n"
            f"RULE: Append to CLAUDE.md, never replace project instructions."
        )

    def get_full_prompt(self, task: str) -> str:
        """Generate gstack-full prompt for FULL tasks."""
        return (
            f"## gstack-full Planning\n\n"
            f"Task: {task}\n\n"
            f"Execute in strict order:\n"
            f"1. PLAN: Architecture impact, file list, test plan, rollback plan\n"
            f"2. REVIEW: Validate plan against existing architecture\n"
            f"3. IMPLEMENT: Execute plan step by step\n"
            f"4. TEST: Run all affected tests + new tests\n"
            f"5. SHIP: Commit, verify, document\n"
            f"6. REPORT: Summary, time, changes, risks, next steps\n\n"
            f"RULE: Append to CLAUDE.md, never replace project instructions."
        )

    def get_plans(self, status: str = None) -> list[TaskPlan]:
        if status:
            return [p for p in self._plans if p.status == status]
        return self._plans

    def _get_plan(self, plan_id: str) -> Optional[TaskPlan]:
        return next((p for p in self._plans if p.plan_id == plan_id), None)


gstack = GstackDiscipline()
