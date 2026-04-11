"""Skill Registry + Runtime — Dealix AI Revenue OS — نظام المهارات"""
from __future__ import annotations

import asyncio, logging, os, uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Callable, Coroutine, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class ApprovalClass(str, Enum):
    AUTO = "auto"
    APPROVAL_REQUIRED = "approval_required"
    FORBIDDEN = "forbidden"


class SkillCategory(str, Enum):
    CRM = "crm"
    MESSAGING = "messaging"
    ANALYTICS = "analytics"
    CONTENT = "content"
    ADMIN = "admin"
    COMPLIANCE = "compliance"


class ExecutionStatus(str, Enum):
    SUCCESS = "success"
    FAILED = "failed"
    PENDING_APPROVAL = "pending_approval"
    FORBIDDEN = "forbidden"
    SKIPPED = "skipped"


class SkillDefinition(BaseModel):
    id: str
    name: str
    name_ar: str
    description: str
    description_ar: str = ""
    category: SkillCategory
    approval_class: ApprovalClass = ApprovalClass.AUTO
    is_read_only: bool = False
    commands: list[str] = []
    required_secrets: list[str] = []
    health_check: Optional[Callable[[], Coroutine[Any, Any, bool]]] = Field(default=None, exclude=True)
    is_enabled: bool = True
    version: str = "1.0.0"
    model_config = {"arbitrary_types_allowed": True}

class UserContext(BaseModel):
    user_id: str
    tenant_id: str
    role: str = "member"
    permissions: list[str] = []


class SkillResult(BaseModel):
    run_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    skill_id: str
    command: str
    status: ExecutionStatus
    data: dict[str, Any] = {}
    evidence: list[str] = []
    error: Optional[str] = None
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    approval_request_id: Optional[str] = None

class SkillHealthReport(BaseModel):
    skill_id: str
    healthy: bool
    checked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    error: Optional[str] = None

class SkillRegistry:
    """Manages all registered domain skills."""

    def __init__(self) -> None:
        self._skills: dict[str, SkillDefinition] = {}
        self._handlers: dict[str, Callable[..., Coroutine[Any, Any, dict]]] = {}

    def register(self, skill: SkillDefinition, handler: Optional[Callable] = None) -> None:
        self._skills[skill.id] = skill
        if handler:
            self._handlers[skill.id] = handler
        logger.info("تسجيل مهارة: %s [%s] v%s", skill.id, skill.category.value, skill.version)

    def get(self, skill_id: str) -> Optional[SkillDefinition]:
        return self._skills.get(skill_id)

    def list_all(self) -> list[SkillDefinition]:
        return list(self._skills.values())

    def list_by_category(self, category: str | SkillCategory) -> list[SkillDefinition]:
        cat = category if isinstance(category, str) else category.value
        return [s for s in self._skills.values() if s.category.value == cat]

    def enable(self, skill_id: str) -> bool:
        s = self._skills.get(skill_id)
        if not s:
            return False
        s.is_enabled = True
        return True

    def disable(self, skill_id: str) -> bool:
        s = self._skills.get(skill_id)
        if not s:
            return False
        s.is_enabled = False
        return True

    async def health_check_all(self) -> list[SkillHealthReport]:
        reports: list[SkillHealthReport] = []
        for sid, skill in self._skills.items():
            if skill.health_check is not None:
                try:
                    healthy = await skill.health_check()
                    reports.append(SkillHealthReport(skill_id=sid, healthy=healthy))
                except Exception as exc:
                    reports.append(SkillHealthReport(skill_id=sid, healthy=False, error=str(exc)))
            else:
                reports.append(SkillHealthReport(skill_id=sid, healthy=skill.is_enabled))
        return reports

    def get_handler(self, skill_id: str) -> Optional[Callable]:
        return self._handlers.get(skill_id)

