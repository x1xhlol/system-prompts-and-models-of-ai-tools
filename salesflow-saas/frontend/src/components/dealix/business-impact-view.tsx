"use client";

import { useEffect, useState } from "react";
import {
  Zap,
  Target,
  Gauge,
  ShieldCheck,
  Building2,
  ArrowUpRight,
  Sparkles,
  LineChart,
  Info,
} from "lucide-react";
import { getApiBaseUrl } from "../../lib/api-base";
import {
  VALUE_PROPOSITION_FALLBACK,
  type ValuePropositionPayload,
} from "../../lib/value-proposition-fallback";
import { ExecutiveRoiDashboard } from "./executive-roi-dashboard";

const iconFor = (id: string) => {
  switch (id) {
    case "velocity":
      return Gauge;
    case "conversion":
      return Target;
    case "cost":
      return Zap;
    case "trust":
      return ShieldCheck;
    default:
      return Sparkles;
  }
};

export function BusinessImpactView() {
  const [data, setData] = useState<ValuePropositionPayload>(VALUE_PROPOSITION_FALLBACK);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const base = getApiBaseUrl().replace(/\/$/, "");
    const url = `${base}/api/v1/value-proposition/`;
    fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: ValuePropositionPayload) => {
        setData(json);
        setLive(true);
      })
      .catch(() => {
        setData(VALUE_PROPOSITION_FALLBACK);
        setLive(false);
      });
  }, []);

  const demoRoi = {
    revenue_lift_percent: 18,
    win_rate: 0.31,
    pipeline_velocity_days: 22,
    manual_work_reduction_percent: 72,
    summary:
      "نموذج توضيحي: ارتفاع الإيراد، تحسين معدل الفوز، وتسريع الأنبوب مع تقليل العمل اليدوي — جاهز للعرض على الإدارة العليا وللمقارنة قبل/بعد.",
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="text-right space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
          <LineChart className="w-3.5 h-3.5" />
          القيمة للشركات
        </div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
          لماذا Dealix يصنع فرقاً عملياً؟
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-3xl mr-0 ml-auto leading-relaxed">
          {data.tagline_ar}
        </p>
      </div>

      {!live && (
        <div className="rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-right text-muted-foreground flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 text-primary/80 mt-0.5" />
          <span>
            يُعرض محتوى مضمّناً في الواجهة. عند تشغيل الـ API وضبط{" "}
            <code className="rounded bg-background/80 px-1 py-0.5 text-[11px]">NEXT_PUBLIC_API_URL</code>{" "}
            تُحدَّث البيانات تلقائياً من الخادم.
          </span>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.pillars.map((p) => {
          const Icon = iconFor(p.id);
          return (
            <div
              key={p.id}
              className="glass-card p-5 border border-border/60 flex gap-4 text-right hover:border-primary/30 transition-colors"
            >
              <div className="shrink-0 p-3 rounded-2xl bg-primary/15 text-primary">
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <h3 className="font-bold text-lg">{p.title_ar}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.summary_ar}</p>
                {p.metrics_hint && p.metrics_hint.length > 0 && (
                  <p className="text-[11px] text-muted-foreground/80 pt-1">
                    مؤشرات: {p.metrics_hint.join(" · ")}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <section className="glass-card p-6 border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 text-right">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 justify-end">
              <Sparkles className="w-5 h-5 text-primary" />
              إطار ROI للإدارة العليا
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl mr-0 ml-auto">
              {data.roi_framework_ar}
            </p>
          </div>
        </div>
        <ExecutiveRoiDashboard snapshot={demoRoi} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 border border-border/50 text-right space-y-3">
          <h3 className="font-bold flex items-center gap-2 justify-end">
            <Building2 className="w-5 h-5 text-emerald-500" />
            قطاعات جاهزة للتمثيل
          </h3>
          <p className="text-sm text-muted-foreground">
            ترسانة قطاعية وعروض وبرزنتيشن — لتقريب الصورة لصاحب القرار بسرعة.
          </p>
          <div className="flex flex-wrap gap-2 justify-end">
            {data.sectors_sample.map((s) => (
              <span
                key={s}
                className="text-xs px-3 py-1 rounded-full bg-secondary/60 border border-border/50"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="glass-card p-6 border border-border/50 text-right space-y-3">
          <h3 className="font-bold flex items-center gap-2 justify-end">
            <ArrowUpRight className="w-5 h-5 text-primary" />
            خطوة تالية مع العميل
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2 list-none">
            <li>• اربط الأهداف بأرقام: زمن الأنبوب، معدل الفوز، تكلفة الفريق المبيعاتي.</li>
            <li>• شغّل بوابة الجاهزية للتشغيل (Go-Live) للتأكد من القنوات والامتثال.</li>
            <li>• استخدم التحليلات ونبض السوق لمقارنة الفرق أسبوعياً.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
