"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X, Send, CheckCheck, User } from "lucide-react";

export function PublicChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "agent",
      text: "هلا والله! حيّاك الله في Dealix 🇸🇦. أنا مساعدك الذكي، كيف أقدر أخدمك اليوم يا غالي؟ ودّك نرفع مبيعاتك 3 أضعاف؟",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Show the "tap" bubble after 3 seconds to pull them in
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newMsg = {
      role: "user",
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI Closer response after 1.5s
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: "agent",
        text: "أبشر بسعدك! هذا بالضبط تخصصنا. نظامنا يختصر عليك مشوار السنين بالذكاء الاصطناعي. تحب أعطيك الرابط وتشوف النتائج بنفسك؟",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Tap Bubble (Puller) */}
      {!isOpen && (
        <div 
          onClick={() => setIsOpen(true)}
          className="mb-4 bg-emerald-500 text-white p-4 rounded-2xl rounded-br-none shadow-2xl cursor-pointer animate-in fade-in zoom-in slide-in-from-right-10 duration-500 max-w-[250px] relative transition-transform hover:scale-105"
        >
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">1</div>
          <p className="text-sm font-bold text-right leading-relaxed">يا هلا بك! عندي لك سر حيّر المنافسين في السوق السعودي.. تبي تعرفه؟ 👇</p>
        </div>
      )}

      {/* Main Chat Window */}
      {isOpen ? (
        <div className="w-[350px] md:w-[400px] h-[550px] bg-background border border-border/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-20 duration-500">
          {/* Header (WhatsApp Look) */}
          <div className="bg-emerald-600 p-4 flex items-center justify-between text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center border border-white/20">
                <User className="w-6 h-6" />
              </div>
              <div className="text-right">
                <h3 className="font-bold text-sm">قناص مبيعات Dealix</h3>
                <p className="text-[10px] opacity-80 text-emerald-100 flex items-center gap-1 justify-end">متصل الآن <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /></p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#e5ddd5] dark:bg-zinc-950/50 scrollbar-hide">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'agent' ? 'justify-start' : 'justify-end animate-in slide-in-from-right-4 duration-300'}`}>
                <div className={`max-w-[85%] p-3 shadow-sm relative ${
                  msg.role === 'agent' 
                  ? 'bg-white dark:bg-zinc-800 rounded-2xl rounded-tl-none text-right' 
                  : 'bg-emerald-100 dark:bg-emerald-900 rounded-2xl rounded-tr-none text-right'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[9px] opacity-50">{msg.time}</span>
                    {msg.role === 'user' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce delay-75" />
                  <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background border-t border-border/50 flex items-center gap-3">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب رسالتك لتبدأ النجاح.."
              className="flex-1 bg-secondary/50 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-right"
            />
            <button 
              onClick={handleSend}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-transform active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-emerald-700 transition-all hover:scale-110 active:scale-95 relative"
        >
          <MessageCircle className="w-7 h-7" />
          <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />
        </button>
      )}
    </div>
  );
}
