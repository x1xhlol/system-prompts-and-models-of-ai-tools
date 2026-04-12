'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  Search, Plus, MessageSquare, BarChart3, Settings,
  Users, Briefcase, ArrowRight, Clock, Inbox,
  LayoutDashboard, UserPlus, CheckSquare, Megaphone,
} from 'lucide-react';
import { useI18n } from '@/i18n';

type CommandCategory = 'recent' | 'navigation' | 'actions' | 'contacts' | 'deals';

interface CommandItem {
  id: string;
  label: string;
  labelAr: string;
  category: CommandCategory;
  icon: typeof Search;
  keywords: string[];
  onSelect?: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (item: CommandItem) => void;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -8 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: -8 },
};

function buildItems(t: (k: string) => string): CommandItem[] {
  return [
    { id: 'nav-dashboard', label: 'Dashboard', labelAr: t('dashboard.tabs.overview'), category: 'navigation', icon: LayoutDashboard, keywords: ['home', 'لوحة', 'loha', 'dashboard'] },
    { id: 'nav-pipeline', label: 'Pipeline', labelAr: t('dashboard.tabs.pipeline'), category: 'navigation', icon: Briefcase, keywords: ['deals', 'مسار', 'masar', 'pipeline', 'صفقات'] },
    { id: 'nav-inbox', label: 'Inbox', labelAr: t('dashboard.tabs.inbox'), category: 'navigation', icon: Inbox, keywords: ['messages', 'صندوق', 'sandoq', 'inbox', 'رسائل'] },
    { id: 'nav-analytics', label: 'Analytics', labelAr: t('dashboard.tabs.analytics'), category: 'navigation', icon: BarChart3, keywords: ['reports', 'تحليلات', 'tahlilat', 'analytics', 'تقارير'] },
    { id: 'nav-leads', label: 'Leads', labelAr: t('dashboard.tabs.leads'), category: 'navigation', icon: Users, keywords: ['clients', 'عملاء', '3omala', 'leads'] },
    { id: 'nav-settings', label: 'Settings', labelAr: t('dashboard.tabs.settings'), category: 'navigation', icon: Settings, keywords: ['config', 'إعدادات', 'e3dadat', 'settings'] },
    { id: 'nav-marketers', label: 'Marketers', labelAr: t('commandPalette.actions.goToMarketers'), category: 'navigation', icon: Megaphone, keywords: ['affiliate', 'مسوقين', 'msawqin', 'marketers'] },
    { id: 'act-new-deal', label: 'Create New Deal', labelAr: t('commandPalette.actions.newDeal'), category: 'actions', icon: Plus, keywords: ['new', 'deal', 'صفقة', 'safqa', 'جديد', 'jadid', 'create'] },
    { id: 'act-new-contact', label: 'Add Contact', labelAr: t('commandPalette.actions.newContact'), category: 'actions', icon: UserPlus, keywords: ['contact', 'add', 'إضافة', 'edafa', 'جهة', 'jiha'] },
    { id: 'act-new-task', label: 'Create Task', labelAr: t('commandPalette.actions.newTask'), category: 'actions', icon: CheckSquare, keywords: ['task', 'مهمة', 'muhimma', 'todo'] },
    { id: 'act-send-msg', label: 'Send Message', labelAr: t('commandPalette.actions.sendMessage'), category: 'actions', icon: MessageSquare, keywords: ['message', 'رسالة', 'risala', 'whatsapp', 'واتساب'] },
  ];
}

function fuzzyMatch(query: string, item: CommandItem, isArabic: boolean): boolean {
  const q = query.toLowerCase();
  const haystack = [
    item.label.toLowerCase(),
    item.labelAr,
    ...item.keywords.map((k) => k.toLowerCase()),
  ].join(' ');
  return haystack.includes(q);
}

function CommandPalette({ open, onClose, onSelect }: CommandPaletteProps) {
  const { t, dir, isArabic } = useI18n();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allItems = useMemo(() => buildItems(t), [t]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 8);
    return allItems.filter((item) => fuzzyMatch(query, item, isArabic));
  }, [query, allItems, isArabic]);

  const grouped = useMemo(() => {
    const map = new Map<CommandCategory, CommandItem[]>();
    for (const item of filtered) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [filtered]);

  const flatItems = useMemo(() => filtered, [filtered]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleSelect = useCallback(
    (item: CommandItem) => {
      onSelect?.(item);
      item.onSelect?.();
      onClose();
    },
    [onSelect, onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % flatItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + flatItems.length) % flatItems.length);
      } else if (e.key === 'Enter' && flatItems[activeIndex]) {
        e.preventDefault();
        handleSelect(flatItems[activeIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [flatItems, activeIndex, handleSelect, onClose],
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const categoryLabel = (cat: CommandCategory) =>
    t(`commandPalette.categories.${cat}`);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette"
            dir={dir}
            className={clsx(
              'relative z-10 w-full max-w-lg',
              'bg-[#0A0F1C]/95 backdrop-blur-2xl',
              'border border-white/10 rounded-2xl',
              'shadow-2xl shadow-black/50',
              'overflow-hidden',
            )}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search className="h-4.5 w-4.5 text-slate-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('commandPalette.placeholder')}
                className={clsx(
                  'flex-1 bg-transparent text-sm text-white',
                  'placeholder:text-slate-500',
                  'outline-none',
                )}
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="hidden sm:inline-flex items-center rounded-md px-1.5 py-0.5 bg-white/[0.06] border border-white/10 text-[11px] text-slate-500 font-mono">
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[340px] overflow-y-auto py-2">
              {flatItems.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  {t('commandPalette.noResults')} &ldquo;{query}&rdquo;
                </div>
              ) : (
                Array.from(grouped.entries()).map(([category, items]) => (
                  <div key={category} className="mb-1 last:mb-0">
                    <p className="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      {categoryLabel(category)}
                    </p>
                    {items.map((item) => {
                      const globalIdx = flatItems.indexOf(item);
                      const isActive = globalIdx === activeIndex;
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setActiveIndex(globalIdx)}
                          className={clsx(
                            'flex items-center gap-3 w-full px-4 py-2.5 text-start',
                            'transition-colors duration-100',
                            isActive
                              ? 'bg-teal-500/10 text-white'
                              : 'text-slate-300 hover:bg-white/5',
                          )}
                        >
                          <Icon
                            className={clsx(
                              'h-4 w-4 shrink-0',
                              isActive ? 'text-teal-400' : 'text-slate-500',
                            )}
                          />
                          <span className="flex-1 text-sm truncate">
                            {isArabic ? item.labelAr : item.label}
                          </span>
                          {isActive && (
                            <ArrowRight className="h-3.5 w-3.5 text-teal-400 shrink-0 rtl:rotate-180" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-white/10 px-4 py-2 flex items-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-white/[0.06] px-1 py-0.5 font-mono">&uarr;&darr;</kbd>
                {isArabic ? 'تنقل' : 'Navigate'}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-white/[0.06] px-1 py-0.5 font-mono">&crarr;</kbd>
                {isArabic ? 'اختر' : 'Select'}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-white/[0.06] px-1 py-0.5 font-mono">ESC</kbd>
                {isArabic ? 'إغلاق' : 'Close'}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { open, setOpen, onClose: () => setOpen(false) };
}

export { CommandPalette, useCommandPalette };
export type { CommandPaletteProps, CommandItem };
