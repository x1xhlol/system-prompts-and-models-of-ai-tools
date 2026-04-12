'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    console.error('[Dealix Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-destructive/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="mb-6"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-destructive/20 border border-destructive/30 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          حدث خطأ غير متوقع
        </h1>
        <p className="text-slate-400 text-lg">
          An unexpected error occurred
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={reset}
        className="px-8 py-3 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 hover:border-primary/50 font-semibold transition-all duration-300 backdrop-blur-sm mb-4"
      >
        Try Again
      </motion.button>

      {isDev && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 w-full max-w-lg"
        >
          <button
            onClick={() => setShowDetails((v) => !v)}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-4"
          >
            {showDetails ? 'Hide Details' : 'Show Error Details'}
          </button>
          {showDetails && (
            <motion.pre
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10 text-start text-xs text-red-400 overflow-auto max-h-48 backdrop-blur-xl"
            >
              {error.message}
              {error.stack && `\n\n${error.stack}`}
              {error.digest && `\n\nDigest: ${error.digest}`}
            </motion.pre>
          )}
        </motion.div>
      )}
    </div>
  );
}
