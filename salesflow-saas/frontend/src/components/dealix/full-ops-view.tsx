"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Layers, Plug, ShieldCheck, GitBranch, AlertCircle, Filter, Radio } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

type Connector = {
  connector_key: string;
  display_name_ar?: string | null;
  status: string;
  last_success_at?: string | null;
  last_attempt_at?: string | null;
  last_error?: string | null;
};

type RunFilter = "all" | "approval" | "auto";

type Snapshot = {
  demo_mode?: boolean;
  pending_approvals: number;
  domain_events_24h: number;
  audit_events_24h: number;
  connectors: Connector[];
  openclaw?: {
    recent_runs?: {
      run_id: string;
      task_type: string;
      status: string;
      started_at?: string;
      approval_required?: boolean;
    }[];
    promoted_memories?: number;
    media_drafts_pending?: number;
    canary?: {
      enforced: boolean;
      tenant_in_canary: boolean;
      canary_count: number;
      auto_class_a_requires_extra_approval: boolean;
      hint_ar?: string;
    };
    approval_sla?: {
      pending_total: number;
      pending_warn_count: number;
      pending_breach_count: number;
      resolved_count: number;
      avg_resolution_hours: number;
      warn_threshold_hours: number;
      breach_threshold_hours: number;
      health: "ok" | "warn" | "breach";
      escalation_by_level?: Record<string, number>;
      escalation_events_last_refresh?: number;
      alert_dispatch?: {
        attempted?: boolean;
        skipped_reason?: string | null;
        webhook_ok?: boolean | null;
        slack_ok?: boolean | null;
        dispatched_at?: string;
        cooldown_minutes?: number;
        next_eligible_at?: string;
      };
      alerts_config?: {
        enabled: boolean;
        webhook_configured: boolean;
        slack_configured: boolean;
        cooldown_minutes: number;
      };
    };
  };
  note_ar?: string;
};

type Overview = {
  commission_ledger?: { demo_mode?: boolean; summary?: Record<string, unknown> };
  daily_digest?: {
    suggested_actions_ar?: string[];
    upcoming_closes?: { title: string; expected_close_date?: string | null }[];
    tasks_preview?: { subject?: string; type?: string }[];
  } | null;
};

function statusColor(st: string) {
  if (st === "ok") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  if (st === "error" || st === "degraded") return "text-rose-400 bg-rose-500/10 border-rose-500/30";
  return "text-amber-200/90 bg-amber-500/10 border-amber-500/25";
}

function slaColor(s: string | undefined) {
  if (s === "breach") return "text-rose-400 bg-rose-500/10 border-rose-500/30";
  if (s === "warn") return "text-amber-300 bg-amber-500/10 border-amber-500/30";
  return "text-emerald-300 bg-emerald-500/10 border-emerald-500/30";
}

