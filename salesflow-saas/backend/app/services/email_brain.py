"""
Email AI Brain — Dealix AI Revenue OS
Handles inbound email classification, outreach generation, and nurture sequences.
Arabic-first with full bilingual support.
"""
import logging
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class EmailIntent(str, Enum):
    INQUIRY = "inquiry"
    SUPPORT = "support"
    COMPLAINT = "complaint"
    PARTNERSHIP = "partnership"
    UNSUBSCRIBE = "unsubscribe"
    REPLY = "reply"
    SPAM = "spam"
    GENERAL = "general"


class EmailDraft(BaseModel):
    subject: str
    body: str
    language: str = "ar"
    campaign_type: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


INTENT_SIGNALS = {
    "inquiry": ["أبي أعرف", "استفسار", "سعر", "باقة", "pricing", "interested", "demo"],
    "support": ["مشكلة", "مساعدة", "خطأ", "bug", "help", "not working", "error"],
    "complaint": ["شكوى", "زعلان", "سيء", "complaint", "terrible", "disappointed"],
    "partnership": ["شراكة", "تعاون", "partner", "collaboration", "reseller"],
    "unsubscribe": ["إلغاء", "unsubscribe", "أوقف", "remove", "stop"],
}

ARABIC_TEMPLATES = {
    "cold_intro": EmailDraft(
        subject="Dealix — نظام المبيعات الذكي للسوق السعودي",
        body=(
            "السلام عليكم {name}،\n\nأنا {sender_name} من فريق Dealix.\n\n"
            "لاحظنا أن {company} تعمل في قطاع {sector} — وهو بالضبط القطاع اللي نخدمه.\n\n"
            "Dealix نظام مبيعات ذكي مصمم للسعودية: واتساب مدمج، ذكاء اصطناعي يفهم عربي، "
            "وحماية بيانات PDPL.\n\nتبي نعطيك عرض سريع ١٥ دقيقة؟\n\nمع التحية،\n{sender_name}\nفريق Dealix"
        ),
    ),
    "follow_up_1": EmailDraft(
        subject="متابعة — هل شفت رسالتنا الأولى؟",
        body=(
            "أهلاً {name}،\n\nأرسلت لك قبل كم يوم عن Dealix. حبيت أتابع معك.\n\n"
            "عملاؤنا في {sector} حققوا:\n• زيادة ٤٠٪ في معدل الإغلاق\n"
            "• توفير ١٠ ساعات أسبوعياً\n• تحسين متابعة العملاء ١٠٠٪\n\n"
            "تقدر تجرب مجاناً ١٤ يوم بدون بطاقة.\n\nمع التحية،\n{sender_name}"
        ),
    ),
    "follow_up_2": EmailDraft(
        subject="آخر متابعة — فرصة مجانية لتجربة Dealix",
        body=(
            "أهلاً {name}،\n\nأعرف إنك مشغول. بس حبيت أذكرك إن التجربة المجانية متاحة.\n\n"
            "رابط التسجيل: dealix.sa/trial\nيأخذ أقل من دقيقة.\n\n"
            "لو ما يناسبك الوقت الحين، رد بـ 'لاحقاً' وبأتواصل معك الشهر الجاي.\n\nمع التحية،\n{sender_name}"
        ),
    ),
    "demo_invite": EmailDraft(
        subject="موعد العرض التوضيحي لـ Dealix",
        body=(
            "أهلاً {name}،\n\nشكراً لاهتمامك بـ Dealix!\n\n"
            "حجزنا لك عرض توضيحي:\n📅 {demo_date}\n⏰ {demo_time}\n🔗 {demo_link}\n\n"
            "العرض يستغرق ١٥ دقيقة ويغطي:\n• إدارة العملاء عبر الواتساب\n"
            "• تقييم العملاء بالذكاء الاصطناعي\n• عروض الأسعار التلقائية\n\nنتطلع لمقابلتك!\n{sender_name}"
        ),
    ),
    "proposal": EmailDraft(
        subject="عرض Dealix المخصص لـ {company}",
        body=(
            "أستاذ/ة {name}،\n\nبناءً على محادثتنا، حضّرنا لكم عرض مخصص:\n\n"
            "الباقة: {plan_name}\nالسعر: {price} ر.س/شهر\nعدد المستخدمين: {users}\n\n"
            "المميزات المشمولة:\n{features}\n\nالعرض صالح لمدة ٧ أيام.\n"
            "للموافقة: {approval_link}\n\nمع التحية،\n{sender_name}"
        ),
    ),
    "welcome": EmailDraft(
        subject="مرحباً بك في Dealix!",
        body=(
            "أهلاً {name}،\n\nمبروك! حسابك جاهز على Dealix.\n\n"
            "خطواتك الأولى:\n١. ادخل: dealix.sa/dashboard\n٢. أضف أول عميل\n"
            "٣. ربط الواتساب\n٤. أرسل أول رسالة ذكية\n\n"
            "لو تحتاج مساعدة، كلمنا واتساب أو إيميل support@dealix.sa.\n\nيلا نبدأ!\nفريق Dealix"
        ),
    ),
    "commission_report": EmailDraft(
        subject="تقرير عمولاتك الأسبوعي — {period}",
        body=(
            "أهلاً {name}،\n\nهذا تقرير عمولاتك لهذا الأسبوع:\n\n"
            "إجمالي العمولة: {total_commission} ر.س\nعملاء جدد: {new_clients}\n"
            "مستواك: {tier}\nترتيبك: #{rank}\n\n"
            "تفاصيل كاملة: dealix.sa/dashboard/commissions\n\nاستمر!\nفريق Dealix"
        ),
    ),
    "partnership_intro": EmailDraft(
        subject="فرصة شراكة مع Dealix — {partnership_type}",
        body=(
            "السلام عليكم {name}،\n\nنحن في Dealix نبحث عن شركاء استراتيجيين في {sector}.\n\n"
            "نقدم:\n• عمولات تنافسية تبدأ من ١٥٪\n• دعم تقني ومبيعاتي كامل\n"
            "• لوحة تحكم شريك مخصصة\n• مواد تسويقية جاهزة\n\n"
            "هل عندك وقت لمكالمة ١٥ دقيقة هذا الأسبوع؟\n\nمع التحية،\n{sender_name}\nمدير الشراكات — Dealix"
        ),
    ),
}


