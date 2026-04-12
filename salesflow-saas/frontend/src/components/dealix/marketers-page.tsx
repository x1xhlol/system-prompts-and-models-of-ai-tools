'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { clsx } from 'clsx';
import {
  Zap, Wrench, HeadphonesIcon, Eye,
  UserPlus, Share2, Coins,
  Award, ChevronDown, ChevronUp,
  LayoutDashboard, Link2, FileText, BarChart3,
  Star, Quote, Phone, Mail, User,
} from 'lucide-react';
import { useI18n } from '@/i18n';

/* ---------- Animation Helpers ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={clsx('py-16 sm:py-20', className)}
    >
      {children}
    </motion.section>
  );
}

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={clsx(
        'rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-6',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

/* ---------- FAQ Accordion ---------- */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-start gap-4"
      >
        <span className="text-sm font-medium text-slate-200">{question}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
        )}
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <p className="pb-4 text-sm text-slate-400 leading-relaxed">{answer}</p>
      </motion.div>
    </div>
  );
}

/* ---------- Main ---------- */
function MarketersPage() {
  const { t, dir, isArabic } = useI18n();
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
  };

  const benefitIcons = [Zap, Wrench, HeadphonesIcon, Eye];
  const benefitKeys = [
    { title: 'benefitInstantCommission', desc: 'benefitInstantCommissionDesc' },
    { title: 'benefitProTools', desc: 'benefitProToolsDesc' },
    { title: 'benefitSupport', desc: 'benefitSupportDesc' },
    { title: 'benefitTransparency', desc: 'benefitTransparencyDesc' },
  ];

  const stepIcons = [UserPlus, Share2, Coins];
  const stepKeys = [
    { title: 'step1Title', desc: 'step1Desc' },
    { title: 'step2Title', desc: 'step2Desc' },
    { title: 'step3Title', desc: 'step3Desc' },
  ];

  const tiers = [
    { key: 'tierBronze', desc: 'tierBronzeDesc', pct: '10%', color: 'from-amber-700 to-amber-900', badge: 'bg-amber-700/40 text-amber-300' },
    { key: 'tierSilver', desc: 'tierSilverDesc', pct: '15%', color: 'from-slate-400 to-slate-600', badge: 'bg-slate-500/40 text-slate-200' },
    { key: 'tierGold', desc: 'tierGoldDesc', pct: '20%', color: 'from-amber-400 to-yellow-500', badge: 'bg-amber-400/30 text-amber-200' },
  ];

  const toolIcons = [LayoutDashboard, Link2, FileText, BarChart3];
  const toolKeys = ['toolDashboard', 'toolLinks', 'toolTemplates', 'toolReports'];

  const faqs = Array.from({ length: 5 }, (_, i) => ({
    q: t(`marketersPage.faq${i + 1}Q`),
    a: t(`marketersPage.faq${i + 1}A`),
  }));

  return (
    <div dir={dir} className="min-h-screen bg-[#0A0F1C] text-white">
      {/* ===== HERO ===== */}
      <Section className="relative overflow-hidden pt-24 sm:pt-32">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 start-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-500/[0.07] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center px-4">
          <motion.h1
            variants={fadeUp}
            className="text-3xl sm:text-5xl font-bold leading-tight mb-5"
          >
            {t('marketersPage.heroTitle')}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed"
          >
            {t('marketersPage.heroSubtitle')}
          </motion.p>
        </div>
      </Section>

      {/* ===== STATS BAR ===== */}
      <Section className="py-0 -mt-6">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: t('marketersPage.statsAvgCommission'), value: isArabic ? '٤,٢٠٠ ر.س' : 'SAR 4,200' },
              { label: t('marketersPage.statsActiveMarketers'), value: isArabic ? '+١٢٠' : '120+' },
              { label: t('marketersPage.statsTotalPaid'), value: isArabic ? '+٢.٥ مليون ر.س' : 'SAR 2.5M+' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 text-center"
              >
                <p className="text-2xl font-bold text-teal-400 mb-1">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ===== BENEFITS ===== */}
      <Section>
        <div className="max-w-5xl mx-auto px-4">
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-center mb-10">
            {t('marketersPage.benefitsTitle')}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefitKeys.map((bk, i) => {
              const Icon = benefitIcons[i];
              return (
                <GlassCard key={bk.title}>
                  <div className="rounded-lg bg-teal-500/10 p-2.5 w-fit mb-4">
                    <Icon className="h-5 w-5 text-teal-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">
                    {t(`marketersPage.${bk.title}`)}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t(`marketersPage.${bk.desc}`)}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ===== HOW IT WORKS ===== */}
      <Section>
        <div className="max-w-3xl mx-auto px-4">
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-center mb-10">
            {t('marketersPage.howItWorksTitle')}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stepKeys.map((sk, i) => {
              const Icon = stepIcons[i];
              return (
                <motion.div
                  key={sk.title}
                  variants={fadeUp}
                  className="text-center"
                >
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-teal-400" />
                  </div>
                  <span className="inline-block text-xs text-teal-400 font-medium mb-2 tabular-nums">
                    {i + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {t(`marketersPage.${sk.title}`)}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t(`marketersPage.${sk.desc}`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ===== COMMISSION TIERS ===== */}
      <Section>
        <div className="max-w-4xl mx-auto px-4">
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-center mb-10">
            {t('marketersPage.tiersTitle')}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {tiers.map((tier) => (
              <GlassCard key={tier.key} className="text-center relative overflow-hidden">
                <div
                  className={clsx(
                    'absolute inset-0 opacity-[0.06] bg-gradient-to-b',
                    tier.color,
                  )}
                />
                <div className="relative">
                  <span className={clsx('inline-block px-3 py-1 rounded-full text-xs font-medium mb-4', tier.badge)}>
                    {t(`marketersPage.${tier.key}`)}
                  </span>
                  <p className="text-4xl font-bold text-white mb-1">{tier.pct}</p>
                  <p className="text-xs text-slate-400 mb-3">{t('marketersPage.tierCommission')}</p>
                  <p className="text-xs text-slate-500">{t(`marketersPage.${tier.desc}`)}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </Section>

      {/* ===== TESTIMONIALS ===== */}
      <Section>
        <div className="max-w-4xl mx-auto px-4">
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-center mb-10">
            {t('marketersPage.testimonialsTitle')}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2].map((n) => (
              <GlassCard key={n}>
                <Quote className="h-5 w-5 text-teal-500/40 mb-3" />
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {t(`marketersPage.testimonial${n}Text`)}
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-sm font-bold text-white">
                    {t(`marketersPage.testimonial${n}Name`).charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {t(`marketersPage.testimonial${n}Name`)}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Award className="h-3 w-3 text-amber-400" />
                      <span className="text-xs text-slate-400">
                        {t(`marketersPage.testimonial${n}Role`)}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </Section>

      {/* ===== TOOLS PREVIEW ===== */}
      <Section>
        <div className="max-w-4xl mx-auto px-4">
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-center mb-10">
            {t('marketersPage.toolsTitle')}
          </motion.h2>
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {toolKeys.map((tk, i) => {
              const Icon = toolIcons[i];
              return (
                <div
                  key={tk}
                  className="rounded-xl bg-white/5 border border-white/10 p-5 text-center hover:bg-white/[0.08] transition-colors"
                >
                  <Icon className="h-6 w-6 text-teal-400 mx-auto mb-3" />
                  <p className="text-xs text-slate-300 font-medium">
                    {t(`marketersPage.${tk}`)}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* ===== FAQ ===== */}
      <Section>
        <div className="max-w-2xl mx-auto px-4">
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-center mb-10">
            {t('marketersPage.faqTitle')}
          </motion.h2>
          <motion.div
            variants={fadeUp}
            className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 px-6"
          >
            {faqs.map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ===== CTA + FORM ===== */}
      <Section className="pb-24">
        <div className="max-w-lg mx-auto px-4 text-center">
          <motion.h2 variants={fadeUp} className="text-2xl font-bold mb-3">
            {t('marketersPage.ctaTitle')}
          </motion.h2>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 rounded-xl bg-teal-500/10 border border-teal-500/25 p-8 text-center"
            >
              <Star className="h-8 w-8 text-teal-400 mx-auto mb-3" />
              <p className="text-sm text-teal-300">{t('marketersPage.formSuccess')}</p>
            </motion.div>
          ) : (
            <motion.form
              variants={fadeUp}
              onSubmit={handleSubmit}
              className="mt-8 space-y-3"
            >
              <div className="relative">
                <User className="absolute top-1/2 -translate-y-1/2 start-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={t('marketersPage.formNamePlaceholder')}
                  className={clsx(
                    'w-full rounded-xl bg-white/5 border border-white/10 ps-10 pe-4 py-3',
                    'text-sm text-white placeholder:text-slate-500',
                    'focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent',
                    'transition-all',
                  )}
                />
              </div>
              <div className="relative">
                <Phone className="absolute top-1/2 -translate-y-1/2 start-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder={t('marketersPage.formPhonePlaceholder')}
                  className={clsx(
                    'w-full rounded-xl bg-white/5 border border-white/10 ps-10 pe-4 py-3',
                    'text-sm text-white placeholder:text-slate-500 text-start',
                    'focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent',
                    'transition-all',
                  )}
                />
              </div>
              <div className="relative">
                <Mail className="absolute top-1/2 -translate-y-1/2 start-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder={t('marketersPage.formEmailPlaceholder')}
                  className={clsx(
                    'w-full rounded-xl bg-white/5 border border-white/10 ps-10 pe-4 py-3',
                    'text-sm text-white placeholder:text-slate-500 text-start',
                    'focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent',
                    'transition-all',
                  )}
                />
              </div>
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={submitting ? undefined : { scale: 1.03 }}
                whileTap={submitting ? undefined : { scale: 0.97 }}
                className={clsx(
                  'w-full rounded-xl py-3.5 text-sm font-semibold',
                  'bg-gradient-to-l from-teal-500 to-emerald-600 text-white',
                  'hover:shadow-[0_0_24px_rgba(20,184,166,0.4)]',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  'transition-shadow duration-200',
                )}
              >
                {submitting ? t('marketersPage.formSubmitting') : t('marketersPage.ctaButton')}
              </motion.button>
            </motion.form>
          )}
        </div>
      </Section>
    </div>
  );
}

export { MarketersPage };
