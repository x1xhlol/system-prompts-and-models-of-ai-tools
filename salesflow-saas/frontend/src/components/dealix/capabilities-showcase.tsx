"use client";

import { motion } from "framer-motion";
import {
  MessageCircle, Mail, Linkedin, Instagram, Music2, Twitter,
  Brain, Shield, Handshake, TrendingUp, Globe, Zap,
  Building2, Users, BarChart3, Bot, Lock, Sparkles,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const UNIQUE_CAPABILITIES = [
  {
    icon: Brain,
    title_ar: "٧ أدمغة ذكية لكل قناة",
    title_en: "7 AI Brains — One Per Channel",
    desc_ar: "كل قناة عندها عقل خاص: واتساب، إيميل، لينكدإن، إنستقرام، تيكتوك، تويتر، سناب — كلهم مربوطين بالباك إند ويعرفون عميلك",
    desc_en: "Each channel has its own AI brain: WhatsApp, Email, LinkedIn, Instagram, TikTok, Twitter, Snapchat — all connected to your CRM data",
    badge_ar: "لا يوجد منافس يقدم هذا",
    badge_en: "No competitor offers this",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Handshake,
    title_ar: "محرك صفقات استراتيجية",
    title_en: "Strategic Deal Exchange Engine",
    desc_ar: "النظام يفهم شركتك ويبحث عن شركاء مناسبين — تبادل خدمات، شراكات، توزيع، استحواذ — ١٥ نوع صفقة",
    desc_en: "The system understands your company and finds matching partners — barter, partnerships, distribution, acquisition — 15 deal types",
    badge_ar: "أول نظام بالعالم يفعل هذا",
    badge_en: "World's first system to do this",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Bot,
    title_ar: "مفاوض AI بالعربي",
    title_en: "Arabic AI Negotiator",
    desc_ar: "يتفاوض بالنيابة عنك بالعربي — يفهم الثقافة السعودية، يحفظ ماء الوجه، ويعرف متى يصعّد للبشر",
    desc_en: "Negotiates on your behalf in Arabic — understands Saudi culture, saves face, knows when to escalate to humans",
    badge_ar: "حصري لـ Dealix",
    badge_en: "Dealix exclusive",
    color: "from-purple-500 to-indigo-600",
  },
  {
    icon: Shield,
    title_ar: "حماية PDPL مدمجة",
    title_en: "Built-in PDPL Protection",
    desc_ar: "النظام يفحص الموافقة قبل كل رسالة — حماية بياناتك وبيانات عملائك حسب نظام حماية البيانات السعودي",
    desc_en: "System checks consent before every message — protects your data and clients' data per Saudi PDPL law",
    badge_ar: "غرامة ٥ مليون ر.س — نحميك",
    badge_en: "SAR 5M fine — we protect you",
    color: "from-red-500 to-orange-600",
  },
  {
    icon: TrendingUp,
    title_ar: "محاكي نمو استراتيجي",
    title_en: "Strategic Growth Simulator",
    desc_ar: "حاكي أي سيناريو: شراكة، استحواذ، توسع — شوف العائد والمخاطر قبل ما تقرر",
    desc_en: "Simulate any scenario: partnership, acquisition, expansion — see ROI and risks before deciding",
    badge_ar: "مستوى enterprise",
    badge_en: "Enterprise-grade",
    color: "from-amber-500 to-yellow-600",
  },
  {
    icon: Globe,
    title_ar: "عربي أولاً — ثنائي اللغة",
    title_en: "Arabic-First — Bilingual",
    desc_ar: "مبني عربي من الأساس مع AI يفهم اللهجة السعودية — مو ترجمة لنظام أجنبي",
    desc_en: "Built Arabic from the ground up with Saudi-dialect AI — not a translation of a foreign system",
    badge_ar: "الوحيد بالسوق",
    badge_en: "Only one in market",
    color: "from-green-500 to-emerald-600",
  },
];

const CHANNEL_ICONS = [
  { icon: MessageCircle, name: "WhatsApp", color: "#25D366" },
  { icon: Mail, name: "Email", color: "#EA4335" },
  { icon: Linkedin, name: "LinkedIn", color: "#0A66C2" },
  { icon: Instagram, name: "Instagram", color: "#E4405F" },
  { icon: Music2, name: "TikTok", color: "#000000" },
  { icon: Twitter, name: "X/Twitter", color: "#1DA1F2" },
];

const COMPARISON_DATA = [
  { feature_ar: "أدمغة AI لكل قناة", dealix: true, salesforce: false, zoho: false, hubspot: false },
  { feature_ar: "صفقات استراتيجية تلقائية", dealix: true, salesforce: false, zoho: false, hubspot: false },
  { feature_ar: "مفاوض AI بالعربي", dealix: true, salesforce: false, zoho: false, hubspot: false },
  { feature_ar: "واتساب مدمج بالنظام", dealix: true, salesforce: false, zoho: false, hubspot: false },
  { feature_ar: "PDPL مدمج", dealix: true, salesforce: false, zoho: false, hubspot: false },
  { feature_ar: "عربي أولاً (مو ترجمة)", dealix: true, salesforce: false, zoho: true, hubspot: false },
  { feature_ar: "محاكي نمو استراتيجي", dealix: true, salesforce: false, zoho: false, hubspot: false },
  { feature_ar: "تسلسلات متعددة القنوات", dealix: true, salesforce: true, zoho: true, hubspot: true },
];

export function CapabilitiesShowcase() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-4 border border-cyan-500/20">
            ما يميز Dealix عن كل المنافسين
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            قدرات لا توجد في أي نظام آخر
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Dealix ليس مجرد CRM — هو نظام تجاري ذكي يبيع ويتفاوض ويبني شراكات بالنيابة عنك
          </p>
        </motion.div>

        {/* Channel Icons Row */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="flex justify-center gap-6 mb-16"
        >
          {CHANNEL_ICONS.map((ch) => (
            <motion.div
              key={ch.name}
              variants={fadeUp}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${ch.color}20`, border: `1px solid ${ch.color}40` }}
              >
                <ch.icon className="w-7 h-7" style={{ color: ch.color }} />
              </div>
              <span className="text-xs text-slate-500">{ch.name}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Unique Capabilities Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
        >
          {UNIQUE_CAPABILITIES.map((cap, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm
                         hover:bg-white/[0.08] transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cap.color} flex items-center justify-center mb-4`}>
                <cap.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{cap.title_ar}</h3>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">{cap.desc_ar}</p>
              <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs border border-cyan-500/20">
                {cap.badge_ar}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            لماذا Dealix هو الخيار الأذكى؟
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-4 text-start text-sm font-medium text-slate-400">الميزة</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-cyan-400">Dealix</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-slate-500">Salesforce</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-slate-500">Zoho</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-slate-500">HubSpot</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.map((row, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-6 py-3 text-sm text-white">{row.feature_ar}</td>
                    <td className="px-6 py-3 text-center">{row.dealix ? "✅" : "❌"}</td>
                    <td className="px-6 py-3 text-center">{row.salesforce ? "✅" : "❌"}</td>
                    <td className="px-6 py-3 text-center">{row.zoho ? "✅" : "❌"}</td>
                    <td className="px-6 py-3 text-center">{row.hubspot ? "✅" : "❌"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-sm text-slate-500 mt-4">
            Dealix يتفوق في ٧ من ٨ مقارنات — والباقي متساوي
          </p>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center p-8 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20"
        >
          <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            جاهز تشوف قدرات لا توجد في أي مكان ثاني؟
          </h3>
          <p className="text-slate-400 mb-6">
            ١٤ يوم تجربة مجانية — بدون بطاقة — كل المميزات مفتوحة
          </p>
          <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
            ابدأ تجربتك المجانية الآن
          </button>
        </motion.div>
      </div>
    </section>
  );
}
