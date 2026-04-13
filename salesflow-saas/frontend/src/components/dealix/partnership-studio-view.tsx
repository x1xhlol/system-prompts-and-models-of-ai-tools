"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Handshake, Plus, RefreshCw } from "lucide-react";

type Profile = {
  id: string;
  company_name: string;
  industry?: string | null;
  capabilities?: string[];
  needs?: string[];
};

type StrategicDeal = {
  id: string;
  deal_title: string;
  deal_type: string;
  status: string;
  estimated_value_sar?: number | null;
  lead_id?: string | null;
  sales_deal_id?: string | null;
};

type MatchRow = {
  id: string;
  match_score: number;
  company_b_name?: string | null;
  status: string;
  deal_type_suggested?: string | null;
};

const DEAL_TYPES = [
  "partnership",
  "distribution",
  "franchise",
  "jv",
  "referral",
  "acquisition",
  "barter",
];

export function PartnershipStudioView() {
  const [tab, setTab] = useState<"profiles" | "deals" | "matches" | "policy" | "archetypes">("profiles");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [deals, setDeals] = useState<StrategicDeal[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [selProfile, setSelProfile] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [newProfile, setNewProfile] = useState({
    company_name: "",
    industry: "",
    capabilities: "",
    needs: "",
  });

  const [newDeal, setNewDeal] = useState({
    deal_title: "",
    deal_type: "partnership",
    target_company_name: "",
    estimated_value_sar: "",
    channel: "whatsapp",
    lead_id: "",
    sales_deal_id: "",
  });

  const [policy, setPolicy] = useState({
    channel: "whatsapp",
    action: "send_custom_message",
    deal_value_sar: "0",
    industry: "",
  });
  const [policyResult, setPolicyResult] = useState<Record<string, unknown> | null>(null);

  const [archetypes, setArchetypes] = useState<Record<string, unknown>[]>([]);

  const loadProfiles = useCallback(async () => {
    const r = await apiFetch("/api/v1/strategic-deals/profiles");
    if (r.ok) {
      const list = (await r.json()) as Profile[];
      setProfiles(list);
      setSelProfile((prev) => prev || list[0]?.id || "");
    }
  }, []);

  const loadDeals = useCallback(async () => {
    if (!selProfile) return;
    const r = await apiFetch(
      `/api/v1/strategic-deals?profile_id=${encodeURIComponent(selProfile)}&per_page=50`,
    );
    if (r.ok) setDeals(await r.json());
  }, [selProfile]);

  const loadMatches = useCallback(async () => {
    if (!selProfile) return;
    const r = await apiFetch(
      `/api/v1/strategic-deals/matches?profile_id=${encodeURIComponent(selProfile)}&per_page=50`,
    );
    if (r.ok) setMatches(await r.json());
  }, [selProfile]);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    void loadDeals();
    void loadMatches();
  }, [loadDeals, loadMatches]);

  useEffect(() => {
    void (async () => {
      const r = await apiFetch("/api/v1/strategic-deals/partner-archetypes");
      if (r.ok) {
        const j = await r.json();
        setArchetypes(j.archetypes || []);
      }
    })();
  }, []);

  const refresh = async () => {
    setLoading(true);
    setMsg(null);
    await loadProfiles();
    await loadDeals();
    await loadMatches();
    setLoading(false);
  };

  const createProfile = async () => {
    setMsg(null);
    const caps = newProfile.capabilities.split(",").map((s) => s.trim()).filter(Boolean);
    const needs = newProfile.needs.split(",").map((s) => s.trim()).filter(Boolean);
    const r = await apiFetch("/api/v1/strategic-deals/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: newProfile.company_name,
        industry: newProfile.industry || undefined,
        capabilities: caps,
        needs,
      }),
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      setMsg((e as { detail?: string }).detail || "فشل إنشاء الملف");
      return;
    }
    setNewProfile({ company_name: "", industry: "", capabilities: "", needs: "" });
    await loadProfiles();
    setMsg("تم إنشاء ملف الشركة.");
  };

  const createDeal = async () => {
    if (!selProfile) {
      setMsg("اختر ملف شركة مبادر.");
      return;
    }
    setMsg(null);
    const body: Record<string, unknown> = {
      initiator_profile_id: selProfile,
      deal_title: newDeal.deal_title,
      deal_type: newDeal.deal_type,
      channel: newDeal.channel,
      target_company_name: newDeal.target_company_name || undefined,
      estimated_value_sar: newDeal.estimated_value_sar
        ? Number(newDeal.estimated_value_sar)
        : undefined,
    };
    if (newDeal.lead_id.trim()) body.lead_id = newDeal.lead_id.trim();
    if (newDeal.sales_deal_id.trim()) body.sales_deal_id = newDeal.sales_deal_id.trim();

    const r = await apiFetch("/api/v1/strategic-deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      setMsg((e as { detail?: string }).detail || "فشل إنشاء الصفقة");
      return;
    }
    setNewDeal((d) => ({
      ...d,
      deal_title: "",
      target_company_name: "",
      estimated_value_sar: "",
      lead_id: "",
      sales_deal_id: "",
    }));
    await loadDeals();
    setMsg("تم إنشاء الصفقة الاستراتيجية.");
  };

  const evaluatePolicy = async () => {
    setMsg(null);
    const r = await apiFetch("/api/v1/strategic-deals/policy/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: policy.channel,
        action: policy.action,
        deal_value_sar: Number(policy.deal_value_sar) || 0,
        industry: policy.industry || undefined,
      }),
    });
    if (!r.ok) {
      setMsg("فشل تقييم السياسة");
      return;
    }
    setPolicyResult(await r.json());
  };

  const patchDealLinks = async (dealId: string, leadId: string, salesId: string) => {
    const body: Record<string, string> = {};
    if (leadId.trim()) body.lead_id = leadId.trim();
    if (salesId.trim()) body.sales_deal_id = salesId.trim();
    if (!Object.keys(body).length) return;
    const r = await apiFetch(`/api/v1/strategic-deals/${dealId}/links`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) await loadDeals();
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Handshake className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Partnership Studio</h1>
            <p className="text-sm text-muted-foreground">ملفات، صفقات، مطابقات، سياسات، وأنماط شراكة — عبر REST الموحّد.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </button>
      </div>

      {msg && <div className="text-sm text-primary">{msg}</div>}

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {(
          [
            ["profiles", "الملفات"],
            ["deals", "الصفقات"],
            ["matches", "المطابقات"],
            ["policy", "محرك السياسات"],
            ["archetypes", "أنماط الشراكة"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              tab === id ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm text-muted-foreground">ملف المبادر النشط:</span>
        <select
          className="bg-secondary/50 border border-border rounded-lg px-2 py-1 text-sm min-w-[200px]"
          value={selProfile}
          onChange={(e) => setSelProfile(e.target.value)}
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.company_name}
            </option>
          ))}
        </select>
      </div>

      {tab === "profiles" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" /> ملف شركة جديد
            </h2>
            <input
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="اسم الشركة *"
              value={newProfile.company_name}
              onChange={(e) => setNewProfile({ ...newProfile, company_name: e.target.value })}
            />
            <input
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="القطاع"
              value={newProfile.industry}
              onChange={(e) => setNewProfile({ ...newProfile, industry: e.target.value })}
            />
            <input
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="قدرات (مفصولة بفاصلة)"
              value={newProfile.capabilities}
              onChange={(e) => setNewProfile({ ...newProfile, capabilities: e.target.value })}
            />
            <input
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="احتياجات (مفصولة بفاصلة)"
              value={newProfile.needs}
              onChange={(e) => setNewProfile({ ...newProfile, needs: e.target.value })}
            />
            <button
              type="button"
              onClick={() => void createProfile()}
              className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
            >
              إنشاء
            </button>
          </div>
          <div className="glass-card p-5 space-y-2 max-h-[400px] overflow-y-auto">
            <h2 className="font-semibold mb-2">الملفات الحالية</h2>
            {profiles.map((p) => (
              <div key={p.id} className="text-sm border-b border-border/50 pb-2">
                <div className="font-medium">{p.company_name}</div>
                <div className="text-xs text-muted-foreground">{p.industry || "—"}</div>
              </div>
            ))}
            {!profiles.length && <p className="text-sm text-muted-foreground">لا توجد ملفات بعد.</p>}
          </div>
        </div>
      )}

      {tab === "deals" && (
        <div className="space-y-6">
          <div className="glass-card p-5 space-y-3">
            <h2 className="font-semibold">صفقة استراتيجية جديدة</h2>
            <input
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="عنوان الصفقة *"
              value={newDeal.deal_title}
              onChange={(e) => setNewDeal({ ...newDeal, deal_title: e.target.value })}
            />
            <div className="grid sm:grid-cols-2 gap-2">
              <select
                className="bg-secondary/50 border border-border rounded-lg px-2 py-2 text-sm"
                value={newDeal.deal_type}
                onChange={(e) => setNewDeal({ ...newDeal, deal_type: e.target.value })}
              >
                {DEAL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                className="bg-secondary/50 border border-border rounded-lg px-2 py-2 text-sm"
                value={newDeal.channel}
                onChange={(e) => setNewDeal({ ...newDeal, channel: e.target.value })}
              >
                <option value="whatsapp">whatsapp</option>
                <option value="email">email</option>
                <option value="linkedin">linkedin</option>
              </select>
            </div>
            <input
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="اسم الشركة المستهدفة"
              value={newDeal.target_company_name}
              onChange={(e) => setNewDeal({ ...newDeal, target_company_name: e.target.value })}
            />
            <input
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="قيمة تقديرية (ر.س)"
              value={newDeal.estimated_value_sar}
              onChange={(e) => setNewDeal({ ...newDeal, estimated_value_sar: e.target.value })}
            />
            <div className="grid sm:grid-cols-2 gap-2">
              <input
                className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm"
                placeholder="ربط lead_id (اختياري)"
                value={newDeal.lead_id}
                onChange={(e) => setNewDeal({ ...newDeal, lead_id: e.target.value })}
              />
              <input
                className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm"
                placeholder="ربط sales_deal_id (اختياري)"
                value={newDeal.sales_deal_id}
                onChange={(e) => setNewDeal({ ...newDeal, sales_deal_id: e.target.value })}
              />
            </div>
            <button
              type="button"
              onClick={() => void createDeal()}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm"
            >
              إنشاء صفقة
            </button>
          </div>

          <div className="glass-card p-5 space-y-3 overflow-x-auto">
            <h2 className="font-semibold">الصفقات</h2>
            <table className="w-full text-sm text-right min-w-[640px]">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="py-2">العنوان</th>
                  <th className="py-2">النوع</th>
                  <th className="py-2">الحالة</th>
                  <th className="py-2">ربط CRM</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => (
                  <tr key={d.id} className="border-b border-border/40">
                    <td className="py-2">{d.deal_title}</td>
                    <td className="py-2">{d.deal_type}</td>
                    <td className="py-2">{d.status}</td>
                    <td className="py-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">
                          lead: {d.lead_id || "—"} | sales: {d.sales_deal_id || "—"}
                        </span>
                        <div className="flex gap-1 flex-wrap">
                          <input
                            id={`lead-${d.id}`}
                            className="w-28 bg-secondary/50 border border-border rounded px-1 py-0.5 text-xs"
                            placeholder="lead uuid"
                          />
                          <input
                            id={`sales-${d.id}`}
                            className="w-28 bg-secondary/50 border border-border rounded px-1 py-0.5 text-xs"
                            placeholder="deal uuid"
                          />
                          <button
                            type="button"
                            className="text-xs text-primary"
                            onClick={() => {
                              const li = document.getElementById(`lead-${d.id}`) as HTMLInputElement;
                              const si = document.getElementById(`sales-${d.id}`) as HTMLInputElement;
                              void patchDealLinks(d.id, li?.value || "", si?.value || "");
                            }}
                          >
                            حفظ الربط
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!deals.length && <p className="text-sm text-muted-foreground">لا صفقات لهذا الملف.</p>}
          </div>
        </div>
      )}

      {tab === "matches" && (
        <div className="glass-card p-5 space-y-2">
          <h2 className="font-semibold">مطابقات مقترحة</h2>
          {matches.map((m) => (
            <div key={m.id} className="text-sm border-b border-border/50 py-2 flex justify-between gap-2">
              <div>
                <div className="font-medium">{m.company_b_name || "طرف ب"}</div>
                <div className="text-xs text-muted-foreground">
                  score {m.match_score.toFixed(2)} · {m.deal_type_suggested || "—"} · {m.status}
                </div>
              </div>
            </div>
          ))}
          {!matches.length && <p className="text-sm text-muted-foreground">لا مطابقات بعد — جرّب فحص الاكتشاف من الـ API.</p>}
        </div>
      )}

      {tab === "policy" && (
        <div className="glass-card p-5 space-y-4 max-w-xl">
          <h2 className="font-semibold">تقييم سياسة الإجراء</h2>
          <select
            className="w-full bg-secondary/50 border border-border rounded-lg px-2 py-2 text-sm"
            value={policy.channel}
            onChange={(e) => setPolicy({ ...policy, channel: e.target.value })}
          >
            <option value="whatsapp">whatsapp</option>
            <option value="email">email</option>
            <option value="linkedin">linkedin</option>
          </select>
          <input
            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm"
            placeholder="action (مثلاً send_custom_message)"
            value={policy.action}
            onChange={(e) => setPolicy({ ...policy, action: e.target.value })}
          />
          <input
            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm"
            placeholder="قيمة الصفقة ر.س"
            value={policy.deal_value_sar}
            onChange={(e) => setPolicy({ ...policy, deal_value_sar: e.target.value })}
          />
          <input
            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm"
            placeholder="قطاع (لاختبار القطاعات الحساسة)"
            value={policy.industry}
            onChange={(e) => setPolicy({ ...policy, industry: e.target.value })}
          />
          <button
            type="button"
            onClick={() => void evaluatePolicy()}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm"
          >
            تقييم
          </button>
          {policyResult && (
            <pre className="text-xs bg-secondary/40 p-3 rounded-lg overflow-auto whitespace-pre-wrap">
              {JSON.stringify(policyResult, null, 2)}
            </pre>
          )}
        </div>
      )}

      {tab === "archetypes" && (
        <div className="glass-card p-5 space-y-3 max-h-[560px] overflow-y-auto">
          <h2 className="font-semibold">من نوع الصفقة إلى النمط التشغيلي</h2>
          {archetypes.map((a, i) => (
            <div key={i} className="text-sm border-b border-border/40 pb-3">
              <div className="font-medium">{(a as { deal_type?: string }).deal_type}</div>
              <div className="text-muted-foreground">{(a as { label_ar?: string }).label_ar}</div>
              <div className="text-xs mt-1">{(a as { description_ar?: string }).description_ar}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
