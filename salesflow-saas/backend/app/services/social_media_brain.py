"""
Social Media AI Brain — Dealix AI Revenue OS
Unified brain for Instagram, TikTok, Twitter, and Snapchat.
Handles inbound DMs, content generation, and content calendar planning.
"""
import logging
from datetime import datetime, timezone, timedelta
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel

logger = logging.getLogger(__name__)


class Platform(str, Enum):
    INSTAGRAM = "instagram"
    TIKTOK = "tiktok"
    TWITTER = "twitter"
    SNAPCHAT = "snapchat"


PLATFORM_RULES = {
    Platform.INSTAGRAM: {"max_chars": 2200, "max_hashtags": 30, "name_ar": "إنستغرام"},
    Platform.TIKTOK: {"max_chars": 300, "max_hashtags": 5, "name_ar": "تيك توك"},
    Platform.TWITTER: {"max_chars": 280, "max_hashtags": 3, "name_ar": "تويتر"},
    Platform.SNAPCHAT: {"max_chars": 250, "max_hashtags": 0, "name_ar": "سناب شات"},
}

SAUDI_CONTENT_THEMES = [
    {"id": "vision_2030", "name_ar": "رؤية ٢٠٣٠ والتحول الرقمي", "hashtags_ar": ["#رؤية_السعودية_2030", "#تحول_رقمي"]},
    {"id": "smb_growth", "name_ar": "نمو المشاريع الصغيرة والمتوسطة", "hashtags_ar": ["#ريادة_أعمال", "#مشاريع_صغيرة"]},
    {"id": "ai_arabic", "name_ar": "الذكاء الاصطناعي بالعربي", "hashtags_ar": ["#ذكاء_اصطناعي", "#تقنية"]},
    {"id": "sales_tips", "name_ar": "نصائح المبيعات للسوق السعودي", "hashtags_ar": ["#مبيعات", "#CRM"]},
    {"id": "whatsapp_business", "name_ar": "واتساب للأعمال", "hashtags_ar": ["#واتساب_أعمال", "#تواصل"]},
]

DM_INTENT_KEYWORDS = {
    "pricing": ["سعر", "كم", "باقة", "price", "cost"],
    "demo": ["عرض", "demo", "تجربة", "وريني"],
    "support": ["مشكلة", "مساعدة", "help", "خطأ"],
    "partnership": ["شراكة", "تعاون", "partner"],
}


class ContentDraft(BaseModel):
    platform: str
    content: str
    hashtags: list[str] = []
    language: str = "ar"
    theme: str = ""
    created_at: datetime = None

    def __init__(self, **data):
        super().__init__(**data)
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)


class CalendarEntry(BaseModel):
    date: str
    platform: str
    theme: str
    content: ContentDraft
    time_slot: str = "10:00"


