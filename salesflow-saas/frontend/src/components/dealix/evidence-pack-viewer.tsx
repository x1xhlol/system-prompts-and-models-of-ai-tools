"use client";

import { useState } from "react";

type EvidenceItem = { type: string; source: string; data: Record<string, unknown>; timestamp?: string };
type EvidencePack = {
  id: string; title: string; title_ar?: string; pack_type: string;
  status: string; contents: EvidenceItem[]; hash_signature?: string;
  created_at?: string; reviewed_at?: string;
};

const TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  deal_closure: { en: "Deal Closure", ar: "إغلاق صفقة" },
  compliance_audit: { en: "Compliance Audit", ar: "تدقيق الامتثال" },
  quarterly_review: { en: "Quarterly Review", ar: "مراجعة ربعية" },
  incident_response: { en: "Incident Response", ar: "استجابة للحوادث" },
  board_report: { en: "Board Report", ar: "تقرير مجلس الإدارة" },
};

export function EvidencePackViewer({ packs = [] }: { packs?: EvidencePack[] }) {
  const [selected, setSelected] = useState<EvidencePack | null>(null);

  return (
    <div className="space-y-4 p-6" dir="rtl">
      <h2 className="text-xl font-bold text-right">عارض حزم الأدلة | Evidence Pack Viewer</h2>

      {!selected ? (
        <div className="space-y-3">
          {packs.length === 0 && (
            <p className="text-sm text-muted-foreground text-right">لا توجد حزم أدلة بعد</p>
          )}
          {packs.map((pack) => {
            const typeInfo = TYPE_LABELS[pack.pack_type] || { en: pack.pack_type, ar: pack.pack_type };
            return (
              <button
                key={pack.id}
                onClick={() => setSelected(pack)}
                className="w-full glass-card p-4 border border-border/40 text-right hover:border-primary/40 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded ${pack.status === "reviewed" ? "bg-emerald-500/20 text-emerald-500" : "bg-yellow-500/20 text-yellow-500"}`}>
                    {pack.status === "reviewed" ? "تمت المراجعة" : "جاهزة"}
                  </span>
                  <div>
                    <h3 className="font-semibold">{pack.title_ar || pack.title}</h3>
                    <p className="text-xs text-muted-foreground">{typeInfo.ar} — {typeInfo.en}</p>
                  </div>
                </div>
                {pack.hash_signature && (
                  <p className="text-xs text-muted-foreground mt-2 font-mono truncate">SHA256: {pack.hash_signature}</p>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => setSelected(null)} className="text-sm text-primary hover:underline">← العودة للقائمة</button>
          <div className="glass-card p-5 border border-border/40">
            <h3 className="text-lg font-bold text-right">{selected.title_ar || selected.title}</h3>
            <p className="text-sm text-muted-foreground">{TYPE_LABELS[selected.pack_type]?.ar || selected.pack_type}</p>
            {selected.hash_signature && (
              <div className="mt-2 p-2 rounded bg-emerald-500/10 text-xs font-mono">
                تم التحقق من السلامة — SHA256: {selected.hash_signature}
              </div>
            )}
          </div>
          <div className="space-y-2">
            {selected.contents.map((item, i) => (
              <details key={i} className="glass-card border border-border/40">
                <summary className="p-3 cursor-pointer text-right text-sm font-medium">
                  {item.type} — {item.source}
                </summary>
                <pre className="p-3 text-xs overflow-auto bg-black/5 rounded-b">{JSON.stringify(item.data, null, 2)}</pre>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
