"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import {
  BookOpen,
  FileText,
  Gavel,
  Megaphone,
  Route,
  Sparkles,
  Target,
  ExternalLink,
} from "lucide-react";

type ProgramPayload = {
  title_ar?: string;
  journey_ar?: { step: number; title: string; detail_ar: string }[];
};

const LEGAL_LINKS = [
  { href: "/strategy/legal/affiliate-rules-ar.md", label: "قواعد المسوقين بالعمولة", summary: "مسموح ومحظور، عقوبات، حقوق المسوق." },
  { href: "/strategy/legal/commission-policy-ar.md", label: "سياسة العمولات", summary: "هيكل العمولات والمستحقات." },
  { href: "/strategy/legal/consent-policy-ar.md", label: "سياسة الموافقة", summary: "التواصل والموافقات المطلوبة." },
] as const;

const PLAYBOOK_STEPS = [
  {
    phase: "تأهيل",
    items: [
      { label: "تعرّف على البرنامج والعمولة", section: "affiliates" as const },
      { label: "اقرأ القواعد والموافقة", section: null },
    ],
  },
  {
    phase: "محتوى وجاهزية",
    items: [
      { label: "البرزنتيشنات القطاعية", section: "presentations" as const },
      { label: "سكربتات المكالمات والواتساب", section: "scripts" as const },
    ],
  },
  {
    phase: "توليد ومتابعة",
    items: [
      { label: "توليد عملاء محتملين", section: "leads" as const },
      { label: "صندوق الوارد الموحّد", section: "inbox" as const },
    ],
  },
  {
    phase: "شراكات متقدمة",
    items: [{ label: "Partnership Studio", section: "partnership-studio" as const }],
  },
];

function dash(section: string) {
  return `/dashboard?section=${section}`;
}

export function MarketerHubView() {
  const [program, setProgram] = useState<ProgramPayload | null>(null);

  const load = useCallback(async () => {
    const r = await apiFetch("/api/v1/affiliates/program");
    if (r.ok) setProgram(await r.json());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <header className="dealix-section-header space-y-2">
        <div className="flex items-center gap-3">
          <Megaphone className="w-9 h-9 text-primary shrink-0" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">مركز المسوق</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              مسار واحد: قواعد البرنامج، الأدوات في Dealix، والوثائق الرسمية — بدون تشتيت بين الشاشات.
            </p>
          </div>
        </div>
      </header>

      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" />
          <h2 className="font-semibold text-lg">برنامج العمولة (مختصر مباشر من API)</h2>
        </div>
        {program?.title_ar && <p className="text-sm font-medium">{program.title_ar}</p>}
        <ul className="space-y-2 text-sm text-muted-foreground">
          {(program?.journey_ar || []).slice(0, 4).map((s) => (
            <li key={s.step} className="flex gap-2">
              <span className="text-primary font-mono text-xs pt-0.5">{s.step}</span>
              <span>
                <span className="text-foreground font-medium">{s.title}</span> — {s.detail_ar}
              </span>
            </li>
          ))}
          {!program?.journey_ar?.length && <li>جارٍ التحميل أو لا توجد بيانات برنامج بعد.</li>}
        </ul>
        <Link
          href={dash("affiliates")}
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Target className="w-4 h-4" />
          فتح لوحة المسوقين والترتيب الكامل
        </Link>
      </section>

      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Route className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Playbook المسار</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {PLAYBOOK_STEPS.map((block) => (
            <div key={block.phase} className="rounded-xl border border-border/60 bg-secondary/20 p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{block.phase}</p>
              <ul className="space-y-2">
                {block.items.map((it) => (
                  <li key={it.label}>
                    {it.section ? (
                      <Link href={dash(it.section)} className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                        {it.label}
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">{it.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Gavel className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-lg">الوثائق القانونية (ملخص + الملف الكامل)</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {LEGAL_LINKS.map((doc) => (
            <a
              key={doc.href}
              href={doc.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-xl border border-border/50 hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{doc.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{doc.summary}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          للربط الشامل بالبيئة والتكاملات راجع وثيقة INTEGRATION_MASTER في المستودع أو مسار الاستراتيجية العامة.
        </p>
      </section>
    </div>
  );
}
