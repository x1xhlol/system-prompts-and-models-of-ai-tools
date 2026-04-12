'use client';

import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

type CardVariant = 'default' | 'gradient' | 'elevated' | 'feature';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: CardVariant;
  header?: ReactNode;
  footer?: ReactNode;
  badge?: ReactNode;
  noPadding?: boolean;
  children: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: clsx(
    'bg-white/5 backdrop-blur-xl',
    'border border-white/10',
  ),
  gradient: clsx(
    'bg-gradient-to-bl from-teal-500/10 via-slate-900/80 to-slate-900/90',
    'backdrop-blur-xl border border-teal-500/20',
  ),
  elevated: clsx(
    'bg-slate-800/80 backdrop-blur-xl',
    'border border-white/10',
    'shadow-xl shadow-black/20',
  ),
  feature: clsx(
    'bg-gradient-to-bl from-teal-500/15 via-emerald-500/5 to-transparent',
    'backdrop-blur-xl border border-teal-400/20',
  ),
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      header,
      footer,
      badge,
      noPadding = false,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{
          y: -2,
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.3)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={clsx(
          'relative rounded-xl overflow-hidden',
          'text-white',
          'transition-colors duration-200',
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        {badge && (
          <div className="absolute top-3 end-3 z-10">{badge}</div>
        )}

        {header && (
          <div
            className={clsx(
              'border-b border-white/10',
              !noPadding && 'px-6 py-4',
            )}
          >
            {header}
          </div>
        )}

        <div className={clsx(!noPadding && 'p-6')}>{children}</div>

        {footer && (
          <div
            className={clsx(
              'border-t border-white/10',
              !noPadding && 'px-6 py-4',
            )}
          >
            {footer}
          </div>
        )}
      </motion.div>
    );
  },
);

Card.displayName = 'Card';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

function CardTitle({ children, className, ...props }: CardTitleProps) {
  return (
    <h3
      className={clsx('text-lg font-semibold text-white', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardDescription({ children, className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={clsx('text-sm text-slate-400 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export { Card, CardTitle, CardDescription };
export type { CardProps, CardVariant };
