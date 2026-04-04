"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Layers, Plug, ShieldCheck, GitBranch, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

type Connector = {
  connector_key: string;
  display_name_ar?: string | null;
  status: string;
  last_success_at?: string | null;
  last_attempt_at?: string | null;
  last_error?: string | null;
};

type Snapshot = {
  demo_mode?: boolean;
  pending_approvals: number;
  domain_events_24h: number;
  audit_events_24h: number;
  connectors: Connector[];
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

export function FullOpsView() {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const digest = overview?.daily_digest;

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
