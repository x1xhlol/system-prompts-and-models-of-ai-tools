'use client';

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ResultCategory = 'leads' | 'deals' | 'contacts' | 'companies';

interface SearchResult {
  id: string;
  category: ResultCategory;
  name: string;
  nameEn: string;
  lastActivity: string;
  lastActivityEn: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const categoryConfig: Record<ResultCategory, { labelAr: string; labelEn: string; icon: string; color: string }> = {
  leads: { labelAr: 'عملاء محتملين', labelEn: 'Leads', icon: '👤', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  deals: { labelAr: 'صفقات', labelEn: 'Deals', icon: '💼', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  contacts: { labelAr: 'جهات اتصال', labelEn: 'Contacts', icon: '📇', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  companies: { labelAr: 'شركات', labelEn: 'Companies', icon: '🏢', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
};

const allResults: SearchResult[] = [
  { id: '1', category: 'leads', name: 'محمد السالم', nameEn: 'Mohammed Al-Salem', lastActivity: 'رسالة منذ ساعتين', lastActivityEn: 'Message 2h ago' },
  { id: '2', category: 'leads', name: 'فهد العتيبي', nameEn: 'Fahd Al-Otaibi', lastActivity: 'مكالمة منذ يوم', lastActivityEn: 'Call 1d ago' },
  { id: '3', category: 'deals', name: 'صفقة عقار الرياض', nameEn: 'Riyadh Property Deal', lastActivity: 'تحديث المرحلة منذ ٣ ساعات', lastActivityEn: 'Stage update 3h ago' },
  { id: '4', category: 'deals', name: 'مشروع جدة التجاري', nameEn: 'Jeddah Commercial Project', lastActivity: 'عرض سعر منذ يومين', lastActivityEn: 'Quote sent 2d ago' },
  { id: '5', category: 'contacts', name: 'أحمد الغامدي', nameEn: 'Ahmed Al-Ghamdi', lastActivity: 'آخر تواصل منذ أسبوع', lastActivityEn: 'Last contact 1w ago' },
  { id: '6', category: 'contacts', name: 'نورة الحربي', nameEn: 'Noura Al-Harbi', lastActivity: 'اجتماع أمس', lastActivityEn: 'Meeting yesterday' },
  { id: '7', category: 'companies', name: 'شركة البناء المتقدم', nameEn: 'Advanced Construction Co.', lastActivity: '٣ صفقات نشطة', lastActivityEn: '3 active deals' },
  { id: '8', category: 'companies', name: 'مجموعة النور القابضة', nameEn: 'Al-Nour Holding Group', lastActivity: 'عميل منذ ٦ أشهر', lastActivityEn: 'Client for 6 months' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isArabic } = useI18n();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dealix-recent-searches');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const label = (ar: string, en: string) => (isArabic ? ar : en);

  // Filter results
  const filtered = query.trim().length > 0
    ? allResults.filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.nameEn.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Group by category
  const grouped = filtered.reduce<Record<ResultCategory, SearchResult[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {} as Record<ResultCategory, SearchResult[]>);

  const flatResults = Object.values(grouped).flat();

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Save recent search
  const saveRecent = useCallback((term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dealix-recent-searches', JSON.stringify(updated));
    }
  }, [recentSearches]);

  // Keyboard nav
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
      saveRecent(query);
      // Would navigate to result in real app
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[10%] start-[50%] -translate-x-1/2 rtl:translate-x-1/2 w-full max-w-2xl z-50"
          >
            <div className="mx-4 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder={label('ابحث في العملاء، الصفقات، الشركات...', 'Search leads, deals, companies...')}
                  className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
                />
                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-500 font-mono">
                  ESC
                </kbd>
              </div>

              {/* Results area */}
              <div ref={listRef} className="max-h-80 overflow-y-auto">
                {query.trim().length === 0 ? (
                  /* Recent searches */
                  <div className="p-4">
                    {recentSearches.length > 0 ? (
                      <>
                        <p className="text-xs text-slate-500 font-medium mb-2">
                          {label('عمليات بحث سابقة', 'Recent Searches')}
                        </p>
                        {recentSearches.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => setQuery(s)}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {s}
                          </button>
                        ))}
                      </>
                    ) : (
                      <p className="text-center text-sm text-slate-500 py-6">
                        {label('اكتب للبحث...', 'Type to search...')}
                      </p>
                    )}
                  </div>
                ) : flatResults.length === 0 ? (
                  /* Empty state */
                  <div className="py-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <p className="text-sm text-slate-500">{label('لا توجد نتائج', 'No results found')}</p>
                    <p className="text-xs text-slate-600 mt-1">{label('جرب كلمات بحث مختلفة', 'Try different search terms')}</p>
                  </div>
                ) : (
                  /* Grouped results */
                  <div className="py-2">
                    {(Object.keys(grouped) as ResultCategory[]).map((cat) => {
                      const cfg = categoryConfig[cat];
                      return (
                        <div key={cat}>
                          <p className="px-5 py-1.5 text-xs font-semibold text-slate-500">
                            {label(cfg.labelAr, cfg.labelEn)}
                          </p>
                          {grouped[cat].map((r) => {
                            const globalIdx = flatResults.indexOf(r);
                            const isSelected = globalIdx === selectedIndex;
                            return (
                              <button
                                key={r.id}
                                data-index={globalIdx}
                                onClick={() => { saveRecent(query); onClose(); }}
                                onMouseEnter={() => setSelectedIndex(globalIdx)}
                                className={`w-full flex items-center gap-3 px-5 py-2.5 text-start transition-colors ${isSelected ? 'bg-white/5' : 'hover:bg-white/[0.03]'}`}
                              >
                                <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${cfg.color.split(' ').slice(0, 2).join(' ')}`}>
                                  {cfg.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white truncate">{label(r.name, r.nameEn)}</p>
                                  <p className="text-xs text-slate-500 truncate">{label(r.lastActivity, r.lastActivityEn)}</p>
                                </div>
                                <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                                  {label(cfg.labelAr, cfg.labelEn)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="px-5 py-2.5 border-t border-white/10 flex items-center gap-4 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">↑↓</kbd>
                  {label('تنقل', 'Navigate')}
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">↵</kbd>
                  {label('فتح', 'Open')}
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">ESC</kbd>
                  {label('إغلاق', 'Close')}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
