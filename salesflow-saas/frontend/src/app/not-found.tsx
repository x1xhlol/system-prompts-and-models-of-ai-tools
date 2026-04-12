'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      {/* Decorative glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-[12rem] sm:text-[16rem] font-bold leading-none bg-gradient-to-b from-white via-white/60 to-white/10 bg-clip-text text-transparent select-none"
      >
        404
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-3 mb-10"
      >
        <h2 className="text-2xl sm:text-3xl font-semibold text-white">
          الصفحة غير موجودة
        </h2>
        <p className="text-slate-400 text-lg">
          Page Not Found
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 hover:border-primary/50 font-semibold transition-all duration-300 backdrop-blur-sm"
        >
          <span>العودة للرئيسية</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
      </motion.div>
    </div>
  );
}
