"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { DealixLogo3D } from "./dealix-3d-logo";
import {
  Zap,
  MessageSquare,
  BarChart3,
  FileText,
  ShieldCheck,
  BrainCircuit,
  ChevronLeft,
  Play,
  CheckCircle2,
  ArrowLeft,
  Star,
  Users,
  Trophy,
  Rocket,
  AlertTriangle,
  Clock,
  XCircle,
  Building2,
} from "lucide-react";

/* ───────────── animation helpers ───────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ───────────── data ───────────── */
const painPoints = [
  { icon: AlertTriangle, title: "بيانات مبعثرة", desc: "معلومات العملاء موزعة بين إكسل وواتساب وأوراق" },
  { icon: Clock, title: "وقت ضائع", desc: "فريق المبيعات يقضي ٦٠٪ من وقته في مهام يدوية" },
  { icon: XCircle, title: "صفقات تضيع", desc: "عدم متابعة العملاء المحتملين في الوقت المناسب" },
  { icon: BarChart3, title: "لا تقارير واضحة", desc: "صعوبة قياس أداء الفريق واتخاذ قرارات مبنية على بيانات" },
];

const features = [
  { icon: MessageSquare, title: "واتساب ذكي", desc: "تواصل تلقائي مع العملاء عبر واتساب مع ردود الذكاء الاصطناعي", color: "text-green-400 bg-green-400/10" },
  { icon: BrainCircuit, title: "تقييم عملاء AI", desc: "تقييم تلقائي لكل عميل محتمل بناءً على سلوكه واهتمامه", color: "text-teal-400 bg-teal-400/10" },
  { icon: BarChart3, title: "Pipeline بصري", desc: "تتبع جميع الصفقات بلوحة كانبان تفاعلية مع drag & drop", color: "text-blue-400 bg-blue-400/10" },
  { icon: FileText, title: "عروض أسعار", desc: "أنشئ عروض أسعار احترافية بضغطة زر مع حسابات تلقائية", color: "text-orange-400 bg-orange-400/10" },
  { icon: ShieldCheck, title: "متوافق مع PDPL", desc: "حماية بيانات العملاء وفق نظام حماية البيانات الشخصية السعودي", color: "text-purple-400 bg-purple-400/10" },
  { icon: Zap, title: "تقارير ذكية", desc: "تحليلات فورية ولوحات بيانات تفاعلية لاتخاذ قرارات أسرع", color: "text-amber-400 bg-amber-400/10" },
];

const steps = [
  { num: "١", title: "سجّل", desc: "أنشئ حسابك في أقل من دقيقتين وابدأ فوراً" },
  { num: "٢", title: "أضف عملاءك", desc: "استورد بياناتك من إكسل أو أضفها يدوياً بسهولة" },
  { num: "٣", title: "ابدأ البيع", desc: "دع الذكاء الاصطناعي يساعدك في إتمام المزيد من الصفقات" },
];

/** فروقات يمكن التحقق منها في المستودع والوثائق — بدون أرقام سوق غير مثبتة */
const provenDifferentiators = [
  {
    icon: FileText,
    title: "مسارات API موثقة",
    desc: "خريطة API في المستودع ومطابقة OpenAPI عبر سكربت التحقق من الفرونت.",
  },
  {
    icon: ShieldCheck,
    title: "حوكمة وإطلاق منضبط",
    desc: "بوابة go-live وفحوص تكامل موثقة في قائمة الإطلاق وليس مجرد وعود في الواجهة.",
  },
  {
    icon: MessageSquare,
    title: "قنوات محلية أولاً",
    desc: "تجربة عربية RTL وواتساب ضمن مسار المنتج، وليس قالباً أمريكياً مترجماً فقط.",
  },
  {
    icon: Building2,
    title: "شراكات B2B في نفس المنصة",
    desc: "مسارات الصفقات الاستراتيجية وPartnership Studio بجانب محرك المبيعات.",
  },
  {
    icon: BrainCircuit,
    title: "توجيه نماذج حسب المهمة",
    desc: "سياسة LLM لكل نوع عمل دون إرسال مفاتيح إلى المتصفح.",
  },
] as const;

