"""
Dealix Autonomous AI Sales Agent for WhatsApp
وكيل مبيعات ذكي يعمل تلقائياً عبر الواتساب — يؤهل العملاء ويحجز المواعيد
"""

import logging
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field

from app.services.llm.provider import get_llm

logger = logging.getLogger("dealix.ai.sales_agent")


class ConversationState(str, Enum):
    GREETING = "greeting"
    QUALIFICATION = "qualification"
    NEEDS_ANALYSIS = "needs_analysis"
    SOLUTION_PITCH = "solution_pitch"
    OBJECTION_HANDLING = "objection_handling"
    CLOSE_OR_ESCALATE = "close_or_escalate"


STATE_TRANSITIONS: dict[str, list[str]] = {
    "greeting": ["qualification"],
    "qualification": ["needs_analysis", "close_or_escalate"],
    "needs_analysis": ["solution_pitch", "close_or_escalate"],
    "solution_pitch": ["objection_handling", "close_or_escalate"],
    "objection_handling": ["solution_pitch", "close_or_escalate"],
    "close_or_escalate": [],
}

INDUSTRY_QUALIFIERS: dict[str, list[str]] = {
    "real_estate": [
        "ما نوع العقار المطلوب (سكني/تجاري)؟",
        "ما المنطقة أو الحي المفضل؟",
        "ما الميزانية التقريبية؟",
        "هل تبحث عن شراء أو إيجار؟",
    ],
    "healthcare": [
        "ما نوع الخدمة الطبية المطلوبة؟",
        "هل لديك تأمين طبي؟",
        "هل تفضل موعد صباحي أو مسائي؟",
    ],
    "services": [
        "ما طبيعة الخدمة المطلوبة؟",
        "ما الميزانية التقريبية؟",
        "ما الجدول الزمني المتوقع؟",
        "هل سبق تجربة مزود خدمة آخر؟",
    ],
    "contracting": [
        "ما نوع المشروع (بناء/صيانة/تشطيبات)؟",
        "ما المساحة التقريبية؟",
        "ما الميزانية المخصصة؟",
        "هل الموقع في الرياض أو منطقة أخرى؟",
    ],
    "education": [
        "ما البرنامج أو الدورة المطلوبة؟",
        "هل تفضل حضوري أو عن بعد؟",
        "ما مستوى الخبرة الحالي؟",
    ],
    "retail": [
        "ما المنتج أو الفئة المطلوبة؟",
        "هل تبحث عن كميات تجارية أو شخصية؟",
        "ما المنطقة لغرض التوصيل؟",
    ],
}

ESCALATION_TRIGGERS = [
    "أبي أكلم مدير",
    "أبي أتكلم مع شخص",
    "أبي موظف",
    "ما فهمت",
    "مشكلة كبيرة",
    "شكوى",
    "غاضب",
    "مستعجل جداً",
]


class AgentContext(BaseModel):
    lead_id: str = ""
    phone: str = ""
    name: str = ""
    industry: str = "services"
    state: str = ConversationState.GREETING.value
    history: list[dict] = Field(default_factory=list)
    qualification_data: dict = Field(default_factory=dict)
    questions_asked: int = 0
    escalated: bool = False
    meeting_proposed: bool = False


class AgentResponse(BaseModel):
    reply: str
    new_state: str
    should_escalate: bool = False
    meeting_suggested: bool = False
    qualification_complete: bool = False
    extracted_data: dict = Field(default_factory=dict)


