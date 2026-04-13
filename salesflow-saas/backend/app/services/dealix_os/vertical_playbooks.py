"""
Vertical playbooks — sector defaults for ICP, channels, and governance hints.
طبقات إعداد قطاعية تغذي الوكلاء والواجهة دون تعديل كود لكل عميل.
"""

from typing import Any

VERTICAL_PLAYBOOKS: dict[str, dict[str, Any]] = {
    "real_estate": {
        "id": "real_estate",
        "label_ar": "العقار والتطوير",
        "label_en": "Real estate & development",
        "icp_hints_ar": ["مطورون، وكلاء عقاريون، صناديق عقارية، إدارة أملاك"],
        "primary_channels": ["whatsapp", "email"],
        "objection_patterns_ar": ["العمولة", "حصرية الحي", "زمن البيع", "الترخيص"],
        "approval_value_threshold_sar": 250_000,
        "suggested_deal_types": ["channel_partnership", "referral_partnership", "co_marketing"],
        "compliance_notes_ar": ["تأكد من إعلانات الهيئة العقارية عند الاقتضاء", "لا التزامات تسعير نهائي بدون موافقة"],
    },
    "healthcare": {
        "id": "healthcare",
        "label_ar": "الرعاية الصحية",
        "label_en": "Healthcare",
        "icp_hints_ar": ["مستشفيات، عيادات، موردو أجهزة، منصات صحية"],
        "primary_channels": ["email", "in_person"],
        "objection_patterns_ar": ["الترخيص SFDA", "خصوصية البيانات", "التكامل مع أنظمة المستشفى"],
        "approval_value_threshold_sar": 100_000,
        "suggested_deal_types": ["subcontracting", "white_label", "strategic_alliance"],
        "compliance_notes_ar": ["قطاع حساس — افتراض موافقة بشرية قبل إرسال واتساب", "تجنب ادعاءات علاجية في المحتوى الآلي"],
    },
    "saas_b2b": {
        "id": "saas_b2b",
        "label_ar": "SaaS وB2B تقني",
        "label_en": "B2B SaaS / technology",
        "icp_hints_ar": ["شركات برمجيات، شركاء تكامل، موزعون، استشاريو تحول رقمي"],
        "primary_channels": ["email", "linkedin", "whatsapp"],
        "objection_patterns_ar": ["الأمان", "SLA", "التكامل", "التسعير حسب المقعد"],
        "approval_value_threshold_sar": 150_000,
        "suggested_deal_types": ["reseller", "co_selling", "white_label", "channel_partnership"],
        "compliance_notes_ar": ["مراجعات DPA عند مشاركة بيانات عملاء"],
    },
    "professional_services": {
        "id": "professional_services",
        "label_ar": "الخدمات المهنية",
        "label_en": "Professional services",
        "icp_hints_ar": ["محاسبة، قانون، استشارات إدارية، تدريب"],
        "primary_channels": ["email", "linkedin"],
        "objection_patterns_ar": ["نطاق الخدمة", "الاستشاري المسؤول", "السرية المهنية"],
        "approval_value_threshold_sar": 80_000,
        "suggested_deal_types": ["referral_partnership", "co_selling", "capability_gap_fill"],
        "compliance_notes_ar": ["لا تقديم استشارة قانونية/مالية كأمر تنفيذي آلي"],
    },
}


def list_playbook_ids() -> list[str]:
    return list(VERTICAL_PLAYBOOKS.keys())


def get_playbook(playbook_id: str) -> dict[str, Any] | None:
    return VERTICAL_PLAYBOOKS.get(playbook_id)
