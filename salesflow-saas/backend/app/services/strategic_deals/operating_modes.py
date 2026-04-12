"""
Operating Modes — Five levels of AI autonomy for deal management.
أوضاع التشغيل: خمسة مستويات لصلاحيات الذكاء الاصطناعي في إدارة الصفقات
"""

import enum
import logging
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategic_deal import CompanyProfile

logger = logging.getLogger("dealix.strategic_deals.operating_modes")


# ── Operating Modes ─────────────────────────────────────────────────────────


class OperatingMode(int, enum.Enum):
    """
    Five escalating levels of AI autonomy.
    خمسة مستويات تصاعدية لاستقلالية الذكاء الاصطناعي
    """
    MANUAL = 0       # AI analyzes, human does everything / الذكاء الاصطناعي يحلل والإنسان ينفذ
    DRAFT = 1        # AI writes drafts, human sends / الذكاء الاصطناعي يكتب والإنسان يرسل
    ASSISTED = 2     # AI sends approved templates via email / الذكاء الاصطناعي يرسل قوالب معتمدة بالإيميل
    NEGOTIATION = 3  # AI negotiates within defined gates / الذكاء الاصطناعي يفاوض ضمن حدود محددة
    STRATEGIC = 4    # Full workflow with mandatory escalation for commitments / سير عمل كامل مع تصعيد إلزامي للالتزامات


MODE_LABELS_AR = {
    OperatingMode.MANUAL: "يدوي",
    OperatingMode.DRAFT: "مسودات",
    OperatingMode.ASSISTED: "مساعد",
    OperatingMode.NEGOTIATION: "تفاوض",
    OperatingMode.STRATEGIC: "استراتيجي",
}

MODE_DESCRIPTIONS_AR = {
    OperatingMode.MANUAL: "الذكاء الاصطناعي يحلل ويقترح فقط — أنت تنفذ كل شيء",
    OperatingMode.DRAFT: "الذكاء الاصطناعي يكتب المسودات — أنت تراجع وترسل",
    OperatingMode.ASSISTED: "الذكاء الاصطناعي يرسل القوالب المعتمدة عبر البريد الإلكتروني تلقائياً",
    OperatingMode.NEGOTIATION: "الذكاء الاصطناعي يتفاوض ضمن الحدود المحددة — يصعّد عند الحاجة",
    OperatingMode.STRATEGIC: "سير عمل كامل مع تصعيد إلزامي لأي التزام مالي أو قانوني",
}


# ── Mode Policy ─────────────────────────────────────────────────────────────


class ModePolicy(BaseModel):
    """Policy governing what an AI agent can do in a given operating mode."""
    mode: int  # OperatingMode value
    allowed_channels: list[str] = Field(default_factory=list)
    allowed_actions: list[str] = Field(default_factory=list)
    auto_send: bool = False
    auto_negotiate: bool = False
    escalation_triggers: list[str] = Field(default_factory=list)
    max_auto_commitment_sar: float = 0.0

    # Labels
    label_ar: str = ""
    description_ar: str = ""


# ── Predefined Policies ────────────────────────────────────────────────────


