"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Zap,
  Sparkles,
  Layers,
  Shield,
  TrendingUp,
  Download,
  LayoutDashboard,
  Cpu,
  Globe2,
  ChevronDown,
} from "lucide-react";

const heroContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const features = [
  {
    title: "وكلاء متعددون + إشراف",
    desc: "طبقات من الاكتشاف إلى الإغلاق مع حوكمة وموافقات قبل الإرسال الحساس.",
    icon: Layers,
  },
  {
    title: "قنوات حقيقية",
    desc: "واتساب، بريد، لينكد إن، صوت — مع تكامل CRM ومسارات دفع وعقود.",
    icon: Globe2,
  },
  {
    title: "ذاكرة وتطوير ذاتي",
    desc: "سياق لكل عميل وصفقة؛ حلقات تحسين مستمرة قابلة للقياس.",
    icon: Cpu,
  },
  {
    title: "جاهزية مؤسسية",
    desc: "عزل متعدد المستأجرين، تدقيق، وتقارير تنفيذية — وليس مجرد شات بوت.",
    icon: Shield,
  },
];

/**
 * صفحة هبوط عامة — مستوى أعلى من landing عادي: حركة، تباين، مسارات واضحة.
 * (Lovable.dev أداة خارجية؛ التصميم هنا منفّذ بالكامل في Next.js.)
 */
export function DealixPublicSite() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(20,184,166,0.25),transparent)]" />
      <div className="pointer-events-none fixed top-0 right-0 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />

      <header className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 shadow-lg shadow-teal-500/25">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">Dealix</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-teal-400/90">Revenue OS</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 md:flex text-sm text-slate-400">
            <a href="#product" className="hover:text-white transition-colors">
              المنتج
            </a>
            <a href="#why" className="hover:text-white transition-colors">
              لماذا Dealix
            </a>
            <Link href="/resources" className="hover:text-teal-300 transition-colors">
              التحميلات
            </Link>
            <Link href="/marketers" className="hover:text-teal-300 transition-colors">
              المسوّقون
            </Link>
            <Link href="/strategy" className="hover:text-teal-300 transition-colors">
              الاستراتيجية
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/resources"
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
            >
              <Download className="h-4 w-4" />
              موارد
            </Link>
            <Link
              href="/login?next=/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-500/30 transition hover:bg-teal-400"
            >
              <LayoutDashboard className="h-4 w-4" />
              دخول المنصة
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <motion.div
            variants={heroContainer}
            initial="hidden"
            animate="show"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={heroItem} className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-medium text-teal-200">
              <Sparkles className="h-3.5 w-3.5" />
              نظام تشغيل إيرادات B2B — سعودي المنطلق
            </motion.div>
            <motion.h1
              variants={heroItem}
              className="text-4xl font-extrabold leading-[1.15] tracking-tight md:text-6xl md:leading-[1.1]"
            >
              حوّل دورة المبيعات إلى{" "}
              <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                آلة إيرادات
              </span>{" "}
              تعمل مع فريقك — لا ضدّه
            </motion.h1>
            <motion.p
              variants={heroItem}
              className="mt-6 text-lg text-slate-400 md:text-xl leading-relaxed"
            >
              اكتشاف، تأهيل، متابعة متعددة القنوات، عروض، تحصيل، وتحليلات — مع حوكمة وذاكرة
              وتكاملات CRM. تصميم أقرب لصفحات المنتجات العالمية، بلمسة عربية احترافية.
            </motion.p>
            <motion.div
              variants={heroItem}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/login?next=/dashboard"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-teal-500 px-8 py-4 text-base font-bold text-slate-950 shadow-xl shadow-teal-500/25 transition hover:scale-[1.02] hover:bg-teal-400"
              >
                ابدأ من لوحة التحكم
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </Link>
              <a
                href="/dealix-marketing/index.html"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur hover:bg-white/10"
              >
                <Download className="h-5 w-5" />
                فتح بوابة الملفات
              </a>
            </motion.div>
            <motion.div
              variants={heroItem}
              className="mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-500"
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-white">34+</p>
                <p className="text-xs uppercase tracking-wider">مسارات وكلاء</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">24/7</p>
                <p className="text-xs uppercase tracking-wider">تشغيل مستمر</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">SAR</p>
                <p className="text-xs uppercase tracking-wider">عملة محلية</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section id="product" className="border-t border-white/5 bg-white/[0.02] py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <p className="text-sm font-semibold text-teal-400">المنتج</p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">كل ما تحتاجه لتسريع الإغلاق</h2>
              <p className="mt-3 text-slate-400">بطاقات تفاعلية — مرّر للموبايل</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 transition hover:border-teal-500/40"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="why" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-950/50 to-slate-900/80 p-8 md:p-12">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-teal-300">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm font-semibold">لماذا ليس مجرد landing بسيط؟</span>
                  </div>
                  <p className="mt-3 max-w-xl text-slate-300 leading-relaxed">
                    الصفحات التسويقية تشرح القيمة. Dealix ينفّذ الدورة: بيانات، صفقات، عمولات، وربط
                    قنوات — مع طبقة ذكاء وحوكمة. استخدم هذه الصفحة للجذب، ولوحة التحكم للتشغيل.
                  </p>
                </div>
                <Link
                  href="/resources"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-slate-900 hover:bg-slate-100"
                >
                  مركز التحميل الكامل
                  <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/5 py-12 text-center text-sm text-slate-500">
          <p>© Dealix — Revenue Operating System</p>
          <p className="mt-2 text-xs">
            تصميم وتنفيذ في Next.js — يمكنك لاحقاً تصدير مفاهيم مشابهة من أدوات مثل Lovable ودمجها يدوياً.
          </p>
        </footer>
      </main>
    </div>
  );
}
