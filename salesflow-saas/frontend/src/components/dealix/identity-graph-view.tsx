"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Share2 } from "lucide-react";

type Profile = {
  id: string;
  company_name: string;
  industry?: string | null;
};

type GraphPayload = {
  profile_id: string;
  company_name: string;
  suggested_playbook_id: string | null;
  counts: {
    strategic_deals_as_initiator: number;
    strategic_deals_as_target: number;
    matches_as_party_a: number;
    matches_as_party_b: number;
    deals_with_lead_link: number;
    deals_with_sales_deal_link: number;
  };
};

export function IdentityGraphView() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pid, setPid] = useState<string>("");
  const [graph, setGraph] = useState<GraphPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const r = await apiFetch("/api/v1/strategic-deals/profiles");
      if (!r.ok) return;
      const list = (await r.json()) as Profile[];
      setProfiles(list);
      setPid((p) => p || list[0]?.id || "");
    })();
  }, []);

  useEffect(() => {
    if (!pid) return;
    void (async () => {
      setErr(null);
      const r = await apiFetch(`/api/v1/strategic-deals/identity/graph?profile_id=${encodeURIComponent(pid)}`);
      if (!r.ok) {
        setErr("تعذر تحميل الرسم البياني للكيان");
        setGraph(null);
        return;
      }
      setGraph(await r.json());
    })();
  }, [pid]);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start gap-3">
        <Share2 className="w-8 h-8 text-primary shrink-0" />
        <div>
          <h1 className="text-2xl font-bold">طبقة الكيان الموحّد</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ملف شركة واحد — صفقات استراتيجية، مطابقات، وروابط CRM (خفيفة).
          </p>
        </div>
      </div>

      <div className="glass-card p-4">
        <label className="text-xs text-muted-foreground block mb-2">ملف الشركة</label>
        <select
          className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm"
          value={pid}
          onChange={(e) => setPid(e.target.value)}
        >
          <option value="">— اختر —</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.company_name}
            </option>
          ))}
        </select>
      </div>

      {err && <div className="text-destructive text-sm">{err}</div>}

      {graph && (
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold">{graph.company_name}</h2>
          {graph.suggested_playbook_id && (
            <p className="text-xs text-muted-foreground">
              Playbook مقترح: <span className="text-foreground">{graph.suggested_playbook_id}</span>
            </p>
          )}
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-secondary/30 p-3">
              صفقات كمبادر: {graph.counts.strategic_deals_as_initiator}
            </div>
            <div className="rounded-lg bg-secondary/30 p-3">
              صفقات كهدف: {graph.counts.strategic_deals_as_target}
            </div>
            <div className="rounded-lg bg-secondary/30 p-3">
              مطابقات (طرف أ): {graph.counts.matches_as_party_a}
            </div>
            <div className="rounded-lg bg-secondary/30 p-3">
              مطابقات (طرف ب): {graph.counts.matches_as_party_b}
            </div>
            <div className="rounded-lg bg-secondary/30 p-3">
              صفقات مربوطة بـ lead: {graph.counts.deals_with_lead_link}
            </div>
            <div className="rounded-lg bg-secondary/30 p-3">
              صفقات مربوطة بصفقة مبيعات: {graph.counts.deals_with_sales_deal_link}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
