"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  ChevronRight,
  MessageCircle,
  X,
  Send,
  Star
} from "lucide-react";

export function LandingView({ onEnterApp }: { onEnterApp: () => void }) {
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "agent", content: "هلا بك يا غالي! معك مساعد Dealix الذكي. شفت إنك مهتم بمضاعفة مبيعاتك؟" }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // Proactive chat trigger
  useEffect(() => {
    const timer = setTimeout(() => setShowChat(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    setChatMessages([...chatMessages, { role: "user", content: inputMessage }]);
    setInputMessage("");
    
    // Simulate AI thinking and "Closing" response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: "agent", 
        content: "بإذن الله نقدر نخدمك ونوصلك لأرقام ما تتخيلها. وش رايك نبدأ بتجربة 'محرك صيد العملاء' الآن؟" 
      }]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans">
      {/* Decorative Lights */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <span className="text-2xl font-bold tracking-tighter gold-glow">DEALIX OS</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium opacity-80">
          <a href="#" className="hover:text-primary transition-colors">المميزات</a>
          <a href="#" className="hover:text-primary transition-colors">عرض مؤسسي</a>
          <a href="#" className="hover:text-primary transition-colors">عنا</a>
        </div>
        <button 
          onClick={onEnterApp}
          className="px-6 py-2.5 bg-primary text-black font-bold rounded-full hover:scale-105 transition-all shadow-lg shadow-primary/20"
        >
          دخول غرفة العمليات
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-bounce">
          <Star className="w-4 h-4 text-accent fill-accent" />
          <span className="text-xs font-bold text-primary tracking-widest uppercase">أول نظام مبيعات مستقل بالكامل في المملكة</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
          امتلك <span className="text-primary italic">إمبراطورية</span> <br /> 
          مبيعات تعمل <span className="gold-glow">24/7</span>
        </h1>
        
        <p className="max-w-2xl text-xl opacity-70 mb-12 leading-relaxed">
          نحول أحلامك إلى أرقام حقيقية. صيد آلي للعملاء، وكلاء ذكاء اصطناعي محترفين، <br /> 
          وحلقة مالية متكاملة لضمان تدفق الأرباح دون انقطاع.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onEnterApp}
            className="px-10 py-5 bg-primary text-black font-black text-lg rounded-2xl flex items-center gap-3 hover:shadow-primary/40 transition-all shadow-xl"
          >
            ابدأ الهيمنة الآن
            <ChevronRight className="w-6 h-6" />
          </button>
          <button className="px-10 py-5 glass-premium rounded-2xl font-bold hover:bg-white/10 transition-all">
            مشاهدة العرض التجريبي
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-32 w-full max-w-4xl">
          {[
            { label: "عمليات بيع ناجحة", value: "+٥,٠٠٠", icon: TrendingUp },
            { label: "وكلاء فاعلين", value: "+١٨", icon: Zap },
            { label: "مسوقين نشطين", value: "+٢٥٠", icon: Users },
            { label: "ضمان ذهبي", value: "١٠٠٪", icon: ShieldCheck },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
                <stat.icon className="w-6 h-6 text-accent" />
              </div>
              <p className="text-3xl font-black">{stat.value}</p>
              <p className="text-xs opacity-50 font-bold uppercase tracking-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Proactive AI Closer (WhatsApp Style) */}
      <div className={`fixed bottom-8 right-8 z-50 transition-all duration-500 transform ${showChat ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"}`}>
        <div className="w-[380px] glass-premium rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-primary/30">
          {/* Chat Header */}
          <div className="bg-primary p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center relative">
                <Zap className="w-5 h-5 text-black" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-primary rounded-full"></span>
              </div>
              <div>
                <p className="font-black text-black leading-none">وكيل Dealix القناص</p>
                <p className="text-[10px] text-black/60 font-bold uppercase mt-1">متصل الآن - جاهز للإغلاق</p>
              </div>
            </div>
            <button onClick={() => setShowChat(false)} className="text-black/40 hover:text-black transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 h-[300px] overflow-y-auto p-4 space-y-4 bg-black/40 backdrop-blur-md">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium ${
                  msg.role === "user" 
                    ? "bg-primary text-black rounded-tr-none" 
                    : "bg-secondary/20 text-white border border-white/5 rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-black/60 border-t border-white/10 flex items-center gap-2">
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="اكتب ردك هنا طال عمرك..." 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all font-sans"
            />
            <button 
              onClick={handleSendMessage}
              className="w-10 h-10 bg-primary text-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Chat Trigger (Hidden when chat is open) */}
      {!showChat && (
        <button 
          onClick={() => setShowChat(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all animate-bounce z-40"
        >
          <MessageCircle className="w-8 h-8" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-[10px] text-white font-bold flex items-center justify-center rounded-full border-2 border-background">1</span>
        </button>
      )}
    </div>
  );
}
