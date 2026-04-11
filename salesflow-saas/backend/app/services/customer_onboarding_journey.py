"""
Structured B2B customer journey: roles, steps, WhatsApp milestones, agent ownership.
Used by GET /api/v1/customer-onboarding/journey and acceptance-test docs.
"""

from __future__ import annotations

from typing import Any, Dict, List


def build_journey() -> Dict[str, Any]:
    return {
        "product": "Dealix",
        "version": "1.0",
        "summary_ar": (
            "رحلة عميل مدفوع من التعاقد إلى تشغيل كامل لنظام التشغيل الإيرادي (OS): "
            "كل مرحلة تسمّي مالكاً عند العميل، ووكيلاً ذكائياً أو بشرياً من Dealix، ونقاط تحقق على واتساب."
        ),
        "roles": [
            {
                "id": "economic_buyer",
                "title_ar": "صاحب القرار المالي / المدير التنفيذي",
                "responsibility_ar": "الموافقة على النطاق، الميزانية، وترتيب مسؤول تقني داخلي.",
            },
            {
                "id": "technical_owner",
                "title_ar": "مسؤول الربط التقني (IT / مطور)",
                "responsibility_ar": "توفير مفاتيح API، DNS، SSL، وصول Salesforce/Stripe، اختبار Webhooks.",
            },
            {
                "id": "channel_owner",
                "title_ar": "مسؤول القنوات (واتساب / مبيعات)",
                "responsibility_ar": "حساب Meta Business، أرقام معتمدة، اختبار قوالب الرسائل.",
            },
            {
                "id": "dealix_success",
                "title_ar": "مدير نجاح العميل (Dealix) — بشري",
                "responsibility_ar": "تنسيق الجدول، جلسات التحقق، تصعيد الانحرافات عن الخطة.",
            },
            {
                "id": "integration_concierge_agent",
                "title_ar": "وكيل دمج ذكي (Integration Concierge)",
                "responsibility_ar": "شرح الخطوات، تذكير، تلخيص حالة الربط، إجابة FAQ تشغيلية — عبر الواجهة أو واتساب داخلي.",
            },
        ],
        "phases": [
            _phase(
                "p0_contract",
                "التعاقد والتسليم",
                [
                    _step(
                        "s0_1",
                        "توقيع العقد وتحديد نطاق المستأجرين والقطاع",
                        "economic_buyer",
                        ["dealix_success"],
                        ["الموافقة على SOW", "عدد الفروع/المستخدمين"],
                        "واتساب: رسالة ترحيب رسمية + رابط بوابة العميل.",
                    ),
                    _step(
                        "s0_2",
                        "تعيين مسؤول تقني + مسؤول قنوات + قناة واتساب للمشروع",
                        "economic_buyer",
                        ["dealix_success", "integration_concierge_agent"],
                        ["أسماء، أرقام جوال، بريد"],
                        "واتساب مجموعة مشروع (اختياري) مع Dealix.",
                    ),
                ],
            ),
            _phase(
                "p1_platform",
                "التأسيس على المنصة",
                [
                    _step(
                        "s1_1",
                        "بيئة الإنتاج: خادم، Docker/Compose أو K8s، قاعدة بيانات، Redis",
                        "technical_owner",
                        ["integration_concierge_agent"],
                        ["عنوان API عام، HTTPS، SECRET_KEY"],
                        None,
                    ),
                    _step(
                        "s1_2",
                        "متغيرات البيئة: LLM، بريد، قاعدة بيانات",
                        "technical_owner",
                        ["integration_concierge_agent"],
                        ["مفاتيح آمنة خارج Git"],
                        None,
                    ),
                    _step(
                        "s1_3",
                        "فحص الجاهزية التلقائي: go-live-gate + live-readiness",
                        "technical_owner",
                        ["dealix_success"],
                        ["تقرير JSON أو لقطة شاشة ناجحة"],
                        "واتساب: ملخص PASS/FAIL للبنود الحرجة.",
                    ),
                ],
            ),
            _phase(
                "p2_integrations",
                "التكاملات — CRM، مدفوعات، توقيع",
                [
                    _step(
                        "s2_1",
                        "Salesforce Connected App + refresh token",
                        "technical_owner",
                        ["integration_concierge_agent"],
                        ["بيانات الدومين، OAuth"],
                        None,
                    ),
                    _step(
                        "s2_2",
                        "Stripe: مفاتيح live/test + webhook",
                        "technical_owner",
                        ["integration_concierge_agent"],
                        ["سر webhook، مسار عام"],
                        None,
                    ),
                    _step(
                        "s2_3",
                        "توقيع إلكتروني (DocuSign أو Adobe)",
                        "technical_owner",
                        ["dealix_success"],
                        ["رمز وصول أو تكامل"],
                        None,
                    ),
                ],
            ),
            _phase(
                "p3_whatsapp",
                "واتساب للأعمال",
                [
                    _step(
                        "s3_1",
                        "Meta Business: تطبيق واتساب + رقم معتمد",
                        "channel_owner",
                        ["integration_concierge_agent", "dealix_success"],
                        ["WHATSAPP_* tokens", "WHATSAPP_MOCK_MODE=false"],
                        "واتساب: اختبار رسالة صادرة من النظام.",
                    ),
                    _step(
                        "s3_2",
                        "Webhook عام + تحقق Meta",
                        "technical_owner",
                        ["integration_concierge_agent"],
                        ["VERIFY_TOKEN، URL عام HTTPS"],
                        "واتساب: اشتراك webhook ناجح.",
                    ),
                ],
            ),
            _phase(
                "p4_voice_email",
                "صوت وبريد",
                [
                    _step(
                        "s4_1",
                        "Twilio صوت (اختياري حسب الباقة)",
                        "technical_owner",
                        ["integration_concierge_agent"],
                        ["TWILIO_*"],
                        None,
                    ),
                    _step(
                        "s4_2",
                        "بريد صادر SendGrid أو SMTP",
                        "technical_owner",
                        ["integration_concierge_agent"],
                        ["SPF/DKIM عند النطاق"],
                        None,
                    ),
                ],
            ),
            _phase(
                "p5_go_live",
                "الإطلاق والتشغيل",
                [
                    _step(
                        "s5_1",
                        "مواءمة NEXT_PUBLIC_API_URL مع عنوان API العام",
                        "technical_owner",
                        ["integration_concierge_agent"],
                        ["واجهة تعمل بدون CORS errors"],
                        "واتساب: إعلان جاهزية القناة للفريق الداخلي.",
                    ),
                    _step(
                        "s5_2",
                        "تدريب سريع لمسؤول القنوات على لوحة التحكم",
                        "channel_owner",
                        ["dealix_success", "onboarding_coach"],
                        ["جلسة مسجلة أو مباشرة"],
                        None,
                    ),
                    _step(
                        "s5_3",
                        "مراجعة أسبوعية: مؤشرات، أخطاء، تحسين",
                        "economic_buyer",
                        ["dealix_success"],
                        ["اجتماع نجاح عملاء"],
                        "واتساب: تذكير أسبوعي آلي من الوكيل (إن وُجدت أتمتة).",
                    ),
                ],
            ),
        ],
        "agent_registry_refs": {
            "integration_concierge_agent": "ai-agents/prompts/customer-integration-concierge.md",
            "onboarding_coach": "ai-agents/prompts/affiliate-onboarding-coach.md",
            "arabic_whatsapp": "ai-agents/prompts/arabic-whatsapp-agent.md",
        },
        "full_os_gaps_ar": [
            "وكيل موحّد يربط حالة go-live gate بحالة محادثة واتساب (حلقة مغلقة) — جزئي عبر التقارير، يحتاج أتمتة إشعار.",
            "مسار SLA بشري واضح عند فشل خطوة لأكثر من X ساعات — إشعار مدير النجاح.",
            "اختبار تحميل وقبول UAT موثّق كقالب لكل عميل — قيد التطوير.",
        ],
    }


