"use client";

import { useEffect, useState } from "react";

type ExecutiveSnapshot = {
  revenue: { actual: number; forecast: number; variance_percent: number; pipeline_value: number; win_rate: number };
  approvals: { pending: number; warning: number; breach: number };
  connectors: { healthy: number; degraded: number; error: number };
  compliance: { compliant: number; partial: number; non_compliant: number; posture: string };
  contradictions: { active: number; critical: number };
  strategic_deals: { active: number; pipeline_value: number };
  evidence_packs: { ready: number; pending_review: number };
};

function MetricCard({ label, labelAr, value, status }: { label: string; labelAr: string; value: string | number; status?: string }) {
  const color = status === "danger" ? "text-red-500" : status === "warning" ? "text-yellow-500" : "text-emerald-500";
  return (
    <div className="rounded-lg border border-border/40 p-4 text-right">
      <div className="text-xs text-muted-foreground">{labelAr}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

export function ExecutiveRoom() {
  const [snapshot, setSnapshot] = useState<ExecutiveSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/v1/executive-room/snapshot`);
        if (res.ok) setSnapshot(await res.json());
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchSnapshot();
    const interval = setInterval(fetchSnapshot, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-center p-8 text-muted-foreground">جارٍ التحميل...</div>;

  const s = snapshot || {
    revenue: { actual: 0, forecast: 0, variance_percent: 0, pipeline_value: 0, win_rate: 0 },
    approvals: { pending: 0, warning: 0, breach: 0 },
    connectors: { healthy: 0, degraded: 0, error: 0 },
    compliance: { compliant: 0, partial: 0, non_compliant: 0, posture: "unknown" },
    contradictions: { active: 0, critical: 0 },
    strategic_deals: { active: 0, pipeline_value: 0 },
    evidence_packs: { ready: 0, pending_review: 0 },
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <h1 className="text-2xl font-bold text-right">غرفة القيادة التنفيذية</h1>
      <p className="text-sm text-muted-foreground text-right">Executive Room — نظرة شاملة على كل ما يحتاجه القائد التنفيذي</p>

      {/* Revenue */}
      <section className="glass-card p-5 border border-border/40">
        <h2 className="text-lg font-semibold mb-3 text-right">الإيرادات | Revenue</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Actual Revenue" labelAr="الإيراد الفعلي" value={`${s.revenue.actual.toLocaleString()} SAR`} />
          <MetricCard label="Forecast" labelAr="التوقعات" value={`${s.revenue.forecast.toLocaleString()} SAR`} />
          <MetricCard label="Variance" labelAr="الانحراف" value={`${s.revenue.variance_percent}%`} status={s.revenue.variance_percent < -10 ? "danger" : s.revenue.variance_percent < 0 ? "warning" : undefined} />
          <MetricCard label="Win Rate" labelAr="معدل الفوز" value={`${s.revenue.win_rate}%`} />
        </div>
      </section>

      {/* Approvals & Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="glass-card p-5 border border-border/40">
          <h2 className="text-lg font-semibold mb-3 text-right">الموافقات | Approvals</h2>
          <div className="grid grid-cols-3 gap-3">
            <MetricCard label="Pending" labelAr="معلقة" value={s.approvals.pending} status={s.approvals.pending > 10 ? "warning" : undefined} />
            <MetricCard label="SLA Warning" labelAr="تحذير SLA" value={s.approvals.warning} status={s.approvals.warning > 0 ? "warning" : undefined} />
            <MetricCard label="SLA Breach" labelAr="خرق SLA" value={s.approvals.breach} status={s.approvals.breach > 0 ? "danger" : undefined} />
          </div>
        </section>

        <section className="glass-card p-5 border border-border/40">
          <h2 className="text-lg font-semibold mb-3 text-right">الامتثال | Compliance</h2>
          <div className="grid grid-cols-3 gap-3">
            <MetricCard label="Compliant" labelAr="ممتثل" value={s.compliance.compliant} />
            <MetricCard label="Partial" labelAr="جزئي" value={s.compliance.partial} status={s.compliance.partial > 0 ? "warning" : undefined} />
            <MetricCard label="Non-Compliant" labelAr="غير ممتثل" value={s.compliance.non_compliant} status={s.compliance.non_compliant > 0 ? "danger" : undefined} />
          </div>
        </section>
      </div>

      {/* Connectors & Contradictions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <section className="glass-card p-5 border border-border/40">
          <h2 className="text-lg font-semibold mb-3 text-right">الموصلات | Connectors</h2>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm">سليمة</span><span className="text-emerald-500 font-bold">{s.connectors.healthy}</span></div>
            <div className="flex justify-between"><span className="text-sm">متراجعة</span><span className="text-yellow-500 font-bold">{s.connectors.degraded}</span></div>
            <div className="flex justify-between"><span className="text-sm">معطلة</span><span className="text-red-500 font-bold">{s.connectors.error}</span></div>
          </div>
        </section>

        <section className="glass-card p-5 border border-border/40">
          <h2 className="text-lg font-semibold mb-3 text-right">التناقضات | Contradictions</h2>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm">نشطة</span><span className="text-yellow-500 font-bold">{s.contradictions.active}</span></div>
            <div className="flex justify-between"><span className="text-sm">حرجة</span><span className="text-red-500 font-bold">{s.contradictions.critical}</span></div>
          </div>
        </section>

        <section className="glass-card p-5 border border-border/40">
          <h2 className="text-lg font-semibold mb-3 text-right">الصفقات الاستراتيجية | Strategic Deals</h2>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm">نشطة</span><span className="font-bold">{s.strategic_deals.active}</span></div>
            <div className="flex justify-between"><span className="text-sm">قيمة الأنبوب</span><span className="font-bold">{s.strategic_deals.pipeline_value.toLocaleString()} SAR</span></div>
          </div>
        </section>
      </div>
    </div>
  );
}
