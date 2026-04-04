"use client";

import React, { useState, useEffect } from "react";
import "../../styles/design-tokens.css";
import "../../styles/brand-kit.css";

// ═══════════════════════════════════════════════════════════════
// Dealix Landing Page — Premium Bilingual (AR/EN) Conversion Page
// ═══════════════════════════════════════════════════════════════

export default function HeroLanding() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [activeTab, setActiveTab] = useState(0);
  const [count, setCount] = useState({ companies: 0, messages: 0, deals: 0 });

  // Animated counter
  useEffect(() => {
    const targets = { companies: 127, messages: 8420, deals: 43 };
    const duration = 2000;
    const steps = 60;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount({
        companies: Math.round(targets.companies * eased),
        messages: Math.round(targets.messages * eased),
        deals: Math.round(targets.deals * eased),
      });
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, []);

  const t = translations[lang];
  const isRTL = lang === "ar";

  return (
    <div
      style={{ direction: isRTL ? "rtl" : "ltr", fontFamily: isRTL ? "var(--font-arabic)" : "var(--font-body)" }}
      className="grid-bg"
    >
      {/* ═══ Navbar ═══ */}
      <nav style={styles.navbar}>
        <div style={styles.navInner}>
          <div style={styles.navBrand}>
            <div style={styles.logoIcon}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" stroke="#00D4AA" strokeWidth="2" fill="rgba(0,212,170,0.1)" />
                <circle cx="14" cy="14" r="4" fill="#00D4AA" />
                <line x1="14" y1="10" x2="14" y2="4" stroke="#00D4AA" strokeWidth="1.5" />
                <line x1="18" y1="14" x2="24" y2="14" stroke="#00D4AA" strokeWidth="1.5" />
                <line x1="14" y1="18" x2="14" y2="24" stroke="#00D4AA" strokeWidth="1.5" />
                <line x1="10" y1="14" x2="4" y2="14" stroke="#00D4AA" strokeWidth="1.5" />
              </svg>
            </div>
            <span style={styles.brandName}>Dealix</span>
            <span style={styles.badgeLive}>
              <span style={styles.liveDot} /> AI
            </span>
          </div>
          <div style={styles.navLinks}>
            <a href="#features" style={styles.navLink}>{t.nav.features}</a>
            <a href="#agents" style={styles.navLink}>{t.nav.agents}</a>
            <a href="#pricing" style={styles.navLink}>{t.nav.pricing}</a>
            <a href="#contact" style={styles.navLink}>{t.nav.contact}</a>
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} style={styles.langToggle}>
              {lang === "ar" ? "EN" : "عربي"}
            </button>
            <a href="#demo" style={styles.navCTA}>{t.nav.demo}</a>
          </div>
        </div>
      </nav>

      {/* ═══ Hero Section ═══ */}
      <section style={styles.hero}>
        <div style={styles.heroGlow} />
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgeDot} /> {t.hero.badge}
          </div>
          <h1 style={{ ...styles.heroTitle, fontFamily: isRTL ? "var(--font-arabic)" : "var(--font-display)" }}>
            {t.hero.title1}
            <span style={styles.heroGradient}> {t.hero.highlight} </span>
            {t.hero.title2}
          </h1>
          <p style={styles.heroSub}>{t.hero.subtitle}</p>
          <div style={styles.heroCTAs}>
            <a href="#demo" style={styles.btnPrimary}>{t.hero.cta1} →</a>
            <a href="#features" style={styles.btnSecondary}>
              ▶ {t.hero.cta2}
            </a>
          </div>
          {/* Stats Row */}
          <div style={styles.statsRow}>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>{count.companies}+</span>
              <span style={styles.statLabel}>{t.hero.stat1}</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={styles.statNumber}>{count.messages.toLocaleString()}</span>
              <span style={styles.statLabel}>{t.hero.stat2}</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={styles.statNumber}>{count.deals}+</span>
              <span style={styles.statLabel}>{t.hero.stat3}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Features Section ═══ */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.overline}>{t.features.overline}</span>
          <h2 style={{ ...styles.sectionTitle, fontFamily: isRTL ? "var(--font-arabic)" : "var(--font-display)" }}>{t.features.title}</h2>
          <p style={styles.sectionSub}>{t.features.subtitle}</p>
        </div>
        <div style={styles.featGrid}>
          {t.features.items.map((f: any, i: number) => (
            <div key={i} style={styles.featCard}>
              <div style={styles.featIcon}>{f.icon}</div>
              <h3 style={styles.featTitle}>{f.title}</h3>
              <p style={styles.featDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section style={{ ...styles.section, background: "var(--surface-card)" }}>
        <div style={styles.sectionHeader}>
          <span style={styles.overline}>{t.how.overline}</span>
          <h2 style={{ ...styles.sectionTitle, fontFamily: isRTL ? "var(--font-arabic)" : "var(--font-display)" }}>{t.how.title}</h2>
        </div>
        <div style={styles.stepsRow}>
          {t.how.steps.map((s: any, i: number) => (
            <div key={i} style={styles.stepCard}>
              <div style={styles.stepNum}>{i + 1}</div>
              <h4 style={styles.stepTitle}>{s.title}</h4>
              <p style={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ AI Agent Hierarchy — Full System Architecture ═══ */}
      <section id="agents" style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.overline}>{t.agents.overline}</span>
          <h2 style={{ ...styles.sectionTitle, fontFamily: isRTL ? "var(--font-arabic)" : "var(--font-display)" }}>{t.agents.title}</h2>
          <p style={styles.sectionSub}>{t.agents.subtitle}</p>
        </div>

        {/* Hierarchy Pyramid */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12, maxWidth: 900, margin: "0 auto" }}>
          {t.agents.layers.map((layer: any, i: number) => (
            <div key={i} style={{
              background: i === 0 ? "linear-gradient(135deg, rgba(0,212,170,0.15), rgba(59,130,246,0.15))" : "#0D1520",
              border: i === 0 ? "2px solid #00D4AA" : "1px solid rgba(148,163,184,0.08)",
              borderRadius: 16,
              padding: "20px 24px",
              display: "flex",
              flexDirection: isRTL ? "row-reverse" as const : "row" as const,
              alignItems: "center",
              gap: 16,
              transition: "all 0.3s",
            }}>
              <div style={{
                minWidth: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
                background: `linear-gradient(135deg, ${layer.color}, ${layer.color}88)`,
                borderRadius: 14, fontSize: 22,
              }}>
                {layer.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexDirection: isRTL ? "row-reverse" as const : "row" as const }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: layer.color, background: `${layer.color}15`, padding: "2px 8px", borderRadius: 6 }}>
                    L{7 - i}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#F0F4F8" }}>{layer.name}</span>
                  <span style={{ fontSize: 12, color: "#64748B" }}>({layer.count})</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                  {layer.agents.map((agent: string, ai: number) => (
                    <span key={ai} style={{
                      fontSize: 12, padding: "3px 10px", borderRadius: 8,
                      background: "rgba(148,163,184,0.08)", color: "#94A3B8",
                      border: "1px solid rgba(148,163,184,0.06)",
                    }}>{agent}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Agent Count Badge */}
        <div style={{ textAlign: "center" as const, marginTop: 32 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, rgba(0,212,170,0.1), rgba(59,130,246,0.1))",
            border: "1px solid rgba(0,212,170,0.2)", padding: "10px 24px", borderRadius: 30,
            fontSize: 15, fontWeight: 700, color: "#00D4AA",
          }}>
            🤖 {t.agents.badge}
          </span>
        </div>
      </section>

      {/* ═══ Multi-Channel Outreach ═══ */}
      <section style={{ ...styles.section, background: "rgba(59,130,246,0.03)" }}>
        <div style={styles.sectionHeader}>
          <span style={styles.overline}>{t.outreach.overline}</span>
          <h2 style={{ ...styles.sectionTitle, fontFamily: isRTL ? "var(--font-arabic)" : "var(--font-display)" }}>{t.outreach.title}</h2>
          <p style={styles.sectionSub}>{t.outreach.subtitle}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
          {t.outreach.channels.map((c: any, i: number) => (
            <div key={i} style={{
              background: "var(--surface-card)", border: "1px solid rgba(148,163,184,0.1)",
              borderRadius: 20, padding: 30, textAlign: "center" as const,
              transition: "transform 0.3s"
            }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{c.icon}</div>
              <h4 style={{ fontSize: 18, fontWeight: 700, color: "#F0F4F8", marginBottom: 8 }}>{c.name}</h4>
              <p style={{ fontSize: 14, color: "#94A3B8" }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Sales Lifecycle ═══ */}
      <section style={{ ...styles.section, background: "#0A1020" }}>
        <div style={styles.sectionHeader}>
          <span style={styles.overline}>{t.lifecycle.overline}</span>
          <h2 style={{ ...styles.sectionTitle, fontFamily: isRTL ? "var(--font-arabic)" : "var(--font-display)" }}>{t.lifecycle.title}</h2>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap" as const, justifyContent: "center", gap: 4, maxWidth: 1000, margin: "0 auto" }}>
          {t.lifecycle.stages.map((stage: any, i: number) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{
                background: stage.active ? "linear-gradient(135deg, #00D4AA, #3B82F6)" : "#0D1520",
                border: stage.active ? "none" : "1px solid rgba(148,163,184,0.1)",
                borderRadius: 12, padding: "16px 20px", textAlign: "center" as const,
                minWidth: 120,
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{stage.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: stage.active ? "#0A1628" : "#F0F4F8" }}>{stage.name}</div>
                <div style={{ fontSize: 11, color: stage.active ? "#0A162888" : "#64748B" }}>{stage.agent}</div>
              </div>
              {i < t.lifecycle.stages.length - 1 && (
                <span style={{ fontSize: 18, color: "#00D4AA" }}>{isRTL ? "←" : "→"}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Pricing Section ═══ */}
      <section id="pricing" style={styles.section}>

        <div style={styles.sectionHeader}>
          <span style={styles.overline}>{t.pricing.overline}</span>
          <h2 style={{ ...styles.sectionTitle, fontFamily: isRTL ? "var(--font-arabic)" : "var(--font-display)" }}>{t.pricing.title}</h2>
          <p style={styles.sectionSub}>{t.pricing.subtitle}</p>
        </div>
        <div style={styles.pricingGrid}>
          {t.pricing.plans.map((plan: any, i: number) => (
            <div key={i} style={{ ...styles.pricingCard, ...(plan.popular ? styles.pricingPopular : {}) }}>
              {plan.popular && <div style={styles.popularBadge}>{t.pricing.popular}</div>}
              <h3 style={styles.planName}>{plan.name}</h3>
              <div style={styles.planPrice}>
                <span style={styles.planAmount}>{plan.price}</span>
                <span style={styles.planPeriod}>{plan.period}</span>
              </div>
              <ul style={styles.planFeatures}>
                {plan.features.map((f: string, fi: number) => (
                  <li key={fi} style={styles.planFeature}>✓ {f}</li>
                ))}
              </ul>
              <a href="#demo" style={plan.popular ? styles.btnPrimary : styles.btnSecondary}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section id="contact" style={styles.ctaSection}>
        <div style={styles.ctaGlow} />
        <h2 style={{ ...styles.ctaTitle, fontFamily: isRTL ? "var(--font-arabic)" : "var(--font-display)" }}>{t.cta.title}</h2>
        <p style={styles.ctaSub}>{t.cta.subtitle}</p>
        <div style={styles.ctaForm}>
          <input type="tel" placeholder={t.cta.placeholder} style={styles.ctaInput} />
          <button style={styles.btnPrimary}>{t.cta.button}</button>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrand}>
            <span style={styles.brandName}>Dealix</span>
            <p style={styles.footerText}>{t.footer.desc}</p>
          </div>
          <div style={styles.footerLinks}>
            <a href="#features" style={styles.footerLink}>{t.nav.features}</a>
            <a href="#pricing" style={styles.footerLink}>{t.nav.pricing}</a>
            <a href="#contact" style={styles.footerLink}>{t.nav.contact}</a>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>© 2026 Dealix. {t.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════════

const translations: Record<string, any> = {
  ar: {
    nav: { features: "المميزات", agents: "الوكلاء", pricing: "الأسعار", contact: "تواصل", demo: "ابدأ مجاناً" },
    hero: {
      badge: "نظام مبيعات ذكاء اصطناعي",
      title1: "حوّل شركتك إلى",
      highlight: "ماكينة بيع ذاتية",
      title2: "بالذكاء الاصطناعي",
      subtitle: "Dealix يكتشف العملاء من 12+ مصدر، يتواصل معهم عبر واتساب وإيميل ومكالمات ولنكدإن، يؤهلهم، ويتابعهم حتى يغلق الصفقة — ذاتياً.",
      cta1: "ابدأ تجربة مجانية",
      cta2: "شاهد كيف يعمل",
      stat1: "شركة سعودية",
      stat2: "رسالة ذكية",
      stat3: "صفقة مغلقة",
    },
    features: {
      overline: "القدرات",
      title: "كل ما تحتاجه لتهيمن على السوق",
      subtitle: "نظام شامل يغطي كل قنوات المبيعات — من الاكتشاف للإغلاق",
      items: [
        { icon: "🔍", title: "استخراج عملاء من 12+ مصدر", desc: "Google Maps، مواقع الشركات، السجل التجاري، LinkedIn، الأدلة المهنية — مع تحقق من الأرقام" },
        { icon: "📱", title: "تحكم LangGraph المحكم", desc: "أتمتة مبيعات ذكية تقودها رسوم بيانية (States) تضمن الأمان ودقة القرار بنسبة 99.9%" },
        { icon: "🧠", title: "الذاكرة ذاتية الشفاء (Mem0)", desc: "يتذكر Dealix كل محادثة وتفصيل عن العميل للأبد بمساعدة ذاكرة Mem0 المتقدمة" },
        { icon: "📊", title: "تكامل Salesforce Agentforce", desc: "ربط مباشر وأصيل مع Salesforce لمزامنة الصفقات والليدات لحظياً مع وكلاء CRM" },
        { icon: "🤖", title: "34 وكيل ذكاء اصطناعي", desc: "نظام وكلاء ضخم (7 طبقات) يدير نفسه ذاتياً بكفاءة تتجاوز الفرق البشرية" },
        { icon: "📋", title: "عروض أسعار + إغلاق تلقائي", desc: "يولّد عروض مخصصة، يعالج الاعتراضات، ويتابع حتى الإغلاق" },
      ],
    },
    outreach: {
      overline: "📡 القنوات",
      title: "تواصل في كل مكان يتواجد فيه عميلك",
      subtitle: "نظام متعدد القنوات يضمن وصول رسالتك بأكثر الطرق فعالية",
      channels: [
        { icon: "💬", name: "WhatsApp Business", desc: "تواصل فوري وشخصي عبر الواتساب" },
        { icon: "📧", name: "Email sequences", desc: "سلاسل إيميلات ذكية واحترافية (Resend/SendGrid)" },
        { icon: "🔗", name: "LinkedIn Automation", desc: "ربط حساب LinkedIn للتواصل المباشر مع صناع القرار" },
        { icon: "📞", name: "AI AI Voice Calls", desc: "مكالمات صوتية ذكية (Twilio/ElevenLabs) قريباً" },
      ],
    },
    how: {
      overline: "كيف يعمل",
      title: "3 خطوات وتبدأ البيع ذاتياً",
      steps: [
        { title: "حدد القطاع", desc: "اختر القطاع المستهدف (عيادات، عقار، مصانع...) والمدن" },
        { title: "فعّل النظام", desc: "Dealix يبدأ يبحث ويتواصل مع العملاء تلقائياً عبر واتساب" },
        { title: "اغلق الصفقات", desc: "النظام يرتب الاجتماعات ويجهّز العروض — أنت بس وقّع" },
      ],
    },
    pricing: {
      overline: "💎 الأسعار",
      title: "خطط تناسب كل شركة",
      subtitle: "ابدأ مجاناً وارتقِ مع نمو أعمالك",
      popular: "الأكثر طلباً",
      plans: [
        {
          name: "المجانية",
          price: "0",
          period: "ر.س/شهر",
          popular: false,
          features: ["50 رسالة واتساب/شهر", "10 عملاء محتملين", "تصنيف AI أساسي", "لوحة تحكم"],
          cta: "ابدأ مجاناً",
        },
        {
          name: "الاحترافية",
          price: "3,000",
          period: "ر.س/شهر",
          popular: true,
          features: ["1,000 رسالة واتساب", "100 عميل محتمل", "5 نماذج AI كاملة", "متابعة ذكية", "تقارير متقدمة", "دعم واتساب"],
          cta: "ابدأ تجربة 14 يوم",
        },
        {
          name: "المؤسسات",
          price: "12,000",
          period: "ر.س/شهر",
          popular: false,
          features: ["رسائل غير محدودة", "عملاء غير محدود", "AI مخصص (LangGraph Control)", "Salesforce Integration", "مدير حساب خاص", "SLA 99.9%"],
          cta: "تواصل معنا",
        },
      ],
    },
    cta: {
      title: "جاهز تضاعف مبيعاتك؟",
      subtitle: "أدخل رقمك ونتواصل معك خلال 24 ساعة",
      placeholder: "05xxxxxxxx",
      button: "ابدأ الآن 🚀",
    },
    footer: { desc: "أقوى نظام AI لأتمتة المبيعات في السعودية", rights: "جميع الحقوق محفوظة" },
    agents: {
      overline: "🧠 بنية النظام",
      title: "25 وكيل ذكي يعملون معاً",
      subtitle: "7 طبقات من الذكاء الاصطناعي تدير دورة المبيعات بالكامل — من الاكتشاف للإغلاق",
      layers: [
        { icon: "👑", name: "القائد — CEO Agent", count: "1 وكيل", color: "#00D4AA", agents: ["Master LangGraph Control"] },
        { icon: "📊", name: "الذكاء — Intelligence", count: "4 وكلاء", color: "#3B82F6", agents: ["ذكاء المحادثات", "ذكاء الإيرادات", "ذكاء السوق", "ذاكرة Mem0"] },
        { icon: "💰", name: "الإيرادات — Revenue", count: "4 وكلاء", color: "#8B5CF6", agents: ["وكيل الإغلاق", "التسعير الذكي", "توقع الإيرادات", "معدّ العروض"] },
        { icon: "🤝", name: "التواصل — Engagement", count: "8 وكلاء", color: "#EC4899", agents: ["واتساب", "إيميل", "صوتي", "لنكدإن", "المحتوى", "متابعة تلقائية", "ردود ذكية", "تنسيق القنوات"] },
        { icon: "🧪", name: "التأهيل — Qualification", count: "4 وكلاء", color: "#F59E0B", agents: ["تأهيل BANT", "تقييم 0-100", "كشف النوايا", "تحليل الجدارة"] },
        { icon: "🔍", name: "الاكتشاف — Discovery", count: "6 وكلاء", color: "#10B981", agents: ["الاستكشاف الاستراتيجي", "إثراء البيانات", "البحث العميق", "محرك الليدات", "فحص المنافسين", "كشف الفرص"] },
        { icon: "⚙️", name: "البنية — Infrastructure", count: "7 وكلاء", color: "#64748B", agents: ["CRM", "Salesforce Link", "التحليلات", "التقارير", "الأمان", "الجدولة", "التأهيل"] },
      ],
      badge: "34 وكيل ذكي × 7 طبقات × LangGraph State Control",
    },
    lifecycle: {
      overline: "🔄 دورة المبيعات",
      title: "دورة حياة العميل الكاملة — مؤتمتة 100%",
      stages: [
        { icon: "🔍", name: "اكتشاف", agent: "Prospector", active: true },
        { icon: "📊", name: "إثراء", agent: "Enricher", active: false },
        { icon: "📱", name: "تواصل", agent: "WhatsApp AI", active: true },
        { icon: "🧪", name: "تأهيل", agent: "Qualifier", active: false },
        { icon: "🤖", name: "رد ذكي", agent: "AI Brain", active: true },
        { icon: "📅", name: "اجتماع", agent: "Scheduler", active: false },
        { icon: "📋", name: "عرض سعر", agent: "Closer", active: false },
        { icon: "💰", name: "إغلاق", agent: "Revenue AI", active: true },
      ],
    },
  },

  en: {
    nav: { features: "Features", agents: "Agents", pricing: "Pricing", contact: "Contact", demo: "Start Free" },
    hero: {
      badge: "AI-Powered Sales System",
      title1: "Turn Your Company Into an",
      highlight: "Autonomous Sales Machine",
      title2: "with AI",
      subtitle: "Dealix discovers prospects from 12+ sources, engages them via WhatsApp, email, calls, and LinkedIn, qualifies them, and follows up until the deal closes — autonomously.",
      cta1: "Start Free Trial",
      cta2: "Watch Demo",
      stat1: "Saudi Companies",
      stat2: "Smart Messages",
      stat3: "Deals Closed",
    },
    features: {
      overline: "CAPABILITIES",
      title: "Everything You Need to Dominate Your Market",
      subtitle: "A comprehensive system covering every sales channel — from discovery to close",
      items: [
        { icon: "🔍", title: "12+ Source Lead Discovery", desc: "Google Maps, company websites, Saudi CR, LinkedIn, industry directories — with phone verification" },
        { icon: "📱", title: "LangGraph State Control", desc: "Strict, smart sales automation guided by state graphs for 99.9% decision accuracy." },
        { icon: "🧠", title: "Self-Healing Memory (Mem0)", desc: "Dealix remembers every detail forever with advanced Mem0 long-term memory." },
        { icon: "📊", title: "Salesforce Agentforce Sync", desc: "Direct integration with Salesforce to sync deals and leads with CRM agents instantly." },
        { icon: "🤖", title: "34 AI-Powered Agents", desc: "Massive 7-layer agent system capable of outperforming entire human sales teams." },
        { icon: "📋", title: "Auto Proposals + Smart Closing", desc: "Generates custom proposals, handles objections, and follows up until close" },
      ],
    },
    outreach: {
      overline: "📡 CHANNELS",
      title: "Communicate Everywhere Your Customer Is",
      subtitle: "A multi-channel system ensures your message lands effectively.",
      channels: [
        { icon: "💬", name: "WhatsApp Business", desc: "Instant and personal outreach via WhatsApp." },
        { icon: "📧", name: "Email Sequences", desc: "Smart email automation (Resend/SendGrid)." },
        { icon: "🔗", name: "LinkedIn Automation", desc: "Connect LinkedIn for direct access to decision-makers." },
        { icon: "📞", name: "AI Voice Calls", desc: "Smart voice calls (Twilio/ElevenLabs) coming soon." },
      ],
    },
    how: {
      overline: "🚀 HOW IT WORKS",
      title: "3 Steps to Autonomous Selling",
      steps: [
        { title: "Choose Your Sector", desc: "Select target sector (clinics, real estate, manufacturing...) and cities" },
        { title: "Activate the System", desc: "Dealix starts discovering and contacting prospects automatically via WhatsApp" },
        { title: "Close Deals", desc: "The system arranges meetings and prepares proposals — you just sign" },
      ],
    },
    pricing: {
      overline: "💎 PRICING",
      title: "Plans for Every Company",
      subtitle: "Start free and scale with your business growth",
      popular: "Most Popular",
      plans: [
        {
          name: "Free",
          price: "0",
          period: "SAR/mo",
          popular: false,
          features: ["50 WhatsApp messages/mo", "10 leads", "Basic AI classification", "Dashboard"],
          cta: "Start Free",
        },
        {
          name: "Professional",
          price: "3,000",
          period: "SAR/mo",
          popular: true,
          features: ["1,000 WhatsApp messages", "100 leads", "5 full AI models", "Smart follow-up", "Advanced reports", "WhatsApp support"],
          cta: "14-Day Free Trial",
        },
        {
          name: "Enterprise",
          price: "12,000",
          period: "SAR/mo",
          popular: false,
          features: ["Unlimited messages", "Unlimited leads", "Custom AI (LangGraph Control)", "Salesforce Integration", "Dedicated manager", "99.9% SLA"],
          cta: "Contact Sales",
        },
      ],
    },
    cta: {
      title: "Ready to Double Your Sales?",
      subtitle: "Enter your number and we'll contact you within 24 hours",
      placeholder: "+966 5xx xxx xxx",
      button: "Get Started 🚀",
    },
    footer: { desc: "The most powerful AI sales automation system in Saudi Arabia", rights: "All rights reserved" },
    agents: {
      overline: "🧠 SYSTEM ARCHITECTURE",
      title: "25 AI Agents Working Together",
      subtitle: "7 layers of artificial intelligence managing the entire sales cycle — from discovery to close",
      layers: [
        { icon: "👑", name: "Master — CEO Agent", count: "1 agent", color: "#00D4AA", agents: ["LangGraph Orchestrator"] },
        { icon: "📊", name: "Intelligence", count: "4 agents", color: "#3B82F6", agents: ["Conversation Intel", "Revenue Intel", "Market Intel", "Mem0 Memory"] },
        { icon: "💰", name: "Revenue", count: "4 agents", color: "#8B5CF6", agents: ["Closer", "Dynamic Pricing", "Revenue Forecast", "Proposal Gen"] },
        { icon: "🤝", name: "Engagement", count: "8 agents", color: "#EC4899", agents: ["WhatsApp", "Email", "Voice", "LinkedIn", "Content", "Follow-up", "Smart Reply", "Orchestrator"] },
        { icon: "🧪", name: "Qualification", count: "4 agents", color: "#F59E0B", agents: ["BANT Qualifier", "Lead Scorer", "Intent Detector", "Fit Analyst"] },
        { icon: "🔍", name: "Discovery", count: "6 agents", color: "#10B981", agents: ["Strategic Prospector", "Data Enricher", "Deep Researcher", "Lead Engine", "Competitor Intel", "Signal Tracker"] },
        { icon: "⚙️", name: "Infrastructure", count: "7 agents", color: "#64748B", agents: ["CRM", "Salesforce Link", "Analytics", "Reports", "Security", "Scheduler", "Onboarding"] },
      ],
      badge: "34 AI Agents × 7 Layers × LangGraph State Control",
    },
    lifecycle: {
      overline: "🔄 SALES LIFECYCLE",
      title: "Complete Customer Lifecycle — 100% Automated",
      stages: [
        { icon: "🔍", name: "Discover", agent: "Prospector", active: true },
        { icon: "📊", name: "Enrich", agent: "Enricher", active: false },
        { icon: "📱", name: "Outreach", agent: "WhatsApp AI", active: true },
        { icon: "🧪", name: "Qualify", agent: "Qualifier", active: false },
        { icon: "🤖", name: "AI Reply", agent: "AI Brain", active: true },
        { icon: "📅", name: "Meeting", agent: "Scheduler", active: false },
        { icon: "📋", name: "Proposal", agent: "Closer", active: false },
        { icon: "💰", name: "Close", agent: "Revenue AI", active: true },
      ],
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════

const styles: Record<string, React.CSSProperties> = {
  navbar: { position: "sticky" as const, top: 0, zIndex: 100, background: "rgba(5, 10, 18, 0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(148,163,184,0.08)" },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  navBrand: { display: "flex", alignItems: "center", gap: 12 },
  logoIcon: { width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" },
  brandName: { fontFamily: "Outfit, sans-serif", fontSize: 22, fontWeight: 800, color: "#F0F4F8" },
  badgeLive: { background: "rgba(0,212,170,0.12)", color: "#00D4AA", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: "50%", background: "#00D4AA", display: "inline-block", animation: "pulse 2s infinite" },
  navLinks: { display: "flex", alignItems: "center", gap: 8 },
  navLink: { padding: "8px 16px", color: "#94A3B8", textDecoration: "none", fontSize: 14, fontWeight: 500, borderRadius: 8, transition: "all 0.2s" },
  langToggle: { padding: "6px 14px", background: "rgba(148,163,184,0.1)", color: "#94A3B8", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  navCTA: { padding: "8px 20px", background: "linear-gradient(135deg, #00D4AA, #3B82F6)", color: "#0A1628", textDecoration: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, boxShadow: "0 4px 15px rgba(0,212,170,0.25)" },

  hero: { position: "relative" as const, padding: "100px 24px 80px", textAlign: "center" as const, overflow: "hidden" },
  heroGlow: { position: "absolute" as const, top: "-50%", left: "50%", transform: "translateX(-50%)", width: 800, height: 800, background: "radial-gradient(ellipse, rgba(0,212,170,0.08) 0%, transparent 70%)", pointerEvents: "none" as const },
  heroContent: { position: "relative" as const, maxWidth: 900, margin: "0 auto", zIndex: 1 },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.2)", color: "#00D4AA", padding: "6px 18px", borderRadius: 30, fontSize: 13, fontWeight: 600, marginBottom: 28 },
  heroBadgeDot: { width: 8, height: 8, borderRadius: "50%", background: "#00D4AA", display: "inline-block" },
  heroTitle: { fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: "#F0F4F8", lineHeight: 1.15, marginBottom: 20 },
  heroGradient: { background: "linear-gradient(135deg, #00D4AA, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { fontSize: "clamp(16px, 2vw, 20px)", color: "#94A3B8", lineHeight: 1.7, maxWidth: 700, margin: "0 auto 36px" },
  heroCTAs: { display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" as const, marginBottom: 60 },
  btnPrimary: { display: "inline-flex", padding: "14px 32px", background: "linear-gradient(135deg, #00D4AA, #3B82F6)", color: "#0A1628", textDecoration: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,212,170,0.3)", transition: "all 0.3s" },
  btnSecondary: { display: "inline-flex", padding: "14px 32px", background: "transparent", color: "#00D4AA", textDecoration: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, border: "1.5px solid rgba(0,212,170,0.3)", cursor: "pointer", transition: "all 0.3s" },

  statsRow: { display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" as const },
  statItem: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 },
  statNumber: { fontFamily: "Outfit, sans-serif", fontSize: 32, fontWeight: 800, color: "#00D4AA" },
  statLabel: { fontSize: 14, color: "#94A3B8" },
  statDivider: { width: 1, height: 50, background: "rgba(148,163,184,0.15)" },

  section: { padding: "100px 24px", maxWidth: 1200, margin: "0 auto" },
  sectionHeader: { textAlign: "center" as const, marginBottom: 64 },
  overline: { display: "inline-flex", alignItems: "center", gap: 8, color: "#00D4AA", fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: 12 },
  sectionTitle: { fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#F0F4F8", lineHeight: 1.2, marginBottom: 14 },
  sectionSub: { fontSize: 18, color: "#94A3B8", maxWidth: 600, margin: "0 auto" },

  featGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 },
  featCard: { background: "#0D1520", border: "1px solid rgba(148,163,184,0.08)", borderRadius: 16, padding: 32, transition: "all 0.3s", cursor: "default" },
  featIcon: { width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 14, fontSize: 24, marginBottom: 16 },
  featTitle: { fontSize: 18, fontWeight: 700, color: "#F0F4F8", marginBottom: 8 },
  featDesc: { fontSize: 15, color: "#94A3B8", lineHeight: 1.6 },

  stepsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 },
  stepCard: { textAlign: "center" as const, padding: 32 },
  stepNum: { width: 48, height: 48, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #00D4AA, #3B82F6)", color: "#0A1628", borderRadius: 14, fontSize: 20, fontWeight: 800, marginBottom: 16 },
  stepTitle: { fontSize: 18, fontWeight: 700, color: "#F0F4F8", marginBottom: 8 },
  stepDesc: { fontSize: 15, color: "#94A3B8", lineHeight: 1.6 },

  pricingGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, alignItems: "start" },
  pricingCard: { background: "#0D1520", border: "1px solid rgba(148,163,184,0.08)", borderRadius: 20, padding: 36, position: "relative" as const, transition: "all 0.3s" },
  pricingPopular: { border: "2px solid #00D4AA", boxShadow: "0 0 30px rgba(0,212,170,0.15)", transform: "scale(1.03)" },
  popularBadge: { position: "absolute" as const, top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #00D4AA, #3B82F6)", color: "#0A1628", padding: "4px 18px", borderRadius: 20, fontSize: 12, fontWeight: 700 },
  planName: { fontSize: 22, fontWeight: 700, color: "#F0F4F8", marginBottom: 16 },
  planPrice: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 24 },
  planAmount: { fontFamily: "Outfit, sans-serif", fontSize: 40, fontWeight: 800, color: "#00D4AA" },
  planPeriod: { fontSize: 15, color: "#94A3B8" },
  planFeatures: { listStyle: "none", padding: 0, marginBottom: 28 },
  planFeature: { padding: "8px 0", fontSize: 14, color: "#94A3B8", borderBottom: "1px solid rgba(148,163,184,0.06)" },

  ctaSection: { position: "relative" as const, padding: "100px 24px", textAlign: "center" as const, background: "#0D1520", overflow: "hidden" },
  ctaGlow: { position: "absolute" as const, top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(0,212,170,0.1) 0%, transparent 70%)", pointerEvents: "none" as const },
  ctaTitle: { fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: "#F0F4F8", marginBottom: 12, position: "relative" as const, zIndex: 1 },
  ctaSub: { fontSize: 18, color: "#94A3B8", marginBottom: 32, position: "relative" as const, zIndex: 1 },
  ctaForm: { display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" as const, position: "relative" as const, zIndex: 1 },
  ctaInput: { padding: "14px 20px", background: "#111D2E", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 12, color: "#F0F4F8", fontSize: 16, width: 300, outline: "none" },

  footer: { borderTop: "1px solid rgba(148,163,184,0.08)", padding: "48px 24px 24px" },
  footerInner: { maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap" as const, gap: 32, marginBottom: 32 },
  footerBrand: {},
  footerText: { color: "#64748B", fontSize: 14, marginTop: 8 },
  footerLinks: { display: "flex", gap: 24 },
  footerLink: { color: "#94A3B8", textDecoration: "none", fontSize: 14 },
  footerBottom: { maxWidth: 1200, margin: "0 auto", paddingTop: 24, borderTop: "1px solid rgba(148,163,184,0.06)", textAlign: "center" as const, color: "#64748B", fontSize: 13 },
};
