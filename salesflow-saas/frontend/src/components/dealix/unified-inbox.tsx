"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  Paperclip,
  ArrowRight,
  Phone,
  MoreVertical,
  Sparkles,
  Check,
  CheckCheck,
  MessageSquare,
  Mail,
  Smartphone,
} from "lucide-react";

/* ───────────── types ───────────── */
type Channel = "whatsapp" | "email" | "sms";
type FilterTab = "all" | "whatsapp" | "email" | "sms";

interface Message {
  id: string;
  text: string;
  sent: boolean; // true = we sent, false = received
  time: string;
  read?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string; // initials
  avatarColor: string;
  channel: Channel;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
}

/* ───────────── channel config ───────────── */
const channelConfig: Record<Channel, { icon: typeof MessageSquare; color: string; label: string }> = {
  whatsapp: { icon: MessageSquare, color: "text-green-400 bg-green-400/20", label: "واتساب" },
  email: { icon: Mail, color: "text-blue-400 bg-blue-400/20", label: "إيميل" },
  sms: { icon: Smartphone, color: "text-purple-400 bg-purple-400/20", label: "رسائل" },
};

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "whatsapp", label: "واتساب" },
  { key: "email", label: "إيميل" },
  { key: "sms", label: "رسائل" },
];

/* ───────────── sample data ───────────── */
const sampleConversations: Conversation[] = [
  {
    id: "c1",
    name: "أحمد الغامدي",
    avatar: "أغ",
    avatarColor: "bg-green-600",
    channel: "whatsapp",
    lastMessage: "تمام، أرسل لي العرض على الإيميل",
    time: "١٠:٣٢",
    unread: 2,
    messages: [
      { id: "m1", text: "السلام عليكم، عندكم حل CRM يدعم العربي؟", sent: false, time: "١٠:١٥" },
      { id: "m2", text: "وعليكم السلام أحمد! أكيد، Dealix مصمم بالكامل للسوق السعودي", sent: true, time: "١٠:١٨", read: true },
      { id: "m3", text: "كم السعر للباقة الاحترافية؟", sent: false, time: "١٠:٢٠" },
      { id: "m4", text: "١٤٩ ر.س شهرياً مع تجربة مجانية ١٤ يوم", sent: true, time: "١٠:٢٥", read: true },
      { id: "m5", text: "تمام، أرسل لي العرض على الإيميل", sent: false, time: "١٠:٣٢" },
    ],
  },
  {
    id: "c2",
    name: "سارة المطيري",
    avatar: "سم",
    avatarColor: "bg-blue-600",
    channel: "email",
    lastMessage: "شكراً على العرض التقديمي، سأرجع لكم بعد الاجتماع",
    time: "أمس",
    unread: 0,
    messages: [
      { id: "m6", text: "مرحباً، أرغب بمعرفة المزيد عن خدمات تقييم العملاء بالذكاء الاصطناعي", sent: false, time: "أمس ٠٩:٠٠" },
      { id: "m7", text: "أهلاً سارة! نظام تقييم العملاء يعتمد على ٤ محاور: التفاعل، الملف الشخصي، السلوك، ونية الشراء", sent: true, time: "أمس ٠٩:٤٥", read: true },
      { id: "m8", text: "ممتاز، هل يمكنكم تقديم عرض لفريق من ١٥ شخص؟", sent: false, time: "أمس ١١:٣٠" },
      { id: "m9", text: "بالتأكيد! أرفقت عرض الأسعار للباقة المؤسسية", sent: true, time: "أمس ١٤:٠٠", read: true },
      { id: "m10", text: "شكراً على العرض التقديمي، سأرجع لكم بعد الاجتماع", sent: false, time: "أمس ١٦:٢٠" },
    ],
  },
  {
    id: "c3",
    name: "خالد العتيبي",
    avatar: "خع",
    avatarColor: "bg-purple-600",
    channel: "sms",
    lastMessage: "موعدنا يوم الأحد الساعة ١١ صباحاً",
    time: "١٢:٠٠",
    unread: 1,
    messages: [
      { id: "m11", text: "خالد، تذكير بموعد العرض التقديمي", sent: true, time: "١١:٣٠", read: true },
      { id: "m12", text: "موعدنا يوم الأحد الساعة ١١ صباحاً", sent: false, time: "١٢:٠٠" },
    ],
  },
  {
    id: "c4",
    name: "منيرة القحطاني",
    avatar: "مق",
    avatarColor: "bg-amber-600",
    channel: "whatsapp",
    lastMessage: "ودي أجرب النظام قبل ما نقرر",
    time: "٠٩:١٥",
    unread: 3,
    messages: [
      { id: "m13", text: "مرحباً، محتاجين نظام CRM لشركة عقارية", sent: false, time: "٠٨:٤٥" },
      { id: "m14", text: "أهلاً منيرة! Dealix يخدم أكثر من ٥٠ شركة عقارية في المملكة", sent: true, time: "٠٩:٠٠", read: true },
      { id: "m15", text: "ودي أجرب النظام قبل ما نقرر", sent: false, time: "٠٩:١٥" },
    ],
  },
];

