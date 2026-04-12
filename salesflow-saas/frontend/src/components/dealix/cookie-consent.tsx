'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useI18n } from '@/i18n';

const STORAGE_KEY = 'dealix-cookie-consent';

export function CookieConsent() {
  const { isArabic } = useI18n();
  const [visible, setVisible] = useState(false);

  const label = (ar: string, en: string) => (isArabic ? ar : en);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Small delay so it doesn't appear on first paint
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  }

  function handleReject() {
    localStorage.setItem(STORAGE_KEY, 'rejected');
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 inset-x-0 z-[100] p-4"
        >
          <div className="max-w-3xl mx-auto rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Text */}
              <div className="flex-1">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {label(
                    'نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل استخدام المنصة وفقاً لنظام حماية البيانات الشخصية (PDPL).',
                    'We use cookies to improve your experience and analyze platform usage in compliance with PDPL.'
                  )}
                </p>
                <Link
                  href="/privacy"
                  className="inline-block mt-1.5 text-xs text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
                >
                  {label('المزيد من المعلومات', 'More Information')}
                </Link>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleReject}
                  className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-slate-300 font-medium transition-all duration-200"
                >
                  {label('رفض', 'Reject')}
                </button>
                <button
                  onClick={handleAccept}
                  className="px-5 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 hover:border-primary/50 text-sm text-primary font-semibold transition-all duration-200"
                >
                  {label('قبول', 'Accept')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
