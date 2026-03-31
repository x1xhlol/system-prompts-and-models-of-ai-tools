import { FileSignature, ShieldCheck, MailPlus, AlertCircle, Building2, Download } from "lucide-react";

export function AgreementsView() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">📋 الاتفاقيات والموارد البشرية (Legal & HR)</h1>
          <p className="text-muted-foreground">توليد وإدارة عقود المسوقين بالعمولة ومسار الترقية للتوظيف الرسمي.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tier 1: Affiliate Agreement */}
        <div className="glass-card flex flex-col group overflow-hidden">
          <div className="p-6 border-b border-border/50 bg-blue-500/10 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-background shadow-sm text-blue-500">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">1. اتفاقية تسويق بالعمولة (عمل حر)</h2>
              <span className="text-sm font-medium text-emerald-500">للمسوقين الجدد</span>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
            <p className="text-sm text-foreground/80 leading-relaxed font-sans">
              اتفاقية مبدئية تحفظ حقوق المسوق والشركة وتحدد نسب العمولة من (8% إلى 12%).
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>حماية الخصوصية و NDA لعدم إفشاء أسرار العملاء.</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>شروط دورة الدفع واستحقاق العمولة عند الإغلاق.</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>قواعد تمثيل الهوية التجارية لـ Dealix بأمانة.</span>
              </li>
            </ul>
            
            <button className="mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/25 transition-all">
              <MailPlus className="w-4 h-4" />
              توليد وإرسال الاتفاقية (DocuSign)
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border font-medium transition-all">
              <Download className="w-4 h-4" />
              تحميل نموذج PDF
            </button>
          </div>
        </div>

        {/* Tier 2: Formal Employment Workflow */}
        <div className="glass-card flex flex-col group overflow-hidden border-2 border-primary/20">
          <div className="p-6 border-b border-primary/20 bg-primary/10 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary shadow-sm text-primary-foreground shadow-primary/50 relative overflow-hidden">
              <Building2 className="w-8 h-8 relative z-10" />
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold">2. مسار التوظيف الرسمي (قوى Qiwa)</h2>
              <span className="text-sm font-medium text-primary">آلي بعد إغلاق 10 شركات / شهر</span>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-relaxed">
                يتم تفعيل هذا المسار تلقائياً عند تحقيق مستهدفات المبيعات المستمرة. النظام يقوم بأتمتة رفع تذكرة لإدارة الموارد البشرية لإنشاء عرض وظيفي رسمي عبر "قوى".
              </p>
            </div>
            
            <ul className="space-y-3 mb-6 mt-2">
              <li className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-primary" />
                <span>تسجيل في التأمينات الاجتماعية وعقد رسمي (Qiwa).</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-primary" />
                <span>راتب ثابت يبدأ من 5,000 ر.س + عمولة 5%.</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-primary" />
                <span>ترقية صلاحيات في Dealix لمدير حسابات أقدم.</span>
              </li>
            </ul>

            <button className="mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/25 transition-all opacity-80 cursor-progress">
              <Building2 className="w-4 h-4" />
              بدء مسار توظيف لمرشح (HR Trigger)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
