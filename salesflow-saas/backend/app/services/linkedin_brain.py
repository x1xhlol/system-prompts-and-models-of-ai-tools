"""
LinkedIn AI Brain — Dealix AI Revenue OS
ASSIST MODE ONLY: generates drafts for human review, never auto-sends.
All outputs are suggestions — the operator approves before sending.
"""
import logging
from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel

logger = logging.getLogger(__name__)

MAX_CONNECTION_REQUEST = 300
MAX_INMAIL = 1900


class LinkedInDraft(BaseModel):
    draft_type: str  # connection_request, inmail, post, comment
    content: str
    target_name: str = ""
    target_company: str = ""
    language: str = "ar"
    status: str = "pending_review"  # always starts as pending
    created_at: datetime = None

    def __init__(self, **data):
        super().__init__(**data)
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)


class OutreachTask(BaseModel):
    task_type: str  # send_connection, send_inmail, engage_post
    target: dict
    draft: LinkedInDraft
    priority: int = 0
    status: str = "queued"


ARABIC_PURPOSES = {
    "sales": "نبي نعرفك على Dealix — نظام مبيعات ذكي للسوق السعودي",
    "partnership": "نبحث عن شراكة استراتيجية مع {company}",
    "hiring": "عندنا فرصة في Dealix ممكن تناسب خبرتك",
    "networking": "يسعدني التواصل مع محترفين في مجال {title}",
}

POST_TOPICS_AR = {
    "saudi_digital": "التحول الرقمي في السعودية",
    "ai_sales": "الذكاء الاصطناعي في المبيعات",
    "crm_tips": "نصائح إدارة علاقات العملاء",
    "startup_growth": "نمو الشركات الناشئة السعودية",
    "vision_2030": "رؤية ٢٠٣٠ والتقنية",
}


class LinkedInBrain:
    """Assist-mode LinkedIn brain — drafts only, never auto-sends."""

    def __init__(self):
        from app.services.whatsapp_knowledge import DealixKnowledge
        self.knowledge = DealixKnowledge

    async def draft_connection_request(
        self, name: str, title: str, company: str, purpose: str = "sales", lang: str = "ar"
    ) -> str:
        purpose_text = ARABIC_PURPOSES.get(purpose, ARABIC_PURPOSES["networking"])
        purpose_text = purpose_text.format(company=company, title=title)

        if lang == "ar":
            draft = f"أهلاً {name}! {purpose_text}. يسعدني نتواصل ونتبادل الأفكار."
        else:
            draft = f"Hi {name}! I'd love to connect — {purpose_text.replace(company, company)}. Looking forward to exchanging ideas."

        if len(draft) > MAX_CONNECTION_REQUEST:
            draft = draft[:MAX_CONNECTION_REQUEST - 3] + "..."
        logger.info(f"[LinkedInBrain] drafted connection request for {name} @ {company}")
        return draft

    async def draft_inmail(self, profile: dict, deal_type: str = "sales", lang: str = "ar") -> str:
        name = profile.get("name", "")
        title = profile.get("title", "")
        company = profile.get("company", "")

        if deal_type == "partnership":
            template = ARABIC_PURPOSES["partnership"].format(company=company, title=title)
            body = f"السلام عليكم {name},\n\n{template}.\n\nDealix يدعم ١٥ نوع صفقة استراتيجية — من تبادل خدمات للتوزيع والشراكات التقنية.\n\nهل عندك ١٠ دقائق نتكلم؟\n\nمع التحية"
        elif deal_type == "hiring":
            body = f"أهلاً {name},\n\nشفت بروفايلك وخبرتك في {title} — عندنا فرصة في Dealix ممكن تناسبك.\n\nنبني نظام مبيعات ذكي للسوق السعودي ونبحث عن كفاءات مميزة.\n\nتحب نتكلم أكثر؟\n\nمع التحية"
        else:
            pricing = "يبدأ من ٢٩٩ ر.س/شهر"
            body = f"السلام عليكم {name},\n\nأتواصل معك لأن {company} ممكن تستفيد من Dealix — نظام المبيعات الذكي للسوق السعودي.\n\n• واتساب CRM مدمج\n• ذكاء اصطناعي يفهم عربي\n• {pricing}\n\nتبي عرض سريع ١٥ دقيقة؟\n\nمع التحية"

        if lang != "ar":
            body = f"Hi {name},\n\nI'm reaching out because {company} could benefit from Dealix — the smart CRM built for Saudi Arabia.\n\n• WhatsApp-native CRM\n• Arabic AI\n• Starts at 299 SAR/mo\n\nWould you have 15 minutes for a quick demo?\n\nBest regards"

        return body[:MAX_INMAIL]

    async def draft_post(self, topic: str, audience: str = "business", lang: str = "ar") -> str:
        topic_ar = POST_TOPICS_AR.get(topic, topic)

        if lang == "ar":
            return (
                f"موضوع اليوم: {topic_ar}\n\n"
                f"في السوق السعودي، الشركات اللي تستخدم أدوات ذكية تحقق نتائج أفضل بـ ٤٠٪.\n\n"
                f"ثلاث نصائح سريعة:\n"
                f"١. استخدم الواتساب كقناة بيع رئيسية\n"
                f"٢. فعّل الذكاء الاصطناعي للتقييم التلقائي\n"
                f"٣. تابع عملاءك بالعربي — يفرق!\n\n"
                f"وش رأيكم؟ شاركوني تجربتكم.\n\n"
                f"#Dealix #مبيعات #السعودية #تقنية #CRM"
            )
        return (
            f"Today's topic: {topic_ar}\n\n"
            f"In the Saudi market, companies using smart tools see 40% better results.\n\n"
            f"3 quick tips:\n1. Use WhatsApp as your main sales channel\n"
            f"2. Enable AI for automatic lead scoring\n3. Follow up in Arabic — it matters!\n\n"
            f"What do you think? Share your experience.\n\n#Dealix #Sales #SaudiArabia #CRM"
        )

    async def generate_outreach_queue(
        self, criteria: dict, db: Any = None
    ) -> list[OutreachTask]:
        targets = criteria.get("targets", [])
        purpose = criteria.get("purpose", "sales")
        lang = criteria.get("language", "ar")
        tasks = []

        for i, target in enumerate(targets[:50]):
            name = target.get("name", "")
            title = target.get("title", "")
            company = target.get("company", "")

            conn_text = await self.draft_connection_request(name, title, company, purpose, lang)
            draft = LinkedInDraft(
                draft_type="connection_request", content=conn_text,
                target_name=name, target_company=company, language=lang,
            )
            tasks.append(OutreachTask(
                task_type="send_connection", target=target, draft=draft, priority=i,
            ))
        logger.info(f"[LinkedInBrain] generated {len(tasks)} outreach tasks for review")
        return tasks


# Global singleton
linkedin_brain = LinkedInBrain()