class SocialMediaBrain:
    """Unified brain for Instagram, TikTok, Twitter, Snapchat."""

    def __init__(self):
        from app.services.whatsapp_knowledge import DealixKnowledge
        self.knowledge = DealixKnowledge

    def _detect_dm_intent(self, message: str) -> str:
        msg_lower = message.lower()
        for intent, keywords in DM_INTENT_KEYWORDS.items():
            if any(kw in msg_lower for kw in keywords):
                return intent
        return "general"

    def _enforce_platform_limits(self, text: str, hashtags: list[str], platform: Platform) -> tuple[str, list[str]]:
        rules = PLATFORM_RULES[platform]
        hashtags = hashtags[:rules["max_hashtags"]]
        hashtag_text = " ".join(hashtags)
        max_content = rules["max_chars"] - len(hashtag_text) - 2 if hashtags else rules["max_chars"]
        if len(text) > max_content:
            text = text[:max_content - 3] + "..."
        return text, hashtags

    async def handle_inbound_dm(
        self, platform: str, sender: str, message: str, db: Any = None
    ) -> str:
        plat = Platform(platform) if platform in Platform.__members__.values() else Platform.INSTAGRAM
        intent = self._detect_dm_intent(message)
        plat_name = PLATFORM_RULES[plat]["name_ar"]
        logger.info(f"[SocialMediaBrain] DM on {plat.value} from={sender} intent={intent}")

        if intent == "pricing":
            pricing = self.knowledge.get_pricing_text("ar")
            return f"أهلاً! شكراً لتواصلك عبر {plat_name}.\n\nباقات Dealix:\n{pricing}\n\nتبي تفاصيل أكثر؟ راسلنا واتساب أو زور dealix.sa"

        if intent == "demo":
            return f"ممتاز! يسعدنا نعرض لك Dealix.\n\nاحجز عرض توضيحي مجاني (١٥ دقيقة): dealix.sa/demo\n\nأو أرسل رقمك ونتواصل معك واتساب."

        if intent == "support":
            return f"أهلاً! للدعم الفني الأسرع، تواصل معنا:\n• واتساب: dealix.sa/whatsapp\n• إيميل: support@dealix.sa\n\nأو وصف مشكلتك هنا وبنساعدك."

        if intent == "partnership":
            return "شكراً لاهتمامك بالشراكة مع Dealix!\n\nأرسل لنا إيميل على partners@dealix.sa أو واتساب ونرتب اجتماع."

        return f"أهلاً وسهلاً! أنا مساعد Dealix على {plat_name}.\n\nأقدر أساعدك في:\n• الأسعار والباقات\n• حجز عرض توضيحي\n• الدعم الفني\n\nوش تحتاج؟"

    async def generate_content(
        self, platform: str, topic: str, language: str = "ar"
    ) -> ContentDraft:
        plat = Platform(platform) if platform in Platform.__members__.values() else Platform.INSTAGRAM
        theme = next((t for t in SAUDI_CONTENT_THEMES if t["id"] == topic), SAUDI_CONTENT_THEMES[0])
        hashtags_base = theme["hashtags_ar"] + ["#Dealix"]

        if language == "ar":
            content_map = {
                Platform.INSTAGRAM: (
                    f"{theme['name_ar']}\n\n"
                    f"في السوق السعودي، الشركات اللي تستخدم أدوات ذكية تحقق نتائج أفضل.\n\n"
                    f"Dealix يساعدك:\n"
                    f"✅ إدارة عملاءك بالواتساب\n"
                    f"✅ ذكاء اصطناعي يفهم عربي\n"
                    f"✅ تقارير وتنبؤات مبيعات\n\n"
                    f"جرّب مجاناً ١٤ يوم — الرابط بالبايو"
                ),
                Platform.TIKTOK: f"{theme['name_ar']}\n\nDealix — نظام مبيعات ذكي للسوق السعودي. جرّب مجاناً!",
                Platform.TWITTER: f"{theme['name_ar']}\n\nDealix: واتساب CRM + AI عربي للشركات السعودية. جرّب مجاناً ١٤ يوم.",
                Platform.SNAPCHAT: f"{theme['name_ar']}\n\nDealix — نظام مبيعاتك الذكي. جرّبه مجاناً!",
            }
        else:
            content_map = {
                Platform.INSTAGRAM: f"{theme['name_ar']}\n\nSmart companies in Saudi use AI-powered tools.\n\nDealix helps you:\n✅ WhatsApp CRM\n✅ Arabic AI\n✅ Sales forecasting\n\nTry free for 14 days — link in bio",
                Platform.TIKTOK: f"{theme['name_ar']}\n\nDealix — smart sales for Saudi. Try free!",
                Platform.TWITTER: f"{theme['name_ar']}\n\nDealix: WhatsApp CRM + Arabic AI for Saudi companies. 14-day free trial.",
                Platform.SNAPCHAT: f"{theme['name_ar']}\n\nDealix — your smart sales system. Try free!",
            }

        raw_content = content_map.get(plat, content_map[Platform.INSTAGRAM])
        final_content, final_hashtags = self._enforce_platform_limits(raw_content, hashtags_base, plat)

        return ContentDraft(
            platform=plat.value, content=final_content, hashtags=final_hashtags,
            language=language, theme=topic,
        )

    async def generate_content_calendar(
        self, platforms: list[str], days: int = 7, language: str = "ar"
    ) -> list[CalendarEntry]:
        calendar = []
        time_slots = {"instagram": "10:00", "tiktok": "18:00", "twitter": "08:00", "snapchat": "14:00"}
        today = datetime.now(timezone.utc).date()

        for day_offset in range(days):
            target_date = today + timedelta(days=day_offset)
            theme = SAUDI_CONTENT_THEMES[day_offset % len(SAUDI_CONTENT_THEMES)]

            for plat_str in platforms:
                content = await self.generate_content(plat_str, theme["id"], language)
                calendar.append(CalendarEntry(
                    date=target_date.isoformat(), platform=plat_str,
                    theme=theme["id"], content=content,
                    time_slot=time_slots.get(plat_str, "10:00"),
                ))

        logger.info(f"[SocialMediaBrain] generated {len(calendar)} calendar entries for {days} days")
        return calendar


# Global singleton
social_media_brain = SocialMediaBrain()
