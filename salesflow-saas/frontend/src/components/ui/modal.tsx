'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

type ModalSize = 'sm' | 'md' | 'lg' | 'full';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  title?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  closeOnBackdrop?: boolean;
  className?: string;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] h-full',
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
};

function Modal({
  open,
  onClose,
  size = 'md',
  title,
  footer,
  children,
  closeOnBackdrop = true,
  className,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : undefined}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={clsx(
              'relative z-10 w-full',
              'bg-slate-900/95 backdrop-blur-xl',
              'border border-white/10 rounded-2xl',
              'shadow-2xl shadow-black/40',
              'flex flex-col overflow-hidden',
              sizeStyles[size],
              className,
            )}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="إغلاق"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            <div className={clsx('flex-1 overflow-y-auto p-6', !title && 'pt-10')}>
              {!title && (
                <button
                  onClick={onClose}
                  className="absolute top-3 end-3 rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
                  aria-label="إغلاق"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              {children}
            </div>

            {footer && (
              <div className="border-t border-white/10 px-6 py-4 flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export { Modal };
export type { ModalProps, ModalSize };
