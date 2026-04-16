"use client";

type TrackForecast = {
  actual: number; forecast: number; variance: number;
  variance_percent?: number; unit: string;
};

type UnifiedForecast = {
  revenue: TrackForecast;
  partnerships: { actual_count: number; target_count: number; variance: number; unit: string };
  ma: { deals_in_progress: number; pipeline_target: number; variance: number; unit: string };
  expansion: { markets_launched: number; markets_planned: number; variance: number; unit: string };
};

function TrackRow({ label, labelAr, actual, target, variance, unit }: {
  label: string; labelAr: string; actual: number; target: number; variance: number; unit: string;
}) {
  const pct = target > 0 ? Math.round((actual / target) * 100) : 0;
  const color = pct >= 90 ? "text-emerald-500" : pct >= 70 ? "text-yellow-500" : "text-red-500";
  return (
    <div className="glass-card p-4 border border-border/40">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-lg font-bold ${color}`}>{pct}%</span>
        <div className="text-right">
          <span className="font-semibold">{labelAr}</span>
          <span className="text-xs text-muted-foreground block">{label}</span>
        </div>
      </div>
      <div className="w-full bg-border/20 rounded-full h-2 mb-2">
        <div className={`h-2 rounded-full ${pct >= 90 ? "bg-emerald-500" : pct >= 70 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>الانحراف: {variance} {unit}</span>
        <span>الفعلي: {actual.toLocaleString()} | الهدف: {target.toLocaleString()} {unit}</span>
      </div>
    </div>
  );
}

export function ActualVsForecastDashboard({ data }: { data?: UnifiedForecast }) {
  const d = data || {
    revenue: { actual: 0, forecast: 0, variance: 0, variance_percent: 0, unit: "SAR" },
    partnerships: { actual_count: 0, target_count: 0, variance: 0, unit: "partners" },
    ma: { deals_in_progress: 0, pipeline_target: 0, variance: 0, unit: "deals" },
    expansion: { markets_launched: 0, markets_planned: 0, variance: 0, unit: "markets" },
  };

  return (
    <div className="space-y-4 p-6" dir="rtl">
      <div className="flex justify-between items-center">
        <button className="text-xs px-3 py-1 rounded border border-border/40 hover:border-primary/40">إعادة المعايرة</button>
        <h2 className="text-xl font-bold text-right">الفعلي مقابل التوقعات | Actual vs Forecast</h2>
      </div>

      <div className="space-y-3">
        <TrackRow label="Revenue" labelAr="الإيرادات" actual={d.revenue.actual} target={d.revenue.forecast} variance={d.revenue.variance} unit={d.revenue.unit} />
        <TrackRow label="Partnerships" labelAr="الشراكات" actual={d.partnerships.actual_count} target={d.partnerships.target_count} variance={d.partnerships.variance} unit={d.partnerships.unit} />
        <TrackRow label="M&A Deals" labelAr="صفقات الاستحواذ" actual={d.ma.deals_in_progress} target={d.ma.pipeline_target} variance={d.ma.variance} unit={d.ma.unit} />
        <TrackRow label="Expansion" labelAr="التوسع" actual={d.expansion.markets_launched} target={d.expansion.markets_planned} variance={d.expansion.variance} unit={d.expansion.unit} />
      </div>
    </div>
  );
}
