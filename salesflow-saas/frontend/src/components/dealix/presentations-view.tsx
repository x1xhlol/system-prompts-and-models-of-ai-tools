import { FileBarChart, MonitorPlay, Activity, Stethoscope, Car, Home, ShoppingBag, BookOpen, ExternalLink } from "lucide-react";

/** Static HTML served by API at /dealix-presentations/ (nginx → backend; next dev → rewrite) */
const PRESENTATION_BASE = "/dealix-presentations";

const SECTORS = [
  {
    icon: Stethoscope,
    name: "العيادات الطبية",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    pain: "ضياع حجوزات بسبب التأخر في الرد على الواتساب وعدم التذكير بالمواعيد.",
    solution: "حجز تلقائي وتأكيد مواعيد، إجابة عن أسئلة القسم والعيادات 24/7.",
    stats: "٣٠٪ معدل فشل حضور المرضى بسبب سوء المتابعة اليدوية.",
    deckUrl: "#deck-clinics",
    htmlFile: "01-sector-healthcare-ar.html",
  },
  {
    icon: Home,
    name: "العقارات وإدارة الأملاك",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    pain: "مئات الاستفسارات عن الأسعار والمواقع والفلترة تضيع وقت الوكلاء.",
    solution: "وكيل عقاري ذكي يفلتر العملاء، يسأل عن الميزانية، ويرسل عروض.",
    stats: "٧٠٪ من الاستفسارات العقارية غير جادة وتضيع وقت المبيعات.",
    deckUrl: "#deck-realestate",
    htmlFile: "02-sector-realestate-ar.html",
  },
  {
    icon: Car,
    name: "قطاع السيارات وصيانتها",
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    pain: "صعوبة في جدولة مواعيد الصيانة واستفسارات قطع الغيار المملة.",
    solution: "حجز مواعيد الصيانة فورياً عبر الواتساب وتذكير العميل عند الانتهاء.",
    stats: "السوق يحتاج ٥٠٪ سرعة أكبر في المبيعات بعد طلب تجربة القيادة.",
    deckUrl: "#deck-auto",
    htmlFile: "10-sector-automotive-ar.html",
  },
  {
    icon: ShoppingBag,
    name: "المتاجر الإلكترونية",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    pain: "استفسارات تتبع الطلب متكررة والسلال المتروكة تكلف أموال.",
    solution: "تتبع آلي، إرسال تذكيرات ذكية للسلال المتروكة، دعم ما بعد البيع.",
    stats: "٦٨٪ معدل ترك السلال الشرائية حول العالم.",
    deckUrl: "#deck-ecommerce",
    htmlFile: "05-sector-retail-ar.html",
  },
  {
    icon: BookOpen,
    name: "التعليم والتدريب",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    pain: "استفسارات عن جداول الدورات والأسعار تأخذ وقت طويل من خدمة العملاء.",
    solution: "مستشار تعليمي آلي يجيب على شروط التسجيل، ويسجل الطلاب.",
    stats: "الطلاب يتوقعون ردود فورية للتسجيل وإلا يذهبون لمعاهد أخرى.",
    deckUrl: "#deck-education",
    htmlFile: "07-sector-education-ar.html",
  },
  {
    icon: Activity,
    name: "شركات التقنية والخدمات B2B",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    pain: "دورة المبيعات طويلة جداً واجتماعات مع أشخاص غير مؤهلين.",
    solution: "تأهيل صارم للعميل (BANT) قبل حجز أي الديمو.",
    stats: "٥٠٪ من اجتماعات B2B تكون مع عملاء خارج نطاق الخدمة.",
    deckUrl: "#deck-b2b",
    htmlFile: "06-sector-it-ar.html",
  }
];

export function PresentationsView() {
  const handleShare = async (sector: (typeof SECTORS)[0]) => {
    const deckUrl = `${window.location.origin}${PRESENTATION_BASE}/${sector.htmlFile}`;
    const shareData = {
      title: `عرض ${sector.name} - Dealix AI`,
      text: `مرحباً، أود مشاركة عرض Dealix AI المخصص لـ ${sector.name}.\n\nالمشكلة: ${sector.pain}\nالحل: ${sector.solution}`,
      url: deckUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + "\n" + shareData.url)}`;
      window.open(whatsappUrl, "_blank");
    }
  };


  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">📊 الترسانة القطاعية (Sector Sales Arsenal)</h1>
          <p className="text-muted-foreground">عروض تقديمية وملفات ROI مخصصة لكل قطاع تستخدمها للإغلاق السريع.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECTORS.map((sector, idx) => (
          <div key={idx} className="glass-card flex flex-col group overflow-hidden">
            <div className={`p-6 border-b border-border/50 ${sector.bg} flex items-center gap-4`}>
              <div className={`p-3 rounded-xl bg-background shadow-sm ${sector.color}`}>
                <sector.icon className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold">{sector.name}</h2>
            </div>
            
            <div className="p-6 flex-1 flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-bold text-destructive mb-1">نقاط الألم (Pain Points):</h4>
                <p className="text-sm text-foreground/80 leading-relaxed font-sans">{sector.pain}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-emerald-500 mb-1">كيف نحل المشكلة (Dealix Solution):</h4>
                <p className="text-sm text-foreground/80 leading-relaxed font-sans">{sector.solution}</p>
              </div>

              <div className="bg-secondary/30 rounded-xl p-3 border border-border/50 mb-4 mt-auto">
                <span className="text-xs font-bold text-muted-foreground">إحصائية للإغلاق: </span>
                <span className="text-sm font-medium">{sector.stats}</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <a
                  href={`${PRESENTATION_BASE}/${sector.htmlFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-900/30 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  فتح العرض HTML (طباعة PDF)
                </a>
                <button 
                  onClick={() => handleShare(sector)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/25 transition-all"
                >
                  <FileBarChart className="w-4 h-4" />
                  مشاركة الرابط
                </button>
                
                <button type="button" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border font-medium transition-all">
                  <MonitorPlay className="w-4 h-4" />
                  حاسبة العائد ROI (قريباً)
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

