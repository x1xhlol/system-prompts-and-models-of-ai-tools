import Link from "next/link";
import {
  MessageCircle,
  Download,
  FileText,
  CheckSquare,
  Presentation,
  ArrowLeft,
  ExternalLink,
  Compass,
} from "lucide-react";

export const metadata = {
  title: "Dealix — بوابة المسوّقين",
  description: "دخول مباشر، تحميلات، قوالب واتساب، وروابط العروض القطاعية.",
};

const links = [
  {
    title: "الخطة الاستراتيجية والمنافسة",
    href: "/strategy",
    desc: "لماذا Dealix، مراحل التنفيذ، وتحميل الوثيقة الكاملة.",
    icon: Compass,
  },
  {
    title: "مركز الموارد (كل الروابط)",
    href: "/resources",
    desc: "ZIP، العروض، والملفات التسويقية.",
    icon: Download,
  },
  {
    title: "فهرس الملفات الثابتة",
    href: "/dealix-marketing/index.html",
    desc: "نسخة HTML كاملة من بوابة الأصول.",
    icon: FileText,
  },
  {
    title: "قوالب واتساب (نسخ ولصق)",
    href: "/dealix-marketing/marketers/whatsapp-playbook-ar.txt",
    desc: "رسائل جاهزة — عدّل الاسم والرابط فقط.",
    icon: MessageCircle,
  },
  {
    title: "قائمة تحقق الدخول",
    href: "/dealix-marketing/marketers/entry-checklist-ar.txt",
    desc: "تأكد أنك غطيت الخطوات قبل التواصل مع العملاء.",
    icon: CheckSquare,
  },
  {
    title: "العروض القطاعية (10 قطاعات)",
    href: "/dealix-presentations/00-dealix-company-master-ar.html",
    desc: "ابدأ من ملف الشركة ثم اختر رقم القطاع.",
    icon: Presentation,
    external: false,
  },
  {
    title: "هيكل العمولة (Markdown)",
    href: "/dealix-marketing/Dealix_Marketing_Arsenal.md",
    desc: "Silver / Gold / Platinum — راجع العقد الرسمي للأرقام النهائية.",
    icon: FileText,
  },
];

export default function MarketersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-teal-950 text-slate-100">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <p className="text-sm font-semibold text-teal-400">Dealix Partner GTM</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">بوابة المسوّقين</h1>
        <p className="mt-3 text-slate-400 leading-relaxed">
          مسار واحد للدخول: افتح الروابط أدناه من نفس الموقع (لا حاجة لخادم 8000). انسخ قوالب
          الواتساب من الملف النصي وعدّل{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-teal-200">
            {`{الاسم}`}
          </code>{" "}
          و
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-teal-200">رابط موقعك</code>.
        </p>

        <div className="mt-10 space-y-3">
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-teal-500/40 hover:bg-white/10"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
                <item.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-semibold text-white">
                  {item.title}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-50" />
                </div>
                <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                <p className="mt-2 truncate font-mono text-xs text-teal-500/80">{item.href}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-teal-500/30 bg-teal-950/40 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-teal-200">
            <MessageCircle className="h-5 w-5" />
            تلميح واتساب سريع
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            احفظ رسالة واحدة كقالب في واتساب (الأجهزة المدعومة) أو استخدم ملاحظات سريعة. لا ترسل
            لعملاء نهائيين دون تنسيق مع فريق Dealix وحسب سياسة الاستخدام.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
            الصفحة الرئيسية
          </Link>
          <Link href="/resources" className="text-sm text-teal-400 hover:text-teal-300">
            الموارد
          </Link>
          <Link href="/dashboard" className="text-sm text-teal-400 hover:text-teal-300">
            المنصة
          </Link>
        </div>
      </div>
    </div>
  );
}
