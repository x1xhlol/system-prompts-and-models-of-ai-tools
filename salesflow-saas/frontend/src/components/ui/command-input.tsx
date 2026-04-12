'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { Search } from 'lucide-react';
import { useI18n } from '@/i18n';

interface CommandInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCommandClick?: () => void;
}

const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
  ({ onCommandClick, className, placeholder, ...props }, ref) => {
    const { t, dir } = useI18n();

    const resolvedPlaceholder = placeholder ?? t('commandPalette.placeholder');

    return (
      <button
        type="button"
        onClick={onCommandClick}
        className={clsx(
          'group flex items-center w-full gap-3',
          'rounded-xl px-4 py-2.5',
          'bg-white/5 backdrop-blur-sm',
          'border border-white/10',
          'hover:bg-white/[0.08] hover:border-white/15',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50',
          'transition-all duration-200 cursor-pointer',
          className,
        )}
        dir={dir}
      >
        <Search className="h-4 w-4 text-slate-500 shrink-0" />

        <span className="flex-1 text-start text-sm text-slate-500 truncate">
          {resolvedPlaceholder}
        </span>

        <kbd
          className={clsx(
            'hidden sm:inline-flex items-center gap-0.5',
            'rounded-md px-1.5 py-0.5',
            'bg-white/[0.06] border border-white/10',
            'text-[11px] text-slate-500 font-mono',
            'group-hover:bg-white/10 group-hover:text-slate-400',
            'transition-colors duration-200',
          )}
        >
          <span className="text-xs">&#x2318;</span>K
        </kbd>
      </button>
    );
  },
);

CommandInput.displayName = 'CommandInput';

export { CommandInput };
export type { CommandInputProps };
