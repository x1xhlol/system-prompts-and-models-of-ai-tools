import Link from "next/link";
import {
  Download,
  FileText,
  Layers,
  Presentation,
  ExternalLink,
  Server,
  Megaphone,
  Landmark,
  Compass,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const metadata = {
  title: "موارد Dealix — عروض وحالات استخدام",
  description:
    "تعمل من Next.js فقط (منفذ 3000). لا حاجة لخادم FastAPI لعرض الملفات — الملفات في public/dealix-*.",
};

export default function ResourcesPage() {
  const paths = [
    {
      title: "الخطة الاستراتيجية (المستوى التالي)",
      href: "/strategy",
      desc: "تمييز، مقارنة سوق، مراحل، مخاطر، ووثيقة كاملة.",
      icon: Compass,
    },
    {
      title: "بوابة المسوّقين (دخول سريع)",
      href: "/marketers",
      desc: "روابط جاهزة، واتساب، وقوائم تحقق — بدون تعقيد.",
      icon: Megaphone,
    },
    {
      title: "العرض الاستثماري للمستثمرين (PDF)",
      href: "/dealix-marketing/investor/00-investor-dealix-full-ar.html",
      desc: "قابلية توسع، مخاطر، نموذج إيرادات، خارطة طريق.",
      icon: Landmark,
    },
    {
      title: "بوابة التسويق (فهرس + ZIP)",
      href: "/dealix-marketing/",
      desc: "صفحة رئيسية لجميع الملفات وتحميل الحزمة الكاملة.",
      icon: Layers,
    },
    {
      title: "الملف التعريفي للشركة (طباعة PDF)",
      href: "/dealix-presentations/00-dealix-company-master-ar.html",
      desc: "هوية Dealix، الرؤية، الأتمتة، والحوكمة.",
      icon: Presentation,
    },
    {
      title: "حالات الاستخدام السبع (وثيقة رئيسية)",
      href: "/dealix-marketing/dealix-use-cases-2026/00-master-use-cases-ar.html",
      desc: "سيناريوهات B2B، KPI، وربط الوكلاء.",
      icon: FileText,
    },
    {
      title: "عارض مخططات Mermaid",
      href: "/dealix-marketing/dealix-use-cases-2026/diagrams-viewer.html",
      desc: "مخططات تفاعلية للعرض على الشاشة.",
      icon: Presentation,
    },
    {
      title: "JSON — مسارات الـ API (اختياري)",
      href: `${API}/api/v1/marketing/hub`,
      desc: "يعمل فقط عند تشغيل الـ backend على 8000؛ باقي الروابط أعلاه تعمل بدونه.",
      icon: Server,
      external: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <header className="space-y-3">
          <p className="text-teal-400 text-sm font-semibold tracking-wide uppercase">
            Dealix · Marketing &amp; GTM
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            موارد احترافية للعروض والتحميل
          </h1>
          <p className="text-slate-400 leading-relaxed">
            الملفات تُخدم من مجلد{" "}
            <code className="text-teal-300/90">public/dealix-marketing</code> و{" "}
            <code className="text-teal-300/90">public/dealix-presentations</code>{" "}
            بعد <code className="text-teal-300/90">npm run dev</code> —{" "}
            <strong className="text-slate-200">لا تحتاج المنفذ 8000</strong> لعرض العروض والـ ZIP.
          </p>
        </header>

        <section className="grid gap-4">
          {paths.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="group flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-teal-500/40 hover:bg-white/10"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300">
                <item.icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 font-semibold text-white">
                  {item.title}
                  {item.external ? (
                    <ExternalLink className="h-4 w-4 opacity-60" />
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                <p className="mt-2 truncate text-xs text-teal-500/80 font-mono">
                  {item.href}
                </p>
              </div>
              <Download className="h-5 w-5 shrink-0 text-slate-500 opacity-0 transition group-hover:opacity-100" />
            </a>
          ))}
        </section>

        <section className="rounded-2xl border border-teal-500/20 bg-teal-950/30 p-6">
          <h2 className="text-lg font-semibold text-teal-200 mb-2">
            تحميل الحزمة الكاملة (ZIP)
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            إن وُجد الملف بعد تشغيل سكربت الضغط في المستودع.
          </p>
          <a
            href="/dealix-marketing/dealix-marketing-bundle.zip"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/40 hover:bg-teal-500"
          >
            <Download className="h-4 w-4" />
            dealix-marketing-bundle.zip
          </a>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-teal-200 mb-2">روابط بديلة (CDN / GitHub)</h2>
          <p className="text-sm text-slate-400 mb-3">
            بعد رفع المستودع إلى GitHub يمكن التحميل عبر jsDelivr — القوالب في الملف التالي:
          </p>
          <a
            href="/DOWNLOAD-MIRRORS.txt"
            className="text-sm text-teal-400 hover:underline font-mono break-all"
          >
            /DOWNLOAD-MIRRORS.txt
          </a>
        </section>

        <p className="text-xs text-slate-500 leading-relaxed">
          للرفع على GitHub: بعد <code>npm run sync-marketing</code> أو أي تشغيل لـ dev/build، نفّذ{" "}
          <code>git add frontend/public/dealix-marketing frontend/public/dealix-presentations</code> ثم commit وpush.
        </p>

        <div className="pt-4 flex flex-wrap gap-4">
          <Link
            href="/"
            className="text-sm text-teal-400 hover:text-teal-300 underline-offset-4 hover:underline"
          >
            الصفحة الرئيسية
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-teal-400 hover:text-teal-300 underline-offset-4 hover:underline"
          >
            دخول المنصة (لوحة التحكم)
          </Link>
        </div>
      </div>
    </div>
  );
}
