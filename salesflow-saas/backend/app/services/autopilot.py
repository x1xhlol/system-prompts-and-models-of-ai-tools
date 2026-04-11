"""Autopilot Layer — Dealix AI Revenue OS — نظام الطيار الآلي"""
from __future__ import annotations

import asyncio, logging, uuid
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Callable, Coroutine, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

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

STEPS = ["monitor", "detect", "classify", "decide", "propose", "approve", "execute", "verify", "log"]

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
        "send_message", "update_deal", "assign_lead"])
    forbidden_actions: list[str] = Field(default_factory=lambda: [
        "delete_data", "change_permissions", "bulk_send"])
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

def _advance(unit: AutopilotUnit, step: str) -> None:
    unit.current_step = step
    unit.checkpoint["step"] = step

async def _task_follow_up_dormant_leads(u: AutopilotUnit, p: AutopilotPolicy) -> None:
    _advance(u, "monitor")
    u.budget.consume_api_call()
    dormant = [{"lead_id": "L001", "name": "أحمد المطيري", "days_inactive": 5},
               {"lead_id": "L002", "name": "فاطمة العتيبي", "days_inactive": 4},
               {"lead_id": "L003", "name": "محمد القحطاني", "days_inactive": 3}]
    u.result_data["dormant_leads"] = dormant
    _advance(u, "detect")
    u.result_data["detected_count"] = len(dormant)
    _advance(u, "classify")
    for ld in dormant:
        ld["urgency"] = "high" if ld["days_inactive"] >= 5 else "medium"
    _advance(u, "decide")
    u.confidence = 0.78
    drafts = [{"lead_id": ld["lead_id"], "action": "send_follow_up", "channel": "whatsapp",
               "message_ar": f"مرحباً {ld['name']}، نود متابعة محادثتنا السابقة. هل لديك أي أسئلة؟"}
              for ld in dormant]
    _advance(u, "propose")
    u.result_data["proposed_actions"] = drafts
    if u.mode in (AutopilotMode.SIMULATION, AutopilotMode.RECOMMENDATION):
        return
    if u.mode == AutopilotMode.DRAFT:
        u.result_data["drafts_created"] = len(drafts)
        return
    if u.mode == AutopilotMode.APPROVAL_GATED:
        for d in drafts:
            if "send_message" in p.require_approval_for:
                u.pending_approvals.append(PendingApproval(
                    action="send_follow_up", description_ar=f"إرسال متابعة لـ {d['lead_id']}", params=d))
        u.status = RunStatus.AWAITING_APPROVAL
        return
    _advance(u, "execute")
    for d in drafts:
        if not u.budget.consume_message():
            u.error = "تم تجاوز حد الرسائل"
            break
        u.side_effects.append(SideEffect(action="send_whatsapp", target=d["lead_id"], detail=d["message_ar"][:80]))
    _advance(u, "verify")

async def _task_qualify_new_leads(u: AutopilotUnit, p: AutopilotPolicy) -> None:
    _advance(u, "monitor")
    u.budget.consume_api_call()
    leads = [{"lead_id": "L010", "name": "سارة الحربي", "source": "website"},
             {"lead_id": "L011", "name": "خالد الشمري", "source": "whatsapp"}]
    u.result_data["new_leads"] = leads
    _advance(u, "detect")
    _advance(u, "classify")
    scored = []
    for ld in leads:
        u.budget.consume_api_call()
        scored.append({**ld, "score": 65, "qualified": True, "tier": "B"})
    u.result_data["scored_leads"] = scored
    _advance(u, "decide")
    u.confidence = 0.82
    _advance(u, "propose")
    u.result_data["proposed_actions"] = [{"lead_id": s["lead_id"], "action": "update_qualification",
                                          "score": s["score"]} for s in scored]
    if u.mode in (AutopilotMode.SIMULATION, AutopilotMode.RECOMMENDATION, AutopilotMode.DRAFT):
        return
    if u.mode == AutopilotMode.APPROVAL_GATED:
        for s in scored:
            u.pending_approvals.append(PendingApproval(
                action="update_qualification", description_ar=f"تأهيل {s['name']} — درجة {s['score']}",
                params={"lead_id": s["lead_id"], "score": s["score"]}))
        u.status = RunStatus.AWAITING_APPROVAL
        return
    _advance(u, "execute")
    for s in scored:
        u.side_effects.append(SideEffect(action="qualify_lead", target=s["lead_id"],
                                         detail=f"تأهيل: {s['score']} — فئة {s['tier']}"))
    _advance(u, "verify")

