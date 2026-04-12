"""
WhatsApp Knowledge Base — Dealix AI Revenue OS
Complete knowledge the WhatsApp brain uses to respond intelligently.
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class DealixKnowledge:
    """Everything the WhatsApp brain needs to know."""

    FEATURES = {
        "whatsapp_crm": {
            "name_ar": "إدارة العملاء عبر الواتساب",
            "name_en": "WhatsApp CRM",
            "desc_ar": "تواصل مع عملاءك مباشرة من الواتساب مع تتبع كامل للمحادثات",
            "selling_points_ar": [
                "رد تلقائي ذكي بالعربي",
                "تتبع كل محادثة",
                "إشعارات فورية عند رد العميل",
            ],
        },
        "ai_scoring": {
            "name_ar": "تقييم عملاء بالذكاء الاصطناعي",
            "name_en": "AI Lead Scoring",
            "desc_ar": "النظام يقيّم كل عميل من ٠ لـ ١٠٠ ويقولك مين الأهم",
            "selling_points_ar": [
                "تقييم تلقائي مع كل تفاعل",
                "يفهم المحادثات العربية",
                "توصيات متابعة بالعربي",
            ],
        },
        "pipeline": {
            "name_ar": "مسار صفقات بصري",
            "name_en": "Visual Pipeline",
            "desc_ar": "شوف كل صفقاتك بنظرة واحدة وحركها بالسحب",
            "selling_points_ar": ["Kanban بصري", "٥ مراحل", "drag-and-drop"],
        },
        "cpq": {
            "name_ar": "عروض أسعار احترافية",
            "name_en": "Quotes & Proposals",
            "desc_ar": "أنشئ عروض أسعار بالعربي مع ضريبة القيمة المضافة تلقائياً",
            "selling_points_ar": ["ضريبة ١٥٪ تلقائي", "إرسال بالواتساب", "تتبع القبول"],
        },
        "pdpl": {
            "name_ar": "حماية البيانات PDPL",
            "name_en": "PDPL Compliance",
            "desc_ar": "متوافق مع نظام حماية البيانات الشخصية السعودي",
            "selling_points_ar": ["موافقات تلقائية", "حقوق بيانات", "audit trail"],
        },
        "deal_exchange": {
            "name_ar": "صفقات استراتيجية",
            "name_en": "Strategic Deals",
            "desc_ar": "اكتشف شركاء وصفقات متبادلة — تبادل خدمات، شراكات، توزيع",
            "selling_points_ar": ["١٥ نوع صفقة", "مطابقة ذكية", "مفاوض AI"],
        },
    }

    PRICING = {
        "starter": {
            "name_ar": "المبتدئ",
            "price": 59,
            "features_ar": ["٣ مستخدمين", "٥٠٠ عميل", "واتساب أساسي", "تقارير أساسية"],
            "best_for_ar": "الشركات الصغيرة والفردية",
        },
        "professional": {
            "name_ar": "الاحترافي",
            "price": 149,
            "features_ar": [
                "١٠ مستخدمين", "عملاء لا محدود", "تقييم AI",
                "تسلسلات تلقائية", "عروض أسعار", "تقارير متقدمة",
            ],
            "best_for_ar": "الشركات المتوسطة وفرق المبيعات",
            "popular": True,
        },
        "enterprise": {
            "name_ar": "المؤسسي",
            "price": 225,
            "features_ar": [
                "مستخدمين لا محدود", "وكيل مبيعات AI", "صفقات استراتيجية",
                "API كامل", "دعم مخصص",
            ],
            "best_for_ar": "الشركات الكبيرة والمؤسسات",
        },
    }

    OBJECTION_RESPONSES = {
        "expensive": {
            "ar": "أفهم — لكن ٥٩ ر.س أقل من فاتورة كابتشينو أسبوعية. وصفقة وحدة ضايعة بسبب عدم المتابعة تكلف أضعاف. جرّبه مجاناً ١٤ يوم وشوف بنفسك.",
            "en": "I understand — but 59 SAR is less than weekly cappuccinos. One lost deal due to poor follow-up costs much more. Try it free for 14 days.",
        },
        "already_have_crm": {
            "ar": "ممتاز! وش تستخدم حالياً؟ كثير من عملاءنا انتقلوا من أنظمة أجنبية لأن Dealix مصمم للسوق السعودي — عربي أولاً، واتساب مدمج، PDPL جاهز.",
            "en": "Great! What are you using? Many clients switched because Dealix is built for Saudi — Arabic-first, WhatsApp native, PDPL ready.",
        },
        "need_to_think": {
            "ar": "أكيد، خذ وقتك. بس حبيت أذكرك إن التجربة مجانية ١٤ يوم بدون بطاقة — تقدر تجرب وتقرر بعدها.",
            "en": "Sure, take your time. Just remember — 14-day free trial, no credit card needed.",
        },
        "too_complex": {
            "ar": "بالعكس! Dealix مصمم ليكون بسيط جداً — أغلب العملاء يبدون يستخدمونه بأقل من ٥ دقائق. وعندنا دعم بالعربي يساعدك.",
            "en": "Actually the opposite! Most clients start using it in under 5 minutes. And we have Arabic support.",
        },
        "small_team": {
            "ar": "حتى لو شخص واحد! باقة المبتدئ ٥٩ ر.س تكفي. والنظام يساعدك تتابع عملاءك بدون ما تحتاج فريق كبير.",
            "en": "Even for one person! Starter plan at 59 SAR is enough. The system helps you follow up without needing a big team.",
        },
        "no_budget": {
            "ar": "أفهم. التجربة مجانية ١٤ يوم — جربها وشوف كم صفقة تقدر تكسب. الاستثمار يرجع لك أضعاف.",
            "en": "I understand. 14-day free trial — try it and see how many deals you can win. The ROI speaks for itself.",
        },
        "competitor_better": {
            "ar": "كل نظام له مميزاته. لكن Dealix الوحيد المصمم للسعودية: عربي أولاً، واتساب مدمج، AI يفهم سعودي. تبي أوريك المقارنة؟",
            "en": "Every system has its strengths. But Dealix is the only one built for Saudi: Arabic-first, WhatsApp native, Saudi-aware AI. Want to see the comparison?",
        },
        "not_now": {
            "ar": "تمام! أقدر أرسل لك ملخص سريع عن Dealix وتشوفه لما يناسبك. وش إيميلك؟",
            "en": "No problem! I can send you a quick summary to review when it suits you. What's your email?",
        },
    }

    COMPETITOR_CARDS = {
        "zoho": {
            "name": "Zoho CRM",
            "we_win": [
                "عربي أولاً (مو ترجمة)", "واتساب مدمج (مو إضافة)",
                "AI يفهم اللهجة السعودية", "PDPL مدمج بالنظام",
                "صفقات استراتيجية (لا يوجد عندهم)", "دعم سعودي مباشر",
            ],
            "they_win": ["نظام أكبر وأقدم", "تكاملات أكثر", "سيرفرات سعودية"],
            "response_ar": "Zoho نظام ممتاز ومعروف. لكن الفرق إن Dealix مبني من الأساس للسوق السعودي — مو ترجمة لنظام أجنبي. واتساب عندنا مدمج، الذكاء الاصطناعي يفهم عربي، وPDPL جاهز. وبسعر مقارب.",
        },
        "salesforce": {
            "name": "Salesforce",
            "we_win": [
                "عربي بالكامل", "سعر أقل ١٠ مرات", "واتساب مدمج",
                "بسيط وسريع (مو ٦ أشهر تطبيق)", "PDPL جاهز",
            ],
            "they_win": ["أكبر نظام CRM بالعالم", "آلاف التكاملات", "enterprise-grade"],
            "response_ar": "Salesforce نظام عملاق — لكن يحتاج ٦ أشهر تطبيق ومئات الآلاف. Dealix يشتغل بأقل من ٥ دقائق، عربي بالكامل، وبسعر يبدأ من ٥٩ ر.س. للشركات السعودية الصغيرة والمتوسطة، Dealix الخيار الأذكى.",
        },
        "hubspot": {
            "name": "HubSpot",
            "we_win": [
                "عربي أولاً", "واتساب مدمج", "AI عربي",
                "سعر أقل بكثير", "PDPL مدمج", "صفقات استراتيجية",
            ],
            "they_win": ["marketing hub قوي", "content management", "brand أكبر"],
            "response_ar": "HubSpot ممتاز للتسويق الرقمي. لكن للمبيعات في السوق السعودي، Dealix أقوى: واتساب مدمج، AI يفهم عربي، وPDPL جاهز. وبسعر أقل بكثير.",
        },
    }

    FAQ = [
        {"q_ar": "كم سعر Dealix؟", "a_ar": "يبدأ من ٥٩ ر.س/شهر. الاحترافي ١٤٩ ر.س، المؤسسي ٢٢٥ ر.س. وفيه تجربة مجانية ١٤ يوم."},
        {"q_ar": "هل يدعم الواتساب؟", "a_ar": "نعم! واتساب مدمج بالنظام — ترسل وتستقبل وتتابع كل المحادثات من مكان واحد."},
        {"q_ar": "هل يدعم العربي؟", "a_ar": "نعم! Dealix مبني عربي أولاً — الواجهة والتقارير والذكاء الاصطناعي كلها بالعربي."},
        {"q_ar": "هل هو آمن؟", "a_ar": "نعم. متوافق مع نظام حماية البيانات PDPL، تشفير SSL، وسيرفرات سعودية."},
        {"q_ar": "هل فيه تجربة مجانية؟", "a_ar": "نعم! ١٤ يوم تجربة مجانية كاملة — بدون بطاقة ائتمانية."},
        {"q_ar": "كيف أبدأ؟", "a_ar": "ادخل dealix.sa واضغط 'ابدأ مجاناً'. التسجيل يأخذ أقل من دقيقة."},
        {"q_ar": "هل يناسب شركتي الصغيرة؟", "a_ar": "أكيد! باقة المبتدئ ٥٩ ر.س مصممة للشركات الصغيرة. حتى لو شخص واحد."},
        {"q_ar": "هل يدعم الإنجليزي بعد؟", "a_ar": "نعم! تقدر تبدل بين العربي والإنجليزي بضغطة زر."},
        {"q_ar": "كيف أتواصل مع الدعم؟", "a_ar": "واتساب أو إيميل support@dealix.sa — نرد خلال ٤ ساعات عمل."},
        {"q_ar": "هل فيه تطبيق جوال؟", "a_ar": "الموقع متجاوب ويشتغل بشكل ممتاز على الجوال. تطبيق مخصص قريباً إن شاء الله."},
    ]

    MARKETER_FAQ = [
        {"q_ar": "كيف أسجل كمسوّق؟", "a_ar": "ادخل dealix.sa/marketers واضغط 'سجّل كمسوّق'. التسجيل مجاني ويتفعل فوراً."},
        {"q_ar": "كم العمولة؟", "a_ar": "تبدأ من ١٠٪ (برونزي) وتوصل ٢٠٪ (ذهبي). كل ما زاد عدد العملاء زادت نسبتك."},
        {"q_ar": "متى تنزل العمولة؟", "a_ar": "كل يوم أحد تتحول العمولات لحسابك البنكي."},
        {"q_ar": "كيف أتابع أدائي؟", "a_ar": "من لوحة التحكم تشوف كل شي: عملاء، عمولات، مستواك، وروابط التتبع."},
        {"q_ar": "هل فيه حد أقصى للعمولة؟", "a_ar": "لا! ما فيه حد — كل ما زاد عدد العملاء زادت عمولتك."},
    ]

    @classmethod
    def get_pricing_text(cls, language: str = "ar") -> str:
        lines = []
        for key, plan in cls.PRICING.items():
            name = plan["name_ar"] if language == "ar" else key.title()
            price = plan["price"]
            features = " | ".join(plan["features_ar"][:3])
            popular = " ⭐" if plan.get("popular") else ""
            lines.append(f"{'🟢' if key == 'starter' else '🔵' if key == 'professional' else '🟣'} {name} — {price} ر.س/شهر{popular}\n   {features}")
        return "\n\n".join(lines)

    @classmethod
    def search_faq(cls, query: str) -> Optional[str]:
        query_lower = query.lower()
        for faq in cls.FAQ:
            if any(word in faq["q_ar"] for word in query_lower.split() if len(word) > 2):
                return faq["a_ar"]
        return None

    @classmethod
    def get_competitor_response(cls, competitor: str) -> Optional[str]:
        card = cls.COMPETITOR_CARDS.get(competitor.lower())
        return card["response_ar"] if card else None

    @classmethod
    def get_objection_response(cls, objection_type: str, language: str = "ar") -> Optional[str]:
        obj = cls.OBJECTION_RESPONSES.get(objection_type)
        return obj[language] if obj else None