class SkillRuntime:
    """Executes skills safely with validation, logging, and approval gating."""

    def __init__(self, registry: SkillRegistry) -> None:
        self._registry = registry
        self._execution_log: list[SkillResult] = []
        self._max_log = 5000
        self._pending_approvals: dict[str, dict[str, Any]] = {}

    async def execute(self, skill_id: str, command: str, params: dict[str, Any],
                      user_context: UserContext) -> SkillResult:
        run_id, start = str(uuid.uuid4()), datetime.now(timezone.utc)
        skill = self._registry.get(skill_id)
        if not skill:
            return self._finish(SkillResult(run_id=run_id, skill_id=skill_id, command=command,
                                            status=ExecutionStatus.FAILED, error=f"مهارة غير موجودة: {skill_id}"), start)
        if not skill.is_enabled:
            return self._finish(SkillResult(run_id=run_id, skill_id=skill_id, command=command,
                                            status=ExecutionStatus.SKIPPED, error="المهارة معطلة حالياً"), start)
        if command not in skill.commands:
            return self._finish(SkillResult(run_id=run_id, skill_id=skill_id, command=command,
                                            status=ExecutionStatus.FAILED,
                                            error=f"أمر غير مدعوم: {command}. المتاحة: {skill.commands}"), start)
        if skill.approval_class == ApprovalClass.FORBIDDEN:
            return self._finish(SkillResult(run_id=run_id, skill_id=skill_id, command=command,
                                            status=ExecutionStatus.FORBIDDEN, error="محظورة"), start)
        missing = [s for s in skill.required_secrets if not os.environ.get(s)]
        if missing:
            return self._finish(SkillResult(run_id=run_id, skill_id=skill_id, command=command,
                                            status=ExecutionStatus.FAILED, error=f"متغيرات بيئة مفقودة: {missing}"), start)
        if skill.approval_class == ApprovalClass.APPROVAL_REQUIRED:
            aid = str(uuid.uuid4())
            self._pending_approvals[aid] = {"run_id": run_id, "skill_id": skill_id, "command": command,
                                            "params": params, "user_context": user_context.model_dump(),
                                            "requested_at": start.isoformat()}
            logger.info("[SkillRuntime] طلب موافقة run=%s skill=%s approval=%s", run_id, skill_id, aid)
            return self._finish(SkillResult(run_id=run_id, skill_id=skill_id, command=command,
                                            status=ExecutionStatus.PENDING_APPROVAL, approval_request_id=aid,
                                            evidence=[f"بانتظار الموافقة: {aid}"]), start)
        handler = self._registry.get_handler(skill_id)
        if not handler:
            return self._finish(SkillResult(run_id=run_id, skill_id=skill_id, command=command,
                                            status=ExecutionStatus.FAILED, error="لا يوجد معالج مسجل"), start)
        try:
            data = await handler(command=command, params=params, user_context=user_context)
            return self._finish(SkillResult(run_id=run_id, skill_id=skill_id, command=command,
                                            status=ExecutionStatus.SUCCESS, data=data,
                                            evidence=[f"تم التنفيذ بنجاح عبر {skill.name}"]), start)
        except Exception as exc:
            logger.exception("[SkillRuntime] خطأ %s: %s", skill_id, exc)
            return self._finish(SkillResult(run_id=run_id, skill_id=skill_id, command=command,
                                            status=ExecutionStatus.FAILED, error=str(exc),
                                            evidence=[f"فشل: {type(exc).__name__}"]), start)

    async def execute_approved(self, approval_id: str) -> SkillResult:
        pending = self._pending_approvals.pop(approval_id, None)
        if not pending:
            return SkillResult(run_id=str(uuid.uuid4()), skill_id="unknown", command="unknown",
                               status=ExecutionStatus.FAILED, error=f"طلب موافقة غير موجود: {approval_id}")
        ctx = UserContext(**pending["user_context"])
        handler = self._registry.get_handler(pending["skill_id"])
        start = datetime.now(timezone.utc)
        if not handler:
            return self._finish(SkillResult(run_id=pending["run_id"], skill_id=pending["skill_id"],
                                            command=pending["command"], status=ExecutionStatus.FAILED,
                                            error="لا يوجد معالج مسجل"), start)
        try:
            data = await handler(command=pending["command"], params=pending["params"], user_context=ctx)
            return self._finish(SkillResult(run_id=pending["run_id"], skill_id=pending["skill_id"],
                                            command=pending["command"], status=ExecutionStatus.SUCCESS,
                                            data=data, evidence=["تم التنفيذ بعد الموافقة"]), start)
        except Exception as exc:
            return self._finish(SkillResult(run_id=pending["run_id"], skill_id=pending["skill_id"],
                                            command=pending["command"], status=ExecutionStatus.FAILED,
                                            error=str(exc)), start)

    async def execute_background(self, skill_id: str, command: str, params: dict[str, Any],
                                 user_context: UserContext) -> str:
        run_id = str(uuid.uuid4())
        asyncio.create_task(self._bg_run(run_id, skill_id, command, params, user_context))
        return run_id

    async def _bg_run(self, run_id: str, skill_id: str, command: str,
                      params: dict[str, Any], ctx: UserContext) -> None:
        try:
            r = await self.execute(skill_id, command, params, ctx)
            r.run_id = run_id
        except Exception as exc:
            logger.exception("[SkillRuntime] فشل خلفي: %s", exc)

    def list_pending_approvals(self) -> list[dict[str, Any]]:
        return [{"approval_id": k, **v} for k, v in self._pending_approvals.items()]

    def get_execution_log(self, last_n: int = 50) -> list[SkillResult]:
        return self._execution_log[-last_n:]

    def _finish(self, result: SkillResult, start: datetime) -> SkillResult:
        now = datetime.now(timezone.utc)
        result.completed_at = now
        result.duration_ms = int((now - start).total_seconds() * 1000)
        self._execution_log.append(result)
        if len(self._execution_log) > self._max_log:
            self._execution_log = self._execution_log[-self._max_log:]
        logger.info("[SkillRuntime] %s run=%s skill=%s cmd=%s %dms",
                    result.status.value, result.run_id, result.skill_id, result.command, result.duration_ms)
        return result