MODE_POLICIES: dict[OperatingMode, ModePolicy] = {
    OperatingMode.MANUAL: ModePolicy(
        mode=OperatingMode.MANUAL.value,
        allowed_channels=[],
        allowed_actions=[
            "analyze",
            "suggest",
            "draft",
            "score_match",
            "generate_report",
        ],
        auto_send=False,
        auto_negotiate=False,
        escalation_triggers=["all"],
        max_auto_commitment_sar=0,
        label_ar="يدوي",
        description_ar="الذكاء الاصطناعي يحلل ويقترح فقط — أنت تنفذ كل شيء",
    ),
    OperatingMode.DRAFT: ModePolicy(
        mode=OperatingMode.DRAFT.value,
        allowed_channels=[],
        allowed_actions=[
            "analyze",
            "suggest",
            "draft",
            "score_match",
            "generate_report",
            "craft_introduction",
            "draft_proposal",
            "draft_counter_offer",
        ],
        auto_send=False,
        auto_negotiate=False,
        escalation_triggers=["all"],
        max_auto_commitment_sar=0,
        label_ar="مسودات",
        description_ar="الذكاء الاصطناعي يكتب المسودات — أنت تراجع وترسل",
    ),
    OperatingMode.ASSISTED: ModePolicy(
        mode=OperatingMode.ASSISTED.value,
        allowed_channels=["email"],
        allowed_actions=[
            "analyze",
            "suggest",
            "draft",
            "score_match",
            "generate_report",
            "craft_introduction",
            "draft_proposal",
            "send_template",
            "send_follow_up",
            "schedule_reminder",
        ],
        auto_send=True,
        auto_negotiate=False,
        escalation_triggers=[
            "reply_received",
            "objection",
            "pricing_question",
            "meeting_request",
            "negative_sentiment",
        ],
        max_auto_commitment_sar=0,
        label_ar="مساعد",
        description_ar="الذكاء الاصطناعي يرسل القوالب المعتمدة عبر البريد الإلكتروني تلقائياً",
    ),
    OperatingMode.NEGOTIATION: ModePolicy(
        mode=OperatingMode.NEGOTIATION.value,
        allowed_channels=["email", "whatsapp"],
        allowed_actions=[
            "analyze",
            "suggest",
            "draft",
            "score_match",
            "generate_report",
            "craft_introduction",
            "draft_proposal",
            "send_template",
            "send_follow_up",
            "schedule_reminder",
            "send_custom_message",
            "handle_response",
            "counter_offer",
            "negotiate_terms",
            "record_concession",
        ],
        auto_send=True,
        auto_negotiate=True,
        escalation_triggers=[
            "pricing_change",
            "exclusivity",
            "equity",
            "legal_terms",
            "value_above_threshold",
            "human_requested",
            "stall_detected",
        ],
        max_auto_commitment_sar=50_000,
        label_ar="تفاوض",
        description_ar="الذكاء الاصطناعي يتفاوض ضمن الحدود المحددة — يصعّد عند الحاجة",
    ),
    OperatingMode.STRATEGIC: ModePolicy(
        mode=OperatingMode.STRATEGIC.value,
        allowed_channels=["email", "whatsapp"],
        allowed_actions=[
            "analyze",
            "suggest",
            "draft",
            "score_match",
            "generate_report",
            "craft_introduction",
            "draft_proposal",
            "send_template",
            "send_follow_up",
            "schedule_reminder",
            "send_custom_message",
            "handle_response",
            "counter_offer",
            "negotiate_terms",
            "record_concession",
            "request_approval",
            "generate_term_sheet",
            "run_discovery_scan",
            "run_outreach_campaign",
        ],
        auto_send=True,
        auto_negotiate=True,
        escalation_triggers=[
            "commitment",
            "exclusivity",
            "equity",
            "legal",
            "data_sharing",
            "ip_licensing",
            "territory_change",
            "value_above_threshold",
            "human_requested",
        ],
        max_auto_commitment_sar=100_000,
        label_ar="استراتيجي",
        description_ar="سير عمل كامل مع تصعيد إلزامي لأي التزام مالي أو قانوني",
    ),
}


# ── Mode Enforcer ───────────────────────────────────────────────────────────


