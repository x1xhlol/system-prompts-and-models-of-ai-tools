import { useState } from "react";
import { Copy, CheckCircle2, ChevronDown, MessageCircle, Phone, FileText } from "lucide-react";

const SCRIPTS = {
  "cold-call": {
    title: "مكالمة باردة (Cold Call)",
    icon: Phone,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    script: `مرحباً [اسم العميل]، معك [اسمك] من منصة Dealix للذكاء الاصطناعي.

أنا أتابع قطاع [قطاع العميل] وملاحظ إن التحدي الأكبر حالياً هو تسرب العملاء المحتملين وصعوبة الرد الفوري على كل الاستفسارات.

نحن في Dealix طورنا "موظف ذكاء اصطناعي" بلهجة سعودية يتحدث مع عملائك 24/7، يفلترهم، ويحجز المواعيد لك مباشرة.

هل عندك 3 دقائق الأسبوع القادم أوريك ديمو حي كيف ممكن نضاعف مبيعاتك؟`
  },
  "whatsapp-intro": {
    title: "تواصل واتساب (WhatsApp Intro)",
    icon: MessageCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    script: `أهلاً [اسم العميل] 👋
معك [اسمك] من شركة Dealix للذكاء الاصطناعي.

بصفتك مدير في [قطاع العميل]، أكيد تعرف إن سرعة الرد تصنع فارق كبير في المبيعات. 🚀
صممنا لك وكيل ذكاء اصطناعي بلهجتنا السعودية 🇸🇦 يرد، يقنع، ويحجز المواعيد 24/7.

متى يناسبك أرسل لك رابط لتجربة النظام فعلياً؟ (التجربة مجانية)`
  },
  "follow-up": {
    title: "متابعة (Follow-up)",
    icon: FileText,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    script: `أهلاً [اسم العميل]، مساك الله بالخير.

أتمنى تكون بخير. حبيت أذكرك بخصوص وكيل المبيعات الذكي من Dealix. 
أرفقت لك ملف سريع يوضح كيف قدرنا نرفع مبيعات شركات في نفس مجالكم بنسبة 40% خلال أول شهر.

هل تحب نحدد موعد سريع 10 دقائق نتناقش فيه؟`
  },
  "objections": {
    title: "الرد على الاعتراضات (Objections)",
    icon: FileText,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    script: `الاعتراض: "السعر غالي"
الرد: "أتفهم وجهة نظرك [اسم العميل]. لكن لو حسبناها، الموظف البشري يكلف راتب، تأمين، ومكتب، وإجازات، ولا يقدر يشتغل 24/7. نظام Dealix يشتغل بدون توقف وبجزء بسيط من هذي التكلفة. والأهم، عندنا (الضمان الذهبي)، إذا ما حققنا لك نتائج خلال 30 يوم نرجع فلوسك كاملة."

الاعتراض: "الذكاء الاصطناعي يخوف/مو دقيق"
الرد: "صحيح البدايات كانت كذا، لكن وكلاء Dealix مدربين على منتجاتك فقط ولا يجاوبون من راسهم مطلقاً. والأهم إنهم مبرمجين يحولون المحادثة لموظف بشري فوراً إذا السؤال كان معقد."`
  },
  "closing": {
    title: "إغلاق البيعة (Closing)",
    icon: CheckCircle2,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    script: `ممتاز جداً [اسم العميل]. 

بما إن النظام ناسبك، كل اللي نحتاجه منك أرقام التواصل وروابط منتجاتكم عشان ندرب الوكيل عليها، وخلال 48 ساعة بيكون جاهز يشتغل لصالحك.

أرسلت لك رابط الدفع مع عقد التشغيل اللي يضمن حقك الكامل بالاسترجاع خلال 30 يوم في حال ما شفت القيمة المضافة اللي وعدتك فيها.
مبروك مقدماً انضمامك لـ Dealix!`
  }
};

export function ScriptsView() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">📞 ترسانة السكربتات (Sales Scripts)</h1>
          <p className="text-muted-foreground">نماذج ومسودات بيعية مثبتة الفعالية للمسوقين لضمان أعلى نسبة تحويل.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(SCRIPTS).map(([id, data]) => (
          <div key={id} className="glass-card flex flex-col h-full overflow-hidden group">
            <div className={`p-6 border-b border-border/50 ${data.bg} transition-colors group-hover:bg-opacity-20`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-background shadow-sm ${data.color}`}>
                  <data.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">{data.title}</h3>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col bg-card/40">
              <div className="bg-background rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap flex-1 border border-border/50 font-sans text-foreground/90">
                {data.script}
              </div>
              
              <button 
                onClick={() => copyToClipboard(id, data.script)}
                className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                  copied === id 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50"
                }`}
              >
                {copied === id ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> تم النسخ بنجاح
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> نسخ النص
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
