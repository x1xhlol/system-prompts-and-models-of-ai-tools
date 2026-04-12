"""
Comparison Engine — Dealix AI Revenue OS
Competitive comparison data for charts, WhatsApp responses, and sales tools.
"""
import logging
from typing import Any

logger = logging.getLogger(__name__)

# Score scale: 0-10 per dimension
COMPETITORS = {
    "dealix": {
        "name": "Dealix", "name_ar": "ديلكس",
        "scores": {
            "arabic_support": 10, "whatsapp_native": 10, "ai_scoring": 9,
            "pdpl_compliance": 10, "pricing_value": 9, "ease_of_use": 9,
            "saudi_market_fit": 10, "deal_exchange": 10, "strategic_deals": 10,
            "multi_channel": 9, "reporting": 8, "integrations": 7,
        },
    },
    "zoho": {
        "name": "Zoho CRM", "name_ar": "زوهو",
        "scores": {
            "arabic_support": 7, "whatsapp_native": 6, "ai_scoring": 6,
            "pdpl_compliance": 5, "pricing_value": 8, "ease_of_use": 7,
            "saudi_market_fit": 6, "deal_exchange": 2, "strategic_deals": 1,
            "multi_channel": 7, "reporting": 8, "integrations": 9,
        },
    },
    "salesforce": {
        "name": "Salesforce", "name_ar": "سيلزفورس",
        "scores": {
            "arabic_support": 3, "whatsapp_native": 2, "ai_scoring": 8,
            "pdpl_compliance": 4, "pricing_value": 3, "ease_of_use": 4,
            "saudi_market_fit": 4, "deal_exchange": 1, "strategic_deals": 2,
            "multi_channel": 7, "reporting": 10, "integrations": 10,
        },
    },
    "hubspot": {
        "name": "HubSpot", "name_ar": "هب سبوت",
        "scores": {
            "arabic_support": 2, "whatsapp_native": 3, "ai_scoring": 7,
            "pdpl_compliance": 3, "pricing_value": 5, "ease_of_use": 8,
            "saudi_market_fit": 3, "deal_exchange": 1, "strategic_deals": 1,
            "multi_channel": 8, "reporting": 8, "integrations": 9,
        },
    },
    "pipedrive": {
        "name": "Pipedrive", "name_ar": "بايب درايف",
        "scores": {
            "arabic_support": 2, "whatsapp_native": 1, "ai_scoring": 5,
            "pdpl_compliance": 2, "pricing_value": 7, "ease_of_use": 9,
            "saudi_market_fit": 2, "deal_exchange": 0, "strategic_deals": 0,
            "multi_channel": 4, "reporting": 6, "integrations": 6,
        },
    },
}

DIMENSION_LABELS = {
    "arabic_support": {"ar": "دعم العربي", "en": "Arabic Support"},
    "whatsapp_native": {"ar": "واتساب مدمج", "en": "WhatsApp Native"},
    "ai_scoring": {"ar": "ذكاء اصطناعي", "en": "AI Scoring"},
    "pdpl_compliance": {"ar": "حماية البيانات", "en": "PDPL Compliance"},
    "pricing_value": {"ar": "القيمة مقابل السعر", "en": "Pricing Value"},
    "ease_of_use": {"ar": "سهولة الاستخدام", "en": "Ease of Use"},
    "saudi_market_fit": {"ar": "مناسب للسعودية", "en": "Saudi Market Fit"},
    "deal_exchange": {"ar": "تبادل صفقات", "en": "Deal Exchange"},
    "strategic_deals": {"ar": "صفقات استراتيجية", "en": "Strategic Deals"},
    "multi_channel": {"ar": "تعدد القنوات", "en": "Multi-Channel"},
    "reporting": {"ar": "التقارير", "en": "Reporting"},
    "integrations": {"ar": "التكاملات", "en": "Integrations"},
}