class ModeEnforcer:
    """
    Enforces operating mode policies before any AI action is executed.
    يفرض سياسات وضع التشغيل قبل تنفيذ أي إجراء للذكاء الاصطناعي
    """

    @staticmethod
    async def check_action(
        mode: OperatingMode,
        action: str,
        deal_value: float,
        db: AsyncSession,
    ) -> tuple[bool, str]:
        """
        Check whether an action is allowed under the current operating mode.
        Returns (allowed, reason_ar).

        التحقق مما إذا كان الإجراء مسموحاً في وضع التشغيل الحالي
        يرجع (مسموح، السبب_بالعربي)
        """
        policy = MODE_POLICIES.get(mode)
        if not policy:
            return False, f"وضع التشغيل غير معروف: {mode}"

        # Check if action is in allowed list
        if action not in policy.allowed_actions:
            mode_label = MODE_LABELS_AR.get(mode, str(mode))
            return False, (
                f"الإجراء '{action}' غير مسموح في وضع '{mode_label}'. "
                f"الإجراءات المتاحة: {', '.join(policy.allowed_actions)}"
            )

        # Check if deal value exceeds auto-commitment threshold
        if deal_value > 0 and deal_value > policy.max_auto_commitment_sar:
            return False, (
                f"قيمة الصفقة ({deal_value:,.0f} ريال) تتجاوز الحد الأقصى للالتزام التلقائي "
                f"({policy.max_auto_commitment_sar:,.0f} ريال). يلزم تصعيد للإنسان."
            )

        # Check escalation triggers
        escalation_actions = {
            "counter_offer": ["pricing_change"],
            "negotiate_terms": ["pricing_change", "legal_terms"],
            "send_custom_message": [],
            "handle_response": ["reply_received"],
            "generate_term_sheet": ["legal_terms", "commitment"],
            "run_outreach_campaign": [],
        }

        action_triggers = escalation_actions.get(action, [])
        for trigger in action_triggers:
            if trigger in policy.escalation_triggers:
                if not policy.auto_negotiate:
                    mode_label = MODE_LABELS_AR.get(mode, str(mode))
                    return False, (
                        f"الإجراء '{action}' يستلزم تصعيداً بسبب: {trigger}. "
                        f"وضع '{mode_label}' لا يسمح بالتفاوض التلقائي."
                    )

        logger.info(
            "Action '%s' allowed in mode %s (deal_value=%.0f SAR)",
            action, mode.name, deal_value,
        )
        return True, "مسموح"

    @staticmethod
    async def check_channel(
        mode: OperatingMode,
        channel: str,
    ) -> tuple[bool, str]:
        """
        Check whether a communication channel is allowed under the current mode.
        التحقق مما إذا كانت قناة الاتصال مسموحة في الوضع الحالي
        """
        policy = MODE_POLICIES.get(mode)
        if not policy:
            return False, f"وضع التشغيل غير معروف: {mode}"

        if not policy.allowed_channels:
            mode_label = MODE_LABELS_AR.get(mode, str(mode))
            return False, f"وضع '{mode_label}' لا يسمح بأي قناة اتصال. الإرسال يتم يدوياً."

        if channel not in policy.allowed_channels:
            mode_label = MODE_LABELS_AR.get(mode, str(mode))
            return False, (
                f"القناة '{channel}' غير مسموحة في وضع '{mode_label}'. "
                f"القنوات المتاحة: {', '.join(policy.allowed_channels)}"
            )

        return True, "مسموح"

    @staticmethod
    async def get_current_mode(
        tenant_id: str,
        db: AsyncSession,
    ) -> OperatingMode:
        """
        Get the current operating mode for a tenant.
        الحصول على وضع التشغيل الحالي للمستأجر
        """
        # Mode is stored in the tenant's first company profile deal_preferences
        result = await db.execute(
            select(CompanyProfile).where(
                CompanyProfile.tenant_id == tenant_id
            ).limit(1)
        )
        profile = result.scalar_one_or_none()
        if not profile:
            logger.info("No profile found for tenant %s, defaulting to MANUAL", tenant_id)
            return OperatingMode.MANUAL

        prefs = profile.deal_preferences or {}
        mode_value = prefs.get("_operating_mode", OperatingMode.MANUAL.value)

        try:
            return OperatingMode(mode_value)
        except ValueError:
            logger.warning("Invalid operating mode %s for tenant %s, defaulting to MANUAL", mode_value, tenant_id)
            return OperatingMode.MANUAL

    @staticmethod
    async def set_mode(
        tenant_id: str,
        mode: OperatingMode,
        db: AsyncSession,
    ):
        """
        Set the operating mode for a tenant.
        تعيين وضع التشغيل للمستأجر
        """
        result = await db.execute(
            select(CompanyProfile).where(
                CompanyProfile.tenant_id == tenant_id
            ).limit(1)
        )
        profile = result.scalar_one_or_none()
        if not profile:
            raise ValueError(f"لا يوجد ملف شركة للمستأجر: {tenant_id}")

        prefs = dict(profile.deal_preferences or {})
        old_mode = prefs.get("_operating_mode", OperatingMode.MANUAL.value)
        prefs["_operating_mode"] = mode.value
        profile.deal_preferences = prefs
        await db.flush()

        old_label = MODE_LABELS_AR.get(OperatingMode(old_mode), str(old_mode))
        new_label = MODE_LABELS_AR.get(mode, str(mode))
        logger.info(
            "Operating mode for tenant %s changed: %s -> %s",
            tenant_id, old_label, new_label,
        )

    @staticmethod
    def get_mode_policy(mode: OperatingMode) -> ModePolicy:
        """
        Get the policy for a specific operating mode.
        الحصول على سياسة وضع تشغيل محدد
        """
        policy = MODE_POLICIES.get(mode)
        if not policy:
            raise ValueError(f"وضع التشغيل غير معروف: {mode}")
        return policy

    @staticmethod
    def get_all_modes() -> list[dict]:
        """
        List all operating modes with their labels and descriptions.
        عرض جميع أوضاع التشغيل مع التسميات والأوصاف
        """
        return [
            {
                "mode": mode.value,
                "name": mode.name,
                "label_ar": MODE_LABELS_AR[mode],
                "description_ar": MODE_DESCRIPTIONS_AR[mode],
                "auto_send": MODE_POLICIES[mode].auto_send,
                "auto_negotiate": MODE_POLICIES[mode].auto_negotiate,
                "max_auto_commitment_sar": MODE_POLICIES[mode].max_auto_commitment_sar,
                "allowed_channels": MODE_POLICIES[mode].allowed_channels,
            }
            for mode in OperatingMode
        ]

    @staticmethod
    async def should_escalate(
        mode: OperatingMode,
        trigger: str,
        deal_value: float,
    ) -> tuple[bool, str]:
        """
        Determine if a specific trigger requires human escalation.
        تحديد ما إذا كان المحفز يستلزم تصعيداً للإنسان
        """
        policy = MODE_POLICIES.get(mode)
        if not policy:
            return True, "وضع التشغيل غير معروف — يجب التصعيد"

        # "all" trigger means everything escalates
        if "all" in policy.escalation_triggers:
            return True, f"وضع '{MODE_LABELS_AR.get(mode, '')}' يتطلب تصعيد كل الإجراءات"

        if trigger in policy.escalation_triggers:
            return True, f"المحفز '{trigger}' يتطلب تصعيداً في وضع '{MODE_LABELS_AR.get(mode, '')}'"

        if deal_value > policy.max_auto_commitment_sar > 0:
            return True, (
                f"قيمة الصفقة ({deal_value:,.0f} ريال) تتجاوز الحد ({policy.max_auto_commitment_sar:,.0f} ريال)"
            )

        return False, "لا يلزم تصعيد"
