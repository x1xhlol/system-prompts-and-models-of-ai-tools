"""
WhatsApp AI Brain — Dealix AI Revenue OS
Central intelligence for the Dealix WhatsApp number.
Handles: sales, support, marketer support, deals, and general inquiries.
Connected to backend data for contextual, intelligent responses.
"""
import logging
import re
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class ConversationMode(str, Enum):
    SALES = "sales"
    SUPPORT = "support"
    MARKETER = "marketer"
    DEALS = "deals"
    GENERAL = "general"


class CallerProfile(BaseModel):
    phone: str
    name: str = "زائر"
    caller_type: str = "unknown"  # client, marketer, lead, unknown
    tenant_id: str = ""
    subscription_plan: str = ""
    commission_balance: float = 0.0
    lead_score: int = 0
    language: str = "ar"


class ConversationEntry(BaseModel):
    role: str  # user, assistant
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


ARABIC_MARKERS = ["وش", "كيف", "أبي", "ليش", "هلا", "مرحبا", "السلام", "شكرا", "طيب"]
INTENT_KEYWORDS = {
    "greeting": ["هلا", "مرحبا", "السلام عليكم", "أهلاً", "hi", "hello", "hey"],
    "pricing": ["سعر", "كم", "باقة", "اشتراك", "price", "cost", "plan", "pricing"],
    "demo": ["عرض", "demo", "تجربة", "شرح", "وريني"],
    "support": ["مشكلة", "ما يشتغل", "خطأ", "bug", "help", "مساعدة", "دعم"],
    "complaint": ["شكوى", "زعلان", "سيء", "complaint", "unhappy"],
    "partnership": ["شراكة", "partner", "تعاون", "صفقة", "deal"],
    "commission": ["عمولة", "commission", "أرباح", "دفعة", "payout"],
    "feature": ["ميزة", "feature", "يقدر", "يدعم", "فيه"],
    "competitor": ["zoho", "salesforce", "hubspot", "pipedrive", "منافس"],
    "cancel": ["إلغاء", "cancel", "أوقف", "stop"],
}


