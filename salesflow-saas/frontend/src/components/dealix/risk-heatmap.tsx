"use client";

type HeatmapData = Record<string, Record<string, number>>;

const CATEGORY_LABELS: Record<string, string> = {
  pdpl: "PDPL",
  zatca: "ZATCA",
  sdaia: "SDAIA",
  nca: "NCA",
  sector_specific: "قطاعي",
  revenue: "الإيرادات",
  operations: "العمليات",
  partners: "الشراكات",
};

const RISK_LEVELS = ["critical", "high", "medium", "low"];
const RISK_LABELS: Record<string, string> = { critical: "حرج", high: "عالي", medium: "متوسط", low: "منخفض" };
const RISK_COLORS: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-emerald-500",
};

function HeatCell({ count, risk }: { count: number; risk: string }) {
  if (count === 0) return <td className="p-2 text-center text-xs text-muted-foreground">—</td>;
  const opacity = count >= 5 ? "opacity-100" : count >= 3 ? "opacity-80" : "opacity-60";
  return (
    <td className="p-2 text-center">
      <span className={`inline-block w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white ${RISK_COLORS[risk]} ${opacity}`}>
        {count}
      </span>
    </td>
  );
}

export function RiskHeatmap({ heatmap = {}, totalControls = 0 }: { heatmap?: HeatmapData; totalControls?: number }) {
  const categories = Object.keys(heatmap);

  return (
    <div className="space-y-4 p-6" dir="rtl">
      <h2 className="text-xl font-bold text-right">خريطة المخاطر الحرارية | Risk Heatmap</h2>
      <p className="text-sm text-muted-foreground text-right">إجمالي الضوابط: {totalControls}</p>

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">لا توجد بيانات — قم بتشغيل فحص الامتثال أولاً</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-right text-xs text-muted-foreground">الفئة</th>
                {RISK_LEVELS.map((level) => (
                  <th key={level} className="p-2 text-center text-xs text-muted-foreground">{RISK_LABELS[level]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat} className="border-t border-border/20">
                  <td className="p-2 text-right text-sm font-medium">{CATEGORY_LABELS[cat] || cat}</td>
                  {RISK_LEVELS.map((level) => (
                    <HeatCell key={level} count={heatmap[cat]?.[level] || 0} risk={level} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
