'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useI18n } from '@/i18n';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const { dir } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      dir={dir}
      className={clsx(
        'flex flex-col items-center justify-center text-center',
        'py-16 px-8',
        className,
      )}
    >
      <div className="mb-5 rounded-2xl bg-white/5 p-4 border border-white/10">
        <Icon className="h-8 w-8 text-slate-500" strokeWidth={1.5} />
      </div>

      <h3 className="text-base font-semibold text-slate-300 mb-1.5">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-slate-500 max-w-xs mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAction}
          className={clsx(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg',
            'bg-teal-500/15 text-teal-400 text-sm font-medium',
            'border border-teal-500/25',
            'hover:bg-teal-500/25 transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
          )}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
