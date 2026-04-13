"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import Link from "next/link";
import { Rocket, CheckCircle2, ExternalLink } from "lucide-react";

type Phase = {
  id: string;
  title_ar: string;
  items_ar: string[];
};

export function GrowthPlaybookView() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [disclaimer, setDisclaimer] = useState("");

  useEffect(() => {
    void (async () => {
      const r = await apiFetch("/api/v1/strategic-deals/growth/checklist");
      if (!r.ok) return;
      const j = await r.json();
      setPhases(j.phases || []);
      setDisclaimer(j.disclaimer_ar || "");
    })();
  }, []);

  const toggle = (key: string) => {
    setDone((d) => ({ ...d, [key]: !d[key] }));
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start gap-3">
        <Rocket className="w-8 h-8 text-primary shrink-0" />
        <div>
          <h1 className="text-2xl font-bold">نمو واستعداد استحواذ / توسع</h1>
          <p className="text-sm text-muted-foreground mt-1">
            مساعد قرار وتنظيم مهام — الموافقات والعناية الواجبة الكاملة تبقى بشرية.
          </p>
        </div>
      </div>

      <div className="glass-card p-4 text-xs text-muted-foreground border border-amber-500/20 bg-amber-500/5">
        {disclaimer}
      </div>

      <Link
        href="/dashboard?section=intelligence"
        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <ExternalLink className="w-4 h-4" />
        فتح لوحة الذكاء الاستراتيجي (Manus) للسيناريوهات والتقارير
      </Link>

      <div className="space-y-4">
        {phases.map((ph) => (
          <div key={ph.id} className="glass-card p-5 space-y-3">
            <h2 className="font-semibold">{ph.title_ar}</h2>
            <ul className="space-y-2">
              {ph.items_ar.map((item, idx) => {
                const key = `${ph.id}-${idx}`;
                const checked = !!done[key];
                return (
                  <li key={key} className="flex items-start gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      className="mt-0.5 text-primary shrink-0"
                      aria-pressed={checked}
                    >
                      <CheckCircle2 className={`w-5 h-5 ${checked ? "opacity-100" : "opacity-30"}`} />
                    </button>
                    <span className={checked ? "line-through text-muted-foreground" : ""}>{item}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
