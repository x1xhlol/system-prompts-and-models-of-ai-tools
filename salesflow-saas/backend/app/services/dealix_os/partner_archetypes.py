"""
Maps core deal_type values (DB enum) to partnership archetypes and taxonomy hints.
يربط نوع الصفقة المخزّن بأنماط شراكة تشغيلية أوضح للواجهة والوكلاء.
"""

from typing import Any

# Strategic deal deal_type column uses DealType enum strings; taxonomy uses richer IDs.
ARCHETYPE_MAP: dict[str, dict[str, Any]] = {
    "partnership": {
        "archetype_id": "strategic_alliance",
        "label_ar": "شراكة عامة / تحالف",
        "label_en": "General partnership / alliance",
        "description_ar": "تعاون مرن قد يتطور إلى تسويق مشترك أو بيع مشترك.",
        "default_taxonomy_ids": ["strategic_alliance", "co_marketing", "co_selling"],
        "negotiation_focus_ar": ["الأهداف المشتركة", "مدة التعاون", "مشاركة العملاء المحتملين"],
    },
    "distribution": {
        "archetype_id": "channel",
        "label_ar": "قناة توزيع",
        "label_en": "Channel / distribution",
        "description_ar": "الوصول لعملاء الشريك عبر شبكة بيع أو توزيع.",
        "default_taxonomy_ids": ["channel_partnership", "reseller"],
        "negotiation_focus_ar": ["المنطقة", "الهامش", "أهداف الأداء", "التدريب"],
    },
    "franchise": {
        "archetype_id": "expansion",
        "label_ar": "امتياز / توسع علامة",
        "label_en": "Franchise / brand expansion",
        "description_ar": "تكرار نموذج عمل تحت علامة موحّدة مع حوكمة أعلى.",
        "default_taxonomy_ids": ["strategic_alliance", "joint_venture"],
        "negotiation_focus_ar": ["الرسوم", "الامتثال للعلامة", "الأداء الإقليمي"],
    },
    "jv": {
        "archetype_id": "jv",
        "label_ar": "مشروع مشترك (JV)",
        "label_en": "Joint venture",
        "description_ar": "كيان أو مشروع مشترك مع مساهمات ورقابة من الطرفين.",
        "default_taxonomy_ids": ["joint_venture", "tender_consortium"],
        "negotiation_focus_ar": ["نسب الملكية", "الحوكمة", "الخروج", "توزيع الأرباح"],
    },
    "referral": {
        "archetype_id": "referral",
        "label_ar": "إحالة وعمولة",
        "label_en": "Referral",
        "description_ar": "إحالة عملاء مؤهلين مقابل عمولة أو مقايضة قيمة.",
        "default_taxonomy_ids": ["referral_partnership"],
        "negotiation_focus_ar": ["نسبة العمولة", "التتبع", "تعريف العميل المؤهل"],
    },
    "acquisition": {
        "archetype_id": "corp_dev",
        "label_ar": "نمو واستحواذ (مساعد قرار)",
        "label_en": "Growth / M&A assist",
        "description_ar": "استكشاف وتأهيل أهداف؛ القرار النهائي والعناية الواجبة بشرية.",
        "default_taxonomy_ids": ["acquisition_scouting", "investment_intro"],
        "negotiation_focus_ar": ["معايير الهدف", "الخصومية", "نطاق الفحص المبدئي"],
    },
    "barter": {
        "archetype_id": "barter",
        "label_ar": "مقايضة / تبادل خدمات",
        "label_en": "Barter / service exchange",
        "description_ar": "تبادل قيمة بدون تدفق نقدي كامل أو مع دفعات جزئية.",
        "default_taxonomy_ids": ["service_barter"],
        "negotiation_focus_ar": ["تعادل القيمة", "نطاق التسليم", "مدة الالتزام"],
    },
}


def list_archetypes() -> list[dict[str, Any]]:
    return [
        {"deal_type": k, **v}
        for k, v in ARCHETYPE_MAP.items()
    ]


def archetype_for_deal_type(deal_type: str) -> dict[str, Any] | None:
    return ARCHETYPE_MAP.get(deal_type)