async def _task_pipeline_health_check(u: AutopilotUnit, p: AutopilotPolicy) -> None:
    _advance(u, "monitor")
    u.budget.consume_api_call()
    _advance(u, "detect")
    at_risk = [{"deal_id": "D100", "title": "مشروع تقنية المعلومات", "value": 250_000, "risk": "stalled"},
               {"deal_id": "D101", "title": "عقد صيانة سنوي", "value": 80_000, "risk": "competitor"}]
    u.result_data["at_risk_deals"] = at_risk
    _advance(u, "classify")
    for d in at_risk:
        d["urgency"] = "critical" if d["value"] > 100_000 else "high"
    _advance(u, "decide")
    u.confidence = 0.75
    u.result_data["recommendations"] = [{"deal_id": d["deal_id"],
                                          "action_ar": "جدولة اجتماع عاجل مع العميل"} for d in at_risk]
    _advance(u, "propose")

async def _task_daily_report(u: AutopilotUnit, p: AutopilotPolicy) -> None:
    _advance(u, "monitor")
    u.budget.consume_api_call()
    _advance(u, "detect")
    u.result_data["report"] = {
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "new_leads": 12, "qualified": 5, "deals_won": 2, "revenue_today": 180_000, "currency": "SAR",
        "top_performer": "أحمد المطيري", "at_risk_count": 3,
        "summary_ar": "يوم إيجابي: صفقتان مغلقتان بقيمة 180 ألف ريال. 3 صفقات تحتاج متابعة."}
    _advance(u, "classify")
    u.confidence = 0.95
    _advance(u, "propose")

async def _task_sequence_optimizer(u: AutopilotUnit, p: AutopilotPolicy) -> None:
    _advance(u, "monitor")
    u.budget.consume_api_call()
    _advance(u, "detect")
    seqs = [{"id": "SEQ01", "name": "ترحيب عملاء جدد", "open_rate": 0.45, "reply_rate": 0.12},
            {"id": "SEQ02", "name": "متابعة بعد العرض", "open_rate": 0.62, "reply_rate": 0.25}]
    u.result_data["sequences"] = seqs
    _advance(u, "classify")
    _advance(u, "decide")
    u.confidence = 0.70
    u.result_data["suggestions"] = [
        {"sequence_id": s["id"], "proposed_change": "shorten_message",
         "suggestion_ar": f"تحسين '{s['name']}' — معدل الرد منخفض ({s['reply_rate']:.0%})"}
        for s in seqs if s["reply_rate"] < 0.15]
    _advance(u, "propose")

_TASKS: dict[str, tuple[Callable, str, str]] = {
    "follow_up_dormant_leads": (_task_follow_up_dormant_leads, "متابعة العملاء الخاملين",
                                "البحث عن عملاء بدون نشاط 3+ أيام وصياغة رسائل متابعة"),
    "qualify_new_leads": (_task_qualify_new_leads, "تأهيل العملاء الجدد",
                          "تقييم وتأهيل العملاء المحتملين الجدد تلقائياً"),
    "pipeline_health_check": (_task_pipeline_health_check, "فحص صحة خط الأنابيب",
                               "تحليل خط الأنابيب والكشف عن صفقات معرضة للخطر"),
    "daily_report": (_task_daily_report, "التقرير اليومي", "إنشاء ملخص يومي لأداء المبيعات"),
    "sequence_optimizer": (_task_sequence_optimizer, "تحسين التسلسلات", "تحليل أداء التسلسلات واقتراح تحسينات"),
}

