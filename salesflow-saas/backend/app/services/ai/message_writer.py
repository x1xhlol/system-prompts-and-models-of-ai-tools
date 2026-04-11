"""
AI Message Writer — Generates personalized WhatsApp, Email, and SMS messages
in Arabic and English with tone control, A/B variants, and Saudi business-hour awareness.
"""

import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from typing import Optional

from app.services.llm.provider import get_llm

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class MessageVariant:
    content: str
    subject: Optional[str] = None  # for email only
    variant_label: str = "A"
    estimated_read_time_sec: int = 0


@dataclass
class MessageDraft:
    channel: str  # "whatsapp", "email", "sms"
    language: str  # "ar", "en"
    tone: str
    variants: list[MessageVariant] = field(default_factory=list)
    best_send_time: Optional[str] = None
    best_send_day: Optional[str] = None
    personalization_used: list[str] = field(default_factory=list)
    metadata: dict = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

CHANNEL_LIMITS = {
    "whatsapp": 4096,
    "sms": 160,
    "email": 10000,
}

TONE_INSTRUCTIONS = {
    "formal": {
        "ar": (
            "استخدم لغة رسمية واحترافية. خاطب العميل بـ'حضرتكم'. "
            "ابدأ بالسلام الرسمي. تجنب العامية."
        ),
        "en": "Use formal, professional language. Address the recipient respectfully.",
    },
    "friendly": {
        "ar": (
            "استخدم لغة ودية وعفوية. خاطب العميل بـ'أنت'. "
            "استخدم تعبيرات سعودية طبيعية مثل 'هلا والله' و'يعطيك العافية'."
        ),
        "en": "Use a warm, friendly tone. Be conversational and approachable.",
    },
    "urgent": {
        "ar": (
            "استخدم لغة مباشرة تحث على الإسراع. "
            "أكد على محدودية العرض أو ضرورة التصرف السريع بدون مبالغة."
        ),
        "en": "Create urgency without being pushy. Emphasize time-limited opportunity.",
    },
    "follow_up": {
        "ar": (
            "ذكّر العميل بالمحادثة السابقة بلطف. "
            "اسأل إذا عنده أسئلة. كن مهذب وغير ملح."
        ),
        "en": "Gently remind about previous conversation. Ask if they have questions.",
    },
}

INDUSTRY_CONTEXT = {
    "real_estate": {
        "ar": "القطاع العقاري — استخدم مصطلحات مثل: وحدة سكنية، مخطط، صك، موقع استراتيجي، عائد استثماري",
        "en": "Real estate — use terms like: residential unit, strategic location, ROI, property value",
    },
    "healthcare": {
        "ar": "القطاع الصحي — استخدم مصطلحات مثل: عيادة، مجمع طبي، تأمين، موعد، رعاية صحية",
        "en": "Healthcare — use terms like: clinic, medical complex, insurance, appointment, care quality",
    },
    "retail": {
        "ar": "قطاع التجزئة — استخدم مصطلحات مثل: نقاط البيع، المخزون، تجربة العميل، موسم التخفيضات",
        "en": "Retail — use terms like: POS, inventory, customer experience, sales season",
    },
    "education": {
        "ar": "قطاع التعليم — استخدم مصطلحات مثل: تسجيل، رسوم دراسية، منهج، فصل دراسي",
        "en": "Education — use terms like: enrollment, tuition, curriculum, academic term",
    },
    "automotive": {
        "ar": "قطاع السيارات — استخدم مصطلحات مثل: معرض، وكالة، تمويل، صيانة، موديل",
        "en": "Automotive — use terms like: showroom, dealership, financing, maintenance, model",
    },
    "hospitality": {
        "ar": "قطاع الضيافة — استخدم مصطلحات مثل: حجز، جناح، باقة، تجربة ضيافة، موسم سياحي",
        "en": "Hospitality — use terms like: booking, suite, package, guest experience, peak season",
    },
}

# Saudi Arabia timezone: UTC+3
SAUDI_TZ_OFFSET = timedelta(hours=3)

