"use client";

type ComplianceControl = {
  control_id: string; control_name: string; control_name_ar: string;
  category: string; status: string; risk_level: string;
  evidence_source: string; last_checked_at: string | null; owner: string | null;
};

const STATUS_STYLES: Record<string, { bg: string; text: string; labelAr: string }> = {
  compliant: { bg: "bg-emerald-500/20", text: "text-emerald-500", labelAr: "ممتثل" },
  partial: { bg: "bg-yellow-500/20", text: "text-yellow-500", labelAr: "جزئي" },
  non_compliant: { bg: "bg-red-500/20", text: "text-red-500", labelAr: "غير ممتثل" },
  not_applicable: { bg: "bg-gray-500/10", text: "text-gray-400", labelAr: "غير مطبق" },
};

const CATEGORY_LABELS: Record<string, string> = {
  pdpl: "نظام حماية البيانات الشخصية",
  zatca: "هيئة الزكاة والضريبة والجمارك",
  sdaia: "الهيئة السعودية للبيانات والذكاء الاصطناعي",
  nca: "الهيئة الوطنية للأمن السيبراني",
  sector_specific: "تنظيمات قطاعية",
};

const RISK_COLORS: Record<string, string> = {
  critical: "border-r-red-500",
  high: "border-r-orange-500",
  medium: "border-r-yellow-500",
  low: "border-r-emerald-500",
};

export function SaudiComplianceDashboard({ controls = [] }: { controls?: ComplianceControl[] }) {
  const grouped: Record<string, ComplianceControl[]> = {};
  controls.forEach((c) => {
    if (!grouped[c.category]) grouped[c.category] = [];
    grouped[c.category].push(c);
  });

  const total = controls.length;
  const compliant = controls.filter((c) => c.status === "compliant").length;
  const rate = total > 0 ? Math.round((compliant / total) * 100) : 0;

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <h2 className="text-xl font-bold text-right">لوحة الامتثال السعودي | Saudi Compliance Dashboard</h2>

      {/* Posture Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 border border-border/40 text-center">
          <div className="text-xs text-muted-foreground">إجمالي الضوابط</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>
        <div className="glass-card p-4 border border-border/40 text-center">
          <div className="text-xs text-muted-foreground">نسبة الامتثال</div>
          <div className={`text-2xl font-bold ${rate >= 80 ? "text-emerald-500" : rate >= 50 ? "text-yellow-500" : "text-red-500"}`}>{rate}%</div>
        </div>
        <div className="glass-card p-4 border border-border/40 text-center">
          <div className="text-xs text-muted-foreground">ممتثل</div>
          <div className="text-2xl font-bold text-emerald-500">{compliant}/{total}</div>
        </div>
      </div>

      {/* Scan Button */}
      <div className="text-center">
        <button className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm hover:opacity-90">
          تشغيل فحص الامتثال الآن
        </button>
      </div>

      {/* Controls by Category */}
      {Object.entries(grouped).map(([category, catControls]) => (
        <section key={category} className="space-y-2">
          <h3 className="text-lg font-semibold text-right">{CATEGORY_LABELS[category] || category}</h3>
          {catControls.map((control) => {
            const style = STATUS_STYLES[control.status] || STATUS_STYLES.non_compliant;
            const riskBorder = RISK_COLORS[control.risk_level] || "";
            return (
              <div key={control.control_id} className={`glass-card p-3 border border-border/40 border-r-4 ${riskBorder}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-0.5 rounded ${style.bg} ${style.text}`}>{style.labelAr}</span>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground ml-2">{control.control_id}</span>
                    <span className="text-sm font-medium">{control.control_name_ar || control.control_name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      ))}

      {controls.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">لا توجد ضوابط مسجلة — قم بتشغيل الفحص أولاً</p>
      )}
    </div>
  );
}
