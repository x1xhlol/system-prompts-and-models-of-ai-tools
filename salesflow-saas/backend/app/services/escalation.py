"""
Escalation Service — Dealix AI Revenue OS
نظام التصعيد: إدارة حلقة الإنسان في العملية (Human-in-the-Loop).
"""
from __future__ import annotations

import logging
import uuid
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class EscalationReason(str, Enum):
    VALIDATION_FAILURE = "validation_failure"
    MISSING_DATA = "missing_data"
    PERMISSION_ISSUE = "permission_issue"
    TIMEOUT = "timeout"
    AMBIGUOUS_DATA = "ambiguous_data"
    LOW_CONFIDENCE = "low_confidence"
    HIGH_VALUE_DEAL = "high_value_deal"
    CUSTOMER_COMPLAINT = "customer_complaint"
    CONSENT_EXPIRED = "consent_expired"
    DELIVERY_FAILURE = "delivery_failure"


class EscalationPriority(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class EscalationStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    EXPIRED = "expired"


_REASON_AR: dict[EscalationReason, str] = {
    EscalationReason.VALIDATION_FAILURE: "فشل التحقق من البيانات",
    EscalationReason.MISSING_DATA: "بيانات مفقودة",
    EscalationReason.PERMISSION_ISSUE: "مشكلة في الصلاحيات",
    EscalationReason.TIMEOUT: "انتهاء المهلة الزمنية",
    EscalationReason.AMBIGUOUS_DATA: "بيانات غامضة تحتاج توضيح",
    EscalationReason.LOW_CONFIDENCE: "ثقة منخفضة في النتيجة",
    EscalationReason.HIGH_VALUE_DEAL: "صفقة عالية القيمة",
    EscalationReason.CUSTOMER_COMPLAINT: "شكوى عميل",
    EscalationReason.CONSENT_EXPIRED: "انتهاء صلاحية الموافقة (PDPL)",
    EscalationReason.DELIVERY_FAILURE: "فشل متكرر في التوصيل",
}


class EscalationArtifact(BaseModel):
    type: str = "text"
    name: str = ""
    content: str = ""
    url: Optional[str] = None


class EscalationPacket(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str = ""
    title: str
    title_ar: str
    entity_type: str
    entity_id: str
    workflow_name: str = ""
    failed_step: str = ""
    reason: EscalationReason
    missing_data: list[str] = []
    priority: EscalationPriority = EscalationPriority.MEDIUM
    due_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(hours=4))
    risk_if_delayed: str = ""
    risk_if_delayed_ar: str = ""
    artifacts: list[EscalationArtifact] = []
    resume_token: str = Field(default_factory=lambda: str(uuid.uuid4()))
    suggested_action: str = ""
    suggested_action_ar: str = ""
    confidence: float = 0.0
    status: EscalationStatus = EscalationStatus.PENDING
    assigned_to: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolved_at: Optional[datetime] = None
    resolution_data: dict[str, Any] = {}
    resolution_notes: str = ""


class ResolutionInput(BaseModel):
    action_taken: str
    notes: str = ""
    override_data: dict[str, Any] = {}
    resume_workflow: bool = False


class EscalationStats(BaseModel):
    total: int = 0
    by_priority: dict[str, int] = Field(default_factory=dict)
    by_status: dict[str, int] = Field(default_factory=dict)
    by_reason: dict[str, int] = Field(default_factory=dict)
    avg_resolution_minutes: float = 0.0
    oldest_pending_hours: float = 0.0
    overdue_count: int = 0


class AutoEscalationRule(BaseModel):
    id: str
    name_ar: str
    condition: str
    priority: EscalationPriority
    target_role: str
    reason: EscalationReason
    suggested_action_ar: str


DEFAULT_RULES: list[AutoEscalationRule] = [
    AutoEscalationRule(
        id="rule_high_value_deal", name_ar="صفقة تتجاوز 100 ألف ريال",
        condition="deal_value_sar > 100000", priority=EscalationPriority.HIGH,
        target_role="manager", reason=EscalationReason.HIGH_VALUE_DEAL,
        suggested_action_ar="مراجعة الصفقة والموافقة على استراتيجية التفاوض"),
    AutoEscalationRule(
        id="rule_no_response_5d", name_ar="عدم رد لأكثر من 5 أيام",
        condition="days_since_last_response > 5", priority=EscalationPriority.MEDIUM,
        target_role="assigned_rep", reason=EscalationReason.TIMEOUT,
        suggested_action_ar="الاتصال بالعميل عبر قناة بديلة أو تصعيد للمدير"),
    AutoEscalationRule(
        id="rule_low_confidence", name_ar="ثقة ذكاء اصطناعي منخفضة",
        condition="ai_confidence < 0.3", priority=EscalationPriority.HIGH,
        target_role="human_reviewer", reason=EscalationReason.LOW_CONFIDENCE,
        suggested_action_ar="مراجعة يدوية للقرار — الذكاء الاصطناعي غير واثق من النتيجة"),
    AutoEscalationRule(
        id="rule_consent_expired", name_ar="انتهاء موافقة PDPL",
        condition="consent_expired == true", priority=EscalationPriority.CRITICAL,
        target_role="compliance", reason=EscalationReason.CONSENT_EXPIRED,
        suggested_action_ar="إيقاف جميع الاتصالات فوراً وطلب تجديد الموافقة"),
    AutoEscalationRule(
        id="rule_delivery_failed_3x", name_ar="فشل التوصيل 3 مرات",
        condition="delivery_failures >= 3", priority=EscalationPriority.MEDIUM,
        target_role="assigned_rep", reason=EscalationReason.DELIVERY_FAILURE,
        suggested_action_ar="التحقق من رقم العميل واستخدام قناة بديلة (بريد أو SMS)"),
]

_workflow_resume_handlers: dict[str, Any] = {}


def register_workflow_resume(workflow_name: str, handler: Any) -> None:
    _workflow_resume_handlers[workflow_name] = handler
    logger.info("تسجيل معالج استئناف: %s", workflow_name)


class EscalationService:
    """Manages human-in-the-loop escalation packets."""

    def __init__(self, rules: Optional[list[AutoEscalationRule]] = None) -> None:
        self._store: dict[str, EscalationPacket] = {}
        self._rules = rules or DEFAULT_RULES
        self._history: list[EscalationPacket] = []
        self._max_history = 10_000

    async def create(self, packet: EscalationPacket) -> EscalationPacket:
        packet.status = EscalationStatus.PENDING
        if not packet.id:
            packet.id = str(uuid.uuid4())
        if not packet.resume_token:
            packet.resume_token = str(uuid.uuid4())
        self._store[packet.id] = packet
        logger.info("[Escalation] إنشاء id=%s priority=%s reason=%s entity=%s/%s",
                    packet.id, packet.priority.value, packet.reason.value,
                    packet.entity_type, packet.entity_id)
        return packet

    async def assign(self, escalation_id: str, user_id: str) -> Optional[EscalationPacket]:
        p = self._store.get(escalation_id)
        if not p:
            return None
        if p.status == EscalationStatus.RESOLVED:
            return p
        p.assigned_to = user_id
        p.status = EscalationStatus.IN_PROGRESS
        logger.info("[Escalation] تعيين %s إلى %s", escalation_id, user_id)
        return p

    async def resolve(self, escalation_id: str, resolution: ResolutionInput,
                      user_id: str) -> Optional[EscalationPacket]:
        p = self._store.get(escalation_id)
        if not p or p.status == EscalationStatus.RESOLVED:
            return p
        now = datetime.now(timezone.utc)
        p.status = EscalationStatus.RESOLVED
        p.resolved_at = now
        p.resolution_data = {"action_taken": resolution.action_taken,
                             "override_data": resolution.override_data, "resolved_by": user_id}
        p.resolution_notes = resolution.notes
        self._history.append(p)
        if len(self._history) > self._max_history:
            self._history = self._history[-self._max_history:]
        logger.info("[Escalation] حل id=%s by=%s dur=%s",
                    escalation_id, user_id, str(now - p.created_at))
        if resolution.resume_workflow:
            await self._try_resume(p)
        return p

    async def resume_workflow(self, escalation_id: str) -> dict[str, Any]:
        p = self._store.get(escalation_id)
        if not p:
            return {"success": False, "error": "تصعيد غير موجود"}
        if p.status != EscalationStatus.RESOLVED:
            return {"success": False, "error": "التصعيد لم يُحل بعد"}
        return await self._try_resume(p)

    async def _try_resume(self, p: EscalationPacket) -> dict[str, Any]:
        handler = _workflow_resume_handlers.get(p.workflow_name)
        if not handler:
            return {"success": False, "error": f"لا يوجد معالج استئناف لـ {p.workflow_name}"}
        try:
            result = await handler(resume_token=p.resume_token, entity_type=p.entity_type,
                                   entity_id=p.entity_id, resolution_data=p.resolution_data)
            logger.info("[Escalation] استئناف %s للتصعيد %s", p.workflow_name, p.id)
            return {"success": True, "result": result}
        except Exception as exc:
            logger.exception("[Escalation] فشل استئناف: %s", exc)
            return {"success": False, "error": str(exc)}

    async def expire_overdue(self, tenant_id: str) -> int:
        now, count = datetime.now(timezone.utc), 0
        for p in self._store.values():
            if (p.tenant_id == tenant_id
                    and p.status in (EscalationStatus.PENDING, EscalationStatus.IN_PROGRESS)
                    and p.due_at < now):
                p.status = EscalationStatus.EXPIRED
                count += 1
        return count

    async def list_pending(self, tenant_id: str,
                           priority: Optional[EscalationPriority] = None) -> list[EscalationPacket]:
        results = [p for p in self._store.values()
                   if p.tenant_id == tenant_id
                   and p.status in (EscalationStatus.PENDING, EscalationStatus.IN_PROGRESS)]
        if priority:
            results = [p for p in results if p.priority == priority]
        prio_order = list(EscalationPriority)
        results.sort(key=lambda p: (prio_order.index(p.priority), p.created_at))
        return results

    async def get(self, escalation_id: str) -> Optional[EscalationPacket]:
        return self._store.get(escalation_id)

    async def get_stats(self, tenant_id: str) -> EscalationStats:
        now = datetime.now(timezone.utc)
        packets = [p for p in self._store.values() if p.tenant_id == tenant_id]
        by_prio: dict[str, int] = defaultdict(int)
        by_status: dict[str, int] = defaultdict(int)
        by_reason: dict[str, int] = defaultdict(int)
        res_times: list[float] = []
        oldest_h, overdue = 0.0, 0
        for p in packets:
            by_prio[p.priority.value] += 1
            by_status[p.status.value] += 1
            by_reason[p.reason.value] += 1
            if p.status == EscalationStatus.RESOLVED and p.resolved_at:
                res_times.append((p.resolved_at - p.created_at).total_seconds() / 60.0)
            if p.status in (EscalationStatus.PENDING, EscalationStatus.IN_PROGRESS):
                age_h = (now - p.created_at).total_seconds() / 3600.0
                oldest_h = max(oldest_h, age_h)
                if p.due_at < now:
                    overdue += 1
        for p in self._history:
            if p.tenant_id == tenant_id and p.id not in self._store and p.resolved_at:
                res_times.append((p.resolved_at - p.created_at).total_seconds() / 60.0)
        return EscalationStats(
            total=len(packets), by_priority=dict(by_prio), by_status=dict(by_status),
            by_reason=dict(by_reason),
            avg_resolution_minutes=sum(res_times) / len(res_times) if res_times else 0.0,
            oldest_pending_hours=round(oldest_h, 2), overdue_count=overdue)

    async def check_auto_escalation(self, tenant_id: str,
                                     context: dict[str, Any]) -> Optional[EscalationPacket]:
        for rule in self._rules:
            if self._eval(rule, context):
                packet = EscalationPacket(
                    tenant_id=tenant_id,
                    title=f"Auto-escalation: {rule.id}",
                    title_ar=rule.name_ar,
                    entity_type=context.get("entity_type", "unknown"),
                    entity_id=context.get("entity_id", ""),
                    workflow_name=context.get("workflow_name", ""),
                    failed_step=context.get("current_step", ""),
                    reason=rule.reason, priority=rule.priority,
                    risk_if_delayed_ar=rule.suggested_action_ar,
                    suggested_action=rule.suggested_action_ar,
                    suggested_action_ar=rule.suggested_action_ar,
                    confidence=context.get("confidence", 0.0),
                    artifacts=[EscalationArtifact(type="context", name="auto_context",
                                                  content=str(context))])
                logger.info("[Escalation] تصعيد تلقائي rule=%s entity=%s/%s",
                            rule.id, packet.entity_type, packet.entity_id)
                return await self.create(packet)
        return None

    @staticmethod
    def _eval(rule: AutoEscalationRule, ctx: dict[str, Any]) -> bool:
        c = rule.condition
        if "deal_value_sar > 100000" in c:
            return ctx.get("deal_value_sar", 0) > 100_000
        if "days_since_last_response > 5" in c:
            return ctx.get("days_since_last_response", 0) > 5
        if "ai_confidence < 0.3" in c:
            return ctx.get("confidence", 1.0) < 0.3
        if "consent_expired == true" in c:
            return ctx.get("consent_expired", False) is True
        if "delivery_failures >= 3" in c:
            return ctx.get("delivery_failures", 0) >= 3
        return False