class AutopilotRunner:
    """Runs autopilot tasks safely with budgets, policies, and checkpointing."""

    def __init__(self, policy: Optional[AutopilotPolicy] = None) -> None:
        self._policy = policy or AutopilotPolicy()
        self._active: dict[str, AutopilotUnit] = {}

    async def run(self, task_type: str, mode: AutopilotMode, params: dict[str, Any],
                  budget: Optional[AutopilotBudget] = None, tenant_id: str = "",
                  agent_id: str = "") -> AutopilotResult:
        entry = _TASKS.get(task_type)
        if not entry:
            return AutopilotResult(run_id=str(uuid.uuid4()), task_type=task_type, mode=mode,
                                   status=RunStatus.FAILED, summary_ar=f"مهمة غير معروفة: {task_type}")
        handler = entry[0]
        unit = AutopilotUnit(
            agent_id=agent_id, tenant_id=tenant_id, task_type=task_type, mode=mode,
            budget=budget or AutopilotBudget(api_calls=self._policy.max_api_calls,
                                             messages=self._policy.max_messages_per_hour,
                                             max_duration_minutes=self._policy.max_run_duration_minutes))
        self._active[unit.run_id] = unit
        start = datetime.now(timezone.utc)
        logger.info("[Autopilot] بدء run=%s task=%s mode=%s", unit.run_id, task_type, mode.value)
        try:
            await handler(unit, self._policy)
            if unit.status == RunStatus.RUNNING:
                unit.status = RunStatus.COMPLETED
        except Exception as exc:
            logger.exception("[Autopilot] فشل run=%s: %s", unit.run_id, exc)
            unit.status = RunStatus.FAILED
            unit.error = str(exc)
        end = datetime.now(timezone.utc)
        unit.completed_at = end
        dur = int((end - start).total_seconds() * 1000)
        idx = STEPS.index(unit.current_step) + 1 if unit.current_step in STEPS else len(STEPS)
        result = AutopilotResult(
            run_id=unit.run_id, task_type=task_type, mode=mode, status=unit.status,
            steps_completed=STEPS[:idx],
            findings=unit.result_data.get("at_risk_deals", unit.result_data.get("dormant_leads", [])),
            actions_taken=[se.model_dump() for se in unit.side_effects],
            actions_proposed=unit.result_data.get("proposed_actions", []),
            side_effects=unit.side_effects, confidence=unit.confidence, duration_ms=dur,
            summary_ar=self._summary(unit))
        logger.info("[Autopilot] نهاية run=%s status=%s %dms", unit.run_id, unit.status.value, dur)
        return result

    async def pause(self, run_id: str) -> bool:
        u = self._active.get(run_id)
        if not u or u.status != RunStatus.RUNNING: return False
        u.status = RunStatus.PAUSED
        return True

    async def resume(self, run_id: str) -> Optional[AutopilotResult]:
        u = self._active.get(run_id)
        if not u or u.status not in (RunStatus.PAUSED, RunStatus.AWAITING_APPROVAL):
            return None
        u.status = RunStatus.RUNNING
        entry = _TASKS.get(u.task_type)
        if entry:
            try:
                await entry[0](u, self._policy)
                if u.status == RunStatus.RUNNING:
                    u.status = RunStatus.COMPLETED
            except Exception as exc:
                u.status = RunStatus.FAILED
                u.error = str(exc)
        return AutopilotResult(run_id=u.run_id, task_type=u.task_type, mode=u.mode,
                               status=u.status, confidence=u.confidence, summary_ar=self._summary(u))

    async def abort(self, run_id: str) -> bool:
        u = self._active.get(run_id)
        if not u: return False
        u.status, u.completed_at = RunStatus.ABORTED, datetime.now(timezone.utc)
        return True

    async def approve_pending(self, run_id: str, approval_id: str, approved_by: str) -> bool:
        u = self._active.get(run_id)
        if not u: return False
        for pa in u.pending_approvals:
            if pa.id == approval_id:
                pa.approved, pa.approved_by = True, approved_by
                return True
        return False

    async def get_status(self, run_id: str) -> Optional[AutopilotUnit]:
        return self._active.get(run_id)

    def list_active(self, tenant_id: Optional[str] = None) -> list[AutopilotUnit]:
        runs = [r for r in self._active.values()
                if r.status in (RunStatus.RUNNING, RunStatus.PAUSED, RunStatus.AWAITING_APPROVAL)]
        return [r for r in runs if r.tenant_id == tenant_id] if tenant_id else runs

    def list_supported_tasks(self) -> list[dict[str, str]]:
        return [{"task_type": k, "name_ar": v[1], "desc_ar": v[2]} for k, v in _TASKS.items()]

    @staticmethod
    def _summary(u: AutopilotUnit) -> str:
        _MAP = {RunStatus.FAILED: lambda: f"فشل: {u.error or 'خطأ غير محدد'}",
                RunStatus.ABORTED: lambda: "تم إلغاء المهمة",
                RunStatus.AWAITING_APPROVAL: lambda: f"بانتظار الموافقة على {len(u.pending_approvals)} إجراء",
                RunStatus.PAUSED: lambda: f"متوقف عند: {u.current_step}"}
        if u.status in _MAP: return _MAP[u.status]()
        e, p = len(u.side_effects), len(u.result_data.get("proposed_actions", []))
        s = f"اكتمل (ثقة {u.confidence:.0%})"
        if e: s += f" — {e} إجراء منفّذ"
        if p: s += f" — {p} مقترح"
        return s
