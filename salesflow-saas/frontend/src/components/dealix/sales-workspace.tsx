'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import {
  Users, CalendarPlus, Briefcase, TrendingUp, Clock, Zap,
  CheckCircle2, Circle, AlertTriangle, MessageSquare, Phone,
  ArrowUpRight, Sparkles, ChevronLeft, ChevronRight,
  FileText, InboxIcon,
} from 'lucide-react';
import { useI18n } from '@/i18n';
import { KpiCard } from '@/components/ui/kpi-card';
import { EmptyState } from '@/components/ui/empty-state';

/* ---------- Types ---------- */
interface Task {
  id: string;
  title: string;
  dueStatus: 'overdue' | 'today' | 'upcoming';
  time?: string;
}

interface Deal {
  id: string;
  name: string;
  value: number;
  stage: string;
  stageColor: string;
}

interface Activity {
  id: string;
  type: 'message' | 'call' | 'dealUpdate' | 'noteAdded';
  text: string;
  time: string;
}

interface AiInsight {
  id: string;
  type: 'followUp' | 'closing' | 'risk';
  count: number;
}

interface SalesWorkspaceProps {
  userName?: string;
  kpis?: {
    totalLeads: number;
    newToday: number;
    openDeals: number;
    wonValue: number;
    conversionRate: number;
    responseTime: number;
  };
  tasks?: Task[];
  deals?: Deal[];
  activities?: Activity[];
  insights?: AiInsight[];
  className?: string;
}

/* ---------- Demo data ---------- */
const demoKpis = {
  totalLeads: 1247,
  newToday: 18,
  openDeals: 43,
  wonValue: 892500,
  conversionRate: 34,
  responseTime: 12,
};

const demoTasks: Task[] = [
  { id: '1', title: 'متابعة أحمد الشمري — عرض عقار', dueStatus: 'overdue', time: 'أمس' },
  { id: '2', title: 'اتصال مع نورة — عرض سعر', dueStatus: 'today', time: '2:00 م' },
  { id: '3', title: 'إرسال عقد لشركة المستقبل', dueStatus: 'today', time: '4:30 م' },
  { id: '4', title: 'جدولة عرض تقديمي', dueStatus: 'upcoming', time: 'غداً' },
];

const demoDeals: Deal[] = [
  { id: '1', name: 'صفقة أبراج الرياض', value: 2500000, stage: 'تفاوض', stageColor: 'bg-amber-500' },
  { id: '2', name: 'مشروع المجمع التجاري', value: 1800000, stage: 'عرض سعر', stageColor: 'bg-teal-500' },
  { id: '3', name: 'فيلا حي النرجس', value: 950000, stage: 'مؤهّل', stageColor: 'bg-blue-500' },
  { id: '4', name: 'مكاتب طريق الملك', value: 780000, stage: 'تفاوض', stageColor: 'bg-amber-500' },
  { id: '5', name: 'شقق حي الملقا', value: 650000, stage: 'عرض سعر', stageColor: 'bg-teal-500' },
];

const demoActivities: Activity[] = [
  { id: '1', type: 'message', text: 'رسالة من أحمد: "ابي تفاصيل العرض"', time: 'منذ 5 دقائق' },
  { id: '2', type: 'call', text: 'مكالمة مع نورة — 8 دقائق', time: 'منذ 30 دقيقة' },
  { id: '3', type: 'dealUpdate', text: 'صفقة أبراج الرياض انتقلت لمرحلة التفاوض', time: 'منذ ساعة' },
  { id: '4', type: 'noteAdded', text: 'ملاحظة على فيلا النرجس: العميل يبي جراج إضافي', time: 'منذ 2 ساعة' },
];

const demoInsights: AiInsight[] = [
  { id: '1', type: 'followUp', count: 3 },
  { id: '2', type: 'closing', count: 2 },
  { id: '3', type: 'risk', count: 1 },
];

