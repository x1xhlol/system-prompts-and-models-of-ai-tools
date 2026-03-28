import {
  Users, MessageSquare, BarChart3, Target, Zap, Phone,
  CheckCircle2, ArrowLeft, Star, ChevronDown, Building2,
  Stethoscope, Home, Clock, Shield, Globe
} from "lucide-react";

const features = [
  { icon: Users, title: "إدارة العملاء المحتملين", titleEn: "Lead Management", desc: "التقط العملاء من واتساب، الموقع، ووسائل التواصل تلقائياً" },
  { icon: MessageSquare, title: "المتابعة التلقائية", titleEn: "Auto Follow-up", desc: "الذكاء الاصطناعي يرسل رسائل وتذكيرات بدون تدخلك" },
  { icon: Target, title: "خط أنابيب المبيعات", titleEn: "Sales Pipeline", desc: "تابع صفقاتك بصرياً وحرّك كل صفقة بين المراحل بسهولة" },
  { icon: Zap, title: "عروض أسعار ذكية", titleEn: "Smart Proposals", desc: "أنشئ وأرسل عروض أسعار احترافية في دقائق" },
  { icon: BarChart3, title: "تقارير وتحليلات", titleEn: "Reports & Analytics", desc: "لوحات بيانات فورية تتابع إيراداتك وأداء فريقك" },
  { icon: Phone, title: "واتساب بزنس", titleEn: "WhatsApp Business", desc: "أرسل واستقبل الرسائل مباشرة من المنصة" },
];

const painPoints = [
  { emoji: "😰", text: "تضيع عملاء لأن المتابعة متأخرة؟" },
  { emoji: "😵", text: "فريقك يشتغل بدون نظام واضح؟" },
  { emoji: "💸", text: "ما تعرف وين فلوسك رايحة؟" },
];

const steps = [
  { num: "01", title: "سجّل شركتك", desc: "في دقيقتين فقط", icon: Building2 },
  { num: "02", title: "اختر قالب قطاعك", desc: "عيادات، عقارات، أو غيرها", icon: Globe },
  { num: "03", title: "المنصة تبدأ تبيع لك", desc: "المتابعة التلقائية تبدأ فوراً", icon: Zap },
];

const plans = [
  {
    name: "أساسي", nameEn: "Basic", price: "299", popular: false,
    features: ["2 مستخدمين", "100 عميل محتمل/شهر", "500 رسالة واتساب", "3 أتمتة", "تقارير أساسية", "دعم بالإيميل"],
  },
  {
    name: "احترافي", nameEn: "Professional", price: "699", popular: true,
    features: ["10 مستخدمين", "1,000 عميل محتمل/شهر", "5,000 رسالة واتساب", "20 أتمتة", "تقارير متقدمة", "دعم أولوية", "قوالب قطاعية"],
  },
  {
    name: "مؤسسات", nameEn: "Enterprise", price: "1,499", popular: false,
    features: ["مستخدمين بلا حدود", "عملاء بلا حدود", "رسائل بلا حدود", "أتمتة بلا حدود", "تقارير مخصصة", "دعم مخصص", "API كامل", "مدير حساب خاص"],
  },
];

const faqs = [
  { q: "هل يدعم الواتساب؟", a: "نعم، نربط مع واتساب بزنس API مباشرة. ترسل وتستقبل الرسائل من داخل المنصة." },
  { q: "هل بياناتي آمنة؟", a: "تشفير كامل لكل البيانات. سيرفرات آمنة مع نسخ احتياطية يومية." },
  { q: "كم يوم التجربة المجانية؟", a: "14 يوم كاملة بكل المميزات بدون بطاقة ائتمان." },
  { q: "هل يدعم العربي؟", a: "المنصة كاملة بالعربي والإنجليزي. مصممة للسوق السعودي." },
  { q: "أقدر ألغي أي وقت؟", a: "نعم، بدون أي التزام أو رسوم إلغاء." },
];

