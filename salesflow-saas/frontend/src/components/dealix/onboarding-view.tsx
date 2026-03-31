import { BookOpen, Map, Target, Award, Rocket, FileText, Smartphone, Megaphone } from "lucide-react";

export function OnboardingView() {
  const steps = [
    { num: 1, title: "فهم المنتج (Dealix)", desc: "شركة سعودية للذكاء الاصطناعي موجهة لقطاع الأعمال؛ تصنع موظفين AI للمبيعات والدعم الفني." },
    { num: 2, title: "تحديد الفئة", desc: "شركات B2B/B2C اللي تعاني من نقص في الرد السريع، أو تسرب المبيعات." },
    { num: 3, title: "اختيار القطاع", desc: "اختر قطاع تفهمه جيداً (العقارات، العيادات، أو المتاجر) واستخدم الترسانة القطاعية." },
    { num: 4, title: "الاستهداف", desc: "ابحث في LinkedIn لمعرفة صناع القرار، أو خرائط جوجل (Google Maps) للأنشطة المحلية." },
    { num: 5, title: "التواصل الأولي", desc: "استخدم سكربت 'المكالمة الباردة' أو 'الواتساب البارد' المتوفر في قسم السكربتات." },
    { num: 6, title: "حجز الديمو", desc: "هدفك الوحيد هو إقناع العميل بتجربة ديمو مجاني للـ AI عن طريق الواتساب." },
    { num: 7, title: "الإغلاق", desc: "يقوم فريقنا وخبرائنا (أو أنت إذا كنت محترفاً) بإغلاق الصفقة وتوقيع العقود، لتستلم عمولتك." },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">📖 دليل المسوق الشامل (Onboarding)</h1>
          <p className="text-muted-foreground">خطوتك الأولى لفهم Dealix وكيف تبدأ بتحقيق المبيعات والعمولات من اليوم الأول.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Steps */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col gap-6">
          <div className="flex items-center gap-4 pb-4 border-b border-border/50">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">خارطة الطريق (7 خطوات نجاح)</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step, i) => (
              <div key={i} className="p-4 bg-secondary/30 rounded-xl border border-border/50 flex gap-4 hover:bg-secondary/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">
                  {step.num}
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel: Targets & Strategies */}
        <div className="space-y-6">
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold">استراتيجيات البحث</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm p-3 bg-card border border-border rounded-lg shadow-sm">
                <Smartphone className="w-4 h-4 text-blue-500" /> Google Maps للشركات والعيادات
              </li>
              <li className="flex items-center gap-3 text-sm p-3 bg-card border border-border rounded-lg shadow-sm">
                <FileText className="w-4 h-4 text-blue-500" /> LinkedIn Sales Navigator
              </li>
              <li className="flex items-center gap-3 text-sm p-3 bg-card border border-border rounded-lg shadow-sm">
                <Megaphone className="w-4 h-4 text-blue-500" /> إعلانات إنستغرام الممولة كمخابئ للعملاء
              </li>
            </ul>
          </div>

          <div className="glass-card p-6 flex flex-col gap-4 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="font-bold">الترقية التلقائية (Qiwa)</h3>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed font-sans mt-2">
              إذا حققت <span className="font-bold text-primary">10 إغلاقات بمبالغ أعلى من 5,000 ريال للشهر الواحد</span>،
              يتم ترقيتك فوراً لمسار "المبيعات التنفيذية" بعقد رسمي وراتب ثابت + عمولة 5%.
            </p>
            <div className="mt-4 p-4 rounded-xl bg-background border border-border/50 text-center">
              <Rocket className="w-8 h-8 text-primary mx-auto mb-2 opacity-80" />
              <span className="text-sm font-bold block">متبقي لك 10 شركات للتأهل!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