/* ---------- Sub-components ---------- */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className={clsx(
        'rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-5',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: typeof Users; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-4 w-4 text-teal-400" />
      <h2 className="text-sm font-semibold text-slate-300">{title}</h2>
    </div>
  );
}

const activityIcons: Record<Activity['type'], typeof MessageSquare> = {
  message: MessageSquare,
  call: Phone,
  dealUpdate: ArrowUpRight,
  noteAdded: FileText,
};

const taskStatusStyles: Record<Task['dueStatus'], { dot: string; text: string }> = {
  overdue: { dot: 'bg-rose-500', text: 'text-rose-400' },
  today: { dot: 'bg-amber-500', text: 'text-amber-400' },
  upcoming: { dot: 'bg-slate-500', text: 'text-slate-400' },
};

const insightIcons: Record<AiInsight['type'], { icon: typeof Sparkles; color: string }> = {
  followUp: { icon: Clock, color: 'text-amber-400' },
  closing: { icon: TrendingUp, color: 'text-emerald-400' },
  risk: { icon: AlertTriangle, color: 'text-rose-400' },
};

/* ---------- Main ---------- */
function SalesWorkspace({
  userName,
  kpis: kpisProp,
  tasks: tasksProp,
  deals: dealsProp,
  activities: activitiesProp,
  insights: insightsProp,
  className,
}: SalesWorkspaceProps) {
  const { t, dir, locale, isArabic } = useI18n();

  const kpis = kpisProp ?? demoKpis;
  const tasks = tasksProp ?? demoTasks;
  const deals = dealsProp ?? demoDeals;
  const activities = activitiesProp ?? demoActivities;
  const insights = insightsProp ?? demoInsights;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const base = hour < 17 ? t('workspace.greeting') : t('workspace.greetingEvening');
    return userName ? `${base}، ${userName}` : base;
  }, [t, userName]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(val);

  const kpiDefs = [
    { key: 'totalLeads', value: kpis.totalLeads, label: t('dashboard.kpis.totalLeads'), icon: Users, trend: { direction: 'up' as const, percentage: 12 }, sparkline: [30, 42, 38, 55, 52, 68, 62] },
    { key: 'newToday', value: kpis.newToday, label: t('dashboard.kpis.newToday'), icon: CalendarPlus, trend: { direction: 'up' as const, percentage: 8 }, sparkline: [5, 8, 12, 9, 15, 11, 18] },
    { key: 'openDeals', value: kpis.openDeals, label: t('dashboard.kpis.openDeals'), icon: Briefcase, trend: { direction: 'up' as const, percentage: 5 }, sparkline: [28, 35, 31, 40, 38, 42, 43] },
    { key: 'wonValue', value: kpis.wonValue, label: t('dashboard.kpis.wonValue'), prefix: isArabic ? 'ر.س' : 'SAR', trend: { direction: 'up' as const, percentage: 22 }, sparkline: [400, 520, 480, 650, 720, 810, 892] },
    { key: 'conversionRate', value: kpis.conversionRate, label: t('dashboard.kpis.conversionRate'), suffix: '%', trend: { direction: 'down' as const, percentage: 3 }, sparkline: [38, 36, 35, 37, 34, 33, 34] },
    { key: 'responseTime', value: kpis.responseTime, label: t('dashboard.kpis.responseTime'), suffix: t('workspace.kpiResponseUnit'), trend: { direction: 'up' as const, percentage: 15 }, sparkline: [20, 18, 15, 14, 13, 12, 12] },
  ];

  const insightLabel = (i: AiInsight) => {
    const labels: Record<AiInsight['type'], string> = {
      followUp: t('workspace.aiInsightFollowUp'),
      closing: t('workspace.aiInsightClosing'),
      risk: t('workspace.aiInsightRisk'),
    };
    return `${i.count} ${labels[i.type]}`;
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      dir={dir}
      className={clsx('space-y-6', className)}
    >
      {/* Greeting */}
      <motion.h1
        variants={fadeUp}
        className="text-2xl font-bold text-white"
      >
        {greeting}
      </motion.h1>

      {/* KPI Bar */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiDefs.map((k) => (
          <KpiCard
            key={k.key}
            value={k.value}
            label={k.label}
            prefix={k.prefix}
            suffix={k.suffix}
            trend={k.trend}
            sparklineData={k.sparkline}
            variant="compact"
          />
        ))}
      </motion.div>

      {/* 3-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: Tasks */}
        <GlassCard className="lg:col-span-3">
          <SectionHeader icon={CheckCircle2} title={t('workspace.todaysTasks')} />
          {tasks.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title={t('workspace.noTasks')}
              className="py-8"
            />
          ) : (
            <ul className="space-y-2">
              {tasks.map((task) => {
                const style = taskStatusStyles[task.dueStatus];
                return (
                  <li
                    key={task.id}
                    className="flex items-start gap-2.5 py-2 border-b border-white/5 last:border-0"
                  >
                    <span className={clsx('mt-1.5 h-2 w-2 rounded-full shrink-0', style.dot)} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-200 truncate">{task.title}</p>
                      <p className={clsx('text-xs mt-0.5', style.text)}>{task.time}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </GlassCard>

        {/* CENTER: Hot Deals */}
        <GlassCard className="lg:col-span-5">
          <SectionHeader icon={Briefcase} title={t('workspace.hotDeals')} />
          {deals.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={t('workspace.noDeals')}
              className="py-8"
            />
          ) : (
            <div className="space-y-2">
              {deals.map((deal, idx) => (
                <div
                  key={deal.id}
                  className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0"
                >
                  <span className="text-xs text-slate-500 w-5 text-center tabular-nums">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{deal.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={clsx('h-1.5 w-1.5 rounded-full', deal.stageColor)} />
                      <span className="text-xs text-slate-400">{deal.stage}</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-teal-400 tabular-nums whitespace-nowrap">
                    {formatCurrency(deal.value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* RIGHT: Activity */}
        <GlassCard className="lg:col-span-4">
          <SectionHeader icon={Clock} title={t('workspace.recentActivity')} />
          {activities.length === 0 ? (
            <EmptyState
              icon={InboxIcon}
              title={t('workspace.noActivity')}
              className="py-8"
            />
          ) : (
            <ul className="space-y-3">
              {activities.map((act) => {
                const Icon = activityIcons[act.type];
                return (
                  <li key={act.id} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-white/5 p-1.5">
                      <Icon className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-200 leading-snug">{act.text}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{act.time}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </GlassCard>
      </div>

      {/* AI Insights */}
      <GlassCard className="border-teal-500/20 bg-gradient-to-l from-teal-500/5 to-transparent">
        <SectionHeader icon={Sparkles} title={t('workspace.aiInsights')} />
        <div className="flex flex-wrap gap-3">
          {insights.map((insight) => {
            const { icon: Icon, color } = insightIcons[insight.type];
            return (
              <motion.div
                key={insight.id}
                whileHover={{ scale: 1.03 }}
                className={clsx(
                  'flex items-center gap-2.5 px-4 py-2.5 rounded-lg',
                  'bg-white/5 border border-white/10',
                  'cursor-pointer hover:bg-white/[0.08] transition-colors',
                )}
              >
                <Icon className={clsx('h-4 w-4', color)} />
                <span className="text-sm text-slate-200">{insightLabel(insight)}</span>
                {isArabic ? (
                  <ChevronLeft className="h-3.5 w-3.5 text-slate-500" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                )}
              </motion.div>
            );
          })}
        </div>
      </GlassCard>
    </motion.div>
  );
}

export { SalesWorkspace };
export type { SalesWorkspaceProps, Task, Deal, Activity, AiInsight };