const stats = [
  { value: "+500", label: "شركة تثق بنا" },
  { value: "+10,000", label: "صفقة تم إغلاقها" },
  { value: "+2M", label: "رسالة تم إرسالها" },
  { value: "24/7", label: "أتمتة مستمرة" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="SalesMatic" className="h-9 w-9" />
              <span className="text-xl font-bold text-primary">SalesMatic</span>
              <span className="text-sm text-gray-400 hidden sm:block">سيلزماتك</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm">
              <a href="#features" className="text-gray-600 hover:text-primary transition">المميزات</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary transition">كيف يعمل</a>
              <a href="#industries" className="text-gray-600 hover:text-primary transition">القطاعات</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary transition">الأسعار</a>
            </div>
            <div className="flex items-center gap-3">
              <a href="/ar/login" className="text-sm text-gray-600 hover:text-primary transition hidden sm:block">تسجيل دخول</a>
              <a href="/ar/register" className="bg-accent hover:bg-accent-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-accent/25">
                ابدأ مجاناً
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-hero-gradient bg-grid pt-32 pb-20 px-4 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/20"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
              صنع في السعودية للسوق السعودي
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-arabic leading-tight mb-6">
              حوّل مبيعاتك إلى
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-secondary to-emerald-300">
                ماكينة أرباح تعمل 24/7
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              منصة ذكاء اصطناعي تدير عملاءك، تتابعهم تلقائياً، وتغلق الصفقات بدون تدخل. مصممة للشركات الصغيرة والمتوسطة.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/ar/register" className="bg-accent hover:bg-accent-600 text-white px-8 py-4 rounded-xl text-lg font-bold transition shadow-2xl shadow-accent/30 flex items-center gap-2">
                ابدأ مجاناً لمدة 14 يوم
                <ArrowLeft className="w-5 h-5" />
              </a>
              <a href="#features" className="text-white/80 hover:text-white transition flex items-center gap-2">
                اكتشف المميزات
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>
            <p className="text-sm text-gray-400 mt-4">بدون بطاقة ائتمان • إلغاء أي وقت</p>
          </div>

          {/* Dashboard Mockup */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {[
                  { label: "عملاء جدد اليوم", value: "23", color: "text-secondary" },
                  { label: "صفقات مفتوحة", value: "47", color: "text-accent" },
                  { label: "إيرادات الشهر", value: "185K", color: "text-emerald-400" },
                  { label: "معدل التحويل", value: "34%", color: "text-purple-400" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-3 text-center">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-3">
                {["جديد", "تم التواصل", "موعد محجوز", "عرض سعر", "تم الإغلاق"].map((stage, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-2">
                    <div className="text-xs text-gray-400 mb-2 text-center">{stage}</div>
                    {Array.from({ length: 3 - Math.floor(i * 0.5) }).map((_, j) => (
                      <div key={j} className="bg-white/10 rounded h-8 mb-1.5"></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {painPoints.map((p, i) => (
              <div key={i} className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="text-4xl mb-3">{p.emoji}</div>
                <p className="text-lg font-medium text-gray-800">{p.text}</p>
                <p className="text-sm text-secondary mt-2 font-medium">SalesMatic يحل هذي المشكلة</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">كل اللي تحتاجه لزيادة مبيعاتك</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">منصة متكاملة تجمع كل أدوات المبيعات في مكان واحد</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                  <f.icon className="w-6 h-6 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1">{f.title}</h3>
                <p className="text-xs text-gray-400 mb-2">{f.titleEn}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">ابدأ في 3 خطوات</h2>
            <p className="text-gray-500 text-lg">من التسجيل إلى أول صفقة في دقائق</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center relative">
                <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                  <s.icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-xs text-primary font-bold mb-2">الخطوة {s.num}</div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Templates */}
      <section id="industries" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">قوالب جاهزة لقطاعك</h2>
            <p className="text-gray-500 text-lg">اختر قالب قطاعك وابدأ فوراً</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-primary to-primary-700 rounded-2xl p-6 text-white shadow-xl">
              <Stethoscope className="w-10 h-10 mb-4" />
              <h3 className="text-lg font-bold mb-1">العيادات والصحة</h3>
              <p className="text-sm text-white/70 mb-4">إدارة المرضى والمواعيد والمتابعة</p>
              <div className="text-xs bg-white/20 rounded-full px-3 py-1 inline-block">متاح الآن</div>
            </div>
            <div className="bg-gradient-to-br from-secondary to-secondary-700 rounded-2xl p-6 text-white shadow-xl">
              <Home className="w-10 h-10 mb-4" />
              <h3 className="text-lg font-bold mb-1">عقارات الرياض</h3>
              <p className="text-sm text-white/70 mb-4">عقارات، جولات، عروض، أحياء الرياض</p>
              <div className="text-xs bg-white/20 rounded-full px-3 py-1 inline-block">متاح الآن</div>
            </div>
            <div className="bg-gray-100 rounded-2xl p-6 text-gray-400">
              <Building2 className="w-10 h-10 mb-4" />
              <h3 className="text-lg font-bold mb-1 text-gray-500">المقاولات</h3>
              <p className="text-sm mb-4">إدارة المشاريع والعملاء</p>
              <div className="text-xs bg-gray-200 rounded-full px-3 py-1 inline-block">قريباً</div>
            </div>
            <div className="bg-gray-100 rounded-2xl p-6 text-gray-400">
              <Star className="w-10 h-10 mb-4" />
              <h3 className="text-lg font-bold mb-1 text-gray-500">الصالونات</h3>
              <p className="text-sm mb-4">حجوزات ومتابعة العملاء</p>
              <div className="text-xs bg-gray-200 rounded-full px-3 py-1 inline-block">قريباً</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-dark text-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-secondary mb-1">{s.value}</div>
                <div className="text-sm text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">خطط تناسب حجم شركتك</h2>
            <p className="text-gray-500 text-lg">ابدأ مجاناً 14 يوم • بدون بطاقة ائتمان</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div key={i} className={`rounded-2xl p-6 border-2 transition-all ${
                plan.popular
                  ? "border-primary bg-primary/5 shadow-xl scale-105 relative"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-4 py-1 rounded-full font-medium">
                    الأكثر شعبية
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-xs text-gray-400">{plan.nameEn}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 text-sm"> ر.س/شهر</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/ar/register" className={`block text-center py-3 rounded-xl font-medium transition ${
                  plan.popular
                    ? "bg-primary text-white hover:bg-primary-600 shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                  ابدأ تجربة مجانية
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">أسئلة شائعة</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-white rounded-xl border border-gray-100 group">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-medium hover:text-primary transition">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-gray-500 text-sm leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-hero-gradient text-white px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">جاهز تزيد مبيعاتك؟</h2>
          <p className="text-lg text-gray-300 mb-8">انضم لمئات الشركات اللي زادت مبيعاتها مع SalesMatic</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/ar/register" className="bg-accent hover:bg-accent-600 text-white px-8 py-4 rounded-xl text-lg font-bold transition shadow-2xl">
              ابدأ مجاناً الآن
            </a>
            <a href="https://wa.me/966XXXXXXXXXX" className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-bold transition shadow-2xl flex items-center gap-2">
              <Phone className="w-5 h-5" />
              تواصل عبر واتساب
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.svg" alt="SalesMatic" className="h-8 w-8" />
                <span className="text-white font-bold text-lg">SalesMatic</span>
              </div>
              <p className="text-sm mb-4 leading-relaxed">مبيعاتك تشتغل وأنت ترتاح</p>
              <p className="text-sm">Sales on Autopilot</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">المنصة</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">المميزات</a></li>
                <li><a href="#pricing" className="hover:text-white transition">الأسعار</a></li>
                <li><a href="#industries" className="hover:text-white transition">القطاعات</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">الشركة</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">من نحن</a></li>
                <li><a href="#" className="hover:text-white transition">تواصل معنا</a></li>
                <li><a href="#" className="hover:text-white transition">سياسة الخصوصية</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> واتساب بزنس</li>
                <li className="flex items-center gap-2"><Shield className="w-4 h-4" /> دعم فني</li>
                <li className="flex items-center gap-2"><Clock className="w-4 h-4" /> 24/7 متاح</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2024 SalesMatic. جميع الحقوق محفوظة</p>
            <p className="text-sm flex items-center gap-1">صنع بـ ❤️ في السعودية 🇸🇦</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
