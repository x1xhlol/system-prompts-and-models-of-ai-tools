import { Bot, Mic, MessageSquare, Plus, Activity, AlertCircle, Phone } from "lucide-react";

export function ChatbotView() {
  const agents = [
    { name: "وكيل التأهيل (WhatsApp)", type: "Qualification", lang: "العربية (السعودية)", status: "Active", volume: 1450 },
    { name: "وكيل الاتصال الصوتي", type: "Voice Calls", lang: "العربية (السعودية)", status: "Training", volume: 320 },
    { name: "الوكيل العقاري الخاص", type: "Sector Specific", lang: "Bilingual", status: "Active", volume: 890 },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="text-right">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">🤖 مركز تحكم الوكلاء</h1>
          <p className="text-sm md:text-base text-muted-foreground">صناعة وتوجيه وكلاء المبيعات، المحادثة النصية (WhatsApp) والاتصال الصوتي (Voice Agents).</p>
        </div>
        <button className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/25 transition-all text-sm">
          <Plus className="w-5 h-5" />
          بناء وكيل جديد
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {agents.map((agent, i) => (
          <div key={i} className="glass-card flex flex-col group overflow-hidden border border-border/50">
            <div className={`p-6 border-b border-border/50 flex justify-between items-center bg-secondary/20`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-background shadow-sm ${agent.type.includes('Voice') ? 'text-blue-500' : 'text-emerald-500'}`}>
                  {agent.type.includes('Voice') ? <Mic className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{agent.name}</h3>
                  <p className="text-xs text-muted-foreground">{agent.type}</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${agent.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </div>
            
            <div className="p-6 flex-1 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-border/50 py-2">
                <span className="text-sm text-muted-foreground">اللغة المدعومة:</span>
                <span className="text-sm font-medium">{agent.lang}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 py-2">
                <span className="text-sm text-muted-foreground">إجمالي المحادثات:</span>
                <span className="text-sm font-bold">{agent.volume}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 py-2">
                <span className="text-sm text-muted-foreground">نسبة التسليم للبشر (Handoff):</span>
                <span className="text-sm font-bold text-amber-500">12%</span>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
                <button className="flex items-center justify-center gap-2 py-2 rounded-lg bg-background border border-border hover:bg-secondary/50 transition-colors text-sm font-medium">
                  <Bot className="w-4 h-4" />
                  تعديل البرومبت
                </button>
                <button className="flex items-center justify-center gap-2 py-2 rounded-lg bg-background border border-border hover:bg-secondary/50 transition-colors text-sm font-medium">
                  <Activity className="w-4 h-4" />
                  سجل المحادثات
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Live Operations Feed (The Pulse of the Empire) */}
      <div className="glass-card overflow-hidden border border-primary/20 bg-primary/5">
        <div className="p-4 border-b border-primary/20 bg-primary/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span className="font-black text-sm uppercase tracking-widest">نبض الإمبراطورية (Live Feed)</span>
          </div>
          <span className="text-[10px] opacity-60 font-bold uppercase">تحديث حي كل ٣ ثواني</span>
        </div>
        <div className="p-4 space-y-3 h-[200px] overflow-y-auto font-sans text-right rtl">
          {[
            { time: "الآن", msg: "الوكيل القناص قام بإغلاق صفقة بقيمة ٢,٥٠٠ ريال مع عميل في الرياض 💰", color: "text-emerald-500" },
            { time: "قبل دقيقة", msg: "وكيل التأهيل قام بتصنيف عميل جديد كـ 'فرصة ذهبية' (Qualified) 🎯", color: "text-primary" },
            { time: "قبل ٣ دقائق", msg: "تم إرسال رابط الدفع آلياً لعميل في جدة عبر الواتساب 🔗", color: "text-blue-400" },
            { time: "قبل ٥ دقائق", msg: "الوكيل الصوتي أكمل مكالمة بنجاح وحجز موعد عرض تجريبي 🎙️", color: "text-purple-400" },
            { time: "قبل ٨ دقائق", msg: "تم تفعيل الضمان الذهبي لعميل جديد لزيادة الثقة 🛡️", color: "text-accent" },
          ].map((log, i) => (
            <div key={i} className="flex justify-between items-center gap-4 py-2 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors px-2 rounded-lg">
              <span className={`text-sm font-bold ${log.color}`}>{log.msg}</span>
              <span className="text-[10px] opacity-40 font-medium whitespace-nowrap">{log.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Demo Panel */}
      <div className="glass-card p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-primary/20 bg-primary/5 mt-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 md:p-4 rounded-xl bg-primary text-black shadow-lg shadow-primary/30">
            <Phone className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
          </div>
          <div className="text-right">
            <h3 className="text-base md:text-lg font-black text-primary">تجربة الوكيل الصوتي (Realtime SA)</h3>
            <p className="text-xs md:text-sm opacity-70 mt-1">تحدث مباشرة مع وكيلك الذكي لتختبر اللهجة السعودية وسرعة الرد القاتلة.</p>
          </div>
        </div>
        <button className="relative z-10 w-full md:w-auto px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-black font-black transition-all shadow-lg shadow-primary/20 flex gap-3 items-center justify-center text-sm hover:scale-105 active:scale-95">
          <Mic className="w-5 h-5" />
          بدء محاكاة المكالمة الذكية
        </button>
      </div>
    </div>
  );
}
