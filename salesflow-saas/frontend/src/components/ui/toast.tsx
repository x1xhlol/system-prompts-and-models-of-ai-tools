'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (type: ToastType, message: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const typeConfig: Record<ToastType, { icon: ReactNode; borderColor: string; iconBg: string }> = {
  success: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
    borderColor: 'border-emerald-500/30',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
  },
  error: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
    borderColor: 'border-red-500/30',
    iconBg: 'bg-red-500/20 text-red-400',
  },
  warning: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    borderColor: 'border-amber-500/30',
    iconBg: 'bg-amber-500/20 text-amber-400',
  },
  info: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    borderColor: 'border-blue-500/30',
    iconBg: 'bg-blue-500/20 text-blue-400',
  },
};

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<ToastContextType | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, duration = 5000) => {
    const id = `toast-${++idCounter}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast: addToast, dismiss }}>
      {children}

      {/* Toast container -- bottom-end (RTL-safe) */}
      <div className="fixed bottom-4 end-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const cfg = typeConfig[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl bg-slate-900/95 backdrop-blur-2xl border ${cfg.borderColor} shadow-xl shadow-black/30`}
              >
                <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${cfg.iconBg}`}>
                  {cfg.icon}
                </span>
                <p className="flex-1 text-sm text-slate-200 leading-snug pt-0.5">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 p-0.5 rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label="Dismiss"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export type { ToastType, Toast, ToastContextType };
