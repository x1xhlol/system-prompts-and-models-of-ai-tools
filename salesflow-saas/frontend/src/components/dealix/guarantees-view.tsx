import { ShieldAlert, Info, AlertTriangle, FileCheck, CheckCircle2, RotateCcw } from "lucide-react";

export function GuaranteesView() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">🛡️ الضمان الذهبي لـ Dealix (الاسترجاع)</h1>
          <p className="text-muted-foreground">سياسة الضمان والشروط وإدارة المطالبات لضمان حق الشركة والعميل معاً.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Policy Brief */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col gap-6">
          <div className="flex items-center gap-4 pb-4 border-b border-border/50">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">ملخص سياسة الضمان لمدة 30 يوماً</h2>
              <p className="text-sm text-muted-foreground mt-1">يُشترط للوفاء بالضمان الالتزام بخطة تشغيل الوكيل الذكي بالكامل.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-foreground/90">شروط الاستحقاق الرئيسية:</h3>
            <ul className="space-y-3 p-4 bg-secondary/30 rounded-xl border border-secondary">
              <li className="flex gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="leading-relaxed">أن يكون العميل قد وفر بيانات التدريب اللازمة (منتجات، أسعار، PDF معرفي) خلال أول 3 أيام من الاشتراك.</span>
              </li>
              <li className="flex gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="leading-relaxed">تفعيل الوكيل أو الشات بوت على قنوات حية (واتساب، انستقرام) وأن يكون قد استلم ما لا يقل عن 100 رسالة حقيقية من العملاء.</span>
              </li>
              <li className="flex gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="leading-relaxed">عدم إيقاف تشغيل الوكيل لأكثر من 48 ساعة متواصلة خلال فترة الشهر الأولى.</span>
              </li>
              <li className="flex gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="leading-relaxed">فشل تقني مثبت (أخطاء جسيمة في الرد، تسريب عملاء، ردود هلوسة) ولم يقم فريق الدعم بحلها.</span>
              </li>
            </ul>
          </div>

          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 flex items-start gap-3 mt-auto">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-relaxed">
              تحذير للمسوقين: لا تقدم ضماناً قطيعاً بدون عرض هذي الشروط الـ 4 للعميل. البيع التضليلي أو المبالغ فيه قد يوقف حسابك تلقائياً في Dealix.
            </p>
          </div>
        </div>

        {/* Claim workflow & Status */}
        <div className="glass-card p-6 flex flex-col gap-6">
          <div className="pb-4 border-b border-border/50">
            <h2 className="text-xl font-bold flex flex-col">
              مركز المطالبات 
              <span className="text-sm text-muted-foreground font-normal mt-1">Claims Management</span>
            </h2>
          </div>

          <div className="flex-1 space-y-4">
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">حالة المراجعة (قيد الانتظار)</span>
                <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-1 rounded font-bold">مراجعة 3 مطالبات</span>
              </div>
              <p className="text-sm font-medium">شركة الأفق الطبي (رفض دفع)</p>
              <div className="flex gap-2 text-xs">
                <button className="flex-1 bg-background border border-border py-2 rounded-lg hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-500 transition-colors">مقبول</button>
                <button className="flex-1 bg-background border border-border py-2 rounded-lg hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-colors">مرفوض</button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">حالة السداد (مدفوعة ومسترجعة)</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded font-bold">1 مطالبة</span>
              </div>
              <p className="text-sm font-medium">مصنع التمور العصرية</p>
              <span className="text-xs text-emerald-500 font-bold">تم إرجاع 21,500 ر.س</span>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/25 transition-all mt-auto">
            <RotateCcw className="w-4 h-4" />
            فتح تذكرة استرجاع (Refund Ticket)
          </button>
        </div>
      </div>
    </div>
  );
}
