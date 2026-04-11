"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Server,
  MessageCircle,
  Plug,
  Rocket,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/api-base";

type Role = { id: string; title_ar: string; responsibility_ar: string };
type Step = {
  id: string;
  title_ar: string;
  primary_owner_role: string;
  supporting_agents: string[];
  customer_must_provide_ar: string[];
  whatsapp_milestone_ar: string | null;
};
type Phase = { id: string; title_ar: string; steps: Step[] };

type Journey = {
  summary_ar: string;
  roles: Role[];
  phases: Phase[];
  full_os_gaps_ar?: string[];
};

type Acceptance = {
  title_ar: string;
  sections: { id: string; title_ar: string; items: string[] }[];
};

const roleLabel: Record<string, string> = {
  economic_buyer: "صاحب القرار",
  technical_owner: "تقني",
  channel_owner: "قنوات",
  dealix_success: "نجاح عملاء Dealix",
  integration_concierge_agent: "وكيل الدمج الذكي",
};

export function CustomerOnboardingJourneyView() {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [acceptance, setAcceptance] = useState<Acceptance | null>(null);
  const [openPhase, setOpenPhase] = useState<string | null>(null);

  useEffect(() => {
    const base = getApiBaseUrl().replace(/\/$/, "");
    Promise.all([
      fetch(`${base}/api/v1/customer-onboarding/journey`, { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`${base}/api/v1/customer-onboarding/acceptance-test`, { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null
      ),
    ]).then(([j, a]) => {
      setJourney(j);
      setAcceptance(a);
      if (j?.phases?.length) setOpenPhase(j.phases[0].id);
    });
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10 text-right animate-in fade-in duration-500">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
          <BookOpen className="w-3.5 h-3.5" />
          مسار التشغيل مع العميل (B2B)
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">من العقد إلى OS كامل</h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-3xl mr-0 ml-auto">
          {journey?.summary_ar ??
            "تحميل الرحلة من الـ API — عيّن NEXT_PUBLIC_API_URL إن لزم."}
        </p>
      </div>

      {journey?.roles && (
        <section className="glass-card p-5 border border-border/60 space-y-3">
          <h2 className="font-bold flex items-center gap-2 justify-end">
            <Users className="w-5 h-5 text-primary" />
            الأدوار عند العميل وفريق Dealix
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {journey.roles.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-border/50 bg-secondary/20 p-3"
              >
                <p className="font-semibold text-foreground">{r.title_ar}</p>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{r.responsibility_ar}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {journey?.phases?.map((phase) => {
        const isOpen = openPhase === phase.id;
        return (
          <section key={phase.id} className="glass-card border border-border/60 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenPhase(isOpen ? null : phase.id)}
              className="w-full flex items-center justify-between gap-3 p-4 text-right hover:bg-secondary/30 transition-colors"
            >
              <span className="font-bold flex items-center gap-2">
                <Server className="w-4 h-4 text-teal-400 shrink-0" />
                {phase.title_ar}
              </span>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            {isOpen && (
              <div className="border-t border-border/50 divide-y divide-border/40">
                {phase.steps.map((st) => (
                  <div key={st.id} className="p-4 space-y-2 bg-background/30">
                    <p className="font-semibold">{st.title_ar}</p>
                    <p className="text-xs text-muted-foreground">
                      مالك رئيسي:{" "}
                      <span className="text-foreground">
                        {roleLabel[st.primary_owner_role] ?? st.primary_owner_role}
                      </span>
                      {" · "}
                      دعم: {st.supporting_agents.map((a) => roleLabel[a] ?? a).join("، ")}
                    </p>
                    {st.customer_must_provide_ar?.length > 0 && (
                      <ul className="text-xs text-muted-foreground list-disc list-inside">
                        {st.customer_must_provide_ar.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    )}
                    {st.whatsapp_milestone_ar && (
                      <p className="text-xs flex items-start gap-2 justify-end text-teal-600/90 dark:text-teal-400/90">
                        <MessageCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {st.whatsapp_milestone_ar}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {acceptance?.sections && (
        <section className="glass-card p-5 border border-border/60 space-y-4">
          <h2 className="font-bold flex items-center gap-2 justify-end">
            <ClipboardCheck className="w-5 h-5 text-emerald-500" />
            {acceptance.title_ar}
          </h2>
          {acceptance.sections.map((sec) => (
            <div key={sec.id}>
              <p className="text-sm font-semibold mb-2 flex items-center gap-2 justify-end">
                <Plug className="w-4 h-4 opacity-70" />
                {sec.title_ar}
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                {sec.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {journey?.full_os_gaps_ar && journey.full_os_gaps_ar.length > 0 && (
        <section className="rounded-xl border border-dashed border-border p-4 space-y-2">
          <h3 className="text-sm font-bold flex items-center gap-2 justify-end">
            <Rocket className="w-4 h-4" />
            فجوات نحو Full OS (تطوير لاحق)
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            {journey.full_os_gaps_ar.map((g) => (
              <li key={g}>• {g}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
