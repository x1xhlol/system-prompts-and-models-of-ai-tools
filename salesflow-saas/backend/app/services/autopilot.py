"""
Autopilot Layer — Dealix AI Revenue OS
========================================
نظام الطيار الآلي: تشغيل مهام CRM بشكل مستقل وآمن.
- أوضاع متعددة: محاكاة، توصية، مسودة، موافقة، مستقل
- حدود ميزانية وحماية من التجاوز
- نقاط تفتيش وإمكانية الإيقاف والاستئناف
"""
from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Callable, Coroutine, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


# ── Enums ───────────────────────────────────────────────────────────

class AutopilotMode(str, Enum):
    SIMULATION = "simulation"
    RECOMMENDATION = "recommendation"
    DRAFT = "draft"
    APPROVAL_GATED = "approval_gated"
    AUTONOMOUS = "autonomous"


class RunStatus(str, Enum):
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    ABORTED = "aborted"
    AWAITING_APPROVAL = "awaiting_approval"


AUTOPILOT_STEPS = [
    "monitor", "detect", "classify", "decide", "propose", "approve", "execute", "verify", "log",
]


# ── Models ──────────────────────────────────────────────────────────

class AutopilotBudget(BaseModel):
    api_calls: int = 100
    messages: int = 50
    max_duration_minutes: int = 30
    api_calls_used: int = 0
    messages_used: int = 0

    def consume_api_call(self) -> bool:
        if self.api_calls_used >= self.api_calls:
            return False
        self.api_calls_used += 1
        return True

    def consume_message(self) -> bool:
        if self.messages_used >= self.messages:
            return False
        self.messages_used += 1
        return True

    @property
    def exhausted(self) -> bool:
        return self.api_calls_used >= self.api_calls


