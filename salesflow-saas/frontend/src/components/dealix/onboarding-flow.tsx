'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  UserCircle, Building2, CheckCircle2, PartyPopper,
  Import, MessageCircle, GitBranch, Users,
  ChevronLeft, ChevronRight, Briefcase, Sparkles,
} from 'lucide-react';
import { useI18n } from '@/i18n';

/* ---------- Types ---------- */
type Phase = 'welcome' | 'firstValue' | 'checklist';
type Role = 'salesManager' | 'salesRep' | 'executive' | 'other';
type Industry = 'realEstate' | 'automotive' | 'healthcare' | 'services' | 'other';

interface OnboardingFlowProps {
  onComplete?: () => void;
  className?: string;
}

/* ---------- Animation ---------- */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

/* ---------- Phase 1: Welcome ---------- */
function WelcomePhase({
  role,
  setRole,
  industry,
  setIndustry,
  onNext,
}: {
  role: Role | null;
  setRole: (r: Role) => void;
  industry: Industry | null;
  setIndustry: (i: Industry) => void;
  onNext: () => void;
}) {
  const { t, isArabic } = useI18n();
  const [step, setStep] = useState<'role' | 'industry'>('role');

  const roles: { key: Role; icon: typeof UserCircle }[] = [
    { key: 'salesManager', icon: UserCircle }, { key: 'salesRep', icon: Briefcase },
    { key: 'executive', icon: Building2 }, { key: 'other', icon: Users },
  ];
  const industries: { key: Industry; label: string }[] = [
    { key: 'realEstate', label: t('onboarding.industryRealEstate') }, { key: 'automotive', label: t('onboarding.industryAutomotive') },
    { key: 'healthcare', label: t('onboarding.industryHealthcare') }, { key: 'services', label: t('onboarding.industryServices') },
    { key: 'other', label: t('onboarding.industryOther') },
  ];
  const roleLabels: Record<Role, string> = {
    salesManager: t('onboarding.roleSalesManager'), salesRep: t('onboarding.roleSalesRep'),
    executive: t('onboarding.roleExecutive'), other: t('onboarding.roleOther'),
  };

  return (
    <div className="text-center max-w-md mx-auto">
      <Sparkles className="h-8 w-8 text-teal-400 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-white mb-2">{t('onboarding.welcomeTitle')}</h1>
      <p className="text-sm text-slate-400 mb-8">{t('onboarding.welcomeSubtitle')}</p>

      <AnimatePresence mode="wait" custom={1}>
        {step === 'role' ? (
          <motion.div
            key="role"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <p className="text-sm font-medium text-slate-300 mb-4">
              {t('onboarding.roleQuestion')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => {
                const Icon = r.icon;
                const selected = role === r.key;
                return (
                  <button
                    key={r.key}
                    onClick={() => {
                      setRole(r.key);
                      setTimeout(() => setStep('industry'), 300);
                    }}
                    className={clsx(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200',
                      selected
                        ? 'bg-teal-500/15 border-teal-500/40 text-teal-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/[0.08]',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{roleLabels[r.key]}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="industry"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <p className="text-sm font-medium text-slate-300 mb-4">
              {t('onboarding.industryQuestion')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {industries.map((ind) => {
                const selected = industry === ind.key;
                return (
                  <button
                    key={ind.key}
                    onClick={() => {
                      setIndustry(ind.key);
                      setTimeout(onNext, 400);
                    }}
                    className={clsx(
                      'flex items-center justify-center p-3.5 rounded-xl border text-xs font-medium transition-all duration-200',
                      selected
                        ? 'bg-teal-500/15 border-teal-500/40 text-teal-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/[0.08]',
                    )}
                  >
                    {ind.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setStep('role')}
              className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {isArabic ? (
                <span className="flex items-center gap-1 justify-center"><ChevronRight className="h-3 w-3" />{t('common.back')}</span>
              ) : (
                <span className="flex items-center gap-1 justify-center"><ChevronLeft className="h-3 w-3" />{t('common.back')}</span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Phase 2: First Value ---------- */
function FirstValuePhase({ onNext }: { onNext: () => void }) {
  const { t, isArabic } = useI18n();
  const [created, setCreated] = useState(false);

  const handleCreate = () => {
    setCreated(true);
    setTimeout(onNext, 1800);
  };

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="text-xl font-bold text-white mb-2">{t('onboarding.firstValueTitle')}</h2>
      <p className="text-sm text-slate-400 mb-8">{t('onboarding.firstValueSubtitle')}</p>

      <AnimatePresence mode="wait">
        {!created ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-xl bg-white/5 border border-white/10 p-6 text-start"
          >
            <div className="space-y-3 mb-6">
              <div>
                <label className="text-[11px] text-slate-500 mb-1 block">
                  {isArabic ? 'اسم الصفقة' : 'Deal Name'}
                </label>
                <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-300">
                  {t('onboarding.sampleDealName')}
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 mb-1 block">
                  {isArabic ? 'القيمة' : 'Value'}
                </label>
                <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-300">
                  {isArabic ? 'ر.س' : 'SAR'} {t('onboarding.sampleDealValue')}
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 mb-1 block">
                  {isArabic ? 'جهة الاتصال' : 'Contact'}
                </label>
                <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-300">
                  {t('onboarding.sampleContactName')} — {t('onboarding.sampleCompany')}
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreate}
              className={clsx(
                'w-full rounded-xl py-3 text-sm font-semibold',
                'bg-gradient-to-l from-teal-500 to-emerald-600 text-white',
                'hover:shadow-[0_0_24px_rgba(20,184,166,0.4)]',
                'transition-shadow',
              )}
            >
              {t('onboarding.createDeal')}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="py-10"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.6 }}
            >
              <PartyPopper className="h-14 w-14 text-amber-400 mx-auto mb-4" />
            </motion.div>
            <p className="text-lg font-bold text-white">{t('onboarding.celebration')}</p>
            <p className="text-sm text-teal-400 mt-1">{t('onboarding.dealCreated')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Phase 3: Checklist ---------- */
interface ChecklistItem {
  key: string;
  label: string;
  icon: typeof Import;
  done: boolean;
}

function ChecklistPhase({ onComplete }: { onComplete?: () => void }) {
  const { t } = useI18n();

  const [items, setItems] = useState<ChecklistItem[]>([
    { key: 'import', label: t('onboarding.checkImportContacts'), icon: Import, done: false },
    { key: 'whatsapp', label: t('onboarding.checkConnectWhatsApp'), icon: MessageCircle, done: false },
    { key: 'pipeline', label: t('onboarding.checkSetupPipeline'), icon: GitBranch, done: false },
    { key: 'team', label: t('onboarding.checkInviteTeam'), icon: Users, done: false },
  ]);

  const doneCount = items.filter((i) => i.done).length;
  const progress = Math.round((doneCount / items.length) * 100);

  const toggleItem = useCallback((key: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, done: !item.done } : item,
      ),
    );
  }, []);

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-lg font-bold text-white mb-1">{t('onboarding.checklistTitle')}</h2>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-6 mt-3">
        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-teal-400 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-xs text-slate-400 tabular-nums">
          {progress}% {t('onboarding.checklistProgress')}
        </span>
      </div>

      {/* Items */}
      <ul className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <motion.li
              key={item.key}
              whileHover={{ x: 2 }}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer',
                item.done
                  ? 'bg-teal-500/10 border-teal-500/25'
                  : 'bg-white/5 border-white/10 hover:bg-white/[0.08]',
              )}
              onClick={() => toggleItem(item.key)}
            >
              {item.done ? (
                <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-slate-600 shrink-0" />
              )}
              <Icon className={clsx('h-4 w-4 shrink-0', item.done ? 'text-teal-400' : 'text-slate-500')} />
              <span className={clsx('text-sm flex-1', item.done ? 'text-teal-300 line-through' : 'text-slate-300')}>
                {item.label}
              </span>
            </motion.li>
          );
        })}
      </ul>

      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onComplete}
            className={clsx(
              'px-8 py-3 rounded-xl text-sm font-semibold',
              'bg-gradient-to-l from-teal-500 to-emerald-600 text-white',
              'hover:shadow-[0_0_24px_rgba(20,184,166,0.4)]',
              'transition-shadow',
            )}
          >
            {t('common.getStarted')}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

/* ---------- Main Onboarding Flow ---------- */
function OnboardingFlow({ onComplete, className }: OnboardingFlowProps) {
  const { dir } = useI18n();
  const [phase, setPhase] = useState<Phase>('welcome');
  const [direction, setDirection] = useState(1);
  const [role, setRole] = useState<Role | null>(null);
  const [industry, setIndustry] = useState<Industry | null>(null);

  const goTo = useCallback((next: Phase) => {
    const order: Phase[] = ['welcome', 'firstValue', 'checklist'];
    setDirection(order.indexOf(next) > order.indexOf(phase) ? 1 : -1);
    setPhase(next);
  }, [phase]);

  const phases: Phase[] = ['welcome', 'firstValue', 'checklist'];
  const currentIdx = phases.indexOf(phase);

  return (
    <div
      dir={dir}
      className={clsx(
        'min-h-[480px] flex flex-col items-center justify-center px-4 py-12',
        className,
      )}
    >
      {/* Phase indicators */}
      <div className="flex items-center gap-2 mb-10">
        {phases.map((p, i) => (
          <div
            key={p}
            className={clsx(
              'h-1.5 rounded-full transition-all duration-300',
              i === currentIdx ? 'w-8 bg-teal-400' : i < currentIdx ? 'w-4 bg-teal-600' : 'w-4 bg-slate-700',
            )}
          />
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={phase}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="w-full max-w-lg"
        >
          {phase === 'welcome' && (
            <WelcomePhase
              role={role}
              setRole={setRole}
              industry={industry}
              setIndustry={setIndustry}
              onNext={() => goTo('firstValue')}
            />
          )}
          {phase === 'firstValue' && (
            <FirstValuePhase onNext={() => goTo('checklist')} />
          )}
          {phase === 'checklist' && (
            <ChecklistPhase onComplete={onComplete} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export { OnboardingFlow };
export type { OnboardingFlowProps };