class EmailBrain:
    """Central brain for Dealix email — classifies inbound and generates outreach."""

    def __init__(self):
        from app.services.whatsapp_knowledge import DealixKnowledge
        self.knowledge = DealixKnowledge

    def _detect_intent(self, subject: str, body: str) -> EmailIntent:
        combined = f"{subject} {body}".lower()
        for intent, keywords in INTENT_SIGNALS.items():
            if any(kw in combined for kw in keywords):
                return EmailIntent(intent)
        return EmailIntent.GENERAL

    async def handle_inbound(
        self, email_from: str, subject: str, body: str, db: Any = None
    ) -> EmailDraft:
        intent = self._detect_intent(subject, body)
        logger.info(f"[EmailBrain] inbound from={email_from} intent={intent.value}")

        if intent == EmailIntent.UNSUBSCRIBE:
            return EmailDraft(
                subject="تأكيد إلغاء الاشتراك",
                body="أهلاً،\n\nتم إلغاء اشتراكك في رسائل Dealix البريدية.\nلو غيّرت رأيك، تقدر تشترك مرة ثانية من dealix.sa.\n\nمع التحية،\nفريق Dealix",
            )
        if intent == EmailIntent.COMPLAINT:
            ticket = f"TKT-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M')}"
            return EmailDraft(
                subject="استلمنا شكواك — سنتابع فوراً",
                body=f"أهلاً،\n\nشكراً لتواصلك. نعتذر عن أي إزعاج.\nفريقنا سيتابع شكواك خلال ٤ ساعات عمل.\nرقم التذكرة: {ticket}\n\nمع التحية،\nفريق دعم Dealix",
            )
        if intent == EmailIntent.INQUIRY:
            pricing = self.knowledge.get_pricing_text("ar")
            return EmailDraft(
                subject="مرحباً — هذي تفاصيل Dealix",
                body=f"أهلاً،\n\nشكراً لاهتمامك بـ Dealix!\n\nالباقات المتاحة:\n{pricing}\n\nكل الباقات فيها تجربة مجانية ١٤ يوم.\nتبي نحجز لك عرض توضيحي؟\n\nمع التحية،\nفريق Dealix",
            )
        if intent == EmailIntent.PARTNERSHIP:
            return EmailDraft(
                subject="شكراً لاهتمامك بالشراكة مع Dealix",
                body="أهلاً،\n\nشكراً لتواصلك بخصوص الشراكة.\nفريق الشراكات سيتواصل معك خلال ٢٤ ساعة لمناقشة الفرص.\n\nمع التحية،\nفريق Dealix",
            )
        if intent == EmailIntent.SUPPORT:
            return EmailDraft(
                subject="استلمنا طلب الدعم — سنرد قريباً",
                body="أهلاً،\n\nشكراً لتواصلك. فريق الدعم سيرد خلال ٤ ساعات عمل.\nللدعم العاجل: واتساب support@dealix.sa\n\nمع التحية،\nفريق دعم Dealix",
            )
        return EmailDraft(
            subject="شكراً لتواصلك مع Dealix",
            body="أهلاً،\n\nشكراً لرسالتك! فريقنا سيرد عليك قريباً.\nلو تحتاج رد أسرع، كلمنا واتساب.\n\nمع التحية،\nفريق Dealix",
        )

    async def generate_outreach(
        self, lead: dict, campaign_type: str = "cold_intro", language: str = "ar"
    ) -> EmailDraft:
        template = ARABIC_TEMPLATES.get(campaign_type, ARABIC_TEMPLATES["cold_intro"])
        filled_body = template.body
        for key, val in lead.items():
            filled_body = filled_body.replace("{" + key + "}", str(val))
        filled_subject = template.subject
        for key, val in lead.items():
            filled_subject = filled_subject.replace("{" + key + "}", str(val))
        return EmailDraft(subject=filled_subject, body=filled_body, language=language, campaign_type=campaign_type)

    async def generate_nurture_sequence(self, lead: dict, db: Any = None) -> list[EmailDraft]:
        sequence_keys = ["cold_intro", "follow_up_1", "follow_up_2", "demo_invite", "proposal"]
        return [await self.generate_outreach(lead, key) for key in sequence_keys]

    def get_template(self, template_name: str) -> Optional[EmailDraft]:
        return ARABIC_TEMPLATES.get(template_name)

    def list_templates(self) -> list[str]:
        return list(ARABIC_TEMPLATES.keys())


# Global singleton
email_brain = EmailBrain()
