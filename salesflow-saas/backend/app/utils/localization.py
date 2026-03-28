TRANSLATIONS = {
    "lead_status": {
        "new": {"ar": "جديد", "en": "New"},
        "contacted": {"ar": "تم التواصل", "en": "Contacted"},
        "qualified": {"ar": "مؤهل", "en": "Qualified"},
        "proposal": {"ar": "عرض سعر", "en": "Proposal"},
        "won": {"ar": "تم الإغلاق", "en": "Won"},
        "lost": {"ar": "مفقود", "en": "Lost"},
    },
    "deal_stage": {
        "new": {"ar": "جديد", "en": "New"},
        "negotiation": {"ar": "تفاوض", "en": "Negotiation"},
        "proposal": {"ar": "عرض سعر", "en": "Proposal"},
        "closed_won": {"ar": "تم الإغلاق", "en": "Closed Won"},
        "closed_lost": {"ar": "خسرنا", "en": "Closed Lost"},
    },
    "user_role": {
        "owner": {"ar": "مالك", "en": "Owner"},
        "manager": {"ar": "مدير", "en": "Manager"},
        "agent": {"ar": "موظف مبيعات", "en": "Sales Agent"},
        "admin": {"ar": "مسؤول النظام", "en": "Administrator"},
    },
    "channels": {
        "whatsapp": {"ar": "واتساب", "en": "WhatsApp"},
        "email": {"ar": "بريد إلكتروني", "en": "Email"},
        "sms": {"ar": "رسالة نصية", "en": "SMS"},
        "phone": {"ar": "اتصال", "en": "Phone"},
        "website": {"ar": "الموقع", "en": "Website"},
    },
}


def t(category: str, key: str, locale: str = "ar") -> str:
    return TRANSLATIONS.get(category, {}).get(key, {}).get(locale, key)