class WhatsAppBrain:
    """Central brain for Dealix WhatsApp — routes and responds intelligently."""

    def __init__(self):
        self._conversations: dict[str, list[ConversationEntry]] = {}
        from app.services.whatsapp_knowledge import DealixKnowledge
        self.knowledge = DealixKnowledge

    async def handle_incoming(
        self, phone: str, message: str, db: Any = None
    ) -> str:
        caller = await self.identify_caller(phone, db)
        language = self._detect_language(message)
        caller.language = language
        intent = self._detect_intent(message)
        history = self._get_history(phone)
        mode = self._route_conversation(intent, caller)

        self._add_to_history(phone, "user", message)

        handlers = {
            ConversationMode.SALES: self._handle_sales,
            ConversationMode.SUPPORT: self._handle_support,
            ConversationMode.MARKETER: self._handle_marketer,
            ConversationMode.DEALS: self._handle_deals,
            ConversationMode.GENERAL: self._handle_general,
        }
        handler = handlers.get(mode, self._handle_general)
        response = await handler(message, caller, intent, history, db)

        # Try AI agent for richer responses (non-blocking enhancement)
        if db and intent not in ("greeting", "pricing") and mode == ConversationMode.SALES:
            try:
                ai_response = await self._get_ai_agent_response(
                    message, caller, intent, db
                )
                if ai_response:
                    response = ai_response
            except Exception as e:
                logger.debug(f"AI agent enhancement skipped: {e}")

        self._add_to_history(phone, "assistant", response)
        logger.info(
            f"[WhatsAppBrain] {phone} mode={mode.value} intent={intent} "
            f"caller={caller.caller_type} lang={language}"
        )
        return response

    async def _get_ai_agent_response(
        self, message: str, caller: CallerProfile, intent: str, db
    ) -> str | None:
        """Try to get a response from the arabic_whatsapp AI agent."""
        try:
            from app.services.agents.executor import AgentExecutor
            executor = AgentExecutor(db)
            result = await executor.execute(
                agent_type="arabic_whatsapp",
                input_data={
                    "message": message,
                    "contact_phone": caller.phone,
                    "contact_name": caller.name,
                    "caller_type": caller.caller_type,
                    "language": caller.language,
                    "intent": intent,
                },
                tenant_id=caller.tenant_id or None,
            )
            if result.status == "success" and result.output:
                ai_msg = result.output.get("response_message_ar")
                if ai_msg and len(ai_msg) > 10:
                    return ai_msg
        except Exception as e:
            logger.debug(f"AI agent response failed: {e}")
        return None

    async def identify_caller(self, phone: str, db: Any = None) -> CallerProfile:
        profile = CallerProfile(phone=phone)
        if not db:
            return profile
        try:
            from sqlalchemy import select, or_
            from app.models.lead import Lead
            from app.models.user import User
            from app.models.affiliate import AffiliateMarketer

            clean_phone = phone.replace("+", "").replace(" ", "")

            # Check if affiliate marketer
            result = await db.execute(
                select(AffiliateMarketer).where(
                    AffiliateMarketer.phone.contains(clean_phone[-9:])
                ).limit(1)
            )
            marketer = result.scalar_one_or_none()
            if marketer:
                profile.caller_type = "marketer"
                profile.name = marketer.full_name or "مسوّق"
                profile.tenant_id = str(marketer.tenant_id) if hasattr(marketer, 'tenant_id') else ""
                return profile

            # Check if existing user/client
            result = await db.execute(
                select(User).where(User.phone.contains(clean_phone[-9:])).limit(1)
            )
            user = result.scalar_one_or_none()
            if user:
                profile.caller_type = "client"
                profile.name = user.full_name or "عميل"
                profile.tenant_id = str(user.tenant_id) if hasattr(user, 'tenant_id') else ""
                return profile

            # Check if known lead
            result = await db.execute(
                select(Lead).where(Lead.phone.contains(clean_phone[-9:])).limit(1)
            )
            lead = result.scalar_one_or_none()
            if lead:
                profile.caller_type = "lead"
                profile.name = lead.name or "عميل محتمل"
                profile.lead_score = lead.score or 0
                profile.tenant_id = str(lead.tenant_id) if hasattr(lead, 'tenant_id') else ""
                return profile

        except Exception as e:
            logger.warning(f"Error identifying caller {phone}: {e}")

        return profile

    def _detect_language(self, message: str) -> str:
        arabic_chars = len(re.findall(r'[\u0600-\u06FF]', message))
        latin_chars = len(re.findall(r'[a-zA-Z]', message))
        return "ar" if arabic_chars >= latin_chars else "en"

    def _detect_intent(self, message: str) -> str:
        msg_lower = message.lower()
        for intent, keywords in INTENT_KEYWORDS.items():
            if any(kw in msg_lower for kw in keywords):
                return intent
        return "general"

    def _route_conversation(self, intent: str, caller: CallerProfile) -> ConversationMode:
        if caller.caller_type == "marketer" or intent == "commission":
            return ConversationMode.MARKETER
        if caller.caller_type == "client" and intent in ("support", "complaint", "cancel"):
            return ConversationMode.SUPPORT
        if intent in ("partnership",):
            return ConversationMode.DEALS
        if intent in ("pricing", "demo", "feature", "competitor"):
            return ConversationMode.SALES
        if caller.caller_type == "client":
            return ConversationMode.SUPPORT
        return ConversationMode.SALES if caller.caller_type == "unknown" else ConversationMode.GENERAL

    def _get_history(self, phone: str) -> list[ConversationEntry]:
        return self._conversations.get(phone, [])[-10:]

    def _add_to_history(self, phone: str, role: str, content: str) -> None:
        if phone not in self._conversations:
            self._conversations[phone] = []
        self._conversations[phone].append(ConversationEntry(role=role, content=content))
        if len(self._conversations[phone]) > 50:
            self._conversations[phone] = self._conversations[phone][-50:]

    async def _handle_sales(
        self, message: str, caller: CallerProfile, intent: str, history: list, db: Any
    ) -> str:
        lang = caller.language

        if intent == "greeting":
            name_part = f" {caller.name}" if caller.name != "زائر" else ""
            if lang == "ar":
                return (
                    f"أهلاً وسهلاً{name_part}! 👋\n"
                    f"أنا مساعد ديلكس الذكي.\n\n"
                    f"أقدر أساعدك في:\n"
                    f"• معرفة مميزات Dealix\n"
                    f"• الأسعار والباقات\n"
                    f"• حجز عرض توضيحي\n"
                    f"• أي سؤال ثاني\n\n"
                    f"كيف أقدر أساعدك؟"
                )
            return (
                f"Hello{name_part}! 👋\n"
                f"I'm the Dealix AI assistant.\n\n"
                f"I can help with:\n"
                f"• Dealix features\n• Pricing\n• Book a demo\n\nHow can I help?"
            )

        if intent == "pricing":
            pricing_text = self.knowledge.get_pricing_text(lang)
            suffix = "\nكل الباقات فيها تجربة مجانية ١٤ يوم بدون بطاقة.\nتبي تجرب؟" if lang == "ar" else "\nAll plans include a 14-day free trial. Want to try?"
            return f"{pricing_text}\n{suffix}"

        if intent == "demo":
            if lang == "ar":
                return (
                    "ممتاز! يسعدنا نعرض لك Dealix 🎉\n\n"
                    "العرض يستغرق ١٥ دقيقة فقط.\n"
                    "أرسل لي اسمك ورقم جوالك وأرتب لك الموعد."
                )
            return "Great! We'd love to show you Dealix 🎉\nThe demo takes just 15 minutes.\nSend your name and phone, and I'll set it up."

        if intent == "competitor":
            for comp in ["zoho", "salesforce", "hubspot"]:
                if comp in message.lower():
                    resp = self.knowledge.get_competitor_response(comp)
                    if resp:
                        return resp
            if lang == "ar":
                return "Dealix الوحيد المصمم للسوق السعودي: عربي أولاً، واتساب مدمج، AI يفهم سعودي. تبي أوريك المقارنة؟"
            return "Dealix is the only CRM built for Saudi: Arabic-first, WhatsApp native, Saudi-aware AI. Want to see the comparison?"

        if intent == "feature":
            for key, feat in self.knowledge.FEATURES.items():
                if any(word in message for word in feat["name_ar"].split()):
                    points = "\n".join(f"✅ {p}" for p in feat["selling_points_ar"])
                    return f"*{feat['name_ar']}*\n{feat['desc_ar']}\n\n{points}"

        # Check objections
        for obj_type, obj_data in self.knowledge.OBJECTION_RESPONSES.items():
            triggers = {"expensive": ["غالي", "مكلف"], "need_to_think": ["أفكر", "بشوف"], "too_complex": ["صعب", "معقد"], "small_team": ["صغير", "وحدي"]}
            if obj_type in triggers and any(t in message for t in triggers[obj_type]):
                return obj_data.get(lang, obj_data["ar"])

        # FAQ search
        faq_answer = self.knowledge.search_faq(message)
        if faq_answer:
            return faq_answer

        if lang == "ar":
            return "شكراً لتواصلك! 🙏\nأقدر أساعدك بأي سؤال عن Dealix — الأسعار، المميزات، أو حجز عرض توضيحي.\nوش تحب تعرف؟"
        return "Thanks for reaching out! 🙏\nI can help with pricing, features, or booking a demo.\nWhat would you like to know?"

    async def _handle_support(
        self, message: str, caller: CallerProfile, intent: str, history: list, db: Any
    ) -> str:
        name = caller.name or "عميل"
        if intent == "complaint":
            return (
                f"أستاذ/ة {name}، نعتذر عن أي إزعاج 🙏\n"
                f"فريق الدعم المتخصص بيتواصل معك خلال ساعة.\n"
                f"لو تقدر توصف المشكلة بالتفصيل، بيساعدنا نحلها أسرع."
            )
        if intent == "cancel":
            return (
                f"أستاذ/ة {name}، نأسف إنك تفكر بالإلغاء 😔\n"
                f"قبل ما نلغي، ممكن أعرف السبب؟ يمكن نقدر نساعدك.\n"
                f"لو تبي، أقدر أحولك لمدير حسابك مباشرة."
            )
        return (
            f"أهلاً {name}! 👋\n"
            f"كيف أقدر أساعدك اليوم؟\n\n"
            f"لو عندك مشكلة تقنية، وصّف لي المشكلة وبأساعدك فوراً.\n"
            f"لو تحتاج شي ما أقدر أحله، بأحولك لفريق الدعم المتخصص."
        )

    async def _handle_marketer(
        self, message: str, caller: CallerProfile, intent: str, history: list, db: Any
    ) -> str:
        name = caller.name or "مسوّق"
        if intent == "commission":
            return (
                f"أهلاً {name}! 🌟\n\n"
                f"للاطلاع على عمولاتك وأدائك، ادخل لوحة التحكم من:\n"
                f"dealix.sa/dashboard\n\n"
                f"لو عندك سؤال عن العمولات أو المدفوعات، أنا هنا أساعدك."
            )

        # Search marketer FAQ
        for faq in self.knowledge.MARKETER_FAQ:
            if any(word in message for word in faq["q_ar"].split() if len(word) > 2):
                return faq["a_ar"]

        return (
            f"أهلاً {name}! مسوّقنا المميز 🌟\n\n"
            f"كيف أقدر أساعدك اليوم؟\n"
            f"• استفسار عن العمولات\n"
            f"• مساعدة تقنية\n"
            f"• نصائح للتسويق\n"
            f"• أي سؤال ثاني"
        )

    async def _handle_deals(
        self, message: str, caller: CallerProfile, intent: str, history: list, db: Any
    ) -> str:
        return (
            "أهلاً! 🤝\n\n"
            "Dealix يدعم ١٥ نوع صفقة استراتيجية:\n"
            "• شراكات وتبادل خدمات\n"
            "• توزيع وreseller\n"
            "• مشاريع مشتركة\n"
            "• فرص استحواذ\n\n"
            "حدثني أكثر عن شركتك ووش تبحث عنه، وبأساعدك نلقى أفضل فرصة."
        )

    async def _handle_general(
        self, message: str, caller: CallerProfile, intent: str, history: list, db: Any
    ) -> str:
        faq_answer = self.knowledge.search_faq(message)
        if faq_answer:
            return faq_answer
        lang = caller.language
        if lang == "ar":
            return (
                "أهلاً وسهلاً! 👋\n"
                "أنا مساعد ديلكس — نظام المبيعات الذكي للسعودية.\n\n"
                "أقدر أساعدك في:\n"
                "١. معرفة مميزات Dealix\n"
                "٢. الأسعار والباقات\n"
                "٣. حجز عرض توضيحي\n"
                "٤. الدعم الفني\n"
                "٥. برنامج التسويق بالعمولة\n\n"
                "أختر رقم أو اكتب سؤالك مباشرة."
            )
        return (
            "Hello! 👋\nI'm the Dealix assistant — the smart sales system for Saudi Arabia.\n\n"
            "I can help with:\n1. Features\n2. Pricing\n3. Book a demo\n4. Support\n5. Affiliate program\n\n"
            "Pick a number or type your question."
        )


# Global singleton
whatsapp_brain = WhatsAppBrain()
