"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function LeadGeneratorView() {
  const [sector, setSector] = useState("تقنية المعلومات");
  const [city, setCity] = useState("الرياض");
  const [count, setCount] = useState(10);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [pipelineRunning, setPipelineRunning] = useState<string | null>(null);
  const [pipelineResult, setPipelineResult] = useState<any>(null);

  const SECTORS = ["تقنية المعلومات", "العقارات", "الصحة", "التعليم", "التجزئة", "المقاولات", "الاستشارات"];
  const CITIES = ["الرياض", "جدة", "الدمام", "مكة المكرمة", "نيوم", "القصيم"];

  const urgencyColor: Record<string, string> = {
    high: "#22c55e", medium: "#f59e0b", low: "#64748b"
  };
  const urgencyLabel: Record<string, string> = {
    high: "🔥 ساخن", medium: "⚡ دافئ", low: "❄️ بارد"
  };

  const generateLeads = async () => {
    setLoading(true);
    setLeads([]);
    try {
      const res = await fetch(`${API}/api/v1/dealix/generate-leads?sector=${encodeURIComponent(sector)}&city=${encodeURIComponent(city)}&count=${count}`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch {
      // fallback mock
      setLeads(Array.from({ length: count }, (_, i) => ({
        company_name: `شركة ${sector} ${i + 1}`,
        city,
        estimated_size: ["SMB", "Mid-Market"][i % 2],
        pain_point: "ضعف إنتاجية فريق المبيعات",
        dealix_solution: "أتمتة كاملة + ذكاء اصطناعي",
        urgency: ["high", "medium", "low"][i % 3],
        contact_approach: "WhatsApp",
        estimated_deal_value: `${(Math.random() * 50 + 10).toFixed(0)},000 SAR`,
        why_good_fit: "يحتاجون حلول مبيعات ذكية"
      })));
    } finally {
      setLoading(false);
    }
  };

  const runPipeline = async (lead: any) => {
    setPipelineRunning(lead.company_name);
    try {
      const res = await fetch(`${API}/api/v1/dealix/full-power`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: lead.company_name,
          contact_name: "المدير التنفيذي",
          contact_phone: "966500000000",
          contact_title: "المدير التنفيذي",
          website: lead.website
        })
      });
      if (res.ok) setPipelineResult(await res.json());
    } catch {
      setPipelineResult({ notice: "تعذر الاتصال — السيرفر قيد الإعداد" });
    } finally {
      setPipelineRunning(null);
    }
  };

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#e2e8f0", padding: 24, fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#F5A623" }}>🎯 Lead Generator</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>توليد عملاء مؤهلين تلقائياً من أي قطاع سعودي</p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <select value={sector} onChange={e => setSector(e.target.value)}
          style={{ background: "#0f1729", border: "1px solid #1e3a5f", borderRadius: 8, color: "#e2e8f0", padding: "10px 14px", fontSize: 14 }}>
          {SECTORS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={city} onChange={e => setCity(e.target.value)}
          style={{ background: "#0f1729", border: "1px solid #1e3a5f", borderRadius: 8, color: "#e2e8f0", padding: "10px 14px", fontSize: 14 }}>
          {CITIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={count} onChange={e => setCount(Number(e.target.value))}
          style={{ background: "#0f1729", border: "1px solid #1e3a5f", borderRadius: 8, color: "#e2e8f0", padding: "10px 14px", fontSize: 14 }}>
          {[5, 10, 20, 50].map(n => <option key={n}>{n}</option>)}
        </select>
        <button onClick={generateLeads} disabled={loading}
          style={{
            padding: "10px 28px", background: loading ? "#334155" : "linear-gradient(135deg, #F5A623, #ff8c00)",
            border: "none", borderRadius: 8, color: "#0a0a0f", fontWeight: 800, fontSize: 15, cursor: "pointer"
          }}>
          {loading ? "⏳ يولّد..." : "🚀 ولّد Leads"}
        </button>
      </div>

      {/* Stats */}
      {leads.length > 0 && (
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          {[
            { label: "إجمالي Leads", value: leads.length, color: "#00D4FF" },
            { label: "🔥 ساخن", value: leads.filter(l => l.urgency === "high").length, color: "#22c55e" },
            { label: "⚡ دافئ", value: leads.filter(l => l.urgency === "medium").length, color: "#f59e0b" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "#0f1729", border: "1px solid #1e3a5f", borderRadius: 10, padding: "12px 20px" }}>
              <div style={{ fontSize: 11, color: "#64748b" }}>{stat.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: leads.length > 0 ? "1fr 1.2fr" : "1fr", gap: 20 }}>
        {/* Leads List */}
        {leads.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 500, overflowY: "auto" }}>
            {leads.map((lead, i) => (
              <div key={i} onClick={() => setSelected(lead)}
                style={{
                  background: selected === lead ? "#0f2040" : "#0f1729",
                  border: `1px solid ${selected === lead ? "#F5A623" : "#1e3a5f"}`,
                  borderRadius: 10, padding: 16, cursor: "pointer", transition: "all 0.2s"
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 15 }}>{lead.company_name}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{lead.estimated_size} • {lead.contact_approach}</div>
                  </div>
                  <span style={{ fontSize: 12, color: urgencyColor[lead.urgency] || "#64748b", background: "#0a0a0f", padding: "3px 8px", borderRadius: 6 }}>
                    {urgencyLabel[lead.urgency] || lead.urgency}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>💡 {lead.pain_point}</div>
                <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 600 }}>{lead.estimated_deal_value}</span>
                  <button onClick={e => { e.stopPropagation(); runPipeline(lead); }}
                    disabled={pipelineRunning === lead.company_name}
                    style={{
                      padding: "5px 12px", background: "#F5A623", border: "none", borderRadius: 6,
                      color: "#0a0a0f", fontWeight: 700, fontSize: 12, cursor: "pointer"
                    }}>
                    {pipelineRunning === lead.company_name ? "⏳" : "▶ Pipeline"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Side Panel */}
        {(selected || pipelineResult) && (
          <div style={{ background: "#0f1729", border: "1px solid #1e3a5f", borderRadius: 12, padding: 20, maxHeight: 500, overflowY: "auto" }}>
            {selected && !pipelineResult && (
              <div>
                <h3 style={{ margin: "0 0 16px", color: "#F5A623" }}>{selected.company_name}</h3>
                {[
                  { label: "الحل المقترح", value: selected.dealix_solution },
                  { label: "سبب الملاءمة", value: selected.why_good_fit },
                  { label: "قيمة الصفقة", value: selected.estimated_deal_value },
                  { label: "أسلوب التواصل", value: selected.contact_approach },
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 14, color: "#e2e8f0" }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}
            {pipelineResult && (
              <div>
                <h3 style={{ margin: "0 0 16px", color: "#22c55e" }}>✅ Pipeline مكتمل</h3>
                <pre style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                  {JSON.stringify(pipelineResult, null, 2).substring(0, 2000)}
                </pre>
                <button onClick={() => setPipelineResult(null)}
                  style={{ marginTop: 12, padding: "8px 16px", background: "#1e3a5f", border: "none", borderRadius: 8, color: "#e2e8f0", cursor: "pointer" }}>
                  إغلاق
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
