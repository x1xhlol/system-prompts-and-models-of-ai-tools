/**
 * Mirrors GET /api/v1/strategy/summary when the API is unreachable (offline dev / CORS).
 * Keeps the dashboard readable without amber “error” styling.
 */
import type { StrategySummary } from "./strategy-summary";

export const STRATEGY_SUMMARY_FALLBACK: StrategySummary = {
  product: "Dealix",
  blueprint_version: "4.0.0-legendary",
  positioning: "Revenue & Operations OS - B2B Saudi-first, governance, multi-tenant",
  vision: {
    tagline_ar: "ليس أداة فقط — شركة مبيعات رقمية مؤتمتة بالذكاء الاصطناعي تعمل 24/7",
    tagline_en: "Not just a tool — an AI-automated digital sales company operating 24/7",
  },
  moat_pillars: [
    "Local channels + compliance context (ZATCA, Arabic-first UX)",
    "Governed actions (approvals before sensitive sends) vs generic chatbots",
    "Multi-tenant CRM + integrations path (Salesforce, WhatsApp, Stripe, eSign)",
    "Measurable self-improvement loops when enabled",
  ],
  competitive_moat: {
    durable_runtime: "Durable flows — checkpoints, retries, bounded plugins",
    saudi_first: "WhatsApp-first, SAR, PDPL-aware handling",
    knowledge: "In-app RAG (PostgreSQL/pgvector) — data stays in your boundary",
  },
  auditable_targets: [
    { id: "revenue", label_ar: "النمو الإيرادي", target: "3–5× سنوياً مقابل خط أساس", unit: "growth_vs_baseline" },
    { id: "efficiency", label_ar: "كفاءة المبيعات", target: "−70–80% عمل يدوي في المسار", unit: "manual_work_reduction" },
    { id: "cycle", label_ar: "دورة الإغلاق", target: "حوالي −40% زمن مقارنة بالخط الأساسي", unit: "cycle_time_delta" },
    { id: "compliance", label_ar: "الامتثال", target: "PDPL + جاهزية ضوابط وسجلات", unit: "policy" },
  ],
  design_principles: [
    { id: "value_first", title_ar: "القيمة أولاً", summary: "كل ميزة مربوطة بمؤشر عميل أو تشغيلي" },
    { id: "measurable", title_ar: "قابلية القياس", summary: "ROI تنفيذي حيث ينطبق" },
  ],
  phases: [
    { id: 0, name: "Foundation", horizon_days: 90 },
    { id: 1, name: "Differentiation", horizon_months: "3-9" },
    { id: 2, name: "Enterprise scale", horizon_months: "9-18" },
    { id: 3, name: "Geographic / category expansion", horizon_months: "18-36" },
  ],
  execution_phases_detail: [
    {
      id: 0,
      name_ar: "أساس الإنتاج",
      window: "0–90 يوماً",
      deliverables: ["CI واختبارات", "go-live gate", "pilot"],
    },
  ],
  kpis: [
    { axis: "product", metric: "API p95, 5xx rate" },
    { axis: "adoption", metric: "channels enabled" },
    { axis: "revenue", metric: "NRR, pilot→paid" },
    { axis: "trust", metric: "case studies, NPS" },
  ],
  doc_paths: {
    full_markdown_web: "/strategy/DEALIX_NEXT_LEVEL_MASTER_PLAN_AR.md",
    ultimate_execution_ar: "/strategy/ULTIMATE_EXECUTION_MASTER_AR.md",
    integration_master_ar: "/strategy/INTEGRATION_MASTER_AR.md",
    investor_html: "/dealix-marketing/investor/00-investor-dealix-full-ar.html",
  },
  repo_paths: {
    blueprint: "salesflow-saas/MASTER-BLUEPRINT.mdc",
    openclaw_config: "salesflow-saas/openclaw/openclaw-config.yaml",
    ultimate_doc: "salesflow-saas/docs/ULTIMATE_EXECUTION_MASTER_AR.md",
    integration_master: "salesflow-saas/docs/INTEGRATION_MASTER_AR.md",
  },
  market_frame: "Global shift to Revenue Action Orchestration",
};