def _phase(phase_id: str, title_ar: str, steps: List[Dict[str, Any]]) -> Dict[str, Any]:
    return {"id": phase_id, "title_ar": title_ar, "steps": steps}


def _step(
    step_id: str,
    title_ar: str,
    primary_owner_role: str,
    supporting_agents: List[str],
    customer_inputs_ar: List[str],
    whatsapp_milestone_ar: str | None,
) -> Dict[str, Any]:
    return {
        "id": step_id,
        "title_ar": title_ar,
        "primary_owner_role": primary_owner_role,
        "supporting_agents": supporting_agents,
        "customer_must_provide_ar": customer_inputs_ar,
        "whatsapp_milestone_ar": whatsapp_milestone_ar,
    }


def build_acceptance_test_checklist() -> Dict[str, Any]:
    """Human + automated checklist «كأنك عميل»."""
    return {
        "title_ar": "اختبار قبول تشغيل Dealix (عميل)",
        "sections": [
            {
                "id": "prep",
                "title_ar": "ما يجب أن يجهّزه العميل قبل الاتصال",
                "items": [
                    "نطاق أو عنوان API عام على HTTPS",
                    "مسؤول تقني متاح لـ DNS وSSL والأسرار",
                    "حساب Meta Business جاهز إن وُجدت قناة واتساب",
                    "قرار ميزانية للاشتراكات (Stripe) إن لزم",
                ],
            },
            {
                "id": "automated",
                "title_ar": "فحوص آلية (من الخادم)",
                "items": [
                    "GET /api/v1/health",
                    "GET /api/v1/ready (قاعدة البيانات)",
                    "GET /api/v1/autonomous-foundation/integrations/go-live-gate",
                    "POST /api/v1/autonomous-foundation/integrations/connectivity-test",
                ],
            },
            {
                "id": "manual",
                "title_ar": "فحوص يدوية",
                "items": [
                    "إرسال رسالة واتساب تجريبية والاستلام",
                    "تسجيل دخول Salesforce اختبار قراءة سجل",
                    "حدث Stripe تجريبي (إن أمكن)",
                ],
            },
        ],
    }