const pricingPlans = [
  {
    name: "Starter",
    nameAr: "الأساسية",
    price: "٥٩",
    period: "شهرياً",
    features: ["٣ مستخدمين", "٥٠٠ عميل محتمل", "واتساب أساسي", "تقارير أساسية", "دعم بالإيميل"],
    cta: "ابدأ مجاناً",
    highlighted: false,
  },
  {
    name: "Professional",
    nameAr: "الاحترافية",
    price: "١٤٩",
    period: "شهرياً",
    features: ["١٠ مستخدمين", "عملاء غير محدودين", "واتساب + إيميل + SMS", "تقييم AI للعملاء", "Pipeline بصري", "عروض أسعار", "تقارير متقدمة", "دعم أولوية"],
    cta: "ابدأ التجربة المجانية",
    highlighted: true,
    badge: "الأكثر شعبية",
  },
  {
    name: "Enterprise",
    nameAr: "المؤسسية",
    price: "٢٢٥",
    period: "شهرياً",
    features: ["مستخدمين غير محدودين", "كل مميزات الاحترافية", "PDPL كامل", "API مفتوح", "مدير حساب مخصص", "تدريب الفريق", "SLA ٩٩.٩٪"],
    cta: "تواصل معنا",
    highlighted: false,
  },
];

