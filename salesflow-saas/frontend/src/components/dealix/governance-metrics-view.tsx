"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { GoLiveReadinessCard } from "./go-live-readiness-card";
import { Target, Shield, TrendingUp } from "lucide-react";

type GovSnapshot = {
  operating_mode: { value: number; name: string; label_ar: string };
  north_star_hints_ar: Record<string, string>;
  governance_kpis: {
    auto_send_enabled: boolean;
    auto_negotiate_enabled: boolean;
    max_auto_commitment_sar: number;
    strategic_deals_total: number;
    deals_with_negotiation_rounds: number;
  };
};

export function GovernanceMetricsView() {
  const [snap, setSnap] = useState<GovSnapshot | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    void (async () => {
      const r = await apiFetch("/api/v1/strategic-deals/governance/snapshot");
      if (!on) return;
      if (!r.ok) {
        setErr(`تعذر جلب المؤشرات (${r.status})`);
        return;
      }
      setSnap(await r.json());
    })();
    return () => {
      on = false;
    };
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الحوكمة والمؤشرات</h1>
        <p className="text-sm text-muted-foreground mt-1">Go-live، وضع التشغيل، ومؤشرات موحّدة لثلاثة محاور المنتج.</p>
      </div>

      <GoLiveReadinessCard />

      {err && <div className="text-destructive text-sm">{err}</div>}

      {snap && (
        <>
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">وضع التشغيل والحدود</h2>
            </div>
            <p className="text-sm">
              <span className="font-medium">{snap.operating_mode.label_ar}</span>
              <span className="text-muted-foreground"> ({snap.operating_mode.name})</span>
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-secondary/30 p-3">
                إرسال تلقائي: {snap.governance_kpis.auto_send_enabled ? "مفعّل" : "غير مفعّل"}
              </div>
              <div className="rounded-lg bg-secondary/30 p-3">
                تفاوض تلقائي: {snap.governance_kpis.auto_negotiate_enabled ? "مفعّل" : "غير مفعّل"}
              </div>
              <div className="rounded-lg bg-secondary/30 p-3">
                حد الالتزام التلقائي: {snap.governance_kpis.max_auto_commitment_sar?.toLocaleString("ar-SA")} ر.س
              </div>
              <div className="rounded-lg bg-secondary/30 p-3">
                صفقات استراتيجية: {snap.governance_kpis.strategic_deals_total}
              </div>
              <div className="rounded-lg bg-secondary/30 p-3 sm:col-span-2">
                صفقات بجولات تفاوض مسجّلة: {snap.governance_kpis.deals_with_negotiation_rounds}
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">تلميحات North Star</h2>
            </div>
            <ul className="list-disc pr-5 text-sm text-muted-foreground space-y-1">
              {Object.entries(snap.north_star_hints_ar).map(([k, v]) => (
                <li key={k}>{v}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="glass-card p-6 flex gap-3 items-start">
        <TrendingUp className="w-5 h-5 shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          اربط هذه اللوحة ببيانات القمع والقنوات الفعلية عند تفعيل التكاملات؛ المؤشرات الحالية تعكس طبقة الصفقات الاستراتيجية والحوكمة.
        </p>
      </div>
    </div>
  );
}
