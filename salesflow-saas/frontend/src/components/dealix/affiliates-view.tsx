import { Users, Award, TrendingUp, AlertCircle, Building2, UserPlus, Filter, Download } from "lucide-react";

export function AffiliatesView() {
  const affiliates = [
    { id: "A-101", name: "أحمد عبدالله", status: "نشط", sales: 12, rev: "450K ر.س", comm: "45K ر.س", level: "Senior", eligibleForHire: true },
    { id: "A-102", name: "سارة خالد", status: "نشط", sales: 4, rev: "120K ر.س", comm: "9.6K ر.س", level: "Mid", eligibleForHire: false },
    { id: "A-103", name: "محمد ياسر", status: "إنذار", sales: 0, rev: "0 ر.س", comm: "0 ر.س", level: "New", eligibleForHire: false },
    { id: "A-104", name: "فهد عبدالرحمن", status: "نشط", sales: 8, rev: "240K ر.س", comm: "24K ر.س", level: "Mid", eligibleForHire: false },
    { id: "A-105", name: "لينا العتيبي", status: "مرشح للتعيين", sales: 15, rev: "600K ر.س", comm: "60K ر.س", level: "Senior", eligibleForHire: true },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">👥 إدارة الشركاء والمسوقين (Affiliates)</h1>
          <p className="text-muted-foreground">مراقبة أداء المسوقين بالعمولة ومراحلة التوظيف الآلية (Auto-Hire).</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />
            تصدير
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/25 transition-all">
            <UserPlus className="w-5 h-5" />
            إضافة مسوق
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 border border-border/50">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">+12%</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">124 مسوق</h3>
          <p className="text-sm text-muted-foreground font-medium">المسوقين النشطين</p>
        </div>
        
        <div className="glass-card p-6 border border-border/50">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">+24%</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">2.4M ر.س</h3>
          <p className="text-sm text-muted-foreground font-medium">إيرادات فريق التسويق (الشهر)</p>
        </div>

        <div className="glass-card p-6 border border-primary/30 bg-primary/5">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1 text-primary">3 مسوقين</h3>
          <p className="text-sm text-muted-foreground font-medium">استوفوا شروط التوظيف الفوري (10+ شركات)</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden border border-border/50">
        <div className="flex justify-between items-center p-6 border-b border-border/50 bg-secondary/10">
          <h2 className="text-lg font-bold">قائمة المسوقين بالعمولة</h2>
          <button className="flex items-center gap-2 p-2 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors">
            <Filter className="w-5 h-5" />
            <span className="text-sm">تصفية</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-secondary/30 text-muted-foreground">
              <tr>
                <th className="py-4 px-6 font-medium">الرقم</th>
                <th className="py-4 px-6 font-medium">الاسم</th>
                <th className="py-4 px-6 font-medium">المستوى</th>
                <th className="py-4 px-6 font-medium">الإغلاقات (الشهر)</th>
                <th className="py-4 px-6 font-medium">المبيعات المُدخلة</th>
                <th className="py-4 px-6 font-medium">العمولة المكتسبة</th>
                <th className="py-4 px-6 font-medium">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {affiliates.map((aff, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-6 font-mono text-muted-foreground">{aff.id}</td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-foreground">{aff.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{aff.status}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                      aff.level === 'Senior' ? 'bg-primary/20 text-primary' : 
                      aff.level === 'Mid' ? 'bg-blue-500/20 text-blue-500' : 'bg-slate-500/20 text-slate-500'
                    }`}>
                      {aff.level}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold">{aff.sales}</td>
                  <td className="py-4 px-6 font-mono">{aff.rev}</td>
                  <td className="py-4 px-6 font-mono text-emerald-500">{aff.comm}</td>
                  <td className="py-4 px-6 flex items-center gap-2">
                    {aff.eligibleForHire ? (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                        <Award className="w-3.5 h-3.5" />
                        ترقية
                      </button>
                    ) : (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold hover:bg-secondary transition-colors text-muted-foreground group-hover:text-foreground">
                        التفاصيل
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        const text = `مرحباً ${aff.name}، إليك رابط لوحة التحكم الخاصة بك في Dealix: https://dealix.sa/affiliate/onboarding/${aff.id}`;
                        if (navigator.share) {
                          navigator.share({ title: 'رابط انضمام Dealix', text, url: 'https://dealix.sa' });
                        } else {
                          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                        }
                      }}
                      className="p-1.5 rounded-lg border border-border bg-card hover:bg-secondary/50 text-muted-foreground hover:text-primary transition-all"
                      title="مشاركة رابط الانضمام"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