class ComparisonEngine:
    """Generate comparison data for charts and sales responses."""

    @staticmethod
    def get_chart_data(language: str = "ar") -> dict[str, Any]:
        """Data formatted for radar/bar charts on frontend."""
        labels = [
            DIMENSION_LABELS[dim][language]
            for dim in DIMENSION_LABELS
        ]
        datasets = []
        for key, comp in COMPETITORS.items():
            datasets.append({
                "label": comp[f"name_{language}" if f"name_{language}" in comp else "name"],
                "data": list(comp["scores"].values()),
                "highlight": key == "dealix",
            })
        return {"labels": labels, "datasets": datasets, "dimensions": list(DIMENSION_LABELS.keys())}

    @staticmethod
    def get_feature_matrix(language: str = "ar") -> dict[str, Any]:
        """Feature comparison table data."""
        features = [
            {"key": "arabic_first", "ar": "عربي أولاً (مو ترجمة)", "en": "Arabic-First (not translation)",
             "dealix": True, "zoho": False, "salesforce": False, "hubspot": False, "pipedrive": False},
            {"key": "whatsapp_built_in", "ar": "واتساب مدمج بالنظام", "en": "Built-in WhatsApp",
             "dealix": True, "zoho": False, "salesforce": False, "hubspot": False, "pipedrive": False},
            {"key": "ai_arabic", "ar": "AI يفهم العربي والسعودي", "en": "Arabic-Aware AI",
             "dealix": True, "zoho": False, "salesforce": False, "hubspot": False, "pipedrive": False},
            {"key": "pdpl_native", "ar": "PDPL مدمج", "en": "Built-in PDPL",
             "dealix": True, "zoho": False, "salesforce": False, "hubspot": False, "pipedrive": False},
            {"key": "deal_exchange", "ar": "صفقات استراتيجية وتبادل", "en": "Strategic Deal Exchange",
             "dealix": True, "zoho": False, "salesforce": False, "hubspot": False, "pipedrive": False},
            {"key": "lead_scoring", "ar": "تقييم عملاء ذكي", "en": "AI Lead Scoring",
             "dealix": True, "zoho": True, "salesforce": True, "hubspot": True, "pipedrive": True},
            {"key": "pipeline", "ar": "مسار صفقات بصري", "en": "Visual Pipeline",
             "dealix": True, "zoho": True, "salesforce": True, "hubspot": True, "pipedrive": True},
            {"key": "cpq", "ar": "عروض أسعار", "en": "Quotes (CPQ)",
             "dealix": True, "zoho": True, "salesforce": True, "hubspot": False, "pipedrive": False},
        ]
        return {"features": features, "competitors": list(COMPETITORS.keys())}

    @staticmethod
    def get_total_scores() -> dict[str, int]:
        """Total score per competitor (out of 120)."""
        return {
            key: sum(comp["scores"].values())
            for key, comp in COMPETITORS.items()
        }

    @staticmethod
    def get_why_dealix_wins(language: str = "ar") -> list[str]:
        """Top reasons Dealix wins."""
        reasons = {
            "ar": [
                "الوحيد المصمم من الأساس للسوق السعودي",
                "واتساب مدمج — مو إضافة من طرف ثالث",
                "ذكاء اصطناعي يفهم اللهجة السعودية",
                "حماية بيانات PDPL مدمجة بالنظام",
                "نظام صفقات استراتيجية — لا يوجد عند أي منافس",
                "سعر يبدأ من ٥٩ ر.س — أرخص ١٠ مرات من Salesforce",
                "ثنائي اللغة (عربي/إنجليزي) بتبديل فوري",
            ],
            "en": [
                "Only CRM built from scratch for the Saudi market",
                "Built-in WhatsApp — not a third-party add-on",
                "AI that understands Saudi Arabic dialect",
                "PDPL data protection built into the core",
                "Strategic Deal Exchange — no competitor has this",
                "Starting at 59 SAR — 10x cheaper than Salesforce",
                "Bilingual (Arabic/English) with instant switching",
            ],
        }
        return reasons.get(language, reasons["ar"])

    @staticmethod
    def get_comparison_summary(competitor: str, language: str = "ar") -> str:
        """Summary comparing Dealix vs a specific competitor."""
        comp = COMPETITORS.get(competitor.lower())
        dealix = COMPETITORS["dealix"]
        if not comp:
            return "المنافس غير موجود" if language == "ar" else "Competitor not found"

        dealix_total = sum(dealix["scores"].values())
        comp_total = sum(comp["scores"].values())
        diff = dealix_total - comp_total

        if language == "ar":
            return (
                f"مقارنة Dealix مع {comp['name_ar']}:\n\n"
                f"النتيجة الإجمالية:\n"
                f"• Dealix: {dealix_total}/120\n"
                f"• {comp['name_ar']}: {comp_total}/120\n\n"
                f"Dealix يتفوق بـ {diff} نقطة.\n\n"
                f"أهم نقاط التفوق:\n"
                + "\n".join(
                    f"• {DIMENSION_LABELS[dim]['ar']}: Dealix {dealix['scores'][dim]} vs {comp['scores'][dim]}"
                    for dim in dealix["scores"]
                    if dealix["scores"][dim] > comp["scores"].get(dim, 0) + 2
                )
            )
        return (
            f"Dealix vs {comp['name']}:\n\n"
            f"Total Score:\n• Dealix: {dealix_total}/120\n• {comp['name']}: {comp_total}/120\n\n"
            f"Dealix leads by {diff} points."
        )


comparison_engine = ComparisonEngine()
