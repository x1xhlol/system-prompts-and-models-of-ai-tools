"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { TrendingUp, Sparkles, UserCheck, MousePointerClick, Target } from "lucide-react";

/* ───────────── types ───────────── */
interface BreakdownItem {
  key: string;
  label: string;
  value: number; // 0-25
  icon: typeof TrendingUp;
}

interface LeadScoreData {
  score: number; // 0-100
  breakdown: BreakdownItem[];
  recommendation: string;
}

/* ───────────── helpers ───────────── */
function getGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#10b981"; // green
  if (score >= 50) return "#eab308"; // yellow
  return "#ef4444"; // red
}

function getGradientId(score: number): string {
  return `score-gradient-${score}`;
}

/* ───────────── sample data ───────────── */
const sampleData: LeadScoreData = {
  score: 78,
  breakdown: [
    { key: "engagement", label: "التفاعل", value: 22, icon: MousePointerClick },
    { key: "profile", label: "الملف الشخصي", value: 18, icon: UserCheck },
    { key: "behavior", label: "السلوك", value: 20, icon: TrendingUp },
    { key: "intent", label: "نية الشراء", value: 18, icon: Target },
  ],
  recommendation: "عميل واعد — تابع خلال ٢٤ ساعة",
};

/* ───────────── circular ring ───────────── */
function ScoreRing({
  score,
  size = 160,
  strokeWidth = 10,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const motionProgress = useMotionValue(0);
  const strokeDashoffset = useTransform(
    motionProgress,
    (v) => circumference - (v / 100) * circumference
  );
  const displayScore = useMotionValue(0);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const anim = animate(motionProgress, score, { duration: 1.4, ease: "easeOut" });
    const anim2 = animate(displayScore, score, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplayed(Math.round(v)),
    });
    return () => {
      anim.stop();
      anim2.stop();
    };
  }, [score, motionProgress, displayScore]);

  const color = getScoreColor(score);
  const grade = getGrade(score);
  const gradientId = getGradientId(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        {/* background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
        />
      </svg>

      {/* center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black tabular-nums" style={{ color }}>
          {displayed}
        </span>
        <span
          className="text-sm font-bold mt-0.5 px-2 py-0.5 rounded-md"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {grade}
        </span>
      </div>
    </div>
  );
}

/* ───────────── breakdown bar ───────────── */
function BreakdownBar({
  item,
  delay,
}: {
  item: BreakdownItem;
  delay: number;
}) {
  const Icon = item.icon;
  const pct = (item.value / 25) * 100;
  const color = getScoreColor(item.value * 4); // scale 0-25 -> 0-100

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold tabular-nums" style={{ color }}>
          {item.value}/٢٥
        </span>
        <div className="flex items-center gap-2">
          <span className="font-medium text-white/70">{item.label}</span>
          <div className="p-1 rounded-md bg-white/5">
            <Icon className="w-3.5 h-3.5 text-white/40" />
          </div>
        </div>
      </div>
      <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

/* ───────────── full variant ───────────── */
export function LeadScoreCard({
  data = sampleData,
  variant = "full",
}: {
  data?: LeadScoreData;
  variant?: "full" | "compact";
}) {
  if (variant === "compact") {
    return <LeadScoreCompact data={data} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-6 max-w-sm w-full"
      dir="rtl"
    >
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div className="p-2 rounded-xl bg-teal-500/10">
          <Sparkles className="w-5 h-5 text-teal-400" />
        </div>
        <h3 className="font-black text-base">تقييم العميل الذكي</h3>
      </div>

      {/* ring */}
      <div className="flex justify-center mb-6">
        <ScoreRing score={data.score} />
      </div>

      {/* breakdown */}
      <div className="space-y-4 mb-6">
        {data.breakdown.map((item, i) => (
          <BreakdownBar key={item.key} item={item} delay={0.3 + i * 0.1} />
        ))}
      </div>

      {/* recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="rounded-2xl bg-teal-500/10 border border-teal-500/20 p-4 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold text-teal-300">توصية الذكاء الاصطناعي</span>
        </div>
        <p className="text-sm font-medium text-white/80">{data.recommendation}</p>
      </motion.div>
    </motion.div>
  );
}

/* ───────────── compact variant ───────────── */
function LeadScoreCompact({ data }: { data: LeadScoreData }) {
  const color = getScoreColor(data.score);
  const grade = getGrade(data.score);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-3"
      dir="rtl"
    >
      {/* mini ring */}
      <ScoreRing score={data.score} size={56} strokeWidth={5} />

      {/* info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-black text-lg tabular-nums" style={{ color }}>
            {data.score}
          </span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {grade}
          </span>
        </div>
        <p className="text-xs text-white/50 truncate mt-0.5">{data.recommendation}</p>
      </div>

      {/* mini bars */}
      <div className="flex gap-1 items-end h-8">
        {data.breakdown.map((item) => (
          <motion.div
            key={item.key}
            className="w-2 rounded-full"
            style={{ backgroundColor: getScoreColor(item.value * 4) }}
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / 25) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </div>
    </motion.div>
  );
}
