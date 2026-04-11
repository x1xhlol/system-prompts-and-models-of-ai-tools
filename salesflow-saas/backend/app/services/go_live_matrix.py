"""
Full commercial go-live matrix: env checks, categories, blocking vs optional.
Used by /integrations/go-live-gate and /integrations/live-readiness.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any, Callable, Dict, List, Tuple

from app.config import Settings


@dataclass(frozen=True)
class CheckDef:
    id: str
    category: str
    category_ar: str
    label_ar: str
    env_vars: str
    blocking: bool
    hint_ar: str


DEFAULT_SECRET = "change-this-to-a-random-secret-key"


def _pass(v: bool) -> str:
    return "PASS" if v else "FAIL"


def build_check_definitions() -> List[CheckDef]:
    """Human-facing catalog; order = display order."""
    return [
        CheckDef(
            "secret_key",
            "security",
            "الأمان والأساس",
            "SECRET_KEY قوي (ليس القيمة الافتراضية)",
            "SECRET_KEY",
            True,
            "استخدم مفتاحاً عشوائياً طويلاً في الإنتاج؛ لا ترفع الملف إلى Git.",
        ),
        CheckDef(
            "environment_production",
            "security",
            "الأمان والأساس",
            "ENVIRONMENT=production للإطلاق التجاري",
            "ENVIRONMENT",
            False,
            "يُفضّل production على الخادم العام؛ development يُسجّل كتحذير فقط.",
        ),
        CheckDef(
            "database_url",
            "data",
            "البيانات",
            "DATABASE_URL مُعرّف",
            "DATABASE_URL",
            True,
            "PostgreSQL بسلسلة asyncpg؛ راجع النسخ الاحتياطي والعزل.",
        ),
        CheckDef(
            "llm_configured",
            "intelligence",
            "الذكاء والنماذج",
            "مفتاح مزود نموذج واحد على الأقل (Groq، OpenAI، Anthropic، DeepSeek، Z.ai، Gemini)",
            "GROQ_API_KEY / OPENAI_API_KEY / ANTHROPIC_API_KEY / …",
            True,
            "مطلوب لتشغيل الوكلاء؛ model_router يختار المزود حسب التوفر.",
        ),
        CheckDef(
            "email_outbound",
            "channels",
            "القنوات والتواصل",
            "بريد صادر (SendGrid أو SMTP كامل)",
            "SENDGRID_API_KEY أو SMTP_USER+SMTP_PASSWORD",
            True,
            "للإشعارات والعروض والترحيب؛ SendGrid أو SMTP موثوق.",
        ),
        CheckDef(
            "salesforce_client_id",
            "crm",
            "CRM و Salesforce",
            "SALESFORCE_CLIENT_ID",
            "SALESFORCE_CLIENT_ID",
            True,
            "مفتاح تطبيق Connected App في Salesforce.",
        ),
        CheckDef(
            "salesforce_client_secret",
            "crm",
            "CRM و Salesforce",
            "SALESFORCE_CLIENT_SECRET",
            "SALESFORCE_CLIENT_SECRET",
            True,
            "سر التطبيق من نفس Connected App.",
        ),
        CheckDef(
            "salesforce_refresh_token",
            "crm",
            "CRM و Salesforce",
            "SALESFORCE_REFRESH_TOKEN",
            "SALESFORCE_REFRESH_TOKEN",
            True,
            "من OAuth web-server flow بصلاحيات API المطلوبة.",
        ),
        CheckDef(
            "salesforce_domain",
            "crm",
            "CRM و Salesforce",
            "SALESFORCE_DOMAIN (مثال login.salesforce.com)",
            "SALESFORCE_DOMAIN",
            True,
            "نطاق تسجيل الدخول أو My Domain.",
        ),
        CheckDef(
            "whatsapp_api_token",
            "channels",
            "القنوات والتواصل",
            "WHATSAPP_API_TOKEN",
            "WHATSAPP_API_TOKEN",
            True,
            "رمز Meta Graph API لواتساب الأعمال.",
        ),
        CheckDef(
            "whatsapp_phone_number_id",
            "channels",
            "القنوات والتواصل",
            "WHATSAPP_PHONE_NUMBER_ID",
            "WHATSAPP_PHONE_NUMBER_ID",
            True,
            "من لوحة Meta Business → واتساب.",
        ),
        CheckDef(
            "whatsapp_verify_token",
            "channels",
            "القنوات والتواصل",
            "WHATSAPP_VERIFY_TOKEN (Webhook)",
            "WHATSAPP_VERIFY_TOKEN",
            True,
            "للتحقق من Webhook واتساب على رابط الـ API العام.",
        ),
        CheckDef(
            "whatsapp_not_mock",
            "channels",
            "القنوات والتواصل",
            "WHATSAPP_MOCK_MODE=false للإرسال الحقيقي",
            "WHATSAPP_MOCK_MODE",
            True,
            "عطّل الوضع التجريبي عند جاهزية الرموز الحقيقية.",
        ),
        CheckDef(
            "stripe_secret_key",
            "billing",
            "المدفوعات والفوترة",
            "STRIPE_SECRET_KEY",
            "STRIPE_SECRET_KEY",
            True,
            "مفتاح سري live أو test حسب البيئة.",
        ),
        CheckDef(
            "stripe_webhook_secret",
            "billing",
            "المدفوعات والفوترة",
            "STRIPE_WEBHOOK_SECRET",
            "STRIPE_WEBHOOK_SECRET",
            True,
            "للتحقق من توقيع webhooks الفواتير والاشتراكات.",
        ),
        CheckDef(
            "twilio_account_sid",
            "voice",
            "الصوت والمكالمات",
            "TWILIO_ACCOUNT_SID",
            "TWILIO_ACCOUNT_SID",
            True,
            "حساب Twilio للمكالمات الصادرة/الواردة.",
        ),
        CheckDef(
            "twilio_auth_token",
            "voice",
            "الصوت والمكالمات",
            "TWILIO_AUTH_TOKEN",
            "TWILIO_AUTH_TOKEN",
            True,
            "رمز Twilio Auth.",
        ),
        CheckDef(
            "twilio_from_number",
            "voice",
            "الصوت والمكالمات",
            "TWILIO_FROM_NUMBER (E.164)",
            "TWILIO_FROM_NUMBER",
            True,
            "رقم معتمد للاتصال الصادر.",
        ),
        CheckDef(
            "esign_provider",
            "contracts",
            "العقود والتوقيع",
            "DocuSign أو Adobe Sign (رمز وصول)",
            "DOCUSIGN_ACCESS_TOKEN / ADOBE_SIGN_ACCESS_TOKEN",
            True,
            "مطلوب لتدفقات التوقيع الإلكتروني.",
        ),
        CheckDef(
            "api_public_url",
            "ops",
            "التشغيل والروابط",
            "API_URL يشير إلى عنوان الخادم العام",
            "API_URL",
            False,
            "للروابط في الويبهوكات والوثائق؛ يجب أن يكون HTTPS في الإنتاج.",
        ),
        CheckDef(
            "frontend_url",
            "ops",
            "التشغيل والروابط",
            "FRONTEND_URL لـ CORS والروابط",
            "FRONTEND_URL",
            False,
            "واجهة Dealix؛ يجب تطابق النطاق في الإنتاج.",
        ),
        CheckDef(
            "hubspot_optional",
            "integrations",
            "تكاملات إضافية",
            "HubSpot (اختياري)",
            "HUBSPOT_API_KEY",
            False,
            "إن وُجدت تستخدم للمزامنة الاختيارية.",
        ),
        CheckDef(
            "unifonic_optional",
            "integrations",
            "تكاملات إضافية",
            "Unifonic SMS (اختياري)",
            "UNIFONIC_APP_SID",
            False,
            "رسائل SMS للسوق السعودي.",
        ),
        CheckDef(
            "linkedin_enrichment_optional",
            "integrations",
            "تكاملات إضافية",
            "RapidAPI / إثراء (اختياري)",
            "RAPIDAPI_KEY",
            False,
            "لإثراء العملاء المحتملين عند التفعيل.",
        ),
    ]


def evaluate_checks(settings: Settings) -> Dict[str, str]:
    s = settings
    sendgrid_ok = bool(s.SENDGRID_API_KEY and s.SENDGRID_API_KEY.strip())
    smtp_ok = bool(s.SMTP_USER and s.SMTP_PASSWORD)
    esign_ok = bool(
        (s.DOCUSIGN_ACCESS_TOKEN and s.DOCUSIGN_ACCESS_TOKEN.strip())
        or (s.ADOBE_SIGN_ACCESS_TOKEN and s.ADOBE_SIGN_ACCESS_TOKEN.strip())
    )
    return {
        "secret_key": _pass(bool(s.SECRET_KEY and s.SECRET_KEY != DEFAULT_SECRET)),
        "environment_production": _pass(getattr(s, "ENVIRONMENT", "") == "production"),
        "database_url": _pass(bool(s.DATABASE_URL and s.DATABASE_URL.strip())),
        "llm_configured": _pass(
            bool(
                (s.GROQ_API_KEY and s.GROQ_API_KEY.strip())
                or (s.OPENAI_API_KEY and s.OPENAI_API_KEY.strip())
                or (s.ANTHROPIC_API_KEY and s.ANTHROPIC_API_KEY.strip())
                or (s.DEEPSEEK_API_KEY and s.DEEPSEEK_API_KEY.strip())
                or (s.ZAI_API_KEY and s.ZAI_API_KEY.strip())
                or (s.GOOGLE_API_KEY and s.GOOGLE_API_KEY.strip())
            )
        ),
        "email_outbound": _pass(sendgrid_ok or smtp_ok),
        "salesforce_client_id": _pass(bool(s.SALESFORCE_CLIENT_ID)),
        "salesforce_client_secret": _pass(bool(s.SALESFORCE_CLIENT_SECRET)),
        "salesforce_refresh_token": _pass(bool(s.SALESFORCE_REFRESH_TOKEN)),
        "salesforce_domain": _pass(bool(s.SALESFORCE_DOMAIN)),
        "whatsapp_api_token": _pass(bool(s.WHATSAPP_API_TOKEN)),
        "whatsapp_phone_number_id": _pass(bool(s.WHATSAPP_PHONE_NUMBER_ID)),
        "whatsapp_verify_token": _pass(bool(s.WHATSAPP_VERIFY_TOKEN)),
        "whatsapp_not_mock": _pass(not getattr(s, "WHATSAPP_MOCK_MODE", True)),
        "stripe_secret_key": _pass(bool(s.STRIPE_SECRET_KEY)),
        "stripe_webhook_secret": _pass(bool(s.STRIPE_WEBHOOK_SECRET)),
        "twilio_account_sid": _pass(bool(s.TWILIO_ACCOUNT_SID)),
        "twilio_auth_token": _pass(bool(s.TWILIO_AUTH_TOKEN)),
        "twilio_from_number": _pass(bool(s.TWILIO_FROM_NUMBER)),
        "esign_provider": _pass(esign_ok),
        "api_public_url": _pass(bool(s.API_URL and str(s.API_URL).strip())),
        "frontend_url": _pass(bool(s.FRONTEND_URL)),
        "hubspot_optional": _pass(bool(s.HUBSPOT_API_KEY)),
        "unifonic_optional": _pass(bool(s.UNIFONIC_APP_SID)),
        "linkedin_enrichment_optional": _pass(bool(s.RAPIDAPI_KEY)),
    }


def build_matrix_report(settings: Settings) -> Dict[str, Any]:
    definitions = build_check_definitions()
    checks = evaluate_checks(settings)
    # Ensure every defined id has a status (fallback FAIL)
    for d in definitions:
        if d.id not in checks:
            checks[d.id] = "FAIL"

    blocking_defs = [d for d in definitions if d.blocking]
    optional_defs = [d for d in definitions if not d.blocking]

    passed_blocking = sum(1 for d in blocking_defs if checks.get(d.id) == "PASS")
    total_blocking = len(blocking_defs)
    passed_all = sum(1 for d in definitions if checks.get(d.id) == "PASS")
    total_all = len(definitions)

    readiness_blocking = round(100.0 * passed_blocking / total_blocking, 2) if total_blocking else 0.0
    readiness_total = round(100.0 * passed_all / total_all, 2) if total_all else 0.0

    missing: List[Dict[str, Any]] = []
    for d in definitions:
        if checks.get(d.id) != "PASS":
            missing.append(
                {
                    "check_id": d.id,
                    "env_var": d.env_vars,
                    "hint": d.hint_ar,
                    "label_ar": d.label_ar,
                    "category": d.category,
                    "category_ar": d.category_ar,
                    "blocking": d.blocking,
                }
            )

    missing_blocking = [m for m in missing if m["blocking"]]

    launch_allowed = passed_blocking == total_blocking and total_blocking > 0

    categories: Dict[str, Dict[str, Any]] = {}
    for d in definitions:
        cat = d.category_ar
        if cat not in categories:
            categories[cat] = {"passed": 0, "total": 0, "items": []}
        categories[cat]["total"] += 1
        if checks.get(d.id) == "PASS":
            categories[cat]["passed"] += 1
        categories[cat]["items"].append(
            {
                "id": d.id,
                "label_ar": d.label_ar,
                "status": checks.get(d.id, "FAIL"),
                "blocking": d.blocking,
            }
        )

    return {
        "checks": checks,
        "definitions": [asdict(d) for d in definitions],
        "categories": categories,
        "blocking": {
            "passed": passed_blocking,
            "total": total_blocking,
            "readiness_percent": readiness_blocking,
        },
        "full_matrix": {
            "passed": passed_all,
            "total": total_all,
            "readiness_percent": readiness_total,
        },
        "missing": missing_blocking,
        "missing_optional": [m for m in missing if not m["blocking"]],
        "missing_count": len(missing_blocking),
        "missing_optional_count": len([m for m in missing if not m["blocking"]]),
        "launch_allowed": launch_allowed,
        "readiness_percent": readiness_blocking,
        "readiness_percent_total": readiness_total,
        "passed_count": passed_blocking,
        "total_count": total_blocking,
        "score": f"{passed_blocking}/{total_blocking}",
    }