/* ───────────── main component ───────────── */
export function PremiumLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans" dir="rtl">
      {/* ── mesh background ── */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-teal-500/10 rounded-full blur-[160px] -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        {/* mesh dots */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ═══════════ NAV ═══════════ */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <Link href="/register" className="px-5 py-2 rounded-xl bg-teal-500 text-black font-bold text-sm hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20">
          ابدأ مجاناً
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="#pricing" className="hover:text-white transition-colors">الأسعار</a>
          <a href="#differentiators" className="hover:text-white transition-colors">لماذا Dealix</a>
          <a href="#features" className="hover:text-white transition-colors">المميزات</a>
          <a href="#how" className="hover:text-white transition-colors">كيف يعمل</a>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <span className="text-lg font-black tracking-tighter">DEALIX</span>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <Section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-20">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-8">
          {/* left: 3D logo */}
          <motion.div variants={fadeUp} custom={2} className="shrink-0">
            <DealixLogo3D size={280} />
          </motion.div>

          {/* right: text */}
          <div className="flex-1 text-right">
            <motion.h1
              variants={fadeUp}
              custom={0}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6"
            >
              نظام تشغيل الإيرادات
              <br />
              <span className="text-teal-400">للشركات والشراكات</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-lg md:text-xl text-white/60 mb-8 max-w-xl leading-relaxed"
            >
              منصة واحدة تدير دورة البيع كاملة: توليد العملاء، التفاوض، الإغلاق، إدارة الشركاء،
              وتشغيل القنوات الذكية عبر واتساب وإيميل ولينكدإن.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-wrap gap-4">
              <Link href="/register" className="px-8 py-4 rounded-2xl bg-teal-500 text-black font-black text-base hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/25 flex items-center gap-2">
                ابدأ مجاناً
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link href="/dashboard" className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-base hover:bg-white/10 transition-all flex items-center gap-2">
                <Play className="w-4 h-4" />
                استكشف المنصة
              </Link>
            </motion.div>
          </div>
        </div>

        {/* stats bar */}
        <motion.div
          variants={fadeUp}
          custom={3}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
        >
          {[
            { label: "اللغة والسياق", value: "عربي · سعودي أولاً" },
            { label: "تكامل CRM", value: "Salesforce · HubSpot عبر API" },
            { label: "الشفافية", value: "وثائق + مصفوفة تنافسية" },
          ].map((s, i) => (
            <div
              key={i}
              className="text-center py-4 px-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
            >
              <p className="text-sm md:text-base font-bold text-teal-400 leading-snug">{s.value}</p>
              <p className="text-xs text-white/40 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </Section>

      {/* ═══════════ PAIN POINTS ═══════════ */}
      <Section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-center mb-4">
          مشاكل يعاني منها كل مدير مبيعات
        </motion.h2>
        <motion.p variants={fadeUp} custom={1} className="text-center text-white/50 mb-12 max-w-lg mx-auto">
          هل تواجه هذه التحديات في فريقك؟ Dealix صُمم لحلها
        </motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {painPoints.map((p, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-6 text-right hover:border-red-500/30 hover:bg-red-500/[0.03] transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 mr-auto group-hover:bg-red-500/20 transition-colors">
                <p.icon className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="font-bold text-base mb-2">{p.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════ FEATURES ═══════════ */}
      <Section id="features" className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-center mb-4">
          كل ما يحتاجه فريق المبيعات
        </motion.h2>
        <motion.p variants={fadeUp} custom={1} className="text-center text-white/50 mb-12 max-w-lg mx-auto">
          أدوات متكاملة مصممة خصيصاً للسوق السعودي
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-6 text-right hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 transition-all group cursor-default"
            >
              <div className={`w-11 h-11 rounded-xl ${f.color.split(" ")[1]} flex items-center justify-center mb-4 mr-auto`}>
                <f.icon className={`w-5 h-5 ${f.color.split(" ")[0]}`} />
              </div>
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════ PROVEN DIFFERENTIATORS ═══════════ */}
      <Section id="differentiators" className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-center mb-4">
          فروقات يمكن إثباتها — لا أرقام وهمية
        </motion.h2>
        <motion.p variants={fadeUp} custom={1} className="text-center text-white/50 mb-4 max-w-2xl mx-auto">
          ما يلي مربوط بمسارات الكود والوثائق في المستودع؛ راجع المصفوفة التفصيلية للمقارنة مع فئات الأدوات العالمية.
        </motion.p>
        <motion.p variants={fadeUp} custom={2} className="text-center mb-10">
          <a
            href="/strategy/COMPETITIVE_MATRIX_AR.md"
            className="text-sm font-semibold text-teal-400 hover:text-teal-300 underline underline-offset-4"
          >
            فتح مصفوفة تنافسية (Markdown)
          </a>
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {provenDifferentiators.map((d, i) => (
            <motion.div
              key={d.title}
              variants={fadeUp}
              custom={i}
              className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-6 text-right hover:border-teal-500/25 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 mr-auto">
                <d.icon className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="font-bold text-base mb-2">{d.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <Section id="how" className="max-w-4xl mx-auto px-6 md:px-12 py-20">
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-center mb-14">
          ابدأ في ٣ خطوات بسيطة
        </motion.h2>
        <div className="relative">
          {/* connecting line */}
          <div className="hidden md:block absolute top-10 right-10 left-10 h-0.5 bg-gradient-to-l from-teal-500/50 via-teal-500/20 to-teal-500/50" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="flex flex-col items-center text-center"
              >
                <div className="relative z-10 w-20 h-20 rounded-full bg-teal-500/10 border-2 border-teal-500/30 flex items-center justify-center mb-5">
                  <span className="text-3xl font-black text-teal-400">{s.num}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed max-w-[240px]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════ SOCIAL PROOF ═══════════ */}
      <Section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-center mb-12">
          شركات سعودية تثق بـ Dealix
        </motion.h2>

        {/* logos row */}
        <motion.div variants={fadeUp} custom={1} className="flex items-center justify-center gap-8 md:gap-14 mb-14 flex-wrap">
          {["الأفق التقنية", "مجموعة الرواد", "حلول البيانات", "شركة النخبة", "مصنع الشرق"].map((name, i) => (
            <div key={i} className="flex items-center gap-2 text-white/20 hover:text-white/40 transition-colors">
              <Building2 className="w-5 h-5" />
              <span className="font-bold text-sm">{name}</span>
            </div>
          ))}
        </motion.div>

        {/* testimonial */}
        <motion.div
          variants={fadeUp}
          custom={2}
          className="max-w-2xl mx-auto rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-8 text-center"
        >
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            &ldquo;Dealix جمع لنا المسار والقنوات في مكان واحد؛ صار عندنا رؤية أوضح لكل صفقة وتقليل تشتيت بين الأدوات.&rdquo;
          </p>
          <div>
            <p className="font-bold">عبدالله الشمري</p>
            <p className="text-sm text-white/40">مدير المبيعات — شركة الأفق التقنية</p>
          </div>
        </motion.div>
      </Section>

      {/* ═══════════ PRICING ═══════════ */}
      <Section id="pricing" className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-center mb-4">
          أسعار بسيطة وشفافة
        </motion.h2>
        <motion.p variants={fadeUp} custom={1} className="text-center text-white/50 mb-12 max-w-lg mx-auto">
          ابدأ مجاناً لمدة ١٤ يوم — بدون بطاقة ائتمانية
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -4 }}
              className={`relative rounded-3xl p-7 text-right transition-all ${
                plan.highlighted
                  ? "bg-teal-500/10 border-2 border-teal-500/40 shadow-xl shadow-teal-500/10"
                  : "bg-white/[0.03] border border-white/[0.08]"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-teal-500 text-black text-xs font-black">
                  {plan.badge}
                </span>
              )}

              <p className="text-sm text-white/50 font-medium">{plan.nameAr}</p>
              <h3 className="text-sm font-bold text-white/70 mt-1">{plan.name}</h3>

              <div className="flex items-baseline gap-1 mt-4 mb-6">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-sm text-white/40 font-medium">ر.س / {plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.highlighted ? "text-teal-400" : "text-white/30"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                  plan.highlighted
                    ? "bg-teal-500 text-black hover:bg-teal-400 shadow-lg shadow-teal-500/20"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <Section className="max-w-4xl mx-auto px-6 md:px-12 py-24 text-center">
        <motion.div
          variants={fadeUp}
          className="rounded-3xl bg-gradient-to-br from-teal-500/20 via-teal-500/5 to-transparent border border-teal-500/20 p-10 md:p-16"
        >
          <Rocket className="w-12 h-12 text-teal-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            جاهز تنقل مبيعاتك للمستوى التالي؟
          </h2>
          <p className="text-white/50 mb-8 max-w-md mx-auto">
            انضم لأكثر من ٥٠٠ شركة سعودية حققت نمو في المبيعات مع Dealix
          </p>
          <button className="px-10 py-4 rounded-2xl bg-teal-500 text-black font-black text-lg hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/25 mb-4">
            ابدأ مجاناً الآن
          </button>
          <p className="text-sm text-white/40">١٤ يوم تجربة مجانية — بدون بطاقة</p>
        </motion.div>
      </Section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center">
                <Zap className="w-4 h-4 text-black" />
              </div>
              <div>
                <span className="font-black tracking-tighter">DEALIX</span>
                <p className="text-[11px] text-white/30">نظام المبيعات الذكي للسعودية</p>
              </div>
            </div>

            {/* links */}
            <div className="flex items-center gap-6 text-sm text-white/40">
              <a href="#features" className="hover:text-white/70 transition-colors">المنتج</a>
              <a href="#pricing" className="hover:text-white/70 transition-colors">الأسعار</a>
              <a href="#" className="hover:text-white/70 transition-colors">عن Dealix</a>
              <a href="#" className="hover:text-white/70 transition-colors">تواصل</a>
            </div>

            {/* social placeholders */}
            <div className="flex items-center gap-3">
              {["X", "in", "yt"].map((s, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/30 hover:text-white/60 hover:bg-white/10 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
            <p>جميع الحقوق محفوظة Dealix {new Date().getFullYear()}</p>
            <p>صنع بـ ❤️ في السعودية</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
