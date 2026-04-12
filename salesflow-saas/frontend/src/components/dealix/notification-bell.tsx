'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type NotificationType = 'new_lead' | 'deal_won' | 'deal_lost' | 'message' | 'task_due' | 'approval_needed';

interface Notification {
  id: string;
  type: NotificationType;
  titleAr: string;
  titleEn: string;
  timeAgo: string;
  read: boolean;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const typeConfig: Record<NotificationType, { icon: string; color: string }> = {
  new_lead: { icon: '👤', color: 'bg-blue-500/20 text-blue-400' },
  deal_won: { icon: '🎉', color: 'bg-emerald-500/20 text-emerald-400' },
  deal_lost: { icon: '📉', color: 'bg-red-500/20 text-red-400' },
  message: { icon: '💬', color: 'bg-primary/20 text-primary' },
  task_due: { icon: '⏰', color: 'bg-amber-500/20 text-amber-400' },
  approval_needed: { icon: '✅', color: 'bg-purple-500/20 text-purple-400' },
};

const initialNotifications: Notification[] = [
  { id: '1', type: 'new_lead', titleAr: 'عميل محتمل جديد: محمد السالم', titleEn: 'New lead: Mohammed Al-Salem', timeAgo: '2m', read: false },
  { id: '2', type: 'deal_won', titleAr: 'تم كسب صفقة عقار الرياض — ٥٠٠,٠٠٠ ر.س', titleEn: 'Deal won: Riyadh Property — SAR 500,000', timeAgo: '15m', read: false },
  { id: '3', type: 'message', titleAr: 'رسالة جديدة من أحمد الغامدي', titleEn: 'New message from Ahmed Al-Ghamdi', timeAgo: '1h', read: false },
  { id: '4', type: 'task_due', titleAr: 'مهمة مستحقة: متابعة عميل شركة النور', titleEn: 'Task due: Follow up with Al-Nour Co.', timeAgo: '2h', read: true },
  { id: '5', type: 'approval_needed', titleAr: 'طلب موافقة على خصم ١٥٪', titleEn: 'Discount approval request: 15%', timeAgo: '3h', read: true },
  { id: '6', type: 'deal_lost', titleAr: 'صفقة خاسرة: مشروع جدة', titleEn: 'Deal lost: Jeddah Project', timeAgo: '5h', read: true },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function NotificationBell() {
  const { isArabic } = useI18n();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const label = (ar: string, en: string) => (isArabic ? ar : en);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
        aria-label={label('الإشعارات', 'Notifications')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 end-0 w-80 sm:w-96 max-h-[420px] rounded-xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40 z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">{label('الإشعارات', 'Notifications')}</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  {label('تعيين الكل كمقروء', 'Mark all as read')}
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-slate-500">{label('لا توجد إشعارات جديدة', 'No new notifications')}</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const cfg = typeConfig[n.type];
                  return (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-start hover:bg-white/5 transition-colors ${!n.read ? 'bg-white/[0.03]' : ''}`}
                    >
                      <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${cfg.color}`}>
                        {cfg.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${n.read ? 'text-slate-400' : 'text-white'}`}>
                          {label(n.titleAr, n.titleEn)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.timeAgo}</p>
                      </div>
                      {!n.read && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-4 py-2.5">
              <button className="w-full text-center text-xs text-primary hover:text-primary/80 transition-colors py-1">
                {label('عرض كل الإشعارات', 'View All Notifications')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
