'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { clsx } from 'clsx';

type NumberLocale = 'ar' | 'en';

interface StatsCounterProps {
  target: number;
  label: string;
  prefix?: string;
  suffix?: string;
  currency?: boolean;
  locale?: NumberLocale;
  duration?: number;
  className?: string;
}

function formatNumber(value: number, locale: NumberLocale, currency: boolean): string {
  const opts: Intl.NumberFormatOptions = currency
    ? { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }
    : { maximumFractionDigits: 0 };

  const loc = locale === 'ar' ? 'ar-SA' : 'en-SA';
  return new Intl.NumberFormat(loc, opts).format(value);
}

function AnimatedNumber({
  target,
  locale,
  currency,
  duration,
}: {
  target: number;
  locale: NumberLocale;
  currency: boolean;
  duration: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: duration * 1000,
  });

  const display = useTransform(springValue, (v) => formatNumber(Math.round(v), locale, currency));

  useEffect(() => {
    if (isInView) {
      springValue.set(target);
    }
  }, [isInView, target, springValue]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = v;
      }
    });
    return unsubscribe;
  }, [display]);

  return <span ref={ref}>0</span>;
}

function StatsCounter({
  target,
  label,
  prefix,
  suffix,
  currency = false,
  locale = 'ar',
  duration = 2,
  className,
}: StatsCounterProps) {
  return (
    <div className={clsx('text-center', className)}>
      <div className="text-3xl font-bold text-white md:text-4xl">
        {prefix && <span className="text-teal-400">{prefix}</span>}
        <AnimatedNumber
          target={target}
          locale={locale}
          currency={currency}
          duration={duration}
        />
        {suffix && <span className="text-teal-400 ms-1">{suffix}</span>}
      </div>
      <p className="mt-2 text-sm text-slate-400 md:text-base">{label}</p>
    </div>
  );
}

interface StatsGridProps {
  stats: StatsCounterProps[];
  className?: string;
}

function StatsGrid({ stats, className }: StatsGridProps) {
  return (
    <div
      className={clsx(
        'grid grid-cols-2 gap-8 md:grid-cols-4',
        className,
      )}
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
          <StatsCounter {...stat} />
        </motion.div>
      ))}
    </div>
  );
}

export { StatsCounter, StatsGrid };
export type { StatsCounterProps, StatsGridProps, NumberLocale };
