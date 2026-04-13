"""JSON summary for /strategy page and integrations."""
from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(tags=["Strategy"])

_BLUEPRINT_VERSION = "4.0.0-legendary"


@router.get("/strategy/summary")
async def strategy_summary() -> dict:
    return {
        "product": "Dealix",
        "blueprint_version": _BLUEPRINT_VERSION,
        "positioning": "Revenue & Operations OS - B2B Saudi-first, governance, multi-tenant",
        "vision": {
            "tagline_ar": "ليس أداة فقط — شركة مبيعات رقمية مؤتمتة بالذكاء الاصطناعي تعمل 24/7",
            "tagline_en": "Not just a tool — an AI-automated digital sales company operating 24/7",
        },
        "moat_pillars": [
            "Local channels + compliance context (ZATCA, Arabic-first UX)",
            "Governed actions (approvals before sensitive sends) vs generic chatbots",
            "Multi-tenant CRM + integrations path (Salesforce, WhatsApp, Stripe, eSign)",
            "Measurable self-improvement loops when enabled",
            "OpenClaw-style durable flows + revision posture (see openclaw-config.yaml)",
        ],
        "differentiators_verifiable": [
            {
                "id": "api_surface",
                "title_ar": "مسارات API موثقة ومفتوحة للتحقق",
                "evidence": "docs/API-MAP.md + OpenAPI /docs + scripts/verify_frontend_openapi_paths.py",
            },
            {
                "id": "crm_sync",
                "title_ar": "تكامل Salesforce/HubSpot مع اختبار ودفع وسحب",
                "evidence": "POST /api/v1/integrations/crm/*/test|push-lead|pull-*",
            },
            {
                "id": "llm_routing",
                "title_ar": "توجيه نماذج حسب المهمة دون كشف مفاتيح",
                "evidence": "GET/PUT /api/v1/ai/routing",
            },
            {
                "id": "arabic_os",
                "title_ar": "واجهة عربية ومسارات Dealix OS في منتج واحد",
                "evidence": "dashboard hubs + docs/DEALIX_OS_PRODUCT_GUIDE_AR.md",
            },
            {
                "id": "competitive_doc",
                "title_ar": "مصفوفة تنافسية صريحة بدون أرقام غير مثبتة",
                "evidence": "docs/COMPETITIVE_MATRIX_AR.md (نسخة ويب /strategy/COMPETITIVE_MATRIX_AR.md بعد المزامنة)",
            },
        ],
        "competitive_moat": {
            "durable_runtime": "OpenClaw 2026.4.2 pattern — checkpoints, retries, bounded plugins",
            "self_improvement": "6-phase loop: signals → diagnose → experiments → A/B → governance → promote/rollback",
            "saudi_first": "WhatsApp-first, SAR, PDPL-aware handling; not generic US-centric sequences",
            "knowledge": "In-app RAG only (PostgreSQL/pgvector, KnowledgeService) — no external RAG SaaS as SoT",
        },
        "auditable_targets": [
            {"id": "revenue", "label_ar": "النمو الإيرادي", "target": "3–5× سنوياً مقابل خط أساس", "unit": "growth_vs_baseline"},
            {"id": "efficiency", "label_ar": "كفاءة المبيعات", "target": "−70–80% عمل يدوي في المسار", "unit": "manual_work_reduction"},
            {"id": "forecast", "label_ar": "دقة التنبؤ", "target": "أفق 30 يوماً — بيانات نظيفة ونماذج معايرة", "unit": "accuracy_horizon_30d"},
            {"id": "cycle", "label_ar": "دورة الإغلاق", "target": "حوالي −40% زمن مقارنة بالخط الأساسي", "unit": "cycle_time_delta"},
            {"id": "cac", "label_ar": "تكلفة الاكتساب", "target": "حوالي −31% عبر الأتمتة والتوجيه", "unit": "cac_delta"},
            {"id": "compliance", "label_ar": "الامتثال", "target": "PDPL + جاهزية SOC2 للضوابط والسجلات", "unit": "policy"},
        ],
        "design_principles": [
            {"id": "value_first", "title_ar": "القيمة أولاً", "summary": "كل ميزة مربوطة بمؤشر عميل أو تشغيلي"},
            {"id": "compliance_by_design", "title_ar": "الامتثال بالتصميم", "summary": "موافقات، سجلات، حدود بيانات وليست لاحقة"},
            {"id": "self_evolving", "title_ar": "تطور ذاتي", "summary": "حلقة تحسين وتجارب بظلال/كاناري عند التفعيل"},
            {"id": "simplicity", "title_ar": "بساطة ظاهرة", "summary": "تعقيد الداخل منظم؛ واجهة بسيطة"},
            {"id": "measurable", "title_ar": "قابلية القياس", "summary": "ROI تنفيذي، تكلفة نماذج لكل مستأجر حيث ينطبق"},
            {"id": "zero_trust", "title_ar": "أمان عبر عدم الثقة العمياء", "summary": "عزل مستأجرين؛ إجراءات حساسة خلف خطافات"},
        ],
        "market_frame": "Global shift to Revenue Action Orchestration; high TCO on mega-platforms",
        "phases": [
            {"id": 0, "name": "Foundation", "horizon_days": 90},
            {"id": 1, "name": "Differentiation", "horizon_months": "3-9"},
            {"id": 2, "name": "Enterprise scale", "horizon_months": "9-18"},
            {"id": 3, "name": "Geographic / category expansion", "horizon_months": "18-36"},
        ],
        "execution_phases_detail": [
            {
                "id": 0,
                "name_ar": "أساس الإنتاج",
                "window": "0–90 يوماً",
                "deliverables": ["CI واختبارات حرجة", "go-live gate", "pilot", "أصول تسويق موحّدة"],
            },
            {
                "id": 1,
                "name_ar": "MVP إيرادي",
                "window": "شهر 2–3",
                "deliverables": ["تأهيل أعمق", "عروض وعقود مسار", "لوحة ROI أساسية", "امتثال تشغيلي"],
            },
            {
                "id": 2,
                "name_ar": "توسع مؤسسي",
                "window": "شهر 4–9",
                "deliverables": ["أنماط multi-tenant أعمق", "مسار صوت", "طبقة تنبؤ إيرادات", "بوابة API"],
            },
            {
                "id": 3,
                "name_ar": "قيادة فئة",
                "window": "شهر 10–36",
                "deliverables": ["مناطق", "شراكات", "قطاعات عمودية", "سوق إضافات"],
            },
        ],
        "kpis": [
            {"axis": "product", "metric": "API p95, 5xx rate"},
            {"axis": "adoption", "metric": "channels enabled, approval usage"},
            {"axis": "revenue", "metric": "NRR, pilot→paid"},
            {"axis": "trust", "metric": "case studies, NPS"},
        ],
        "doc_paths": {
            "full_markdown_web": "/strategy/DEALIX_NEXT_LEVEL_MASTER_PLAN_AR.md",
            "ultimate_execution_ar": "/strategy/ULTIMATE_EXECUTION_MASTER_AR.md",
            "integration_master_ar": "/strategy/INTEGRATION_MASTER_AR.md",
            "competitive_matrix_ar": "/strategy/COMPETITIVE_MATRIX_AR.md",
            "investor_html": "/dealix-marketing/investor/00-investor-dealix-full-ar.html",
        },
        "repo_paths": {
            "blueprint": "salesflow-saas/MASTER-BLUEPRINT.mdc",
            "openclaw_config": "salesflow-saas/openclaw/openclaw-config.yaml",
            "ultimate_doc": "salesflow-saas/docs/ULTIMATE_EXECUTION_MASTER_AR.md",
            "integration_master": "salesflow-saas/docs/INTEGRATION_MASTER_AR.md",
        },
        "dealix_os_three_pillars": {
            "sales": {
                "label_ar": "محرك المبيعات",
                "focus": "اكتشاف، قمع، قنوات، إغلاق مع حوكمة إرسال",
                "primary_api_surface": "leads, pipeline, inbox, agents",
            },
            "partnerships": {
                "label_ar": "شراكات استراتيجية",
                "focus": "ملفات B2B، مطابقة، تفاوض، Partnership Studio",
                "primary_api_surface": "/api/v1/strategic-deals",
            },
            "growth": {
                "label_ar": "نمو واستعداد استحواذ",
                "focus": "ذكاء استراتيجي، قوائم مهام، قرار بشري للالتزامات الكبرى",
                "primary_api_surface": "autonomous_core, strategy_summary, growth/checklist",
            },
            "governance": {
                "label_ar": "حوكمة وثقة",
                "focus": "أوضاع تشغيل، سياسات متدرجة، go-live، سجلات",
                "primary_api_surface": "operating-model, policy/evaluate, go-live-gate",
            },
        },
    }
