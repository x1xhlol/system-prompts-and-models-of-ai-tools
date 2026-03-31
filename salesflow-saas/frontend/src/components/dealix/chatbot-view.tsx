import { Bot, Mic, MessageSquare, Plus, Activity, AlertCircle, Phone } from "lucide-react";

export function ChatbotView() {
  const agents = [
    { name: "وكيل التأهيل (WhatsApp)", type: "Qualification", lang: "العربية (السعودية)", status: "Active", volume: 1450 },
    { name: "وكيل الاتصال الصوتي", type: "Voice Calls", lang: "العربية (السعودية)", status: "Training", volume: 320 },
    { name: "الوكيل العقاري الخاص", type: "Sector Specific", lang: "Bilingual", status: "Active", volume: 890 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">🤖 مركز تحكم وكلاء الذكاء الاصطناعي</h1>
          <p className="text-muted-foreground">صناعة وتوجيه وكلاء المبيعات، المحادثة النصية (WhatsApp) والاتصال الصوتي (Voice Agents).</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/25 transition-all">
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
      
      {/* Voice Demo Panel */}
      <div className="glass-card p-6 flex items-center justify-between border border-blue-500/20 bg-blue-500/5 mt-8">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30">
            <Phone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold">تجربة الوكيل الصوتي المباشر (Realtime SA)</h3>
            <p className="text-sm text-muted-foreground mt-1">تحدث مباشرة مع وكيلك الذكي لتختبر اللهجة السعودية وسرعة الرد.</p>
          </div>
        </div>
        <button className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all shadow-lg flex gap-2 items-center">
          <Mic className="w-5 h-5" />
          بدء محاكاة المكالمة
        </button>
      </div>
    </div>
  );
}
