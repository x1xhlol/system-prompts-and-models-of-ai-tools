"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Shield, Users, Clock, Gavel } from "lucide-react";

type ModeRow = {
  mode: number;
  name: string;
  label_ar: string;
  description_ar: string;
  auto_send: boolean;
  auto_negotiate: boolean;
  max_auto_commitment_sar: number;
  allowed_channels: string[];
};

type OperatingPayload = {
  current: ModeRow & { name: string };
  modes: ModeRow[];
  roles_ar: { id: string; label: string; scope: string }[];
  sla_hints_ar: Record<string, string>;
};

export function OperatingModelView() {
  const [data, setData] = useState<OperatingPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const r = await apiFetch("/api/v1/strategic-deals/operating-model");
    if (!r.ok) {
      setError(`تعذر التحميل (${r.status})`);
      setLoading(false);
      return;
    }
    setData(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setMode = async (mode: number) => {
    setSaving(true);
    setError(null);
    const r = await apiFetch("/api/v1/strategic-deals/operating-model", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    setSaving(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError((j as { detail?: string }).detail || "فشل الحفظ");
      return;
    }
    await load();
  };

  if (loading) {
    return <div className="glass-card p-6 m-4">جارٍ تحميل نموذج التشغيل…</div>;
  }
  if (error && !data) {
    return <div className="glass-card p-6 m-4 text-destructive">{error}</div>;
  }
  if (!data) return null;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold">نموذج تشغيل Dealix OS</h1>
        <p className="text-sm text-muted-foreground mt-1">
          أدوار، حلقات قرار، وحدود أتمتة الذكاء الاصطناعي — مربوطة بوضع التشغيل في الخادم.
        </p>
      </div>

      {error && <div className="text-sm text-amber-500">{error}</div>}

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Shield className="w-5 h-5" />
          <h2 className="font-semibold">الوضع الحالي</h2>
        </div>
        <p className="text-lg font-medium">{data.current.label_ar}</p>
        <p className="text-sm text-muted-foreground">{data.current.description_ar}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-secondary">
            إرسال تلقائي: {data.current.auto_send ? "نعم" : "لا"}
          </span>
          <span className="px-2 py-1 rounded-full bg-secondary">
            تفاوض تلقائي: {data.current.auto_negotiate ? "نعم" : "لا"}
          </span>
          <span className="px-2 py-1 rounded-full bg-secondary">
            حد الالتزام التلقائي: {data.current.max_auto_commitment_sar?.toLocaleString("ar-SA")} ر.س
          </span>
        </div>
      </div>

      <div className="glass-card p-6 space-y-3">
        <h2 className="font-semibold">تغيير وضع التشغيل (0–4)</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {data.modes.map((m) => (
            <button
              key={m.mode}
              type="button"
              disabled={saving}
              onClick={() => void setMode(m.mode)}
              className={`text-right p-3 rounded-xl border transition-colors ${
                data.current.mode === m.mode
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-secondary/40"
              }`}
            >
              <div className="font-medium">{m.label_ar}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{m.description_ar}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">أدوار مقترحة</h2>
        </div>
        <ul className="space-y-2 text-sm">
          {data.roles_ar.map((r) => (
            <li key={r.id} className="border-b border-border/50 pb-2 last:border-0">
              <span className="font-medium">{r.label}</span>
              <span className="text-muted-foreground"> — {r.scope}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">إرشادات SLA داخلية</h2>
        </div>
        <ul className="list-disc pr-5 text-sm text-muted-foreground space-y-1">
          {Object.values(data.sla_hints_ar).map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>

      <div className="glass-card p-6 flex gap-3 items-start">
        <Gavel className="w-5 h-5 shrink-0 text-muted-foreground mt-0.5" />
        <p className="text-xs text-muted-foreground">
          الالتزامات القانونية والمالية النهائية تبقى بشرية؛ الوضع الاستراتيجي يسمح بأتمتة أوسع مع تصعيد إلزامي عند الحدود.
        </p>
      </div>
    </div>
  );
}
