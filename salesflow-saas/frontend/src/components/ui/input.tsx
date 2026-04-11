'use client';

import {
  forwardRef,
  useState,
  useId,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Search, Eye, EyeOff } from 'lucide-react';

type InputType = 'text' | 'email' | 'phone' | 'password' | 'search' | 'textarea';

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  inputType?: InputType;
  label?: string;
  error?: string;
  rows?: number;
}

const baseStyles = clsx(
  'w-full bg-white/5 backdrop-blur-sm text-white placeholder-transparent',
  'border border-white/10 rounded-lg',
  'transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'text-base ps-4 pe-4 pt-5 pb-2',
  'peer',
);

const labelStyles = clsx(
  'absolute text-sm text-slate-400 duration-200 transform',
  'top-4 start-4 z-10 origin-[right]',
  'peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0',
  'peer-focus:scale-75 peer-focus:-translate-y-2.5',
  'peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-2.5',
  'pointer-events-none',
);

const errorLabelStyles = 'text-red-400';

const DealixInput = forwardRef<HTMLInputElement, InputProps>(
  ({ inputType = 'text', label, error, className, rows = 4, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [showPassword, setShowPassword] = useState(false);

    const errorId = error ? `${inputId}-error` : undefined;

    const wrapperClass = 'relative w-full';

    if (inputType === 'textarea') {
      return (
        <div className={wrapperClass}>
          <textarea
            id={inputId}
            rows={rows}
            dir="auto"
            placeholder=" "
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={clsx(baseStyles, 'resize-y min-h-[80px]', error && 'border-red-400/60', className)}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
          {label && (
            <label htmlFor={inputId} className={clsx(labelStyles, error && errorLabelStyles)}>
              {label}
            </label>
          )}
          <ErrorMessage id={errorId} message={error} />
        </div>
      );
    }

    if (inputType === 'phone') {
      return (
        <div className={wrapperClass}>
          <div className="relative flex items-center">
            <span className="absolute start-4 text-sm text-teal-400 font-medium z-10 pointer-events-none">
              966+
            </span>
            <input
              ref={ref}
              id={inputId}
              type="tel"
              dir="ltr"
              placeholder=" "
              aria-invalid={!!error}
              aria-describedby={errorId}
              className={clsx(baseStyles, 'ps-16', error && 'border-red-400/60', className)}
              {...props}
            />
            {label && (
              <label htmlFor={inputId} className={clsx(labelStyles, 'start-16', error && errorLabelStyles)}>
                {label}
              </label>
            )}
          </div>
          <ErrorMessage id={errorId} message={error} />
        </div>
      );
    }

    if (inputType === 'search') {
      return (
        <div className={wrapperClass}>
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            ref={ref}
            id={inputId}
            type="search"
            dir="auto"
            placeholder={label ?? '...بحث'}
            className={clsx(
              'w-full bg-white/5 backdrop-blur-sm text-white placeholder-slate-500',
              'border border-white/10 rounded-lg',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400',
              'text-base ps-11 pe-4 py-2.5',
              error && 'border-red-400/60',
              className,
            )}
            {...props}
          />
          <ErrorMessage id={errorId} message={error} />
        </div>
      );
    }

    if (inputType === 'password') {
      return (
        <div className={wrapperClass}>
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            dir="auto"
            placeholder=" "
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={clsx(baseStyles, 'pe-12', error && 'border-red-400/60', className)}
            {...props}
          />
          {label && (
            <label htmlFor={inputId} className={clsx(labelStyles, error && errorLabelStyles)}>
              {label}
            </label>
          )}
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <ErrorMessage id={errorId} message={error} />
        </div>
      );
    }

    return (
      <div className={wrapperClass}>
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          dir="auto"
          placeholder=" "
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={clsx(baseStyles, error && 'border-red-400/60', className)}
          {...props}
        />
        {label && (
          <label htmlFor={inputId} className={clsx(labelStyles, error && errorLabelStyles)}>
            {label}
          </label>
        )}
        <ErrorMessage id={errorId} message={error} />
      </div>
    );
  },
);

DealixInput.displayName = 'DealixInput';

function ErrorMessage({ id, message }: { id?: string; message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          id={id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="mt-1.5 text-sm text-red-400 ps-1"
          role="alert"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export { DealixInput as Input };
export type { InputProps, InputType };
