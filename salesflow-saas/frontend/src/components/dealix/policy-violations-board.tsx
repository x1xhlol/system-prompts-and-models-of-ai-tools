"use client";

type Violation = {
  id: string; source: string; description: string;
  severity: string; status: string; detected_at: string;
  owner?: string;
};

const SEVERITY_STYLES: Record<string, { bg: string; text: string; labelAr: string }> = {
  critical: { bg: "bg-red-500/20", text: "text-red-500", labelAr: "حرج" },
  high: { bg: "bg-orange-500/20", text: "text-orange-500", labelAr: "عالي" },
  medium: { bg: "bg-yellow-500/20", text: "text-yellow-500", labelAr: "متوسط" },
  low: { bg: "bg-gray-500/20", text: "text-gray-400", labelAr: "منخفض" },
};

const STATUS_LABELS: Record<string, string> = {
  detected: "تم الاكتشاف",
  reviewing: "قيد المراجعة",
  resolved: "تم الحل",
  accepted: "مقبول",
};

export function PolicyViolationsBoard({ violations = [] }: { violations?: Violation[] }) {
  const active = violations.filter((v) => v.status === "detected" || v.status === "reviewing");
  const resolved = violations.filter((v) => v.status === "resolved" || v.status === "accepted");

  return (
    <div className="space-y-4 p-6" dir="rtl">
      <h2 className="text-xl font-bold text-right">لوحة مخالفات السياسات | Policy Violations Board</h2>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="glass-card p-3 border border-border/40 text-center">
          <div className="text-xs text-muted-foreground">الإجمالي</div>
          <div className="text-xl font-bold">{violations.length}</div>
        </div>
        <div className="glass-card p-3 border border-border/40 text-center">
          <div className="text-xs text-muted-foreground">نشطة</div>
          <div className="text-xl font-bold text-yellow-500">{active.length}</div>
        </div>
        <div className="glass-card p-3 border border-border/40 text-center">
          <div className="text-xs text-muted-foreground">حرجة</div>
          <div className="text-xl font-bold text-red-500">{violations.filter((v) => v.severity === "critical" && (v.status === "detected" || v.status === "reviewing")).length}</div>
        </div>
        <div className="glass-card p-3 border border-border/40 text-center">
          <div className="text-xs text-muted-foreground">محلولة</div>
          <div className="text-xl font-bold text-emerald-500">{resolved.length}</div>
        </div>
      </div>

      {/* Active Violations */}
      {active.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-2 text-right">المخالفات النشطة</h3>
          <div className="space-y-2">
            {active.map((v) => {
              const style = SEVERITY_STYLES[v.severity] || SEVERITY_STYLES.medium;
              return (
                <div key={v.id} className="glass-card p-4 border border-border/40">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-muted-foreground">{STATUS_LABELS[v.status] || v.status}</span>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className={`text-xs px-2 py-0.5 rounded ${style.bg} ${style.text}`}>{style.labelAr}</span>
                        <span className="text-xs text-muted-foreground">{v.source}</span>
                      </div>
                      <p className="text-sm mt-1">{v.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {violations.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">لا توجد مخالفات مسجلة</p>
      )}
    </div>
  );
}
