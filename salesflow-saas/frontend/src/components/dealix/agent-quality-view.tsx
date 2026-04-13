"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Activity, LineChart } from "lucide-react";

type Snap = {
  strategic_deals_total: number;
  negotiation_rounds_total: number;
  avg_negotiation_rounds_per_deal: number;
  deals_high_ai_confidence: number;
  labels_ar: Record<string, string>;
  loop_hints_ar: string[];
};

export function AgentQualityView() {
  const [data, setData] = useState<Snap | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    void (async () => {
      const r = await apiFetch("/api/v1/strategic-deals/agent-quality/snapshot");
      if (!on) return;
      if (!r.ok) {
        setErr(`تعذر التحميل (${r.status})`);
        return;
      }
      setData(await r.json());
    })();
    return () => {
      on = false;
    };
  }, []);

  if (err) {
    return <div className="glass-card p-6 m-4 text-destructive">{err}</div>;
  }
  if (!data) {
    return <div className="glass-card p-6 m-4">جارٍ التحميل…</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">حلقة جودة الوكلاء</h1>
        <p className="text-sm text-muted-foreground mt-1">مؤشرات مساعدة من مسار الصفقات الاستراتيجية — توسع لاحقاً بسجلات الرسائل والتحويل.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Activity className="w-4 h-4" />
            {data.labels_ar.negotiation_depth}
          </div>
          <p className="text-2xl font-bold">{data.negotiation_rounds_total}</p>
          <p className="text-xs text-muted-foreground">متوسط {data.avg_negotiation_rounds_per_deal} جولة / صفقة</p>
        </div>
        <div className="glass-card p-5 space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <LineChart className="w-4 h-4" />
            {data.labels_ar.high_confidence_deals}
          </div>
          <p className="text-2xl font-bold">{data.deals_high_ai_confidence}</p>
          <p className="text-xs text-muted-foreground">من أصل {data.strategic_deals_total} صفقة</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-2">
        <h2 className="font-semibold text-sm">تحسين مستمر</h2>
        <ul className="list-disc pr-5 text-sm text-muted-foreground space-y-1">
          {data.loop_hints_ar.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
