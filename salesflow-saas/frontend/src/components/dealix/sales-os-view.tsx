"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Receipt, Wallet, AlertCircle, Target } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

type LedgerItem = {
  commission_id: string;
  deal_title: string;
  deal_stage?: string | null;
  deal_value_sar?: number | null;
  affiliate_name?: string | null;
  amount_sar: number;
  rate: number;
  status_ar: string;
  payout_status_ar?: string | null;
  approved_at?: string | null;
  paid_at?: string | null;
};

type LedgerPayload = {
  demo_mode?: boolean;
  items: LedgerItem[];
  summary?: {
    pending_review?: number;
    approved_unpaid?: number;
    paid?: number;
    total_amount_sar?: number;
  };
};

type QuotaPayload = {
  monthly_target_sar: number;
  pipeline_open_sar: number;
  attainment_ratio: number;
  note_ar?: string;
} | null;

type TaskItem = {
  id: string;
  type?: string;
  subject?: string;
  scheduled_at?: string | null;
};

type Overview = {
  commission_ledger: LedgerPayload;
  quota: QuotaPayload;
  tasks: TaskItem[];
  rep_onboarding?: { title_ar?: string };
};

function formatSar(n: number) {
  return new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(n) + " ر.س";
}

export function SalesOsView() {
  const [data, setData] = useState<Overview | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await apiFetch("/api/v1/sales-os/overview", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = (await r.json()) as Overview;
      setData(j);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "تعذّر التحميل");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const ledger = data?.commission_ledger;
  const summary = ledger?.summary;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 leading-relaxed text-right rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2 flex flex-wrap items-center gap-2 justify-end">
            <Receipt className="w-8 h-8 text-primary shrink-0" />
            دفتر العمولات — صفقة إلى دفعة
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            شفافية كاملة: قيمة الصفقة، نسبة العمولة، حالة الاعتماد، والدفعة. بدون تسجيل دخول تُعرض بيانات توضيحية؛ مع JWT يُعرض مستأجرك.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </button>
      </div>

      {err && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-destructive">تعذّر الاتصال بالـ API</p>
            <p className="text-muted-foreground mt-1">{err} — تأكد من تشغيل الخادم و<code className="rounded bg-background/80 px-1">NEXT_PUBLIC_API_URL</code>.</p>
          </div>
        </div>
      )}

      {loading && !data && !err && (
        <div className="glass-card p-12 text-center text-muted-foreground">جاري التحميل…</div>
      )}

      {ledger && (
        <>
          {ledger.demo_mode && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-200/90">
              وضع توضيحي — عند ربط حساب ووجود عمولات في قاعدة البيانات تظهر بياناتك الفعلية.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 border border-border/50">
              <p className="text-xs font-bold text-muted-foreground mb-1">قيد المراجعة</p>
              <p className="text-2xl font-black">{summary?.pending_review ?? "—"}</p>
            </div>
            <div className="glass-card p-5 border border-border/50">
              <p className="text-xs font-bold text-muted-foreground mb-1">معتمد غير مدفوع</p>
              <p className="text-2xl font-black">{summary?.approved_unpaid ?? "—"}</p>
            </div>
            <div className="glass-card p-5 border border-border/50">
              <p className="text-xs font-bold text-muted-foreground mb-1">مدفوع</p>
              <p className="text-2xl font-black">{summary?.paid ?? "—"}</p>
            </div>
            <div className="glass-card p-5 border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-1 justify-end">
                <Wallet className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold text-muted-foreground">مجموع العمولات (غير مرفوض)</p>
              </div>
              <p className="text-2xl font-black text-primary">
                {summary?.total_amount_sar != null ? formatSar(summary.total_amount_sar) : "—"}
              </p>
            </div>
          </div>

          <div className="glass-card border border-border/50 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border/50 flex justify-between items-center flex-wrap gap-2">
              <h2 className="font-bold text-lg">سجل الصفقات والعمولات</h2>
              <span className="text-xs text-muted-foreground">{ledger.items.length} سجل</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right min-w-[720px]">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/50 bg-secondary/20">
                    <th className="py-3 px-4 font-medium">الصفقة</th>
                    <th className="py-3 px-4 font-medium">المسوّق</th>
                    <th className="py-3 px-4 font-medium">قيمة الصفقة</th>
                    <th className="py-3 px-4 font-medium">العمولة</th>
                    <th className="py-3 px-4 font-medium">الحالة</th>
                    <th className="py-3 px-4 font-medium">الدفعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {ledger.items.map((row) => (
                    <tr key={row.commission_id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-medium">{row.deal_title}</p>
                        {row.deal_stage && (
                          <span className="text-xs text-muted-foreground">{row.deal_stage}</span>
                        )}
                      </td>
                      <td className="py-4 px-4">{row.affiliate_name ?? "—"}</td>
                      <td className="py-4 px-4 font-mono text-foreground/90">
                        {row.deal_value_sar != null ? formatSar(row.deal_value_sar) : "—"}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-primary">{formatSar(row.amount_sar)}</span>
                        <span className="text-xs text-muted-foreground mr-2">
                          ({Math.round(row.rate * 100)}%)
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs bg-secondary/60 border border-border/50">
                          {row.status_ar}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground">
                        {row.payout_status_ar ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {data?.quota && (
        <div className="glass-card p-6 border border-border/50 space-y-3">
          <div className="flex items-center gap-2 justify-end">
            <Target className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold text-lg">الهدف مقابل الأنبوب (شهري)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">هدف شهري</p>
              <p className="text-xl font-black">{formatSar(data.quota.monthly_target_sar)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">أنبوب مفتوح</p>
              <p className="text-xl font-black">{formatSar(data.quota.pipeline_open_sar)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">نسبة التغطية (تقريبية)</p>
              <p className="text-xl font-black">{(data.quota.attainment_ratio * 100).toFixed(1)}%</p>
            </div>
          </div>
          {data.quota.note_ar && <p className="text-xs text-muted-foreground pt-2 border-t border-border/30">{data.quota.note_ar}</p>}
        </div>
      )}

      {data && data.tasks && data.tasks.length > 0 && (
        <div className="glass-card p-6 border border-border/50">
          <h2 className="font-bold text-lg mb-4">مهام اليوم (بداية Inbox)</h2>
          <ul className="space-y-2 text-sm">
            {data.tasks.slice(0, 8).map((t) => (
              <li key={t.id} className="flex justify-between gap-4 border-b border-border/20 pb-2 last:border-0">
                <span>{t.subject || t.type || "نشاط"}</span>
                <span className="text-muted-foreground text-xs shrink-0">{t.scheduled_at?.slice(0, 10) ?? ""}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
