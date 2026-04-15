"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { getStoredUser } from "@/lib/auth-storage";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  Radio,
  Send,
  Sparkles,
  Target,
} from "lucide-react";

type LeadRow = Record<string, unknown> & {
  company_name?: string;
  urgency?: string;
  pain_point?: string;
  dealix_solution?: string;
  estimated_deal_value?: string;
  contact_approach?: string;
  why_good_fit?: string;
  website?: string;
};

type Enrichment = {
  vertical_playbook_id?: string | null;
  playbook_label_ar?: string | null;
  icp_summary_ar?: string;
  icp_summary_en?: string;
  market_signals?: { title: string; summary: string; implication_ar?: string }[];
  buying_committee_hints?: { role_ar: string; role_en?: string; rationale_ar?: string }[];
  partnership_angle_ar?: string;
  rag_playbook_refs?: string[];
  provenance?: { field_path: string; source: string; detail?: string }[];
  feature_flags_used?: Record<string, boolean>;
};

type Profile = { id: string; company_name: string };

const STEPS = [
  { id: 0, ar: "سياق ICP", en: "ICP context", icon: Target },
  { id: 1, ar: "السوق", en: "Market scan", icon: Radio },
  { id: 2, ar: "الفرص", en: "Opportunities", icon: Building2 },
  { id: 3, ar: "إجراءات", en: "Actions", icon: Send },
] as const;

const SECTORS = [
  "تقنية المعلومات",
  "العقارات",
  "الصحة",
  "التعليم",
  "التجزئة",
  "المقاولات",
  "الاستشارات",
];
const CITIES = ["الرياض", "جدة", "الدمام", "مكة المكرمة", "نيوم", "القصيم"];

