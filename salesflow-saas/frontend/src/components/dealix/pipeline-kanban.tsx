"use client";

import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  GripVertical,
  Building2,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  X,
} from "lucide-react";

/* ───────────── types ───────────── */
interface Deal {
  id: string;
  company: string;
  value: number;
  rep: string;
  daysInStage: number;
  note?: string;
  probability: number;
}

interface Stage {
  id: string;
  label: string;
  color: string;        // tailwind ring/border colour
  headerBg: string;     // gradient header
  dotColor: string;
  deals: Deal[];
}

/* ───────────── sample data ───────────── */
const initialStages: Stage[] = [
  {
    id: "new",
    label: "جديد",
    color: "border-blue-500",
    headerBg: "from-blue-600 to-blue-400",
    dotColor: "bg-blue-500",
    deals: [
      { id: "d1", company: "شركة الأفق التقنية", value: 45_000, rep: "سالم", daysInStage: 2, probability: 10, note: "تواصل أولي عبر واتساب" },
      { id: "d2", company: "مؤسسة الوفاء", value: 22_000, rep: "نورة", daysInStage: 5, probability: 15 },
    ],
  },
  {
    id: "negotiation",
    label: "تفاوض",
    color: "border-yellow-500",
    headerBg: "from-yellow-500 to-amber-400",
    dotColor: "bg-yellow-500",
    deals: [
      { id: "d3", company: "مجموعة الرواد", value: 125_000, rep: "فهد", daysInStage: 8, probability: 45, note: "اجتماع مع المدير التنفيذي يوم الأحد" },
    ],
  },
  {
    id: "proposal",
    label: "عرض سعر",
    color: "border-orange-500",
    headerBg: "from-orange-500 to-orange-400",
    dotColor: "bg-orange-500",
    deals: [
      { id: "d4", company: "مصنع الشرق", value: 310_000, rep: "سالم", daysInStage: 3, probability: 60 },
      { id: "d5", company: "حلول البيانات", value: 88_000, rep: "نورة", daysInStage: 12, probability: 55, note: "بانتظار موافقة المشتريات" },
    ],
  },
  {
    id: "won",
    label: "فوز",
    color: "border-emerald-500",
    headerBg: "from-emerald-500 to-green-400",
    dotColor: "bg-emerald-500",
    deals: [
      { id: "d6", company: "شركة النخبة", value: 200_000, rep: "فهد", daysInStage: 0, probability: 100 },
    ],
  },
  {
    id: "lost",
    label: "خسارة",
    color: "border-red-500",
    headerBg: "from-red-500 to-rose-400",
    dotColor: "bg-red-500",
    deals: [
      { id: "d7", company: "مؤسسة السلام", value: 60_000, rep: "نورة", daysInStage: 0, probability: 0, note: "اختاروا منافس أرخص" },
    ],
  },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(n);

/* ───────────── progress dots ───────────── */
const stageOrder = ["new", "negotiation", "proposal", "won", "lost"];
function ProgressDots({ stageId }: { stageId: string }) {
  const idx = stageOrder.indexOf(stageId);
  const isLost = stageId === "lost";
  return (
    <div className="flex gap-1 mt-2">
      {stageOrder.slice(0, 4).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            isLost
              ? "w-3 bg-red-500/40"
              : i <= idx
              ? "w-5 bg-emerald-400"
              : "w-3 bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}

/* ───────────── deal card ───────────── */
function DealCard({ deal, stageId }: { deal: Deal; stageId: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.12}
      className="group relative cursor-grab active:cursor-grabbing rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-4 shadow-lg hover:border-white/20 transition-colors"
    >
      {/* drag handle */}
      <GripVertical className="absolute top-4 left-2 w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />

      {/* header */}
      <div className="flex items-start justify-between gap-2 pr-0 pl-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-white/40 shrink-0" />
            <h4 className="font-bold text-sm truncate">{deal.company}</h4>
          </div>
          <p className="text-lg font-black mt-1 tracking-tight text-teal-400">
            {fmt(deal.value)} <span className="text-xs font-medium text-white/40">ر.س</span>
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-white/50" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/50" />
          )}
        </button>
      </div>

      {/* meta row */}
      <div className="flex items-center gap-3 mt-3 text-[11px] text-white/50">
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {deal.rep}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {deal.daysInStage} يوم
        </span>
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {deal.probability}٪
        </span>
      </div>

      <ProgressDots stageId={stageId} />

      {/* expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/60 space-y-2">
              {deal.note && <p>{deal.note}</p>}
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 transition-colors font-medium">
                  فتح الصفقة
                </button>
                <button className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors font-medium">
                  تعديل
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ───────────── empty state ───────────── */
function EmptyColumn() {
  return (
    <div className="flex-1 flex items-center justify-center rounded-2xl border-2 border-dashed border-white/10 p-6 text-center">
      <p className="text-sm text-white/30 font-medium">لا توجد صفقات</p>
    </div>
  );
}

/* ───────────── column ───────────── */
function StageColumn({ stage }: { stage: Stage }) {
  const total = stage.deals.reduce((s, d) => s + d.value, 0);
  const [deals, setDeals] = useState(stage.deals);

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] shrink-0 lg:min-w-0 lg:w-auto lg:flex-1">
      {/* header */}
      <div
        className={`rounded-2xl bg-gradient-to-l ${stage.headerBg} p-4 mb-3 shadow-lg`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-black/60 bg-black/10 px-2 py-0.5 rounded-full">
            {deals.length}
          </span>
          <h3 className="font-black text-black text-base">{stage.label}</h3>
        </div>
        <p className="text-left text-sm font-bold text-black/70 mt-1">
          {fmt(total)} <span className="text-[10px]">ر.س</span>
        </p>
      </div>

      {/* cards */}
      <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-260px)] pe-1 scrollbar-thin">
        {deals.length === 0 ? (
          <EmptyColumn />
        ) : (
          <Reorder.Group
            axis="y"
            values={deals}
            onReorder={setDeals}
            className="space-y-3"
          >
            {deals.map((deal) => (
              <Reorder.Item key={deal.id} value={deal}>
                <DealCard deal={deal} stageId={stage.id} />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}

/* ───────────── main component ───────────── */
export function PipelineKanban() {
  const [stages] = useState<Stage[]>(initialStages);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      {/* title bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black">خط الصفقات</h2>
          <p className="text-sm text-white/40 mt-0.5">
            إجمالي: {fmt(stages.flatMap((s) => s.deals).reduce((a, d) => a + d.value, 0))} ر.س
            &nbsp;|&nbsp; {stages.flatMap((s) => s.deals).length} صفقة
          </p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-teal-500/20 text-teal-300 text-sm font-bold hover:bg-teal-500/30 transition-colors">
          + صفقة جديدة
        </button>
      </div>

      {/* kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory lg:snap-none">
        {stages.map((stage, i) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="snap-start flex flex-col min-w-[280px] w-[280px] shrink-0 lg:min-w-0 lg:w-auto lg:flex-1"
          >
            <StageColumn stage={stage} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