export function FullOpsView() {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [runFilter, setRunFilter] = useState<RunFilter>("all");
  const [liveTick, setLiveTick] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [r1, r2] = await Promise.all([
        apiFetch("/api/v1/operations/snapshot", { cache: "no-store" }),
        apiFetch("/api/v1/sales-os/overview", { cache: "no-store" }),
      ]);
      if (!r1.ok) throw new Error(`snapshot ${r1.status}`);
      setSnap((await r1.json()) as Snapshot);
      if (r2.ok) setOverview((await r2.json()) as Overview);
      setLiveTick((n) => n + 1);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطأ");
      setSnap(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** تحديث تلقائي كل 30 ثانية عندما التبويب ظاهر — يعيد جلب الكناري و SLA والتشغيلات بشكل حي. */
  useEffect(() => {
    pollRef.current = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      void load();
    }, 30000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [load]);

  const digest = overview?.daily_digest;

  const runsRaw = snap?.openclaw?.recent_runs ?? [];
  const filteredRuns = runsRaw.filter((r) => {
    if (runFilter === "all") return true;
    if (runFilter === "approval") return Boolean(r.approval_required);
    return r.approval_required === false;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 leading-relaxed text-right rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2 flex flex-wrap items-center gap-2 justify-end">
            <Layers className="w-8 h-8 text-primary shrink-0" />
            التشغيل الشامل — Full Auto Ops
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
            لقطة واحدة: موافقات معلّقة، أحداث وتدقيق 24 ساعة، صحة موصلات التكامل، وربط مع ملخّص Sales OS. مع JWT تُعرض بيانات المستأجر؛ بدون تسجيل يظهر وضع توضيحي.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 justify-end">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5" title="تحديث تلقائي كل 30 ثانية">
            <Radio className={`w-3.5 h-3.5 ${loading ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
            مباشر {liveTick > 0 ? `· ${liveTick}` : ""}
          </span>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary/50 text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </button>
        </div>
      </div>

      {err && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-destructive">تعذّر التحميل</p>
            <p className="text-muted-foreground mt-1">{err}</p>
          </div>
        </div>
      )}

      <div className="glass-card p-6 border border-border/50 space-y-3">
        <div className="flex items-center gap-2 justify-end text-sm font-bold text-primary">
          <GitBranch className="w-4 h-4" />
          حلقات التشغيل (مرجعية)
        </div>
        <ul className="text-xs md:text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li>صفقة: إنشاء → تحديث → تغيير مرحلة → تدقيق + حدث نطاق</li>
          <li>عمولة: اعتماد / تعليق / دفع → تدقيق + حدث (شفافية حتى الدفع)</li>
          <li>موافقات قنوات: طلب → مراجعة مدير → نتيجة + حدث</li>
          <li>موصلات: حالة مزامنة لـ CRM / واتساب / فوترة / بريد</li>
        </ul>
      </div>

      {snap && (
        <>
          {snap.demo_mode && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-200/90">
              لقطة توضيحية — سجّل الدخول لعرض أعداد حقيقية للمستأجر.
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 border border-border/50">
              <div className="flex items-center gap-2 mb-2 justify-end text-muted-foreground text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                موافقات معلّقة
              </div>
              <p className="text-3xl font-black">{snap.pending_approvals}</p>
            </div>
            <div className="glass-card p-5 border border-border/50">
              <p className="text-xs font-bold text-muted-foreground mb-2">أحداث النطاق (24 ساعة)</p>
              <p className="text-3xl font-black">{snap.domain_events_24h}</p>
            </div>
            <div className="glass-card p-5 border border-border/50">
              <p className="text-xs font-bold text-muted-foreground mb-2">سجل التدقيق (24 ساعة)</p>
              <p className="text-3xl font-black">{snap.audit_events_24h}</p>
            </div>
            <div className="glass-card p-5 border border-primary/20 bg-primary/5">
              <p className="text-xs font-bold text-muted-foreground mb-2">موصلات</p>
              <p className="text-3xl font-black">{snap.connectors?.length ?? 0}</p>
            </div>
          </div>

          {snap.openclaw?.canary && (
            <div className="glass-card p-5 border border-violet-500/35 bg-violet-500/5 space-y-2">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <h3 className="font-bold text-violet-100">OpenClaw — سياسة الكناري</h3>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    snap.openclaw.canary.tenant_in_canary
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                      : "border-amber-500/40 bg-amber-500/10 text-amber-100"
                  }`}
                >
                  {snap.openclaw.canary.tenant_in_canary ? "مستأجر كناري" : "خارج الكناري"}
                </span>
              </div>
              <p className="text-xs text-violet-100/80 leading-relaxed">{snap.openclaw.canary.hint_ar}</p>
              <p className="text-[11px] text-muted-foreground">
                فرض الكناري: {snap.openclaw.canary.enforced ? "مفعّل" : "غير مفعّل"} · عدد معرفات الكناري في الإعدادات:{" "}
                {snap.openclaw.canary.canary_count}
                {snap.openclaw.canary.auto_class_a_requires_extra_approval
                  ? " · يتطلب موافقة إضافية للتشغيل التلقائي (Class A)"
                  : ""}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="glass-card p-5 border border-indigo-500/30 bg-indigo-500/5">
              <p className="text-xs font-bold text-muted-foreground mb-2">OpenClaw Runs (آخر 5)</p>
              <p className="text-3xl font-black">{snap.openclaw?.recent_runs?.length ?? 0}</p>
            </div>
            <div className="glass-card p-5 border border-cyan-500/30 bg-cyan-500/5">
              <p className="text-xs font-bold text-muted-foreground mb-2">Memories مُرقّاة</p>
              <p className="text-3xl font-black">{snap.openclaw?.promoted_memories ?? 0}</p>
            </div>
            <div className="glass-card p-5 border border-fuchsia-500/30 bg-fuchsia-500/5">
              <p className="text-xs font-bold text-muted-foreground mb-2">Media Drafts (قيد المراجعة)</p>
              <p className="text-3xl font-black">{snap.openclaw?.media_drafts_pending ?? 0}</p>
            </div>
          </div>

          <div className={`glass-card p-5 border mt-4 ${slaColor(snap.openclaw?.approval_sla?.health)}`}>
            <h3 className="font-bold mb-3">Approval SLA</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs opacity-80">Pending</p>
                <p className="text-lg font-black">{snap.openclaw?.approval_sla?.pending_total ?? 0}</p>
              </div>
              <div>
                <p className="text-xs opacity-80">Warn</p>
                <p className="text-lg font-black">{snap.openclaw?.approval_sla?.pending_warn_count ?? 0}</p>
              </div>
              <div>
                <p className="text-xs opacity-80">Breach</p>
                <p className="text-lg font-black">{snap.openclaw?.approval_sla?.pending_breach_count ?? 0}</p>
              </div>
              <div>
                <p className="text-xs opacity-80">Avg Resolve (h)</p>
                <p className="text-lg font-black">{snap.openclaw?.approval_sla?.avg_resolution_hours ?? 0}</p>
              </div>
            </div>
            {snap.openclaw?.approval_sla?.escalation_by_level && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {(["0", "1", "2", "3"] as const).map((k) => (
                  <div key={k} className="rounded-lg border border-border/40 bg-background/40 px-2 py-1.5 text-center">
                    <span className="opacity-70">مستوى {k}</span>
                    <p className="font-black text-sm">{snap.openclaw?.approval_sla?.escalation_by_level?.[k] ?? 0}</p>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs mt-3 opacity-90">
              Thresholds: warn ≥ {snap.openclaw?.approval_sla?.warn_threshold_hours ?? 0}h, breach ≥{" "}
              {snap.openclaw?.approval_sla?.breach_threshold_hours ?? 0}h
            </p>
            {snap.openclaw?.approval_sla?.alerts_config && (
              <p className="text-[11px] mt-2 opacity-80">
                تنبيهات الـ SLA:{" "}
                {snap.openclaw.approval_sla.alerts_config.enabled ? "مفعّلة" : "معطّلة"} · Webhook:{" "}
                {snap.openclaw.approval_sla.alerts_config.webhook_configured ? "مهيأ" : "—"} · Slack:{" "}
                {snap.openclaw.approval_sla.alerts_config.slack_configured ? "مهيأ" : "—"} · تهدئة{" "}
                {snap.openclaw.approval_sla.alerts_config.cooldown_minutes} د
              </p>
            )}
            {snap.openclaw?.approval_sla?.alert_dispatch && (
              <p className="text-[11px] mt-1 font-mono opacity-90 break-all">
                آخر إشعار:{" "}
                {snap.openclaw.approval_sla.alert_dispatch.dispatched_at
                  ? snap.openclaw.approval_sla.alert_dispatch.dispatched_at
                  : snap.openclaw.approval_sla.alert_dispatch.skipped_reason || "—"}
                {snap.openclaw.approval_sla.alert_dispatch.next_eligible_at
                  ? ` · التالي بعد: ${snap.openclaw.approval_sla.alert_dispatch.next_eligible_at}`
                  : ""}
              </p>
            )}
          </div>

          <div className="glass-card border border-border/50 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border/50 flex items-center gap-2 justify-end">
              <Plug className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">صحة التكامل</h2>
            </div>
            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {(snap.connectors || []).map((c) => (
                <div
                  key={c.connector_key}
                  className={`rounded-xl border p-4 ${statusColor(c.status)}`}
                >
                  <p className="font-bold">{c.display_name_ar || c.connector_key}</p>
                  <p className="text-xs mt-1 opacity-90">الحالة: {c.status}</p>
                  {c.last_error && <p className="text-xs mt-2 opacity-80 line-clamp-2">{c.last_error}</p>}
                </div>
              ))}
            </div>
            {snap.note_ar && <p className="px-6 pb-4 text-xs text-muted-foreground">{snap.note_ar}</p>}
          </div>

          {!!snap.openclaw?.recent_runs?.length && (
            <div className="glass-card border border-border/50 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="font-bold">OpenClaw — Structured Progress</h3>
                <div className="flex flex-wrap items-center gap-2 justify-end">
                  <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                  {(
                    [
                      ["all", "الكل"],
                      ["approval", "يتطلب موافقة"],
                      ["auto", "تلقائي / آمن"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setRunFilter(id)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                        runFilter === id
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border/60 bg-background/40 text-muted-foreground hover:bg-secondary/50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {filteredRuns.length === 0 ? (
                  <p className="text-xs text-muted-foreground">لا توجد تشغيلات ضمن الفلتر الحالي.</p>
                ) : (
                  filteredRuns.map((r) => (
                    <div
                      key={r.run_id}
                      className="flex flex-wrap items-center justify-between gap-2 border border-border/40 rounded-lg px-3 py-2"
                    >
                      <span className="font-mono text-xs text-muted-foreground">{r.run_id.slice(0, 8)}</span>
                      <span>{r.task_type}</span>
                      <span className="text-xs">{r.status}</span>
                      {typeof r.approval_required === "boolean" && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            r.approval_required
                              ? "border-amber-500/40 text-amber-200"
                              : "border-emerald-500/35 text-emerald-200/90"
                          }`}
                        >
                          {r.approval_required ? "موافقة" : "آمن"}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}

      {overview?.commission_ledger?.summary && (
        <div className="glass-card p-6 border border-border/50">
          <h2 className="font-bold text-lg mb-4">ملخّص عمولات (من Sales OS)</h2>
          <pre className="text-xs font-mono bg-secondary/30 rounded-lg p-4 overflow-x-auto text-left dir-ltr">
            {JSON.stringify(overview.commission_ledger.summary, null, 2)}
          </pre>
        </div>
      )}

      {digest && (
        <div className="glass-card p-6 border border-border/50 space-y-4">
          <h2 className="font-bold text-lg">الملخّص اليومي (مع تسجيل الدخول)</h2>
          {digest.suggested_actions_ar && digest.suggested_actions_ar.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2">اقتراحات</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                {digest.suggested_actions_ar.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {digest.upcoming_closes && digest.upcoming_closes.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2">إغلاقات قريبة</p>
              <ul className="text-sm space-y-1">
                {digest.upcoming_closes.map((d, i) => (
                  <li key={i}>
                    {d.title} {d.expected_close_date ? `— ${d.expected_close_date}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {loading && !snap && !err && <div className="glass-card p-12 text-center text-muted-foreground">جاري التحميل…</div>}
    </div>
  );
}