const urgencyBadge: Record<string, string> = {
  high: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  low: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export function LeadGeneratorView() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [step, setStep] = useState(0);
  const [sector, setSector] = useState("تقنية المعلومات");
  const [city, setCity] = useState("الرياض");
  const [count, setCount] = useState(10);
  const [icpNotesAr, setIcpNotesAr] = useState("");
  const [icpNotesEn, setIcpNotesEn] = useState("");
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [sectorInsights, setSectorInsights] = useState<Record<string, unknown> | null>(null);
  const [discoveryManifest, setDiscoveryManifest] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<LeadRow | null>(null);
  const [enrichment, setEnrichment] = useState<Enrichment | null>(null);
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [channelDrafts, setChannelDrafts] = useState<Record<string, unknown> | null>(null);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<unknown>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileId, setProfileId] = useState<string>("");
  const [savedLeadId, setSavedLeadId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [intelFlags, setIntelFlags] = useState<Record<string, unknown> | null>(null);
  const [policyEval, setPolicyEval] = useState<Record<string, unknown> | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [governanceSnap, setGovernanceSnap] = useState<Record<string, unknown> | null>(null);
  const [aiRouting, setAiRouting] = useState<Record<string, unknown> | null>(null);
  const [asyncEnrichLoading, setAsyncEnrichLoading] = useState(false);

  const L = (ar: string, en: string) => (lang === "ar" ? ar : en);

  useEffect(() => {
    void (async () => {
      try {
        const r = await apiFetch("/api/v1/dealix/intelligence-flags", { cache: "no-store" });
        if (r.ok) setIntelFlags(await r.json());
      } catch {
        /* optional */
      }
    })();
  }, []);

  function parseDealValueSar(lead: LeadRow): number {
    const raw = String(lead.estimated_deal_value || "");
    const digits = raw.replace(/[^\d.]/g, "");
    const n = parseFloat(digits);
    return Number.isFinite(n) ? n : 0;
  }

  const runPolicyEvaluate = async () => {
    if (!selected) return;
    setPolicyLoading(true);
    setPolicyEval(null);
    setActionMsg(null);
    try {
      const res = await apiFetch("/api/v1/strategic-deals/policy/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "whatsapp",
          action: "send_custom_message",
          deal_value_sar: parseDealValueSar(selected),
          industry: sector,
        }),
      });
      if (res.ok) {
        setPolicyEval((await res.json()) as Record<string, unknown>);
      } else {
        setActionMsg(L("تقييم السياسة يتطلب تسجيل الدخول.", "Policy evaluation requires sign-in."));
      }
    } catch {
      setActionMsg(L("تعذر تقييم السياسة.", "Policy check failed."));
    } finally {
      setPolicyLoading(false);
    }
  };

  const loadProfiles = useCallback(async () => {
    try {
      const res = await apiFetch("/api/v1/strategic-deals/profiles?per_page=50", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as Profile[];
      setProfiles(data.map((p) => ({ id: String(p.id), company_name: p.company_name })));
      setProfileId((prev) => (prev ? prev : data.length ? String(data[0].id) : ""));
    } catch {
      /* unauthenticated or empty */
    }
  }, []);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    void (async () => {
      try {
        const g = await apiFetch("/api/v1/strategic-deals/governance/snapshot", { cache: "no-store" });
        if (g.ok) setGovernanceSnap((await g.json()) as Record<string, unknown>);
      } catch {
        setGovernanceSnap(null);
      }
      try {
        const r = await apiFetch("/api/v1/ai/routing", { cache: "no-store" });
        if (r.ok) setAiRouting((await r.json()) as Record<string, unknown>);
      } catch {
        setAiRouting(null);
      }
    })();
  }, []);

  const runDiscovery = async () => {
    setLoading(true);
    setActionMsg(null);
    setLeads([]);
    setSectorInsights(null);
    setDiscoveryManifest(null);
    setSelected(null);
    setEnrichment(null);
    try {
      const res = await apiFetch(
        `/api/v1/dealix/generate-leads?sector=${encodeURIComponent(sector)}&city=${encodeURIComponent(city)}&count=${count}`,
        { method: "POST" }
      );
      if (res.ok) {
        const data = await res.json();
        setLeads((data.leads || []) as LeadRow[]);
        setSectorInsights((data.sector_insights as Record<string, unknown>) || null);
        setDiscoveryManifest((data.discovery_manifest as Record<string, unknown>) || null);
        setStep(2);
      } else {
        setLeads(mockLeadsFallback());
        setStep(2);
      }
    } catch {
      setLeads(mockLeadsFallback());
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  function mockLeadsFallback(): LeadRow[] {
    return Array.from({ length: count }, (_, i) => ({
      company_name: `${sector} — ${L("شركة", "Co.")} ${i + 1}`,
      city,
      estimated_size: ["SMB", "Mid-Market"][i % 2],
      pain_point: L("ضعف إنتاجية فريق المبيعات", "Sales productivity gap"),
      dealix_solution: "Dealix OS",
      urgency: ["high", "medium", "low"][i % 3],
      contact_approach: "WhatsApp",
      estimated_deal_value: `${(Math.random() * 50 + 10).toFixed(0)},000 SAR`,
      why_good_fit: L("ملاءمة قطاعية", "Sector fit"),
      website: "",
    }));
  }

  const runEnrichment = async (lead: LeadRow) => {
    setEnrichLoading(true);
    setEnrichment(null);
    try {
      const u = getStoredUser();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (u?.tenantId) headers["X-Tenant-Id"] = u.tenantId;
      const res = await apiFetch("/api/v1/dealix/enrich-exploration", {
        method: "POST",
        headers,
        body: JSON.stringify({
          sector,
          city,
          lead,
          icp_notes_ar: icpNotesAr,
          icp_notes_en: icpNotesEn,
        }),
      });
      if (res.ok) setEnrichment((await res.json()) as Enrichment);
    } catch {
      setEnrichment({
        icp_summary_ar: L("تعذر جلب الإثراء من الخادم.", "Could not load enrichment."),
        provenance: [{ field_path: "error", source: "unavailable", detail: "network" }],
      });
    } finally {
      setEnrichLoading(false);
    }
  };

  const runEnrichmentAsync = async (lead: LeadRow) => {
    setAsyncEnrichLoading(true);
    setEnrichment(null);
    setActionMsg(null);
    try {
      const u = getStoredUser();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (u?.tenantId) headers["X-Tenant-Id"] = u.tenantId;
      const res = await apiFetch("/api/v1/dealix/enrich-exploration/async", {
        method: "POST",
        headers,
        body: JSON.stringify({
          sector,
          city,
          lead,
          icp_notes_ar: icpNotesAr,
          icp_notes_en: icpNotesEn,
        }),
      });
      if (!res.ok) {
        setActionMsg(L("تعذر بدء الإثراء غير المتزامن.", "Could not start async enrichment."));
        return;
      }
      const { job_id: jobId } = (await res.json()) as { job_id: string };
      for (let i = 0; i < 45; i++) {
        await new Promise((r) => setTimeout(r, 800));
        const st = await apiFetch(`/api/v1/dealix/enrich-exploration/jobs/${jobId}`, { cache: "no-store" });
        if (!st.ok) break;
        const row = (await st.json()) as { status?: string; result?: Enrichment; error?: string };
        if (row.status === "done" && row.result) {
          setEnrichment(row.result);
          setActionMsg(L("اكتمل الإثراء في الخلفية.", "Background enrichment complete."));
          return;
        }
        if (row.status === "error") {
          setActionMsg(L("فشل الإثراء في الخلفية.", "Background enrichment failed."));
          return;
        }
      }
      setActionMsg(L("انتهت مهلة انتظار المهمة.", "Job poll timeout."));
    } catch {
      setActionMsg(L("خطأ في مسار الإثراء غير المتزامن.", "Async enrichment error."));
    } finally {
      setAsyncEnrichLoading(false);
    }
  };

  const loadChannelDrafts = async () => {
    if (!selected?.company_name) return;
    setDraftsLoading(true);
    try {
      const res = await apiFetch("/api/v1/dealix/channel-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: String(selected.company_name),
          partnership_angle_ar: enrichment?.partnership_angle_ar || "",
          contact_name: L("فريق Dealix", "Dealix team"),
        }),
      });
      if (res.ok) setChannelDrafts(await res.json());
    } catch {
      setChannelDrafts(null);
    } finally {
      setDraftsLoading(false);
    }
  };

  const saveLead = async () => {
    if (!selected) return;
    setActionMsg(null);
    const meta: Record<string, unknown> = {
      revenue_discovery_workspace: true,
      sector,
      city,
      icp_notes_ar: icpNotesAr,
      icp_notes_en: icpNotesEn,
      discovery_manifest: discoveryManifest,
    };
    if (enrichment) meta.revenue_discovery = enrichment;
    const res = await apiFetch("/api/v1/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(selected.company_name || "Lead"),
        source: "revenue_discovery_workspace",
        notes: [selected.pain_point, selected.why_good_fit].filter(Boolean).join(" — ") || null,
        metadata: meta,
      }),
    });
    if (res.ok) {
      const row = await res.json();
      setSavedLeadId(String(row.id));
      setActionMsg(L("تم حفظ العميل المحتمل في CRM.", "Lead saved to CRM."));
    } else {
      setActionMsg(L("تعذر الحفظ — تأكد من تسجيل الدخول.", "Save failed — sign in required."));
    }
  };

  const createStrategicDeal = async () => {
    if (!profileId || !selected) {
      setActionMsg(L("اختر ملف المبادر أو سجّل الدخول.", "Pick initiator profile and sign in."));
      return;
    }
    const leadUuid = savedLeadId;
    const res = await apiFetch("/api/v1/strategic-deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initiator_profile_id: profileId,
        target_company_name: String(selected.company_name),
        deal_type: "partnership",
        deal_title: L(`شراكة محتملة — ${selected.company_name}`, `Partnership — ${selected.company_name}`),
        deal_title_ar: `استكشاف شراكة — ${selected.company_name}`,
        our_offer: enrichment?.partnership_angle_ar || L("استكشاف ذكاء الإيرادات", "Revenue discovery"),
        channel: "whatsapp",
        lead_id: leadUuid || undefined,
      }),
    });
    if (res.ok) {
      setActionMsg(L("تم إنشاء صفقة استراتيجية وربطها عند توفر lead_id.", "Strategic deal created."));
    } else {
      setActionMsg(L("تعذر إنشاء الصفقة — صلاحيات أو ملف المبادر.", "Could not create strategic deal."));
    }
  };

  const runPipeline = async () => {
    if (!selected) return;
    setPipelineRunning(true);
    setPipelineResult(null);
    try {
      const res = await apiFetch("/api/v1/dealix/full-power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: selected.company_name,
          contact_name: L("مسؤول العمليات", "Operations"),
          contact_phone: "966500000000",
          contact_title: "CEO",
          website: selected.website || null,
        }),
      });
      if (res.ok) setPipelineResult(await res.json());
    } catch {
      setPipelineResult({ notice: L("تعذر الاتصال بالخادم", "Server unreachable") });
    } finally {
      setPipelineRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-6 w-6" />
              <h1 className="text-xl font-black md:text-2xl">
                {L("مساحة استكشاف الإيرادات", "Revenue discovery workspace")}
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              {L(
                "خطوات: سياق ICP، مسح السوق، اختيار فرصة، ثم مسودات قنوات بحوكمة وربط CRM/الصفقات الاستراتيجية.",
                "ICP context → market scan → opportunities → governed channel drafts and CRM / strategic links."
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLang("ar")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold border ${lang === "ar" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold border ${lang === "en" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
            >
              EN
            </button>
          </div>
        </header>

        {(governanceSnap || aiRouting) && (
          <div className="glass-card border border-border/50 rounded-2xl p-4 text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="space-y-1 text-muted-foreground">
              <p className="font-bold text-foreground">
                {L("حوكمة الصفقات وتوجيه النماذج", "Deals governance & model routing")}
              </p>
              {governanceSnap && (
                <p className="text-xs line-clamp-2" dir="ltr">
                  governance: {JSON.stringify(governanceSnap).slice(0, 220)}…
                </p>
              )}
              {aiRouting && (
                <p className="text-xs line-clamp-2" dir="ltr">
                  ai/routing discovery:{" "}
                  {JSON.stringify(
                    (aiRouting as { effective?: { discovery?: unknown } }).effective?.discovery ?? {}
                  ).slice(0, 180)}
                  …
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <a
                href="/dashboard?section=governance-metrics"
                className="text-primary text-sm font-semibold underline underline-offset-4"
              >
                {L("لوحة الحوكمة", "Governance dashboard")}
              </a>
              <a href="/dashboard?section=go-live" className="text-primary text-sm font-semibold underline underline-offset-4">
                {L("جاهزية الإطلاق", "Go-live readiness")}
              </a>
              <a href="/dashboard?section=partnership-studio" className="text-primary text-sm font-semibold underline underline-offset-4">
                Partnership Studio
              </a>
            </div>
          </div>
        )}

        {/* Stepper */}
        <nav className="glass-card border border-border/50 rounded-2xl p-4 flex flex-wrap gap-2">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : done
                      ? "bg-muted/40 text-muted-foreground border border-transparent"
                      : "border border-border/60 text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{L(s.ar, s.en)}</span>
                {idx < STEPS.length - 1 && <ChevronRight className="h-4 w-4 opacity-40 hidden sm:inline" />}
              </button>
            );
          })}
        </nav>

        {actionMsg && (
          <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm">{actionMsg}</div>
        )}

        {/* Step 0 — ICP */}
        {step === 0 && (
          <section className="glass-card border border-border/50 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              {L("سياق العميل المثالي (ICP)", "Ideal customer profile")}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">{L("القطاع", "Sector")}</span>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2"
                >
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">{L("المدينة", "City")}</span>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">{L("عدد النتائج", "Result count")}</span>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2"
                >
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block space-y-1 text-sm">
              <span className="text-muted-foreground">{L("ملاحظات ICP (عربي)", "ICP notes (Arabic)")}</span>
              <textarea
                value={icpNotesAr}
                onChange={(e) => setIcpNotesAr(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border bg-card px-3 py-2"
                placeholder={L("حجم، ألم، قنوات تفضيلية…", "Size, pain, preferred channels…")}
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-muted-foreground">{L("ملاحظات ICP (إنجليزي، اختياري)", "ICP notes (EN, optional)")}</span>
              <textarea
                value={icpNotesEn}
                onChange={(e) => setIcpNotesEn(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-border bg-card px-3 py-2"
                dir="ltr"
              />
            </label>
            <div className="flex justify-between gap-2 pt-2">
              <span />
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
              >
                {L("التالي", "Next")}
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </button>
            </div>
          </section>
        )}

        {/* Step 1 — Market */}
        {step === 1 && (
          <section className="glass-card border border-border/50 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" />
              {L("مسح السوق", "Market scan")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {L(
                "يستدعي توليد الفرص مع مصفوفة مصدر الحقول (provenance) ومزامنة مع playbook قطاعي.",
                "Calls lead generation with field-level provenance and vertical playbook context."
              )}
            </p>
            {intelFlags && (
              <div className="rounded-xl border border-border/50 bg-muted/10 p-3 text-xs space-y-1">
                <p className="font-bold text-primary">{L("أعلام طبقة الذكاء", "Intelligence flags")}</p>
                <ul className="text-muted-foreground space-y-0.5" dir="ltr">
                  <li>licensed_web_search_allowed: {String(intelFlags.licensed_web_search_allowed)}</li>
                  <li>deep_enrichment_enabled: {String(intelFlags.deep_enrichment_enabled)}</li>
                  <li>enrich_idempotent_daily: {String(intelFlags.enrich_idempotent_daily)}</li>
                  <li>async_enrich_jobs_enabled: {String(intelFlags.async_enrich_jobs_enabled)}</li>
                </ul>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => void runDiscovery()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-primary-foreground disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {L("تشغيل الاستكشاف", "Run discovery")}
              </button>
              <button type="button" onClick={() => setStep(0)} className="rounded-xl border border-border px-4 py-2 text-sm">
                {L("رجوع", "Back")}
              </button>
            </div>
          </section>
        )}

        {/* Step 2 — Opportunities */}
        {step === 2 && (
          <div className="grid gap-6 lg:grid-cols-5">
            <section className="glass-card border border-border/50 rounded-2xl p-4 lg:col-span-2 space-y-3 max-h-[560px] overflow-y-auto">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold">{L("الفرص", "Opportunities")}</h2>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-primary font-semibold">
                  {L("إعادة المسح", "Rescan")}
                </button>
              </div>
              {sectorInsights && Object.keys(sectorInsights).length > 0 && (
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs space-y-1">
                  <p className="font-bold text-primary">{L("إشارات قطاعية (من النموذج)", "Sector signals (model)")}</p>
                  <pre className="whitespace-pre-wrap text-muted-foreground">{JSON.stringify(sectorInsights, null, 2)}</pre>
                </div>
              )}
              {leads.length === 0 && <p className="text-sm text-muted-foreground">{L("لا نتائج بعد.", "No rows yet.")}</p>}
              {leads.map((lead, i) => {
                const u = String(lead.urgency || "");
                const active = selected === lead;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelected(lead);
                      setEnrichment(null);
                      setChannelDrafts(null);
                      setSavedLeadId(null);
                    }}
                    className={`w-full text-right rounded-xl border p-3 transition-colors ${
                      active ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold">{String(lead.company_name)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{String(lead.pain_point || "")}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${urgencyBadge[u] || urgencyBadge.low}`}>
                        {u || "—"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </section>

            <section className="glass-card border border-border/50 rounded-2xl p-4 lg:col-span-3 space-y-4">
              {!selected ? (
                <p className="text-sm text-muted-foreground">{L("اختر شركة من القائمة.", "Pick a company.")}</p>
              ) : (
                <>
                  <h3 className="text-lg font-black">{String(selected.company_name)}</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={enrichLoading}
                      onClick={() => void runEnrichment(selected)}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary/90 px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60"
                    >
                      {enrichLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {L("إثراء + Playbook", "Enrich + playbook")}
                    </button>
                    {intelFlags?.async_enrich_jobs_enabled !== false && (
                      <button
                        type="button"
                        disabled={asyncEnrichLoading || enrichLoading}
                        onClick={() => void runEnrichmentAsync(selected)}
                        className="inline-flex items-center gap-2 rounded-xl border border-primary/40 px-4 py-2 text-sm font-bold text-primary disabled:opacity-60"
                      >
                        {asyncEnrichLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {L("إثراء في الخلفية", "Background enrich")}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="rounded-xl border border-border px-4 py-2 text-sm font-semibold"
                    >
                      {L("إجراءات وحوكمة", "Actions & governance")}
                    </button>
                  </div>
                  {enrichment && (
                    <div className="space-y-3 text-sm border border-border/50 rounded-xl p-4 bg-muted/10">
                      <p className="text-xs text-primary font-bold">
                        {enrichment.playbook_label_ar || enrichment.vertical_playbook_id || "Playbook"}
                      </p>
                      <p>{enrichment.icp_summary_ar}</p>
                      {enrichment.icp_summary_en && (
                        <p className="text-muted-foreground" dir="ltr">
                          {enrichment.icp_summary_en}
                        </p>
                      )}
                      {enrichment.market_signals && enrichment.market_signals.length > 0 && (
                        <div>
                          <p className="font-semibold mb-1">{L("إشارات السوق", "Market signals")}</p>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {enrichment.market_signals.map((m, j) => (
                              <li key={j}>
                                <span className="text-foreground font-medium">{m.title}</span> — {m.summary}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {enrichment.feature_flags_used && Object.keys(enrichment.feature_flags_used).length > 0 && (
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          flags: {JSON.stringify(enrichment.feature_flags_used)}
                        </p>
                      )}
                      {enrichment.provenance && enrichment.provenance.length > 0 && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground">{L("مصادر الحقول (provenance)", "Field sources")}</summary>
                          <ul className="mt-2 space-y-1">
                            {enrichment.provenance.map((p, j) => (
                              <li key={j}>
                                {p.field_path}: <code>{p.source}</code> {p.detail}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}

        {/* Step 3 — Actions */}
        {step === 3 && (
          <section className="glass-card border border-border/50 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold">{L("إجراءات، قنوات، وصفقات", "Actions, channels, deals")}</h2>
            {!selected ? (
              <p className="text-sm text-muted-foreground">{L("ارجع واختر فرصة.", "Go back and select a lead.")}</p>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">{L("CRM", "CRM")}</p>
                    <button type="button" onClick={() => void saveLead()} className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                      {L("حفظ في العملاء المحتملين", "Save lead")}
                    </button>
                    {savedLeadId && (
                      <p className="text-xs text-muted-foreground">
                        lead_id: <code dir="ltr">{savedLeadId}</code>
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">{L("صفقة استراتيجية", "Strategic deal")}</p>
                    <select
                      value={profileId}
                      onChange={(e) => setProfileId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
                    >
                      {profiles.length === 0 ? (
                        <option value="">{L("— سجّل الدخول لتحميل الملفات —", "— sign in for profiles —")}</option>
                      ) : (
                        profiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.company_name}
                          </option>
                        ))
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => void createStrategicDeal()}
                      className="w-full rounded-xl border border-primary/40 px-4 py-2 text-sm font-bold text-primary"
                    >
                      {L("إنشاء صفقة + ربط lead", "Create deal + link lead")}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">{L("مسودات قنوات (حوكمة)", "Channel drafts (governance)")}</p>
                  <p className="text-xs text-muted-foreground">
                    {L(
                      "مهام الصياغة تُوجَّه عبر سياسة /api/v1/ai/routing (discovery / compliance). لينكدإن: موافقة بشرية فقط.",
                      "Drafting aligns with /api/v1/ai/routing. LinkedIn: human approval only."
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={draftsLoading}
                      onClick={() => void loadChannelDrafts()}
                      className="rounded-xl bg-muted px-4 py-2 text-sm font-semibold disabled:opacity-60"
                    >
                      {draftsLoading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : null}{" "}
                      {L("توليد مسودات", "Generate drafts")}
                    </button>
                    <button
                      type="button"
                      disabled={policyLoading}
                      onClick={() => void runPolicyEvaluate()}
                      className="rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-2 text-sm font-semibold disabled:opacity-60"
                    >
                      {policyLoading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : null}{" "}
                      {L("تقييم سياسة الإرسال", "Evaluate send policy")}
                    </button>
                    <button
                      type="button"
                      disabled={pipelineRunning}
                      onClick={() => void runPipeline()}
                      className="rounded-xl border border-border px-4 py-2 text-sm font-semibold disabled:opacity-60"
                    >
                      {pipelineRunning ? <Loader2 className="h-4 w-4 animate-spin inline" /> : null}{" "}
                      {L("Full-power pipeline", "Full-power pipeline")}
                    </button>
                  </div>
                  {policyEval && (
                    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm">
                      <p className="font-bold text-amber-700 dark:text-amber-400 mb-2">
                        {L("نتيجة السياسة (go / موافقة / ممنوع)", "Policy outcome")}
                      </p>
                      <pre className="text-xs whitespace-pre-wrap overflow-x-auto" dir="ltr">
                        {JSON.stringify(policyEval, null, 2)}
                      </pre>
                    </div>
                  )}
                  {channelDrafts && (
                    <div className="rounded-xl border border-border/60 bg-muted/10 p-4 text-sm space-y-3">
                      <div>
                        <p className="text-xs font-bold text-primary">WhatsApp</p>
                        <p className="whitespace-pre-wrap">{String(channelDrafts.whatsapp_draft_ar || "")}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-primary">Email</p>
                        <p className="font-medium">{String(channelDrafts.email_subject_ar || "")}</p>
                        <p className="whitespace-pre-wrap text-muted-foreground">{String(channelDrafts.email_body_ar || "")}</p>
                      </div>
                      {typeof channelDrafts.linkedin === "object" &&
                        channelDrafts.linkedin !== null &&
                        !Array.isArray(channelDrafts.linkedin) && (
                        <div className="border border-amber-500/30 rounded-lg p-3 bg-amber-500/5">
                          <p className="text-xs font-bold text-amber-600">LinkedIn</p>
                          <p className="text-xs text-muted-foreground">
                            {String((channelDrafts.linkedin as Record<string, unknown>).policy_note_ar || "")}
                          </p>
                          <p className="mt-2 whitespace-pre-wrap">
                            {String((channelDrafts.linkedin as Record<string, unknown>).draft_ar || "")}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {pipelineResult && (
                  <details className="text-xs rounded-xl border border-border/50 p-3">
                    <summary className="cursor-pointer font-semibold">{L("مخرجات Pipeline", "Pipeline output")}</summary>
                    <pre className="mt-2 whitespace-pre-wrap overflow-x-auto">{JSON.stringify(pipelineResult, null, 2).slice(0, 4000)}</pre>
                  </details>
                )}

                <button type="button" onClick={() => setStep(2)} className="text-sm text-primary font-semibold">
                  ← {L("الفرص", "Opportunities")}
                </button>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
