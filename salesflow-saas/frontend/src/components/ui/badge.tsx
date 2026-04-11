'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'live';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  danger: 'bg-red-500/15 text-red-400 border-red-500/30',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  neutral: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  live: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  info: 'bg-blue-400',
  neutral: 'bg-slate-400',
  live: 'bg-emerald-400',
};

function Badge({ variant = 'neutral', dot = false, children, className }: BadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={clsx(
        'inline-flex items-center gap-1.5',
        'rounded-full border px-2.5 py-0.5',
        'text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {variant === 'live' && (
            <span
              className={clsx(
                'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                dotColors[variant],
              )}
            />
          )}
          <span
            className={clsx('relative inline-flex h-2 w-2 rounded-full', dotColors[variant])}
          />
        </span>
      )}
      {children}
    </motion.span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
