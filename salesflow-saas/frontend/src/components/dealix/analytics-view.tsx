"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Target,
  MapPin,
  Zap,
  Award,
  Activity,
  ArrowUpRight,
  Shield,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getApiBaseUrl } from "@/lib/api-base";

const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`rounded-xl border border-white/10 bg-white/5 ${className ?? ""}`}>{children}</div>
);

export function AnalyticsView() {
  const [roi, setRoi] = useState({
    revenue_lift_percent: 18,
    win_rate: 31,
    pipeline_velocity_days: 22,
    manual_work_reduction_percent: 72,
    summary: "بيانات توضيحية — يتم التحديث من الـ API عند الاتصال.",
  });

  useEffect(() => {
    const loadRoi = async () => {
      const base = getApiBaseUrl().replace(/\/$/, "");
      try {
        const res = await fetch(`${base}/api/v1/autonomous-foundation/dashboard/executive-roi`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            baseline: { revenue: 100000 },
            current: {
              revenue: 130000,
              win_rate: 31,
              pipeline_velocity_days: 19,
              manual_work_reduction_percent: 72,
            },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setRoi(data);
        }
      } catch {
        // Keep seeded KPI values if API is unreachable.
      }
    };
    loadRoi();
  }, []);

  const kpis = [
    { label: "معدل التحويل (Lead to Deal)", value: `${roi.win_rate}%`, trend: "+5.2%", icon: Target, color: "text-teal-400" },
    { label: "كفاءة الذكاء الاصطناعي", value: "99.4%", trend: "+1.2%", icon: Zap, color: "text-cyan-400" },
    { label: "Revenue Lift", value: `${roi.revenue_lift_percent}%`, trend: "LIVE", icon: Shield, color: "text-emerald-500" },
    { label: "تخفيض العمل اليدوي", value: `${roi.manual_work_reduction_percent}%`, trend: "+15%", icon: Activity, color: "text-blue-400" },
  ];

  const chartData = [
    { name: "Revenue Lift", value: roi.revenue_lift_percent },
    { name: "Win Rate", value: roi.win_rate },
    { name: "Ops Reduction", value: roi.manual_work_reduction_percent },
  ];

  const marketHeatmap = [
    { city: "الرياض", pulse: 92, status: "High Demand", color: "bg-teal-500" },
    { city: "جدة", pulse: 78, status: "Expanding", color: "bg-blue-500" },
    { city: "الدمام", pulse: 65, status: "Growing", color: "bg-emerald-500" },
    { city: "نيوم", pulse: 88, status: "Strategic Focus", color: "bg-cyan-500" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">📊 الرؤية التنفيذية (Executive Pulse)</h1>
          <p className="text-gray-400 font-bold">تحليل عميق للأداء، خرائط حرارية للسوق، وتوقعات النمو الاستراتيجي.</p>
        </div>
        <button
          type="button"
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-black text-sm hover:opacity-95 transition-all shadow-lg shadow-primary/25"
        >
          توليد تقرير مجلس الإدارة
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className="p-6 hover:border-primary/30 transition-all group">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 rounded-lg bg-white/5">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> {kpi.trend}
              </span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-black">{kpi.value}</h3>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Heatmap */}
        <Card className="lg:col-span-2 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-400" />
              <h2 className="text-xl font-black">نبض السوق السعودي (Market Heatmap)</h2>
            </div>
            <div className="text-[10px] bg-teal-500/15 text-teal-300 px-3 py-1 rounded-full font-black border border-teal-500/20">
              تحديث لحظي ●
            </div>
          </div>
          <div className="space-y-6">
            {marketHeatmap.map((area, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-sm">{area.city}</span>
                  <span className="text-[10px] opacity-60 font-black">{area.status} ({area.pulse}%)</span>
                </div>
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${area.color} rounded-full transition-all duration-1000`} style={{ width: `${area.pulse}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Performance */}
        <Card className="p-8 border-teal-500/25 bg-teal-950/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Zap className="w-32 h-32 text-teal-400" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-teal-400" />
              <h2 className="text-xl font-black">كفاءة الإغلاق الذكي</h2>
            </div>
            <div className="text-5xl font-black mb-2">٩٨.٢٪</div>
            <p className="text-sm text-gray-400 mb-8">تطور ملحوظ في دقة الإغلاق باستخدام اللهجة السعودية وتوقيت الرد.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <p className="text-[10px] opacity-50 font-bold uppercase mb-1">متوسط الرد</p>
                <p className="text-lg font-black">١.٤ ثانية</p>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <p className="text-[10px] opacity-50 font-bold uppercase mb-1">الرضا العام</p>
                <p className="text-lg font-black">٤.٩/٥</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Strategic Goals */}
      <Card className="p-8">
        <div className="flex items-center gap-2 mb-8">
          <Award className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-black">الأهداف الاستراتيجية (Q2 2026)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {["التوسع في دول الخليج", "أتمتة الفواتير الضريبية بنسبة 100%", "زيادة فريق المسوقين لـ 500"].map((goal, i) => (
            <div key={i} className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10 font-black text-teal-400">
                0{i + 1}
              </div>
              <p className="font-bold">{goal}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-black">Executive ROI (Live)</h2>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-400 mt-4">{roi.summary}</p>
      </Card>
    </div>
  );
}
