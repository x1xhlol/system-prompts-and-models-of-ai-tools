import { BarChart3, Users, Target, TrendingUp, Calendar, ArrowUpRight, BrainCircuit, Zap } from "lucide-react";

export function DashboardView() {
  const stats = [
    { label: "العملاء المحتملين", value: "2,450", trend: "+12.5%", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "الاجتماعات المجدولة", value: "145", trend: "+24.3%", icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "المبيعات المغلقة", value: "89", trend: "+8.2%", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "إيرادات الشهر", value: "1.2M ر.س", trend: "+18.4%", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const pipeline = [
    { name: "شركة الأفق التقنية", stage: "تفاوض", value: "125,000 ر.س", prob: "80%", agent: "وكيل الإغلاق" },
    { name: "مجموعة الرواد", stage: "عرض سعر", value: "450,000 ر.س", prob: "60%", agent: "متدرب الذكاء الاصطناعي" },
    { name: "مصنع الشرق الأوسط", stage: "اجتماع أولي", value: "85,000 ر.س", prob: "30%", agent: "مجدول المواعيد" },
    { name: "مؤسسة النور", stage: "تأهيل", value: "غير محدد", prob: "10%", agent: "وكيل التأهيل" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Intro */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">أهلاً بك، سالم 👋</h1>
          <p className="text-muted-foreground">نظرة عامة على أداء نظام المبيعات الذكي اليوم.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors text-sm font-medium">
            تصدير التقرير
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors shadow-lg shadow-primary/25 text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4" />
            تفعيل وكيل جديد
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 transition-all group-hover:opacity-40 group-hover:scale-150 ${stat.bg.replace('/10', '')}`} />
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                {stat.trend}
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold tracking-tight mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Table */}
        <div className="lg:col-span-2 glass-card p-6 border border-border/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">أحدث الصفقات في المسار</h2>
            <button className="text-sm text-primary hover:underline">عرض الكل</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="text-muted-foreground border-b border-border/50 bg-secondary/20">
                  <th className="py-3 px-4 font-medium">العميل</th>
                  <th className="py-3 px-4 font-medium">المرحلة</th>
                  <th className="py-3 px-4 font-medium">القيمة</th>
                  <th className="py-3 px-4 font-medium">احتمالية الإغلاق</th>
                  <th className="py-3 px-4 font-medium">الوكيل المسؤول</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {pipeline.map((deal, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-4 font-medium text-foreground">{deal.name}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary/50 text-secondary-foreground border border-border/50">
                        {deal.stage}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-foreground/80">{deal.value}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-1000" 
                            style={{ width: deal.prob }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{deal.prob}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 opacity-50" />
                      {deal.agent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Panel */}
        <div className="glass-card p-6 flex flex-col border border-border/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">تنبيهات الإدارة العُليا</h2>
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          </div>
          <div className="space-y-4 flex-1">
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex flex-col gap-2">
              <span className="text-xs font-bold text-destructive">مراجعة شكوى</span>
              <p className="text-sm font-medium">شركة "التطوير الذكي" تطلب تفعيل الضمان الذهبي لعدم الوصول للمستهدف التفاعلي.</p>
              <button className="text-xs font-bold text-destructive underline mt-1 text-right w-full">مراجعة فحص الشرط الرابع</button>
            </div>
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col gap-2">
              <span className="text-xs font-bold text-primary">تفعيل توظيف مسوق</span>
              <p className="text-sm font-medium">المسوق "أحمد عبدالله" أكمل 12 إغلاق، يحتاج لتحويل عقده إلى رسمي عبر Qiwa.</p>
              <button className="text-xs font-bold text-primary underline mt-1 text-right w-full">بدء عملية HR</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
