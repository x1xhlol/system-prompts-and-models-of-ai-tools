"use client";

import Link from "next/link";
import {
  Target,
  Shield,
  Zap,
  Globe2,
  TrendingUp,
  AlertTriangle,
  FileDown,
  ArrowLeft,
  Layers,
  BarChart3,
  Users,
  Sparkles,
  Loader2,
  BookOpen,
} from "lucide-react";
import { useStrategySummary } from "@/hooks/use-strategy-summary";
import { getApiBaseUrl } from "@/lib/api-base";

const moatIcons = [Globe2, Shield, Layers, Zap, Sparkles];

const STATIC_MOAT = [
  {
    title: "سياق سعودي حقيقي",
    desc: "عربي أولاً، SAR، زاتكا/فوترة ضمن المسار، واتساب كقناة تشغيل لا كملحق.",
    icon: Globe2,
  },
  {
    title: "حوكمة وليس مجرد أتمتة",
    desc: "موافقات قبل الإرسال الحساس، عزل متعدد المستأجرين، سجلات تدقيق قابلة للتوسع.",
    icon: Shield,
  },
  {
    title: "تشغيل إيرادات كامل",
    desc: "من الاكتشاف إلى التحصيل والتحليلات — وليس شات بوت معزول عن CRM والدفع.",
    icon: Layers,
  },
  {
    title: "تكاملات مفتوحة",
    desc: "مسار Salesforce/CRM، Stripe، توقيع، صوت — تقليل قفل المنصة الواحدة.",
    icon: Zap,
  },
];

const competitors = [
  { cat: "CRM + وكلاء", ex: "Salesforce / Agentforce", them: "عمق CRM، مؤسسات", gap: "تكلفة واعتماد بيانات داخل CRM" },
  { cat: "ذكاء إيرادات", ex: "Gong ونظيرات الفئة", them: "مكالمات، تدريب، توقعات", gap: "سيناريوهات محلية/قنوات مختلطة" },
  { cat: "تسلسلات مبيعات", ex: "Outreach ونظيراتها", them: "أتمتة قوية", gap: "تعقيد وتكوين غربي أحياناً" },
  { cat: "وكلاء SDR مستقلون", ex: "11x، Tario…", them: "صيد وقنوات", gap: "حوكمة متعددة مستأجرين + امتثال محلي" },
];

const STATIC_PHASES = [
  { n: "0", t: "أساس التشغيل", d: "0–90 يوماً", items: ["CI واختبارات حرجة", "مراقبة وAPI صحة", "عميل مرجعي pilot", "روابط تسويق موحّدة"] },
  { n: "1", t: "تمييز تنفيذي", d: "3–9 أشهر", items: ["حوكمة أعمق", "CRM أولوية", "واتساب معتمد", "GTM بأرقام منسوبة"] },
  { n: "2", t: "توسع مؤسسي", d: "9–18 شهراً", items: ["امتثال/تخزين", "ذكاء إيرادات أوضح", "شراكات تكامل"] },
  { n: "3", t: "توسع جغرافي", d: "18–36 شهراً", items: ["خليج/قطاعات", "تكاملات استراتيجية"] },
];

const gapsClosing = {
  tech: ["مراقبة SLO وتكلفة LLM لكل مستأجر", "اختبارات حمل وانحدار", "زاتكا/ERP أعمق حسب ICP", "تجربة منتج موحّدة بصرياً"],
  business: ["مراجع عملاء بأرقام محافظة", "جملة تموضع واحدة", "شركاء بعقود وتدريب", "محتوى ثقة وخصوصية"],
};

const FALLBACK_QUOTE =
  "«ليس مجرد أداة — بل شركة مبيعات رقمية مؤتمتة بالذكاء الاصطناعي تعمل على مدار الساعة، تتطور ذاتياً، وتولد قيمة قابلة للقياس.»";

const FALLBACK_TARGETS = [
  { k: "النمو", v: "+3–5× إيرادات سنوياً (مقابل خط أساس لكل عميل)" },
  { k: "الكفاءة", v: "−70–80% عمل يدوي في مسار المبيعات" },
  { k: "التنبؤ", v: "دقة أعلى في أفق 30 يوماً (بيانات + معايرة)" },
  { k: "الدورة", v: "حوالي −40% زمن إغلاق نسبي للخط الأساسي" },
  { k: "الاكتساب", v: "حوالي −31% تكلفة اكتساب عبر الأتمتة" },
  { k: "الامتثال", v: "PDPL + ممارسات جاهزة لـ SOC2 للضوابط والسجلات" },
];