# ── Built-in CRM skill handlers ────────────────────────────────────

async def _h_lead_qualify(command: str, params: dict, user_context: UserContext) -> dict:
    return {"lead_id": params.get("lead_id"), "qualified": True, "score": 72,
            "reason_ar": "العميل أبدى اهتماماً واضحاً ولديه ميزانية مناسبة", "next_step": "schedule_demo"}


async def _h_lead_score(command: str, params: dict, user_context: UserContext) -> dict:
    return {"lead_id": params.get("lead_id"), "score": 68,
            "factors": {"engagement": 0.8, "fit": 0.7, "budget": 0.6, "timing": 0.5}, "tier": "A"}


async def _h_lead_assign(command: str, params: dict, user_context: UserContext) -> dict:
    return {"lead_id": params.get("lead_id"), "assigned_to": params.get("rep_id"),
            "reason_ar": "تم التعيين بناءً على التخصص وحمل العمل الحالي"}


async def _h_deal_forecast(command: str, params: dict, user_context: UserContext) -> dict:
    return {"deal_id": params.get("deal_id"), "forecast_amount": 150_000, "currency": "SAR",
            "probability": 0.65, "expected_close": "2026-05-15", "risk_factors_ar": ["تأخر في الرد", "منافس نشط"]}


async def _h_whatsapp_send(command: str, params: dict, user_context: UserContext) -> dict:
    return {"phone": params.get("phone"), "message_preview": (params.get("message", ""))[:100],
            "status": "queued", "message_id": str(uuid.uuid4())}


async def _h_sequence_enroll(command: str, params: dict, user_context: UserContext) -> dict:
    return {"lead_id": params.get("lead_id"), "sequence_id": params.get("sequence_id"),
            "status": "enrolled", "next_step_at": "2026-04-12T09:00:00+03:00"}


async def _h_pipeline_summary(command: str, params: dict, user_context: UserContext) -> dict:
    return {"total_deals": 47, "total_value": 2_350_000, "currency": "SAR",
            "by_stage": {"prospecting": 12, "qualification": 10, "proposal": 8,
                         "negotiation": 9, "closed_won": 5, "closed_lost": 3},
            "at_risk": 4, "summary_ar": "خط الأنابيب بحالة جيدة. 4 صفقات تحتاج متابعة عاجلة."}


async def _h_forecast_generate(command: str, params: dict, user_context: UserContext) -> dict:
    return {"period": params.get("period", "Q2-2026"), "forecast_revenue": 1_800_000,
            "currency": "SAR", "confidence": 0.72,
            "summary_ar": "التوقعات إيجابية مع احتمال تحقيق الهدف بنسبة 72%"}


async def _h_consent_check(command: str, params: dict, user_context: UserContext) -> dict:
    return {"entity_id": params.get("entity_id"), "channel": params.get("channel", "whatsapp"),
            "has_consent": True, "consent_purpose": "marketing",
            "expires_at": "2027-04-11T00:00:00+03:00", "pdpl_compliant": True}


async def _h_data_export(command: str, params: dict, user_context: UserContext) -> dict:
    return {"entity_id": params.get("entity_id"), "format": params.get("format", "json"),
            "status": "export_ready", "download_url": f"/api/v1/exports/{uuid.uuid4()}", "expires_in_hours": 24}


async def _h_tenant_update(command: str, params: dict, user_context: UserContext) -> dict:
    return {"tenant_id": user_context.tenant_id,
            "updated_fields": list(params.get("settings", {}).keys()), "status": "updated"}


