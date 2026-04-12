'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useI18n } from '@/i18n';

interface KpiCardProps {
  value: number;
  label: string;
  trend?: { direction: 'up' | 'down'; percentage: number };
  prefix?: string;
  suffix?: string;
  sparklineData?: number[];
  variant?: 'compact' | 'full';
  className?: string;
}

function useCountUp(target: number, duration: number = 1200) {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return current;
}

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 28;
  const w = 72;
  const step = w / (data.length - 1);

  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={clsx('overflow-visible', className)}
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KpiCard({
  value,
  label,
  trend,
  prefix,
  suffix,
  sparklineData,
  variant = 'full',
  className,
}: KpiCardProps) {
  const { locale } = useI18n();
  const animatedValue = useCountUp(value);

  const formatted = useMemo(() => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(
      animatedValue,
    );
  }, [animatedValue, locale]);

  const isCompact = variant === 'compact';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={clsx(
        'relative rounded-xl overflow-hidden',
        'bg-white/5 backdrop-blur-xl',
        'border border-white/10',
        isCompact ? 'p-3' : 'p-5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={clsx(
            'text-slate-400 truncate',
            isCompact ? 'text-xs mb-1' : 'text-sm mb-2',
          )}>
            {label}
          </p>
          <p className={clsx(
            'font-semibold text-white tabular-nums',
            isCompact ? 'text-lg' : 'text-2xl',
          )}>
            {prefix && <span className="text-slate-400 me-1">{prefix}</span>}
            {formatted}
            {suffix && <span className="text-slate-400 ms-1 text-base">{suffix}</span>}
          </p>
        </div>

        {sparklineData && sparklineData.length > 1 && (
          <div className={clsx(
            'shrink-0',
            isCompact ? 'w-14' : 'w-[72px]',
            trend?.direction === 'up' ? 'text-emerald-400' : 'text-rose-400',
          )}>
            <Sparkline data={sparklineData} />
          </div>
        )}
      </div>

      {trend && (
        <div className={clsx(
          'flex items-center gap-1',
          isCompact ? 'mt-1.5' : 'mt-3',
        )}>
          {trend.direction === 'up' ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
          )}
          <span
            className={clsx(
              'text-xs font-medium tabular-nums',
              trend.direction === 'up' ? 'text-emerald-400' : 'text-rose-400',
            )}
          >
            {trend.percentage}%
          </span>
        </div>
      )}
    </motion.div>
  );
}

export { KpiCard };
export type { KpiCardProps };