# Optimal send windows (Saudi time, 24h)
SEND_WINDOWS = {
    "whatsapp": {"start": 9, "end": 21, "peak": [10, 14, 19]},
    "email": {"start": 8, "end": 17, "peak": [9, 11, 14]},
    "sms": {"start": 9, "end": 20, "peak": [10, 13, 18]},
}

# Saudi work week: Sunday (6) through Thursday (3)
SAUDI_WORK_DAYS = {6, 0, 1, 2, 3}  # Sunday=6, Mon=0, Tue=1, Wed=2, Thu=3


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class MessageWriter:
    """Generates personalized, culturally-aware sales messages."""

    def __init__(self):
        self._llm = get_llm()

    async def write_message(
        self,
        channel: str,
        tone: str,
        lead_data: dict,
        context: Optional[dict] = None,
        language: str = "ar",
    ) -> MessageDraft:
        """
        Generate a sales message with A/B variants.

        Args:
            channel: "whatsapp", "email", or "sms"
            tone: "formal", "friendly", "urgent", "follow_up"
            lead_data: {"name", "company", "industry", "stage", "city", "last_contact"}
            context: Optional {"deal_value", "product", "previous_topic", "objection"}
            language: "ar" or "en"

        Returns:
            MessageDraft with two A/B variants and send-time recommendation.
        """
        context = context or {}
        channel = channel.lower()
        tone = tone.lower()
        language = language.lower() if language else "ar"

        if channel not in CHANNEL_LIMITS:
            channel = "whatsapp"
        if tone not in TONE_INSTRUCTIONS:
            tone = "friendly"
        if language not in ("ar", "en"):
            language = "ar"

        # Build the prompt
        system_prompt = self._build_system_prompt(channel, tone, lead_data, context, language)
        user_prompt = self._build_user_prompt(channel, tone, lead_data, context, language)

        # Generate both variants in one LLM call
        try:
            response = await self._llm.complete(
                system_prompt=system_prompt,
                user_message=user_prompt,
                json_mode=True,
                temperature=0.7,
                max_tokens=2048,
            )
            parsed = response.parse_json()
            if parsed:
                variants = self._parse_variants(parsed, channel)
            else:
                raise ValueError("Failed to parse LLM response")
        except Exception as e:
            logger.warning(f"LLM message generation failed: {e}")
            variants = self._fallback_variants(channel, tone, lead_data, language)

        # Calculate best send time
        best_time, best_day = self._calculate_best_send_time(channel)

        # Track which personalization fields were used
        personalization = [
            k for k in ("name", "company", "industry", "city", "stage")
            if lead_data.get(k)
        ]

        return MessageDraft(
            channel=channel,
            language=language,
            tone=tone,
            variants=variants,
            best_send_time=best_time,
            best_send_day=best_day,
            personalization_used=personalization,
            metadata={
                "max_length": CHANNEL_LIMITS[channel],
                "lead_name": lead_data.get("name", ""),
                "industry": lead_data.get("industry", ""),
            },
        )

    # ── Prompt Construction ──────────────────────

    def _build_system_prompt(
        self, channel: str, tone: str, lead_data: dict, context: dict, language: str
    ) -> str:
        lang_key = language if language in ("ar", "en") else "ar"
        tone_instruction = TONE_INSTRUCTIONS.get(tone, TONE_INSTRUCTIONS["friendly"])[lang_key]

        industry = (lead_data.get("industry") or "").lower().replace(" ", "_")
        industry_note = ""
        if industry in INDUSTRY_CONTEXT:
            industry_note = INDUSTRY_CONTEXT[industry][lang_key]

        char_limit = CHANNEL_LIMITS[channel]

        if language == "ar":
            prompt = (
                "أنت كاتب رسائل مبيعات محترف متخصص في السوق السعودي.\n"
                f"القناة: {channel} (حد أقصى {char_limit} حرف)\n"
                f"النبرة: {tone_instruction}\n"
            )
            if industry_note:
                prompt += f"القطاع: {industry_note}\n"
            prompt += (
                "\nقواعد مهمة:\n"
                "- لا تستخدم لهجة مصرية أو شامية\n"
                "- استخدم 'ريال' للعملة\n"
                "- راعي ثقافة الأعمال السعودية\n"
                "- اكتب رسالتين مختلفتين (A و B) لاختبار A/B\n"
                "- الرسالة يجب أن تكون كاملة وجاهزة للإرسال\n"
            )
            if channel == "email":
                prompt += "- أضف عنوان بريد مناسب لكل رسالة\n"
        else:
            prompt = (
                "You are a professional sales message writer for the Saudi market.\n"
                f"Channel: {channel} (max {char_limit} characters)\n"
                f"Tone: {tone_instruction}\n"
            )
            if industry_note:
                prompt += f"Industry: {industry_note}\n"
            prompt += (
                "\nRules:\n"
                "- Write two different message variants (A and B) for A/B testing\n"
                "- Messages must be complete and ready to send\n"
                "- Be culturally aware of Saudi business norms\n"
            )
            if channel == "email":
                prompt += "- Include an email subject line for each variant\n"

        prompt += (
            "\nأجب بصيغة JSON فقط:\n"
            "{\n"
            '  "variant_a": {"content": "...", "subject": "..." },\n'
            '  "variant_b": {"content": "...", "subject": "..." }\n'
            "}\n"
            "subject مطلوب فقط للبريد الإلكتروني. للواتساب والرسائل اتركه فارغ."
        )
        return prompt

    def _build_user_prompt(
        self, channel: str, tone: str, lead_data: dict, context: dict, language: str
    ) -> str:
        name = lead_data.get("name", "العميل" if language == "ar" else "Customer")
        company = lead_data.get("company", "")
        industry = lead_data.get("industry", "")
        stage = lead_data.get("stage", "")
        city = lead_data.get("city", "")
        last_contact = lead_data.get("last_contact", "")

        deal_value = context.get("deal_value", "")
        product = context.get("product", "")
        previous_topic = context.get("previous_topic", "")
        objection = context.get("objection", "")

        if language == "ar":
            parts = [f"اكتب رسالة {channel} للعميل:"]
            parts.append(f"- الاسم: {name}")
            if company:
                parts.append(f"- الشركة: {company}")
            if industry:
                parts.append(f"- القطاع: {industry}")
            if stage:
                parts.append(f"- مرحلة البيع: {stage}")
            if city:
                parts.append(f"- المدينة: {city}")
            if last_contact:
                parts.append(f"- آخر تواصل: {last_contact}")
            if deal_value:
                parts.append(f"- قيمة الصفقة: {deal_value} ريال")
            if product:
                parts.append(f"- المنتج: {product}")
            if previous_topic:
                parts.append(f"- الموضوع السابق: {previous_topic}")
            if objection:
                parts.append(f"- اعتراض العميل: {objection}")
        else:
            parts = [f"Write a {channel} message for:"]
            parts.append(f"- Name: {name}")
            if company:
                parts.append(f"- Company: {company}")
            if industry:
                parts.append(f"- Industry: {industry}")
            if stage:
                parts.append(f"- Stage: {stage}")
            if city:
                parts.append(f"- City: {city}")
            if last_contact:
                parts.append(f"- Last contact: {last_contact}")
            if deal_value:
                parts.append(f"- Deal value: {deal_value} SAR")
            if product:
                parts.append(f"- Product: {product}")
            if previous_topic:
                parts.append(f"- Previous topic: {previous_topic}")
            if objection:
                parts.append(f"- Objection: {objection}")

        return "\n".join(parts)

    # ── Response Parsing ─────────────────────────

    def _parse_variants(self, parsed: dict, channel: str) -> list[MessageVariant]:
        """Parse LLM JSON response into MessageVariant objects."""
        variants = []
        char_limit = CHANNEL_LIMITS[channel]

        for key, label in [("variant_a", "A"), ("variant_b", "B")]:
            variant_data = parsed.get(key, {})
            if isinstance(variant_data, str):
                content = variant_data
                subject = None
            else:
                content = variant_data.get("content", "")
                subject = variant_data.get("subject") if channel == "email" else None

            # Truncate if over limit
            if len(content) > char_limit:
                content = content[:char_limit - 3] + "..."

            read_time = max(1, len(content) // 200 * 10)  # ~200 chars / 10 sec

            variants.append(MessageVariant(
                content=content,
                subject=subject,
                variant_label=label,
                estimated_read_time_sec=read_time,
            ))

        return variants

    def _fallback_variants(
        self, channel: str, tone: str, lead_data: dict, language: str
    ) -> list[MessageVariant]:
        """Generate basic fallback messages when LLM is unavailable."""
        name = lead_data.get("name", "")
        company = lead_data.get("company", "")

        if language == "ar":
            greeting = "السلام عليكم" if tone == "formal" else "هلا والله"
            if tone == "follow_up":
                text_a = f"{greeting} {name}، كيف حالك؟ حبيت أتابع معك بخصوص محادثتنا السابقة. هل عندك أي أسئلة؟"
                text_b = f"{greeting} {name}، يعطيك العافية! تواصلنا قبل وحبيت أشوف إذا تحتاج أي شي ثاني."
            elif tone == "urgent":
                text_a = f"{greeting} {name}، عندنا عرض خاص ينتهي قريب. تبي أرسل لك التفاصيل؟"
                text_b = f"{greeting} {name}، فرصة محدودة متاحة الحين. هل تحب نتكلم عنها؟"
            else:
                text_a = f"{greeting} {name}، يسعدنا تواصلك! كيف نقدر نساعدك اليوم؟"
                text_b = f"{greeting} {name}، حياك الله! عندنا حلول ممتازة تناسب احتياجاتك."
        else:
            if tone == "follow_up":
                text_a = f"Hi {name}, following up on our previous conversation. Do you have any questions?"
                text_b = f"Hello {name}, just checking in. Would you like to continue our discussion?"
            elif tone == "urgent":
                text_a = f"Hi {name}, we have a limited-time offer. Shall I share the details?"
                text_b = f"Hello {name}, a special opportunity is available now. Interested?"
            else:
                text_a = f"Hi {name}, great to connect! How can we help you today?"
                text_b = f"Hello {name}, we have solutions tailored to your needs. Let's chat!"

        return [
            MessageVariant(content=text_a, variant_label="A", estimated_read_time_sec=10),
            MessageVariant(content=text_b, variant_label="B", estimated_read_time_sec=10),
        ]

    # ── Send Time Calculation ────────────────────

    def _calculate_best_send_time(self, channel: str) -> tuple[str, str]:
        """Calculate best send time based on Saudi business hours."""
        now_utc = datetime.now(timezone.utc)
        now_saudi = now_utc + SAUDI_TZ_OFFSET

        window = SEND_WINDOWS.get(channel, SEND_WINDOWS["whatsapp"])
        peak_hours = window["peak"]

        # Find the next available peak hour
        current_hour = now_saudi.hour
        current_weekday = now_saudi.weekday()

        # Check today first
        if current_weekday in SAUDI_WORK_DAYS:
            for peak in peak_hours:
                if peak > current_hour:
                    best_time = f"{peak:02d}:00 (توقيت السعودية)"
                    day_names_ar = {
                        6: "الأحد", 0: "الاثنين", 1: "الثلاثاء",
                        2: "الأربعاء", 3: "الخميس",
                    }
                    best_day = day_names_ar.get(current_weekday, "اليوم")
                    return best_time, best_day

        # Next work day
        days_ahead = 1
        while days_ahead <= 7:
            next_day = (current_weekday + days_ahead) % 7
            if next_day in SAUDI_WORK_DAYS:
                best_time = f"{peak_hours[0]:02d}:00 (توقيت السعودية)"
                day_names_ar = {
                    6: "الأحد", 0: "الاثنين", 1: "الثلاثاء",
                    2: "الأربعاء", 3: "الخميس", 4: "الجمعة", 5: "السبت",
                }
                best_day = day_names_ar.get(next_day, "")
                return best_time, best_day
            days_ahead += 1

        return f"{peak_hours[0]:02d}:00 (توقيت السعودية)", "الأحد"
