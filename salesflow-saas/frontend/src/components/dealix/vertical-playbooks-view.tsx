"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { BookOpen } from "lucide-react";

type Playbook = {
  id: string;
  label_ar: string;
  label_en: string;
  primary_channels: string[];
  approval_value_threshold_sar: number;
  compliance_notes_ar: string[];
};

export function VerticalPlaybooksView() {
  const [items, setItems] = useState<Playbook[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [detail, setDetail] = useState<Playbook | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const r = await apiFetch("/api/v1/strategic-deals/playbooks");
      if (!r.ok) {
        setErr("تعذر تحميل القوالب القطاعية");
        return;
      }
      const j = (await r.json()) as { items: Playbook[] };
      setItems(j.items || []);
    })();
  }, []);

  useEffect(() => {
    if (!sel) {
      setDetail(null);
      return;
    }
    void (async () => {
      const r = await apiFetch(`/api/v1/strategic-deals/playbooks/${sel}`);
      if (r.ok) setDetail(await r.json());
    })();
  }, [sel]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start gap-3">
        <BookOpen className="w-8 h-8 text-primary shrink-0" />
        <div>
          <h1 className="text-2xl font-bold">Playbooks قطاعية</h1>
          <p className="text-sm text-muted-foreground mt-1">
            قنوات أولى، عتبات موافقة، وملاحظات امتثال — تغذي الوكلاء والسياسات دون تخصيص كود لكل عميل.
          </p>
        </div>
      </div>

      {err && <div className="text-destructive text-sm">{err}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card p-4 space-y-2 max-h-[480px] overflow-y-auto">
          {items.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSel(p.id)}
              className={`w-full text-right p-3 rounded-xl border transition-colors ${
                sel === p.id ? "border-primary bg-primary/10" : "border-border hover:bg-secondary/40"
              }`}
            >
              <div className="font-medium">{p.label_ar}</div>
              <div className="text-xs text-muted-foreground">{p.label_en}</div>
            </button>
          ))}
        </div>
        <div className="glass-card p-5 space-y-3 min-h-[200px]">
          {!detail ? (
            <p className="text-sm text-muted-foreground">اختر قطاعاً لعرض التفاصيل.</p>
          ) : (
            <>
              <h2 className="font-semibold">{detail.label_ar}</h2>
              <p className="text-xs text-muted-foreground">عتبة موافقة مقترحة: {detail.approval_value_threshold_sar?.toLocaleString("ar-SA")} ر.س</p>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">قنوات أولى</p>
                <div className="flex flex-wrap gap-1">
                  {detail.primary_channels?.map((c) => (
                    <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-secondary">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">امتثال</p>
                <ul className="list-disc pr-4 text-sm text-muted-foreground space-y-1">
                  {detail.compliance_notes_ar?.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
