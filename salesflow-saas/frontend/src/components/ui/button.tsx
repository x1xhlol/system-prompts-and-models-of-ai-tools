'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children' | 'disabled'>,
    Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'type' | 'form'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: clsx(
    'bg-gradient-to-l from-teal-500 to-emerald-600 text-white',
    'hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]',
    'active:from-teal-600 active:to-emerald-700',
    'disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400',
  ),
  secondary: clsx(
    'border border-teal-500/50 text-teal-400 bg-transparent',
    'hover:bg-teal-500/10 hover:border-teal-400',
    'hover:shadow-[0_0_15px_rgba(20,184,166,0.2)]',
    'active:bg-teal-500/20',
    'disabled:border-slate-600 disabled:text-slate-500',
  ),
  ghost: clsx(
    'text-slate-300 bg-transparent',
    'hover:bg-white/5 hover:text-white',
    'active:bg-white/10',
    'disabled:text-slate-600',
  ),
  danger: clsx(
    'bg-gradient-to-l from-red-500 to-rose-600 text-white',
    'hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]',
    'active:from-red-600 active:to-rose-700',
    'disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400',
  ),
  gold: clsx(
    'bg-gradient-to-l from-amber-400 to-yellow-500 text-slate-900 font-semibold',
    'hover:shadow-[0_0_20px_rgba(251,191,36,0.4)]',
    'active:from-amber-500 active:to-yellow-600',
    'disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400',
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 text-sm ps-3 pe-3 gap-1.5 rounded-md',
  md: 'h-10 text-base ps-5 pe-5 gap-2 rounded-lg',
  lg: 'h-12 text-lg ps-7 pe-7 gap-2.5 rounded-xl',
};

const DealixButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'start',
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        whileHover={isDisabled ? undefined : { scale: 1.03 }}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={clsx(
          'inline-flex items-center justify-center font-medium',
          'text-center select-none cursor-pointer',
          'transition-shadow duration-200',
          'disabled:cursor-not-allowed disabled:opacity-70',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
          fullWidth && 'w-full',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          icon && iconPosition === 'start' && <span className="shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {!loading && icon && iconPosition === 'end' && (
          <span className="shrink-0">{icon}</span>
        )}
      </motion.button>
    );
  },
);

DealixButton.displayName = 'DealixButton';

export { DealixButton as Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