export function StrategyPageClient() {
  const { data, loading } = useStrategySummary();
  const api = getApiBaseUrl();

  const quote = data?.vision.tagline_ar ? `«${data.vision.tagline_ar}»` : FALLBACK_QUOTE;
  const auditableRows =
    data?.auditable_targets?.length ?
      data.auditable_targets.map((t) => ({ k: t.label_ar, v: t.target }))
    : FALLBACK_TARGETS;

  const moatCards =
    data?.moat_pillars?.length ?
      data.moat_pillars.map((text, i) => {
        const Icon = moatIcons[i % moatIcons.length];
        return { title: `محور تمييز ${i + 1}`, desc: text, icon: Icon };
      })
    : STATIC_MOAT.map((m) => ({ title: m.title, desc: m.desc, icon: m.icon }));

  const phaseBlocks =
    data?.execution_phases_detail?.length ?
      data.execution_phases_detail.map((p) => ({
        n: String(p.id),
        t: p.name_ar,
        d: p.window,
        items: p.deliverables,
      }))
    : STATIC_PHASES;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-30%,rgba(13,148,136,0.22),transparent)]" />

      <header className="relative border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-700 shadow-lg shadow-teal-900/40">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400/90">Dealix Strategy</p>
              <h1 className="text-xl font-bold">الانتقال للمستوى التالي</h1>
              {data?.blueprint_version && (
                <p className="text-[10px] text-slate-500 mt-1">Blueprint {data.blueprint_version}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {loading && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                تحديث من API
              </span>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
              الرئيسية
            </Link>
            <a
              href={`${api}/api/v1/strategy/summary`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-teal-500/40 bg-teal-950/50 px-4 py-2 text-sm text-teal-200 hover:bg-teal-900/40"
            >
              JSON API
            </a>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl space-y-16 px-6 py-14">
        <section className="space-y-4">
          <p className="text-sm font-medium text-teal-400">ملخص تنفيذي</p>
          <blockquote className="rounded-2xl border border-teal-500/20 bg-teal-950/25 px-5 py-4 text-base italic leading-relaxed text-teal-100/95">
            {quote}
          </blockquote>
          <p className="text-lg leading-relaxed text-slate-300">
            <strong className="text-white">Dealix</strong> —{" "}
            {data?.positioning ??
              "نظام تشغيل إيرادات وعمليات يجمع الاكتشاف، التأهيل، القنوات، العروض، التحصيل، والتحليلات مع حوكمة وعزل متعدد المستأجرين."}
          </p>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <BarChart3 className="h-5 w-5 text-teal-400" />
            مقاييس مستهدفة (قابلة للتدقيق)
            {data && <span className="text-xs font-normal text-teal-500/80">— مباشر من API</span>}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {auditableRows.map((row) => (
              <div
                key={row.k + row.v}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right text-sm"
              >
                <p className="font-bold text-teal-300">{row.k}</p>
                <p className="mt-1 text-slate-400">{row.v}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            المعرفة والـ RAG داخل المنتج (PostgreSQL + pgvector) — بدون الاعتماد على منصات RAG خارجية كطبقة أساسية.
          </p>
        </section>

        {data?.design_principles && data.design_principles.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <BookOpen className="h-5 w-5 text-teal-400" />
              مبادئ التصميم
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.design_principles.map((pr) => (
                <div
                  key={pr.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right text-sm"
                >
                  <p className="font-bold text-white">{pr.title_ar}</p>
                  <p className="mt-1 text-slate-400">{pr.summary}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
            <Target className="h-5 w-5 text-teal-400" />
            أضلاع التمييز (لماذا نتقدّم منطقياً)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {moatCards.map((m) => (
              <div
                key={m.title + m.desc}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-teal-500/35"
              >
                <m.icon className="mb-3 h-8 w-8 text-teal-400/90" />
                <h3 className="font-bold text-white">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <BarChart3 className="h-5 w-5 text-teal-400" />
            إطار مقارنة معياري (ليس تطابقاً حرفياً)
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[640px] text-right text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-3 font-semibold text-teal-200">الفئة</th>
                  <th className="p-3 font-semibold text-teal-200">أمثلة سوق</th>
                  <th className="p-3 font-semibold text-teal-200">قوتهم النموذجية</th>
                  <th className="p-3 font-semibold text-teal-200">فجوة نموذجية</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((r) => (
                  <tr key={r.cat} className="border-b border-white/5 text-slate-300">
                    <td className="p-3 font-medium text-white">{r.cat}</td>
                    <td className="p-3">{r.ex}</td>
                    <td className="p-3 text-slate-400">{r.them}</td>
                    <td className="p-3 text-slate-500">{r.gap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {data?.market_frame ??
              "اتجاه السوق العالمي نحو «أنظمة إجراء» مدمجة بالذكاء (Revenue Action Orchestration) يفرض إظهار إجراءات قابلة للقياس وليس تقارير فقط."}
          </p>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <TrendingUp className="h-5 w-5 text-teal-400" />
            ما نُغلقه من فجوات (تقني وغير تقني)
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5">
              <h3 className="mb-3 font-bold text-emerald-200">تقني / منتج</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                {gapsClosing.tech.map((x) => (
                  <li key={x} className="flex gap-2">
                    <span className="text-emerald-500">▸</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-5">
              <h3 className="mb-3 font-bold text-cyan-200">تسويق / مبيعات / شراكات</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                {gapsClosing.business.map((x) => (
                  <li key={x} className="flex gap-2">
                    <span className="text-cyan-500">▸</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
            <Layers className="h-5 w-5 text-teal-400" />
            خارطة الطريق (مراحل)
            {data?.execution_phases_detail?.length ? (
              <span className="text-xs font-normal text-teal-500/80">— من API</span>
            ) : null}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {phaseBlocks.map((p) => (
              <div key={p.n} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-black text-teal-400">{p.n}</span>
                  <span className="text-xs text-slate-500">{p.d}</span>
                </div>
                <h3 className="mt-1 font-bold text-white">{p.t}</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
                  {p.items.map((i) => (
                    <li key={i}>• {i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-500/25 bg-amber-950/20 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-100">
            <AlertTriangle className="h-5 w-5" />
            مخاطر يجب إدارتها بصراحة
          </h2>
          <ul className="space-y-2 text-sm text-amber-100/80">
            <li>• تكلفة LLM والقنوات الخارجية إن لم تُحسب لكل مستأجر.</li>
            <li>• تعميق وكلاء CRM العالميين — التمييز بالمحلية والامتثال والسرعة.</li>
            <li>• أي إرسال تسويقي يحتاج سياسة وموافقات (واتساب، بريد، خصوصية).</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-950/40 to-slate-900/60 p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <FileDown className="h-5 w-5 text-teal-300" />
            الوثيقة الكاملة والروابط السريعة
          </h2>
          <p className="mb-6 text-sm text-slate-400">
            النسخة الكاملة Markdown تُحدَّث في المستودع وتُنسَخ تلقائياً إلى{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5">public/strategy/</code> عند المزامنة.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="/strategy/DEALIX_NEXT_LEVEL_MASTER_PLAN_AR.md"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-teal-400"
            >
              <FileDown className="h-4 w-4" />
              وثيقة المستوى التالي (.md)
            </a>
            <a
              href="/strategy/ULTIMATE_EXECUTION_MASTER_AR.md"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-500/50 bg-teal-950/40 px-6 py-3 text-sm font-bold text-teal-100 hover:bg-teal-900/50"
            >
              <FileDown className="h-4 w-4" />
              وثيقة التنفيذ الشاملة v4 (.md)
            </a>
            <a
              href="/strategy/INTEGRATION_MASTER_AR.md"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-6 py-3 text-sm font-bold text-emerald-100 hover:bg-emerald-900/40"
            >
              <FileDown className="h-4 w-4" />
              ملف الربط الشامل — التكاملات والإطلاق (.md)
            </a>
            <Link
              href="/investors"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              عرض المستثمرين (PDF)
            </Link>
            <Link
              href="/marketers"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              <Users className="h-4 w-4" />
              بوابة المسوّقين
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              الموارد والـ ZIP
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              لوحة التشغيل
            </Link>
          </div>
        </section>

        <footer className="border-t border-white/10 pb-12 pt-8 text-center text-xs text-slate-600">
          وثائق حية — راجع ربع سنوياً. المصدر:{" "}
          <code className="text-slate-500">docs/DEALIX_NEXT_LEVEL_MASTER_PLAN_AR.md</code>،{" "}
          <code className="text-slate-500">docs/ULTIMATE_EXECUTION_MASTER_AR.md</code>،{" "}
          <code className="text-slate-500">docs/INTEGRATION_MASTER_AR.md</code>،{" "}
          <code className="text-slate-500">MASTER-BLUEPRINT.mdc</code>
        </footer>
      </main>
    </div>
  );
}
