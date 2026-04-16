"use client";

type Connector = {
  connector_key: string; display_name: string; display_name_ar: string;
  status: string; last_success_at: string | null; last_error: string | null; registered: boolean;
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string; labelAr: string }> = {
  ok: { bg: "bg-emerald-500/20", text: "text-emerald-500", label: "Healthy", labelAr: "سليم" },
  degraded: { bg: "bg-yellow-500/20", text: "text-yellow-500", label: "Degraded", labelAr: "متراجع" },
  error: { bg: "bg-red-500/20", text: "text-red-500", label: "Error", labelAr: "خطأ" },
  unknown: { bg: "bg-gray-500/20", text: "text-gray-400", label: "Unknown", labelAr: "غير معروف" },
  not_configured: { bg: "bg-gray-500/10", text: "text-gray-400", label: "Not Configured", labelAr: "غير مهيأ" },
};

export function ConnectorGovernanceBoard({ connectors = [] }: { connectors?: Connector[] }) {
  return (
    <div className="space-y-4 p-6" dir="rtl">
      <h2 className="text-xl font-bold text-right">لوحة حوكمة الموصلات | Connector Governance Board</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectors.map((conn) => {
          const style = STATUS_STYLES[conn.status] || STATUS_STYLES.unknown;
          return (
            <div key={conn.connector_key} className="glass-card p-4 border border-border/40">
              <div className="flex justify-between items-start">
                <span className={`text-xs px-2 py-1 rounded ${style.bg} ${style.text}`}>{style.labelAr}</span>
                <div className="text-right">
                  <h3 className="font-semibold">{conn.display_name_ar}</h3>
                  <p className="text-xs text-muted-foreground">{conn.display_name}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                {conn.last_success_at && (
                  <div className="flex justify-between">
                    <span>{new Date(conn.last_success_at).toLocaleDateString("ar-SA")}</span>
                    <span>آخر نجاح</span>
                  </div>
                )}
                {conn.last_error && (
                  <div className="text-red-400 truncate mt-1">{conn.last_error}</div>
                )}
                {!conn.registered && (
                  <div className="text-center mt-2">
                    <button className="text-xs px-3 py-1 rounded border border-border/40 hover:border-primary/40">تهيئة الموصل</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {connectors.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">لا توجد موصلات مسجلة</p>
        )}
      </div>
    </div>
  );
}
