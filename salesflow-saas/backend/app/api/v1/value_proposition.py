"""Public JSON describing business value — for demos, proposals, and dashboard."""

from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/value-proposition", tags=["Value Proposition"])


@router.get("/")
async def get_value_proposition():
    return {
        "product": "Dealix",
        "tagline_ar": "نظام تشغيل إيرادات بالذكاء الاصطناعي — مبني للسوق السعودي",
        "pillars": [
            {
                "id": "velocity",
                "title_ar": "سرعة الأنبوب",
                "summary_ar": "تقليل زمن الدورة من التأهيل إلى الإغلاق عبر أتمتة المتابعة والجدولة.",
                "metrics_hint": ["pipeline_velocity_days", "response_time"],
            },
            {
                "id": "conversion",
                "title_ar": "رفع معدل الفوز",
                "summary_ar": "تأهيل أعمق، اعتراضات أقل، ومسارات عروض متسقة عبر وكلاء متخصصين.",
                "metrics_hint": ["win_rate", "qualification_score"],
            },
            {
                "id": "cost",
                "title_ar": "تخفيض العمل اليدوي",
                "summary_ar": "إزالة التكرار في الرسائل، التقارير، والتنسيق بين الفرق.",
                "metrics_hint": ["manual_work_reduction_percent", "tickets_deflected"],
            },
            {
                "id": "trust",
                "title_ar": "امتثال وتتبع",
                "summary_ar": "مسارات موافقات، سجل تدقيق، وقنوات رسمية (واتساب، بريد، صوت).",
                "metrics_hint": ["consent_rate", "audit_events"],
            },
        ],
        "sectors_sample": [
            "العقارات",
            "الصحة",
            "التجزئة",
            "التعليم",
            "B2B خدمات",
        ],
        "roi_framework_ar": (
            "يقيس النظام أثراً مالياً عبر ارتفاع الإيراد، تحسين معدل الفوز، "
            "وتسريع الأنبوب مع تقليل العمل اليدوي — جاهز للعرض على الإدارة العليا."
        ),
    }