class SalesAgent:
    """Autonomous WhatsApp sales agent with Arabic dialogue and state machine."""

    def __init__(self):
        self.llm = get_llm()
        self._contexts: dict[str, AgentContext] = {}

    async def handle_message(
        self,
        phone: str,
        message: str,
        lead_id: str = "",
        name: str = "",
        industry: str = "services",
    ) -> AgentResponse:
        """Main entry: process an inbound WhatsApp message and produce a reply."""
        ctx = self._get_or_create_context(phone, lead_id, name, industry)
        ctx.history.append({"role": "user", "content": message, "ts": _now_iso()})

        if await self.should_escalate(message, ctx):
            ctx.escalated = True
            ctx.state = ConversationState.CLOSE_OR_ESCALATE.value
            reply = (
                f"حياك الله {ctx.name or ''}، أقدّر تواصلك. "
                "بحوّلك الحين لأحد مستشارينا المتخصصين يخدمك بشكل أفضل. لحظات من فضلك."
            )
            ctx.history.append({"role": "assistant", "content": reply, "ts": _now_iso()})
            return AgentResponse(
                reply=reply,
                new_state=ctx.state,
                should_escalate=True,
            )

        reply, extracted = await self._generate_state_reply(ctx, message)
        ctx.qualification_data.update(extracted)
        ctx.history.append({"role": "assistant", "content": reply, "ts": _now_iso()})

        next_state = await self._determine_next_state(ctx, message)
        ctx.state = next_state

        qualification_complete = ctx.questions_asked >= len(
            INDUSTRY_QUALIFIERS.get(ctx.industry, INDUSTRY_QUALIFIERS["services"])
        )

        meeting_suggested = False
        if qualification_complete and not ctx.meeting_proposed:
            meeting_reply = await self.suggest_meeting(ctx)
            reply += f"\n\n{meeting_reply}"
            ctx.meeting_proposed = True
            meeting_suggested = True

        return AgentResponse(
            reply=reply,
            new_state=ctx.state,
            should_escalate=False,
            meeting_suggested=meeting_suggested,
            qualification_complete=qualification_complete,
            extracted_data=extracted,
        )

    async def qualify_lead(self, ctx: AgentContext) -> dict:
        """Return current qualification status and gathered data."""
        qualifiers = INDUSTRY_QUALIFIERS.get(ctx.industry, INDUSTRY_QUALIFIERS["services"])
        return {
            "lead_id": ctx.lead_id,
            "industry": ctx.industry,
            "state": ctx.state,
            "questions_total": len(qualifiers),
            "questions_asked": ctx.questions_asked,
            "qualification_data": ctx.qualification_data,
            "is_qualified": ctx.questions_asked >= len(qualifiers),
        }

    async def suggest_meeting(self, ctx: AgentContext) -> str:
        """Generate a meeting suggestion message."""
        prompt = (
            "أنت مساعد مبيعات في السوق السعودي. اقترح موعد اجتماع للعميل "
            "بأسلوب ودود ومهني بالسعودية. اذكر 2-3 أوقات متاحة هذا الأسبوع. "
            "اجعل الرد مختصراً (3 أسطر كحد أقصى)."
        )
        resp = await self.llm.complete(
            system_prompt=prompt,
            user_message=f"اسم العميل: {ctx.name}\nالقطاع: {ctx.industry}",
            temperature=0.6,
            max_tokens=150,
        )
        return resp.content.strip()

    async def should_escalate(self, message: str, ctx: AgentContext) -> bool:
        """Determine if message requires human handoff."""
        msg_lower = message.strip()
        for trigger in ESCALATION_TRIGGERS:
            if trigger in msg_lower:
                logger.info("Escalation triggered for %s: matched '%s'", ctx.phone, trigger)
                return True

        if len(ctx.history) > 10 and ctx.state == ConversationState.OBJECTION_HANDLING.value:
            return True

        return False

    async def generate_follow_up(self, phone: str, days_dormant: int = 3) -> Optional[str]:
        """Generate a follow-up message for a dormant lead."""
        ctx = self._contexts.get(phone)
        if not ctx:
            return None

        prompt = (
            "أنت مساعد مبيعات سعودي. اكتب رسالة متابعة ودية لعميل لم يرد منذ "
            f"{days_dormant} أيام. اجعلها مختصرة (سطرين) ومهتمة بدون ضغط. "
            "اسم العميل: " + (ctx.name or "العميل")
        )
        resp = await self.llm.complete(
            system_prompt=prompt,
            user_message=f"القطاع: {ctx.industry}. آخر حالة: {ctx.state}",
            temperature=0.7,
            max_tokens=100,
        )
        return resp.content.strip()

    # ── Internal helpers ─────────────────────────────

    def _get_or_create_context(
        self, phone: str, lead_id: str, name: str, industry: str,
    ) -> AgentContext:
        if phone not in self._contexts:
            self._contexts[phone] = AgentContext(
                lead_id=lead_id, phone=phone, name=name, industry=industry,
            )
        ctx = self._contexts[phone]
        if name and not ctx.name:
            ctx.name = name
        return ctx

    async def _generate_state_reply(
        self, ctx: AgentContext, message: str,
    ) -> tuple[str, dict]:
        """Generate a reply appropriate to the current conversation state."""
        qualifiers = INDUSTRY_QUALIFIERS.get(ctx.industry, INDUSTRY_QUALIFIERS["services"])
        current_q = qualifiers[ctx.questions_asked] if ctx.questions_asked < len(qualifiers) else ""

        state_instructions = {
            ConversationState.GREETING.value: (
                "رحّب بالعميل بأسلوب سعودي ودود. اسأل كيف تقدر تساعده. "
                "لا تكن رسمياً أكثر من اللازم."
            ),
            ConversationState.QUALIFICATION.value: (
                f"اسأل السؤال التالي بأسلوب طبيعي: {current_q}\n"
                "حاول استخلاص المعلومات من إجابة العميل."
            ),
            ConversationState.NEEDS_ANALYSIS.value: (
                "حلل احتياجات العميل وأكّد فهمك. لخّص ما فهمته واسأل إذا في شي ثاني."
            ),
            ConversationState.SOLUTION_PITCH.value: (
                "اعرض الحل المناسب بناءً على احتياجات العميل. "
                "ركّز على الفوائد مع ذكر القيمة بشكل غير مباشر."
            ),
            ConversationState.OBJECTION_HANDLING.value: (
                "تعامل مع اعتراض العميل بذكاء. أعد التأطير وركّز على القيمة. "
                "لا تكن دفاعياً."
            ),
        }

        instruction = state_instructions.get(
            ctx.state,
            "أكمل المحادثة بأسلوب مهني وودود.",
        )

        system = (
            "أنت وكيل مبيعات ذكي لشركة سعودية. تتحدث بالعامية السعودية الراقية.\n"
            "قواعدك:\n"
            "1. ردود مختصرة (3-4 أسطر كحد أقصى)\n"
            "2. لا تستخدم رموز تعبيرية مبالغ فيها\n"
            "3. كن ودوداً ومحترفاً\n"
            "4. استخلص أي معلومات ذات قيمة من رد العميل\n"
            f"5. التعليمات الحالية: {instruction}\n"
            "أجب بـ JSON: {\"reply\": \"...\", \"extracted\": {\"key\": \"value\"}}\n"
        )

        recent_history = ctx.history[-6:]
        history_text = "\n".join(
            f"{'العميل' if h['role'] == 'user' else 'الوكيل'}: {h['content']}"
            for h in recent_history
        )

        user_msg = f"المحادثة السابقة:\n{history_text}\n\nرسالة العميل الجديدة: {message}"

        resp = await self.llm.complete(
            system_prompt=system,
            user_message=user_msg,
            temperature=0.6,
            max_tokens=250,
            json_mode=True,
        )

        parsed = resp.parse_json()
        if parsed:
            reply = parsed.get("reply", message)
            extracted = parsed.get("extracted", {})
        else:
            reply = resp.content.strip()
            extracted = {}

        if ctx.state == ConversationState.QUALIFICATION.value:
            ctx.questions_asked += 1

        return reply, extracted

    async def _determine_next_state(self, ctx: AgentContext, message: str) -> str:
        """Decide the next conversation state."""
        allowed = STATE_TRANSITIONS.get(ctx.state, [])
        if not allowed:
            return ctx.state

        qualifiers = INDUSTRY_QUALIFIERS.get(ctx.industry, INDUSTRY_QUALIFIERS["services"])

        if ctx.state == ConversationState.GREETING.value:
            return ConversationState.QUALIFICATION.value

        if ctx.state == ConversationState.QUALIFICATION.value:
            if ctx.questions_asked >= len(qualifiers):
                return ConversationState.NEEDS_ANALYSIS.value
            return ConversationState.QUALIFICATION.value

        if ctx.state == ConversationState.NEEDS_ANALYSIS.value:
            return ConversationState.SOLUTION_PITCH.value

        if ctx.state == ConversationState.SOLUTION_PITCH.value:
            negative_signals = ["غالي", "ما أبي", "لا", "مو مقتنع", "كثير", "فكر"]
            if any(s in message for s in negative_signals):
                return ConversationState.OBJECTION_HANDLING.value
            return ConversationState.CLOSE_OR_ESCALATE.value

        if ctx.state == ConversationState.OBJECTION_HANDLING.value:
            return ConversationState.SOLUTION_PITCH.value

        return ctx.state


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
