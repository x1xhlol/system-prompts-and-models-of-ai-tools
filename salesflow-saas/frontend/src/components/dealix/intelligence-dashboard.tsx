"use client";

import { useState, useEffect } from "react";
import { getApiBaseUrl } from "@/lib/api-base";
import { apiFetch } from "@/lib/api-client";

interface AgentStatus {
  role: string;
  model: string;
  status: string;
}

interface SystemHealth {
  status: string;
  autonomous_cycle: number;
  improvements_applied: number;
}

export function IntelligenceDashboard() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [pipelineResult, setPipelineResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"agents" | "pipeline" | "report">("agents");
  const [leadForm, setLeadForm] = useState({
    contact_name: "",
    contact_phone: "",
    contact_title: "",
    company_name: "",
    company_website: "",
    source: "whatsapp",
  });

  useEffect(() => {
    fetchAgentStatus();
    fetchHealth();
    const interval = setInterval(() => { fetchHealth(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgentStatus = async () => {
    try {
      const res = await apiFetch("/api/v1/agents/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
      }
    } catch {}
  };

  const fetchHealth = async () => {
    try {
      const res = await apiFetch("/api/v1/intelligence/health", { cache: "no-store" });
      if (res.ok) setHealth(await res.json());
    } catch {}
  };

  const runPipeline = async () => {
    if (!leadForm.contact_name || !leadForm.company_name) return;
    setLoading(true);
    try {
      const res = await apiFetch("/api/v1/intelligence/run-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: `lead_${Date.now()}`, ...leadForm }),
      });
      if (res.ok) setPipelineResult(await res.json());
    } catch (e) {
      setPipelineResult({ error: "تعذر الاتصال بالسيرفر" });
    } finally {
      setLoading(false);
    }
  };

  const roleArabic: Record<string, string> = {
    orchestrator: "المنسق الرئيسي",
    researcher: "الباحث",
    qualifier: "المؤهِّل",
    outreach: "التواصل",
    closer: "المغلق",
    compliance: "الامتثال",
    analytics: "التحليل",
    memory: "الذاكرة",
  };

  const roleIcon: Record<string, string> = {
    orchestrator: "🎯", researcher: "🔍", qualifier: "⚡", outreach: "💬",
    closer: "🤝", compliance: "⚖️", analytics: "📊", memory: "🧠",
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#0a0a0f", minHeight: "100vh", color: "#e2e8f0", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
        <div style={{
          width: 48, height: 48, background: "linear-gradient(135deg, #F5A623, #00D4FF)",
          borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 900, fontSize: 22, color: "#0a0a0f"
        }}>D</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#F5A623" }}>Dealix Intelligence</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>نظام ذكاء اصطناعي مستقل — يعمل 24/7 🟢</p>
        </div>
        {health && (
          <div style={{ marginLeft: "auto", background: "#0f1729", border: "1px solid #1e3a5f", borderRadius: 10, padding: "8px 16px" }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>دورات التحسين الذاتي</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#00D4FF" }}>{health.autonomous_cycle}</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          { key: "agents", label: "الوكلاء 🤖" },
          { key: "pipeline", label: "تشغيل Pipeline 🎯" },
          { key: "report", label: "التقارير 📊" },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer",
              background: activeTab === tab.key ? "#F5A623" : "#0f1729",
              color: activeTab === tab.key ? "#0a0a0f" : "#94a3b8",
              fontWeight: activeTab === tab.key ? 700 : 400, fontSize: 14
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Agents Tab */}
      {activeTab === "agents" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {(agents.length > 0 ? agents : [
              { role: "orchestrator", model: "llama-3.3-70b", status: "active" },
              { role: "researcher", model: "llama-3.1-8b", status: "active" },
              { role: "qualifier", model: "llama-3.1-8b", status: "active" },
              { role: "outreach", model: "llama-3.1-8b", status: "active" },
              { role: "closer", model: "llama-3.3-70b", status: "active" },
              { role: "compliance", model: "llama-3.3-70b", status: "active" },
              { role: "analytics", model: "llama-3.1-8b", status: "active" },
              { role: "memory", model: "llama-3.1-8b", status: "active" },
            ]).map(agent => (
              <div key={agent.role} style={{
                background: "#0f1729", border: "1px solid #1e3a5f", borderRadius: 12,
                padding: 20, transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{roleIcon[agent.role] || "🤖"}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>
                  {roleArabic[agent.role] || agent.role}
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{agent.model}</div>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
                  <span style={{ fontSize: 12, color: "#22c55e" }}>نشط</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, background: "#0f1729", border: "1px solid #1e3a5f", borderRadius: 12, padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", color: "#F5A623" }}>🔗 البنية — Manus-Style Orchestration</h3>
            <div style={{ fontFamily: "monospace", fontSize: 13, color: "#64748b", lineHeight: 1.8 }}>
              <div>Lead/WhatsApp → <span style={{ color: "#F5A623" }}>Orchestrator</span></div>
              <div style={{ paddingLeft: 24 }}>├── <span style={{ color: "#00D4FF" }}>Researcher</span> → تحليل الشركة</div>
              <div style={{ paddingLeft: 24 }}>├── <span style={{ color: "#00D4FF" }}>Qualifier</span> → درجة 0-100</div>
              <div style={{ paddingLeft: 24 }}>├── <span style={{ color: "#00D4FF" }}>Outreach</span> → رسالة واتساب</div>
              <div style={{ paddingLeft: 24 }}>├── <span style={{ color: "#22c55e" }}>Closer</span> → إغلاق الصفقة</div>
              <div style={{ paddingLeft: 24 }}>├── <span style={{ color: "#f59e0b" }}>Compliance</span> → ZATCA</div>
              <div style={{ paddingLeft: 24 }}>└── <span style={{ color: "#a78bfa" }}>Analytics</span> → تقارير</div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Tab */}
      {activeTab === "pipeline" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ background: "#0f1729", border: "1px solid #1e3a5f", borderRadius: 12, padding: 24 }}>
            <h3 style={{ margin: "0 0 20px", color: "#F5A623" }}>🎯 تشغيل Pipeline كامل</h3>
            {[
              { key: "contact_name", label: "اسم العميل *", placeholder: "محمد العمري" },
              { key: "contact_phone", label: "رقم الجوال *", placeholder: "966501234567" },
              { key: "contact_title", label: "المسمى الوظيفي", placeholder: "مدير المبيعات" },
              { key: "company_name", label: "اسم الشركة *", placeholder: "شركة النخبة للتقنية" },
              { key: "company_website", label: "الموقع الإلكتروني", placeholder: "https://example.com" },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>{field.label}</label>
                <input
                  placeholder={field.placeholder}
                  value={(leadForm as any)[field.key]}
                  onChange={e => setLeadForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  style={{
                    width: "100%", background: "#0a0a0f", border: "1px solid #1e3a5f",
                    borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14,
                    outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>
            ))}
            <button onClick={runPipeline} disabled={loading}
              style={{
                width: "100%", padding: "14px", background: loading ? "#334155" : "linear-gradient(135deg, #F5A623, #ff8c00)",
                border: "none", borderRadius: 10, color: "#0a0a0f", fontWeight: 800,
                fontSize: 16, cursor: loading ? "not-allowed" : "pointer", marginTop: 8
              }}>
              {loading ? "⏳ يعمل الذكاء الاصطناعي..." : "🚀 شغّل Pipeline الكامل"}
            </button>
          </div>

          <div style={{ background: "#0f1729", border: "1px solid #1e3a5f", borderRadius: 12, padding: 24, overflow: "auto", maxHeight: 600 }}>
            <h3 style={{ margin: "0 0 16px", color: "#F5A623" }}>📋 النتائج</h3>
            {!pipelineResult && !loading && (
              <div style={{ color: "#64748b", textAlign: "center", marginTop: 60 }}>
                <div style={{ fontSize: 40 }}>🎯</div>
                <div style={{ marginTop: 12 }}>أدخل بيانات العميل وشغّل Pipeline لرؤية النتائج</div>
              </div>
            )}
            {loading && (
              <div style={{ textAlign: "center", marginTop: 60 }}>
                <div style={{ fontSize: 40 }}>⚙️</div>
                <div style={{ marginTop: 12, color: "#F5A623" }}>الوكلاء يعملون...</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
                  باحث → مؤهِّل → إعداد رسالة واتساب → عرض تقديمي
                </div>
              </div>
            )}
            {pipelineResult && !loading && (
              <pre style={{ fontSize: 12, color: "#e2e8f0", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {JSON.stringify(pipelineResult, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "report" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { title: "تقرير مالي", emoji: "💰", endpoint: "/api/v1/intelligence/financial-forecast", desc: "توقعات الإيراد + تحليل Pipeline" },
            { title: "فرص التوسع", emoji: "🌍", endpoint: "/api/v1/intelligence/market-expansion", desc: "أفضل قطاعات السوق السعودي" },
            { title: "خطة النمو 90 يوم", emoji: "📈", endpoint: "/api/v1/intelligence/growth-plan", desc: "خارطة طريق النمو الذاتي" },
          ].map(report => (
            <div key={report.title} style={{
              background: "#0f1729", border: "1px solid #1e3a5f", borderRadius: 12, padding: 24, textAlign: "center"
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{report.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#e2e8f0", marginBottom: 8 }}>{report.title}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>{report.desc}</div>
              <button
                onClick={() =>
                  window.open(
                    `${getApiBaseUrl().replace(/\/$/, "")}${report.endpoint}`,
                    "_blank"
                  )
                }
                style={{
                  padding: "10px 20px", background: "#0a0a0f", border: "1px solid #F5A623",
                  borderRadius: 8, color: "#F5A623", cursor: "pointer", fontWeight: 600, fontSize: 14
                }}>
                توليد التقرير →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