class PendingApproval(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    action: str
    description_ar: str
    params: dict[str, Any] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    approved: Optional[bool] = None
    approved_by: Optional[str] = None


class SideEffect(BaseModel):
    action: str
    target: str
    detail: str
    occurred_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AutopilotUnit(BaseModel):
    run_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    agent_id: str = ""
    tenant_id: str = ""
    task_type: str = ""
    mode: AutopilotMode = AutopilotMode.SIMULATION
    status: RunStatus = RunStatus.RUNNING
    current_step: str = "monitor"
    confidence: float = 0.0
    pending_approvals: list[PendingApproval] = []
    side_effects: list[SideEffect] = []
    checkpoint: dict[str, Any] = {}
    budget: AutopilotBudget = Field(default_factory=AutopilotBudget)
    result_data: dict[str, Any] = {}
    error: Optional[str] = None
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None


class AutopilotPolicy(BaseModel):
    max_api_calls: int = 100
    max_messages_per_hour: int = 50
    max_run_duration_minutes: int = 30
    require_approval_for: list[str] = Field(default_factory=lambda: [
        "send_message", "update_deal", "assign_lead",
    ])
    forbidden_actions: list[str] = Field(default_factory=lambda: [
        "delete_data", "change_permissions", "bulk_send",
    ])
    kill_switch_enabled: bool = True


class AutopilotResult(BaseModel):
    run_id: str
    task_type: str
    mode: AutopilotMode
    status: RunStatus
    steps_completed: list[str] = []
    findings: list[dict[str, Any]] = []
    actions_taken: list[dict[str, Any]] = []
    actions_proposed: list[dict[str, Any]] = []
    side_effects: list[SideEffect] = []
    confidence: float = 0.0
    duration_ms: int = 0
    summary_ar: str = ""


# ── Task Handlers ───────────────────────────────────────────────────

async def _task_follow_up_dormant_leads(
    unit: AutopilotUnit, policy: AutopilotPolicy,
) -> None:
    unit.current_step = "monitor"
    unit.checkpoint["step"] = "monitor"
    unit.budget.consume_api_call()

    dormant = [
        {"lead_id": "L001", "name": "أحمد المطيري", "days_inactive": 5},
        {"lead_id": "L002", "name": "فاطمة العتيبي", "days_inactive": 4},
        {"lead_id": "L003", "name": "محمد القحطاني", "days_inactive": 3},
    ]
    unit.result_data["dormant_leads"] = dormant

    unit.current_step = "detect"
    unit.checkpoint["step"] = "detect"
    unit.result_data["detected_count"] = len(dormant)

    unit.current_step = "classify"
    unit.checkpoint["step"] = "classify"
    for lead in dormant:
        lead["urgency"] = "high" if lead["days_inactive"] >= 5 else "medium"

    unit.current_step = "decide"
    unit.confidence = 0.78
    drafts = []
    for lead in dormant:
        drafts.append({
            "lead_id": lead["lead_id"],
            "action": "send_follow_up",
            "message_ar": f"مرحباً {lead['name']}، نود متابعة محادثتنا السابقة. هل لديك أي أسئلة؟",
            "channel": "whatsapp",
        })

    unit.current_step = "propose"
    unit.result_data["proposed_actions"] = drafts
    unit.checkpoint["step"] = "propose"

    if unit.mode in (AutopilotMode.SIMULATION, AutopilotMode.RECOMMENDATION):
        return

    if unit.mode == AutopilotMode.DRAFT:
        unit.result_data["drafts_created"] = len(drafts)
        return

    if unit.mode == AutopilotMode.APPROVAL_GATED:
        for draft in drafts:
            if "send_message" in policy.require_approval_for:
                unit.pending_approvals.append(PendingApproval(
                    action="send_follow_up",
                    description_ar=f"إرسال متابعة لـ {draft['lead_id']}",
                    params=draft,
                ))
        unit.status = RunStatus.AWAITING_APPROVAL
        return

    unit.current_step = "execute"
    for draft in drafts:
        if not unit.budget.consume_message():
            unit.error = "تم تجاوز حد الرسائل المسموح"
            break
        unit.side_effects.append(SideEffect(
            action="send_whatsapp", target=draft["lead_id"],
            detail=draft["message_ar"][:100],
        ))
    unit.result_data["messages_sent"] = len(unit.side_effects)

    unit.current_step = "verify"
    unit.checkpoint["step"] = "verify"


async def _task_qualify_new_leads(
    unit: AutopilotUnit, policy: AutopilotPolicy,
) -> None:
    unit.current_step = "monitor"
    unit.budget.consume_api_call()

    new_leads = [
        {"lead_id": "L010", "name": "سارة الحربي", "source": "website"},
        {"lead_id": "L011", "name": "خالد الشمري", "source": "whatsapp"},
    ]
    unit.result_data["new_leads"] = new_leads

    unit.current_step = "detect"
    unit.result_data["detected_count"] = len(new_leads)

    unit.current_step = "classify"
    scored = []
    for lead in new_leads:
        unit.budget.consume_api_call()
        scored.append({**lead, "score": 65, "qualified": True, "tier": "B"})
    unit.result_data["scored_leads"] = scored

    unit.current_step = "decide"
    unit.confidence = 0.82

    unit.current_step = "propose"
    unit.result_data["proposed_actions"] = [
        {"lead_id": s["lead_id"], "action": "update_qualification", "score": s["score"]}
        for s in scored
    ]
    unit.checkpoint["step"] = "propose"

    if unit.mode in (AutopilotMode.SIMULATION, AutopilotMode.RECOMMENDATION, AutopilotMode.DRAFT):
        return

    if unit.mode == AutopilotMode.APPROVAL_GATED:
        for s in scored:
            unit.pending_approvals.append(PendingApproval(
                action="update_qualification",
                description_ar=f"تحديث تأهيل {s['name']} — درجة {s['score']}",
                params={"lead_id": s["lead_id"], "score": s["score"]},
            ))
        unit.status = RunStatus.AWAITING_APPROVAL
        return

    unit.current_step = "execute"
    for s in scored:
        unit.side_effects.append(SideEffect(
            action="qualify_lead", target=s["lead_id"],
            detail=f"تأهيل: {s['score']} — فئة {s['tier']}",
        ))

    unit.current_step = "verify"


async def _task_pipeline_health_check(
    unit: AutopilotUnit, policy: AutopilotPolicy,
) -> None:
    unit.current_step = "monitor"
    unit.budget.consume_api_call()

    unit.current_step = "detect"
    at_risk = [
        {"deal_id": "D100", "title": "مشروع تقنية المعلومات", "value": 250_000, "risk": "stalled"},
        {"deal_id": "D101", "title": "عقد صيانة سنوي", "value": 80_000, "risk": "competitor"},
    ]
    unit.result_data["at_risk_deals"] = at_risk

    unit.current_step = "classify"
    for deal in at_risk:
        deal["urgency"] = "critical" if deal["value"] > 100_000 else "high"

    unit.current_step = "decide"
    unit.confidence = 0.75
    unit.result_data["recommendations"] = [
        {"deal_id": d["deal_id"], "action_ar": "جدولة اجتماع عاجل مع العميل"} for d in at_risk
    ]

    unit.current_step = "propose"
    unit.checkpoint["step"] = "propose"


async def _task_daily_report(
    unit: AutopilotUnit, policy: AutopilotPolicy,
) -> None:
    unit.current_step = "monitor"
    unit.budget.consume_api_call()

    unit.current_step = "detect"
    unit.result_data["report"] = {
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "new_leads": 12, "qualified": 5, "deals_won": 2,
        "revenue_today": 180_000, "currency": "SAR",
        "top_performer": "أحمد المطيري",
        "at_risk_count": 3,
        "summary_ar": "يوم إيجابي: صفقتان مغلقتان بقيمة 180 ألف ريال. 3 صفقات تحتاج متابعة.",
    }

    unit.current_step = "classify"
    unit.confidence = 0.95

    unit.current_step = "propose"
    unit.checkpoint["step"] = "propose"


async def _task_sequence_optimizer(
    unit: AutopilotUnit, policy: AutopilotPolicy,
) -> None:
    unit.current_step = "monitor"
    unit.budget.consume_api_call()

    unit.current_step = "detect"
    sequences = [
        {"id": "SEQ01", "name": "ترحيب عملاء جدد", "open_rate": 0.45, "reply_rate": 0.12},
        {"id": "SEQ02", "name": "متابعة بعد العرض", "open_rate": 0.62, "reply_rate": 0.25},
    ]
    unit.result_data["sequences"] = sequences

    unit.current_step = "classify"
    unit.current_step = "decide"
    unit.confidence = 0.70
    suggestions = []
    for seq in sequences:
        if seq["reply_rate"] < 0.15:
            suggestions.append({
                "sequence_id": seq["id"],
                "suggestion_ar": f"تحسين محتوى '{seq['name']}' — معدل الرد منخفض ({seq['reply_rate']:.0%})",
                "proposed_change": "shorten_message",
            })
    unit.result_data["suggestions"] = suggestions

    unit.current_step = "propose"
    unit.checkpoint["step"] = "propose"


# ── Task Registry ──────────────────────────────────────────────────

_TASK_HANDLERS: dict[str, Callable[[AutopilotUnit, AutopilotPolicy], Coroutine[Any, Any, None]]] = {
    "follow_up_dormant_leads": _task_follow_up_dormant_leads,
    "qualify_new_leads": _task_qualify_new_leads,
    "pipeline_health_check": _task_pipeline_health_check,
    "daily_report": _task_daily_report,
    "sequence_optimizer": _task_sequence_optimizer,
}


# ── Autopilot Runner ───────────────────────────────────────────────

class AutopilotRunner:
    """Runs autopilot tasks safely with budgets, policies, and checkpointing."""

    def __init__(self, policy: Optional[AutopilotPolicy] = None) -> None:
        self._policy = policy or AutopilotPolicy()
        self._active_runs: dict[str, AutopilotUnit] = {}

    async def run(
        self,
        task_type: str,
        mode: AutopilotMode,
        params: dict[str, Any],
        budget: Optional[AutopilotBudget] = None,
        tenant_id: str = "",
        agent_id: str = "",
    ) -> AutopilotResult:
        handler = _TASK_HANDLERS.get(task_type)
        if not handler:
            return AutopilotResult(
                run_id=str(uuid.uuid4()), task_type=task_type, mode=mode,
                status=RunStatus.FAILED,
                summary_ar=f"مهمة غير معروفة: {task_type}",
            )

        unit = AutopilotUnit(
            agent_id=agent_id, tenant_id=tenant_id, task_type=task_type,
            mode=mode,
            budget=budget or AutopilotBudget(
                api_calls=self._policy.max_api_calls,
                messages=self._policy.max_messages_per_hour,
                max_duration_minutes=self._policy.max_run_duration_minutes,
            ),
        )
        self._active_runs[unit.run_id] = unit
        start = datetime.now(timezone.utc)
        deadline = start + timedelta(minutes=unit.budget.max_duration_minutes)

        logger.info(
            "[Autopilot] بدء run=%s task=%s mode=%s tenant=%s",
            unit.run_id, task_type, mode.value, tenant_id,
        )

        try:
            if self._policy.kill_switch_enabled and datetime.now(timezone.utc) > deadline:
                unit.status = RunStatus.FAILED
                unit.error = "تم تجاوز الحد الزمني المسموح"
            else:
                await handler(unit, self._policy)
                if unit.status == RunStatus.RUNNING:
                    unit.status = RunStatus.COMPLETED
        except Exception as exc:
            logger.exception("[Autopilot] فشل run=%s: %s", unit.run_id, exc)
            unit.status = RunStatus.FAILED
            unit.error = str(exc)

        end = datetime.now(timezone.utc)
        unit.completed_at = end
        duration_ms = int((end - start).total_seconds() * 1000)

        steps_done = []
        for step in AUTOPILOT_STEPS:
            steps_done.append(step)
            if step == unit.current_step:
                break

        result = AutopilotResult(
            run_id=unit.run_id, task_type=task_type, mode=mode,
            status=unit.status, steps_completed=steps_done,
            findings=unit.result_data.get("at_risk_deals", unit.result_data.get("dormant_leads", [])),
            actions_taken=[se.model_dump() for se in unit.side_effects],
            actions_proposed=unit.result_data.get("proposed_actions", []),
            side_effects=unit.side_effects,
            confidence=unit.confidence, duration_ms=duration_ms,
            summary_ar=self._build_summary(unit),
        )

        logger.info(
            "[Autopilot] انتهاء run=%s status=%s dur=%dms",
            unit.run_id, unit.status.value, duration_ms,
        )
        return result

    async def pause(self, run_id: str) -> bool:
        unit = self._active_runs.get(run_id)
        if not unit or unit.status != RunStatus.RUNNING:
            return False
        unit.status = RunStatus.PAUSED
        logger.info("[Autopilot] إيقاف مؤقت run=%s at step=%s", run_id, unit.current_step)
        return True

    async def resume(self, run_id: str) -> Optional[AutopilotResult]:
        unit = self._active_runs.get(run_id)
        if not unit or unit.status not in (RunStatus.PAUSED, RunStatus.AWAITING_APPROVAL):
            return None
        unit.status = RunStatus.RUNNING
        logger.info("[Autopilot] استئناف run=%s from step=%s", run_id, unit.current_step)
        handler = _TASK_HANDLERS.get(unit.task_type)
        if handler:
            try:
                await handler(unit, self._policy)
                if unit.status == RunStatus.RUNNING:
                    unit.status = RunStatus.COMPLETED
            except Exception as exc:
                unit.status = RunStatus.FAILED
                unit.error = str(exc)
        return AutopilotResult(
            run_id=unit.run_id, task_type=unit.task_type, mode=unit.mode,
            status=unit.status, confidence=unit.confidence,
            summary_ar=self._build_summary(unit),
        )

    async def abort(self, run_id: str) -> bool:
        unit = self._active_runs.get(run_id)
        if not unit:
            return False
        unit.status = RunStatus.ABORTED
        unit.completed_at = datetime.now(timezone.utc)
        logger.info("[Autopilot] إلغاء run=%s", run_id)
        return True

    async def approve_pending(self, run_id: str, approval_id: str, approved_by: str) -> bool:
        unit = self._active_runs.get(run_id)
        if not unit:
            return False
        for pa in unit.pending_approvals:
            if pa.id == approval_id:
                pa.approved = True
                pa.approved_by = approved_by
                logger.info("[Autopilot] تمت الموافقة approval=%s by=%s", approval_id, approved_by)
                return True
        return False

    async def get_status(self, run_id: str) -> Optional[AutopilotUnit]:
        return self._active_runs.get(run_id)

    def list_active(self, tenant_id: Optional[str] = None) -> list[AutopilotUnit]:
        runs = list(self._active_runs.values())
        if tenant_id:
            runs = [r for r in runs if r.tenant_id == tenant_id]
        return [r for r in runs if r.status in (RunStatus.RUNNING, RunStatus.PAUSED, RunStatus.AWAITING_APPROVAL)]

    def list_supported_tasks(self) -> list[dict[str, str]]:
        _TASK_META = {
            "follow_up_dormant_leads": {
                "name_ar": "متابعة العملاء الخاملين",
                "desc_ar": "البحث عن عملاء بدون نشاط لأكثر من 3 أيام وصياغة رسائل متابعة",
            },
            "qualify_new_leads": {
                "name_ar": "تأهيل العملاء الجدد",
                "desc_ar": "تقييم وتأهيل العملاء المحتملين الجدد تلقائياً",
            },
            "pipeline_health_check": {
                "name_ar": "فحص صحة خط الأنابيب",
                "desc_ar": "تحليل خط الأنابيب والكشف عن الصفقات المعرضة للخطر",
            },
            "daily_report": {
                "name_ar": "التقرير اليومي",
                "desc_ar": "إنشاء ملخص يومي لأداء المبيعات",
            },
            "sequence_optimizer": {
                "name_ar": "تحسين التسلسلات",
                "desc_ar": "تحليل أداء التسلسلات واقتراح تحسينات",
            },
        }
        return [
            {"task_type": k, **_TASK_META.get(k, {"name_ar": k, "desc_ar": ""})}
            for k in _TASK_HANDLERS
        ]

    @staticmethod
    def _build_summary(unit: AutopilotUnit) -> str:
        if unit.status == RunStatus.FAILED:
            return f"فشل التنفيذ: {unit.error or 'خطأ غير محدد'}"
        if unit.status == RunStatus.ABORTED:
            return "تم إلغاء المهمة"
        if unit.status == RunStatus.AWAITING_APPROVAL:
            return f"بانتظار الموافقة على {len(unit.pending_approvals)} إجراء"
        if unit.status == RunStatus.PAUSED:
            return f"متوقف مؤقتاً عند الخطوة: {unit.current_step}"

        effects = len(unit.side_effects)
        proposed = len(unit.result_data.get("proposed_actions", []))
        parts = [f"تم التنفيذ بنجاح (ثقة {unit.confidence:.0%})"]
        if effects:
            parts.append(f"— {effects} إجراء منفّذ")
        if proposed:
            parts.append(f"— {proposed} إجراء مقترح")
        return " ".join(parts)
