"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Award,
  TrendingUp,
  Building2,
  UserPlus,
  Filter,
  Download,
  Route,
  Sparkles,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";

const AffiliateNetworkOrb = dynamic(
  () => import("./affiliate-network-orb").then((m) => m.AffiliateNetworkOrb),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-border/50 bg-secondary/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
  },
);

type JourneyStep = { step: number; title: string; detail_ar: string };

type ProgramPayload = {
  title_ar?: string;
  journey_ar: JourneyStep[];
  commission_rates: Record<string, { price: number; rate: number }>;
  bonus_tiers: { min_deals: number; bonus: number }[];
  auto_employ_rule_ar?: string;
};

type LeaderRow = {
  name: string;
  deals: number;
  commission: number;
  status: string;
};

function formatSar(n: number) {
  return `${n.toLocaleString("ar-SA", { maximumFractionDigits: 0 })} ر.س`;
}

function statusLabelAr(s: string) {
  const m: Record<string, string> = {
    active: "نشط",
    employed: "مُوظّف / مرشح توظيف",
    pending: "قيد المراجعة",
    suspended: "معلّق",
    terminated: "منتهي",
  };
  return m[s] ?? s;
}

export function AffiliatesView() {
  const [program, setProgram] = useState<ProgramPayload | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const [pRes, lRes] = await Promise.all([
        apiFetch("/api/v1/affiliates/program"),
        apiFetch("/api/v1/affiliates/leaderboard/top?limit=20"),
      ]);
      if (!pRes.ok) throw new Error("program");
      if (!lRes.ok) throw new Error("leaderboard");
      setProgram((await pRes.json()) as ProgramPayload);
      setLeaderboard((await lRes.json()) as LeaderRow[]);
    } catch {
      setLoadErr("تعذر تحميل بيانات البرنامج أو لوحة الصدارة. تحقق من الاتصال بالـ API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const n = leaderboard.length;
    const totalComm = leaderboard.reduce((a, r) => a + (r.commission || 0), 0);
    const hireReady = leaderboard.filter((r) => r.status === "employed" || r.deals >= 10).length;
    return { n, totalComm, hireReady };
  }, [leaderboard]);

  const shareOnboarding = (name: string, hint: string) => {
    const text = `مرحباً ${name}، رابط انضمامك كشريك Dealix: https://dealix.sa/affiliate — مرجع: ${hint}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({ title: "Dealix — شراكة", text, url: "https://dealix.sa" });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">👥 الشركاء والمسوقين</h1>
          <p className="text-muted-foreground max-w-xl">
            رحلة كاملة من التسجيل إلى العمولة والترقية، مع لوحة صدارة حية من الـ API ومشهد ثلاثي الأبعاد تفاعلي.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            تصدير
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/25 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            إضافة مسوق
          </button>
        </div>
      </div>

      {loadErr && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 flex items-center justify-between gap-4">
          <span>{loadErr}</span>
          <button type="button" onClick={() => void load()} className="shrink-0 text-primary font-medium underline">
            إعادة المحاولة
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch">
        <div className="space-y-6">
          <div className="glass-card border border-border/50 p-6">
            <div className="mb-4 flex items-center gap-2 text-primary">
              <Route className="h-5 w-5" />
              <h2 className="text-lg font-bold">{program?.title_ar ?? "رحلة المسوق"}</h2>
            </div>
            {loading && !program ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> جاري تحميل الخطوات…
              </div>
            ) : (
              <ol className="space-y-4">
                <AnimatePresence>
                  {(program?.journey_ar ?? []).map((j, i) => (
                    <motion.li
                      key={j.step}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-4 rounded-xl border border-border/40 bg-secondary/10 p-4"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                        {j.step}
                      </span>
                      <div>
                        <div className="font-semibold">{j.title}</div>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{j.detail_ar}</p>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
            )}
            {program?.auto_employ_rule_ar && (
              <p className="mt-4 text-xs text-muted-foreground border-t border-border/40 pt-4">{program.auto_employ_rule_ar}</p>
            )}
          </div>

          {program?.commission_rates && (
            <div className="glass-card border border-primary/25 bg-primary/5 p-6">
              <div className="mb-3 flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-bold">شرائح العمولة (من الـ API)</h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {Object.entries(program.commission_rates).map(([plan, v]) => (
                  <div key={plan} className="rounded-xl border border-border/50 bg-card/60 p-4 text-center">
                    <div className="text-xs uppercase text-muted-foreground">{plan}</div>
                    <div className="mt-1 text-lg font-bold">{formatSar(v.price)}</div>
                    <div className="text-sm text-emerald-500 font-medium">{(v.rate * 100).toFixed(0)}% عمولة</div>
                  </div>
                ))}
              </div>
              {program.bonus_tiers?.length ? (
                <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
                  {program.bonus_tiers.map((t) => (
                    <li key={t.min_deals}>
                      من {t.min_deals} صفقات: مكافأة {formatSar(t.bonus)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <AffiliateNetworkOrb />
          <p className="text-center text-xs text-muted-foreground px-2">
            تفاعل ثلاثي الأبعاد عبر React Three Fiber — مناسب لصفحات التسويق والشراكة دون إعادة تحميل كاملة للصفحة.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border border-border/50">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1">{stats.n}</h3>
          <p className="text-sm text-muted-foreground font-medium">في لوحة الصدارة (نشط / مُوظّف)</p>
        </div>

        <div className="glass-card p-6 border border-border/50">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1">{formatSar(stats.totalComm)}</h3>
          <p className="text-sm text-muted-foreground font-medium">مجموع عمولات المعروضين</p>
        </div>

        <div className="glass-card p-6 border border-primary/30 bg-primary/5">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1 text-primary">{stats.hireReady}</h3>
          <p className="text-sm text-muted-foreground font-medium">بمعايير أداء عالية (10+ صفقات أو employed)</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden border border-border/50">
        <div className="flex justify-between items-center p-6 border-b border-border/50 bg-secondary/10">
          <h2 className="text-lg font-bold">لوحة الصدارة (من الـ API)</h2>
          <button
            type="button"
            className="flex items-center gap-2 p-2 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span className="text-sm">تصفية</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-secondary/30 text-muted-foreground">
              <tr>
                <th className="py-4 px-6 font-medium">#</th>
                <th className="py-4 px-6 font-medium">الاسم</th>
                <th className="py-4 px-6 font-medium">الحالة</th>
                <th className="py-4 px-6 font-medium">الصفقات</th>
                <th className="py-4 px-6 font-medium">العمولة المتراكمة</th>
                <th className="py-4 px-6 font-medium">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {leaderboard.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    لا بيانات بعد — سجّل أول مسوق عبر{" "}
                    <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">POST /api/v1/affiliates/register</code>
                  </td>
                </tr>
              ) : (
                leaderboard.map((aff, i) => (
                  <tr key={`${aff.name}-${i}`} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6 font-mono text-muted-foreground">{i + 1}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-foreground">{aff.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="rounded px-2.5 py-1 text-xs font-medium bg-secondary/80">{statusLabelAr(aff.status)}</span>
                    </td>
                    <td className="py-4 px-6 font-bold">{aff.deals}</td>
                    <td className="py-4 px-6 font-mono text-emerald-500">{formatSar(aff.commission)}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap items-center gap-2">
                        {(aff.deals >= 10 || aff.status === "employed") && (
                          <button
                            type="button"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                          >
                            <Award className="w-3.5 h-3.5" />
                            ترقية
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => shareOnboarding(aff.name, `#${i + 1}`)}
                          className="p-1.5 rounded-lg border border-border bg-card hover:bg-secondary/50 text-muted-foreground hover:text-primary transition-all"
                          title="مشاركة رابط الانضمام"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