# ── Default registry factory ───────────────────────────────────────

_BUILTIN_SKILLS: list[tuple[dict, Callable]] = [
    ({"id": "crm.lead.qualify", "name": "Qualify Lead", "name_ar": "تأهيل عميل محتمل",
      "description": "Qualify a lead using AI", "description_ar": "تأهيل عميل محتمل بالذكاء الاصطناعي",
      "category": "crm", "approval_class": "auto", "commands": ["qualify", "re_qualify"]}, _h_lead_qualify),
    ({"id": "crm.lead.score", "name": "Score Lead", "name_ar": "تقييم عميل محتمل",
      "description": "Score a lead", "description_ar": "تقييم عميل محتمل",
      "category": "crm", "approval_class": "auto", "is_read_only": True, "commands": ["score", "rescore"]}, _h_lead_score),
    ({"id": "crm.lead.assign", "name": "Assign Lead", "name_ar": "تعيين عميل محتمل",
      "description": "Assign lead to rep", "description_ar": "تعيين عميل محتمل لممثل مبيعات",
      "category": "crm", "approval_class": "approval_required", "commands": ["assign", "reassign"]}, _h_lead_assign),
    ({"id": "crm.deal.forecast", "name": "Forecast Deal", "name_ar": "توقع الصفقة",
      "description": "Forecast deal outcome", "description_ar": "توقع نتيجة الصفقة",
      "category": "crm", "approval_class": "auto", "is_read_only": True, "commands": ["forecast", "refresh"]}, _h_deal_forecast),
    ({"id": "messaging.whatsapp.send", "name": "Send WhatsApp", "name_ar": "إرسال واتساب",
      "description": "Send WhatsApp message", "description_ar": "إرسال رسالة واتساب",
      "category": "messaging", "approval_class": "approval_required",
      "commands": ["send", "send_template"], "required_secrets": ["WHATSAPP_API_TOKEN"]}, _h_whatsapp_send),
    ({"id": "messaging.sequence.enroll", "name": "Enroll in Sequence", "name_ar": "تسجيل في تسلسل",
      "description": "Enroll lead in sequence", "description_ar": "تسجيل عميل محتمل في تسلسل آلي",
      "category": "messaging", "approval_class": "approval_required", "commands": ["enroll", "unenroll"]}, _h_sequence_enroll),
    ({"id": "analytics.pipeline.summary", "name": "Pipeline Summary", "name_ar": "ملخص خط الأنابيب",
      "description": "Pipeline summary", "description_ar": "ملخص خط أنابيب المبيعات",
      "category": "analytics", "approval_class": "auto", "is_read_only": True, "commands": ["summary", "detailed"]}, _h_pipeline_summary),
    ({"id": "analytics.forecast.generate", "name": "Generate Forecast", "name_ar": "إنشاء توقعات",
      "description": "Revenue forecast", "description_ar": "توقعات الإيرادات",
      "category": "analytics", "approval_class": "auto", "is_read_only": True, "commands": ["generate", "compare"]}, _h_forecast_generate),
    ({"id": "compliance.consent.check", "name": "Check Consent", "name_ar": "التحقق من الموافقة",
      "description": "Check PDPL consent", "description_ar": "التحقق من موافقة PDPL",
      "category": "compliance", "approval_class": "auto", "is_read_only": True, "commands": ["check", "audit"]}, _h_consent_check),
    ({"id": "compliance.data.export", "name": "Export Customer Data", "name_ar": "تصدير بيانات العميل",
      "description": "Export data per PDPL request", "description_ar": "تصدير بيانات بناءً على طلب صاحب البيانات",
      "category": "compliance", "approval_class": "approval_required", "is_read_only": True, "commands": ["export", "preview"]}, _h_data_export),
    ({"id": "admin.tenant.update", "name": "Update Tenant", "name_ar": "تحديث إعدادات المستأجر",
      "description": "Update tenant settings", "description_ar": "تحديث إعدادات المستأجر",
      "category": "admin", "approval_class": "approval_required", "commands": ["update", "reset"]}, _h_tenant_update),
]


def build_default_registry() -> tuple[SkillRegistry, SkillRuntime]:
    """Create registry with all built-in Dealix CRM skills."""
    registry = SkillRegistry()
    for spec, handler in _BUILTIN_SKILLS:
        registry.register(SkillDefinition(**spec), handler)
    runtime = SkillRuntime(registry)
    logger.info("تم تهيئة سجل المهارات: %d مهارة مسجلة", len(_BUILTIN_SKILLS))
    return registry, runtime
