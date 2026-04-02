"use client";

import { 
  TrendingUp, Users, Target, MapPin, Zap, Award, 
  Activity, ArrowUpRight, Shield
} from "lucide-react";

const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`rounded-xl border border-white/10 bg-white/5 ${className ?? ""}`}>{children}</div>
);

export function AnalyticsView() {
  const kpis = [
    { label: "معدل التحويل (Lead to Deal)", value: "24.5%", trend: "+5.2%", icon: Target, color: "text-yellow-400" },
    { label: "كفاءة الذكاء الاصطناعي", value: "98.2%", trend: "+1.1%", icon: Zap, color: "text-amber-500" },
    { label: "متوسط قيمة الصفقة", value: "3.2M SAR", trend: "+12%", icon: TrendingUp, color: "text-emerald-500" },
    { label: "النمو في السوق السعودي", value: "42%", trend: "+8%", icon: Activity, color: "text-blue-500" },
  ];

  const marketHeatmap = [
    { city: "الرياض", pulse: 92, status: "High Demand", color: "bg-yellow-400" },
    { city: "جدة", pulse: 78, status: "Expanding", color: "bg-blue-500" },
    { city: "الدمام", pulse: 65, status: "Growing", color: "bg-emerald-500" },
    { city: "نيوم", pulse: 88, status: "Strategic Focus", color: "bg-amber-500" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">📊 الرؤية التنفيذية (Executive Pulse)</h1>
          <p className="text-gray-400 font-bold">تحليل عميق للأداء، خرائط حرارية للسوق، وتوقعات النمو الاستراتيجي.</p>
        </div>
        <button className="bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-lg">
          توليد تقرير مجلس الإدارة
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className="p-6 hover:border-yellow-400/30 transition-all group">
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
              <MapPin className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-black">نبض السوق السعودي (Market Heatmap)</h2>
            </div>
            <div className="text-[10px] bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full font-black">تحديث لحظي ●</div>
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
        <Card className="p-8 border-yellow-400/20 bg-yellow-400/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Zap className="w-32 h-32 text-yellow-400" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-yellow-400" />
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
          <Award className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-black">الأهداف الاستراتيجية (Q2 2026)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {["التوسع في دول الخليج", "أتمتة الفواتير الضريبية بنسبة 100%", "زيادة فريق المسوقين لـ 500"].map((goal, i) => (
            <div key={i} className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10 font-black text-yellow-400">0{i + 1}</div>
              <p className="font-bold">{goal}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