/* ───────────── typing indicator ───────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-4 py-3 rounded-2xl rounded-br-sm bg-slate-700/60 w-fit">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-white/40"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

/* ───────────── conversation list item ───────────── */
function ConversationItem({
  convo,
  isActive,
  onClick,
}: {
  convo: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  const ch = channelConfig[convo.channel];
  const Icon = ch.icon;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all ${
        isActive
          ? "bg-white/10 border border-white/10"
          : "hover:bg-white/[0.04] border border-transparent"
      }`}
    >
      {/* avatar */}
      <div className={`relative shrink-0 w-11 h-11 rounded-full ${convo.avatarColor} flex items-center justify-center text-xs font-bold text-white`}>
        {convo.avatar}
        <span className={`absolute -bottom-0.5 -left-0.5 p-0.5 rounded-full ${ch.color.split(" ")[1]}`}>
          <Icon className={`w-2.5 h-2.5 ${ch.color.split(" ")[0]}`} />
        </span>
      </div>

      {/* text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-white/40">{convo.time}</span>
          <h4 className="font-bold text-sm truncate">{convo.name}</h4>
        </div>
        <p className="text-xs text-white/50 truncate mt-0.5">{convo.lastMessage}</p>
      </div>

      {/* unread badge */}
      {convo.unread > 0 && (
        <span className="shrink-0 w-5 h-5 rounded-full bg-teal-500 text-[10px] font-bold text-black flex items-center justify-center">
          {convo.unread}
        </span>
      )}
    </motion.button>
  );
}

/* ───────────── chat panel ───────────── */
function ChatPanel({
  convo,
  onBack,
}: {
  convo: Conversation;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState(convo.messages);
  const [input, setInput] = useState("");
  const [showTyping, setShowTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ch = channelConfig[convo.channel];

  useEffect(() => {
    setMessages(convo.messages);
  }, [convo.id, convo.messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, showTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      text: input,
      sent: true,
      time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setShowTyping(true);
    setTimeout(() => {
      setShowTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}-r`,
          text: "شكراً لتواصلك! سأرد عليك في أقرب وقت",
          sent: false,
          time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* chat header */}
      <div className="shrink-0 flex items-center justify-between gap-3 p-4 border-b border-white/10 bg-white/[0.02] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <Phone className="w-4 h-4 text-white/50" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <MoreVertical className="w-4 h-4 text-white/50" />
          </button>
        </div>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="text-right">
            <h3 className="font-bold text-sm">{convo.name}</h3>
            <span className={`text-[10px] font-medium ${ch.color.split(" ")[0]}`}>
              {ch.label}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-full ${convo.avatarColor} flex items-center justify-center text-xs font-bold text-white`}>
            {convo.avatar}
          </div>
          {/* back button mobile */}
          <button
            onClick={onBack}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sent ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.sent
                  ? "bg-teal-600/80 text-white rounded-bl-sm"
                  : "bg-slate-700/60 text-white/90 rounded-br-sm"
              }`}
            >
              <p>{msg.text}</p>
              <div className={`flex items-center gap-1 mt-1 ${msg.sent ? "justify-start" : "justify-end"}`}>
                <span className="text-[10px] text-white/40">{msg.time}</span>
                {msg.sent &&
                  (msg.read ? (
                    <CheckCheck className="w-3 h-3 text-teal-300" />
                  ) : (
                    <Check className="w-3 h-3 text-white/30" />
                  ))}
              </div>
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {showTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-end"
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI suggestion chip */}
      <div className="shrink-0 px-4 pb-2">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium hover:bg-teal-500/20 transition-colors">
          <Sparkles className="w-3 h-3" />
          اقتراح الرد الذكي
        </button>
      </div>

      {/* input bar */}
      <div className="shrink-0 p-3 border-t border-white/10 bg-white/[0.02] backdrop-blur-xl flex items-center gap-2">
        <button className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/40 hover:text-white/60">
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="اكتب رسالتك..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 transition-colors"
        />
        <button
          onClick={handleSend}
          className="p-2.5 rounded-xl bg-teal-500 text-black hover:bg-teal-400 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ───────────── main component ───────────── */
export function UnifiedInbox() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const filtered = sampleConversations.filter((c) => {
    if (filter !== "all" && c.channel !== filter) return false;
    if (search && !c.name.includes(search) && !c.lastMessage.includes(search)) return false;
    return true;
  });

  const activeConvo = sampleConversations.find((c) => c.id === activeId) ?? null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[calc(100vh-120px)] min-h-[500px] rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-xl flex"
      dir="rtl"
    >
      {/* ─── right panel: conversation list ─── */}
      <div
        className={`w-full lg:w-[340px] shrink-0 border-l border-white/10 flex flex-col ${
          activeConvo ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* search */}
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-2 text-sm placeholder:text-white/30 focus:outline-none focus:border-teal-500/40 transition-colors"
            />
          </div>
        </div>

        {/* filter tabs */}
        <div className="flex gap-1 p-2 border-b border-white/10">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filter === tab.key
                  ? "bg-teal-500/20 text-teal-300"
                  : "text-white/40 hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <AnimatePresence>
            {filtered.map((convo, i) => (
              <motion.div
                key={convo.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ConversationItem
                  convo={convo}
                  isActive={activeId === convo.id}
                  onClick={() => setActiveId(convo.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="flex items-center justify-center h-32 text-sm text-white/30">
              لا توجد محادثات
            </div>
          )}
        </div>
      </div>

      {/* ─── left panel: chat thread ─── */}
      <div
        className={`flex-1 flex flex-col ${
          !activeConvo ? "hidden lg:flex" : "flex"
        }`}
      >
        {activeConvo ? (
          <ChatPanel convo={activeConvo} onBack={() => setActiveId(null)} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/30 text-sm font-medium">اختر محادثة للبدء</p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
