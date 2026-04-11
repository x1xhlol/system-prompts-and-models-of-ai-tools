"use client";

import Link from "next/link";
import { Sparkles, Loader2, ExternalLink, BarChart3, Radio } from "lucide-react";
import { useStrategySummary } from "@/hooks/use-strategy-summary";
import { getApiBaseUrl } from "@/lib/api-base";

/**
 * Executive strip on the main dashboard — GET /api/v1/strategy/summary,
 * or embedded fallback when the API is offline (no amber warning box).
 */
export function StrategyBriefPanel() {
  const { data, loading, source } = useStrategySummary();
  const api = getApiBaseUrl();

  if (loading) {
    return (
      <div className="glass-card border border-primary/20 bg-primary/5 p-4 md:p-5 flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
        <span className="text-sm">جاري تحميل ملخص الاستراتيجية…</span>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const isLive = source === "live";

  return (
    <div className="glass-card border border-teal-500/25 bg-gradient-to-br from-teal-950/30 to-card p-5 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex items-center gap-3 text-right">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 justify-end mb-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400/90">
                الاستراتيجية
              </p>
              {!isLive && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <Radio className="h-3 w-3 opacity-70" />
                  نسخة مضمّنة — شغّل الـ API للبيانات المباشرة
                </span>
              )}
              {isLive && (
                <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/40 bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  مباشر من API
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-foreground">{data.product}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              الإصدار {data.blueprint_version} — {data.positioning}
            </p>
          </div>
        </div>
        <a
          href={`${api}/api/v1/strategy/summary`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/40 px-3 py-1.5 text-xs text-teal-200 hover:bg-teal-950/50 self-start"
        >
          JSON
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <blockquote className="text-sm leading-relaxed text-foreground/90 border-r-2 border-teal-500/50 pr-3">
        {data.vision.tagline_ar}
      </blockquote>

      {data.kpis?.length ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {data.kpis.slice(0, 4).map((k) => (
            <div
              key={k.axis + k.metric}
              className="rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-right"
            >
              <p className="text-[10px] uppercase text-muted-foreground font-semibold">{k.axis}</p>
              <p className="text-xs text-foreground mt-1 line-clamp-2">{k.metric}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 justify-end">
        <Link
          href="/strategy"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
        >
          <BarChart3 className="h-4 w-4" />
          تفاصيل الاستراتيجية والوثائق
        </Link>
      </div>
    </div>
  );
}
