"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import ar from "./ar.json";
import en from "./en.json";

type Locale = "ar" | "en";
type Translations = typeof ar;

interface I18nContextType {
  locale: Locale;
  t: (key: string) => string;
  switchLocale: (locale: Locale) => void;
  dir: "rtl" | "ltr";
  isArabic: boolean;
}

const translations: Record<Locale, Translations> = { ar, en };

const I18nContext = createContext<I18nContextType | null>(null);

function getNestedValue(obj: any, path: string): string {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return path;
    current = current[key];
  }
  return typeof current === "string" ? current : path;
}

export function I18nProvider({ children, defaultLocale = "ar" }: { children: ReactNode; defaultLocale?: Locale }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("dealix-locale") as Locale) || defaultLocale;
    }
    return defaultLocale;
  });

  const t = useCallback(
    (key: string): string => {
      return getNestedValue(translations[locale], key);
    },
    [locale]
  );

  const switchLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("dealix-locale", newLocale);
      document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = newLocale;
    }
  }, []);

  const value: I18nContextType = {
    locale,
    t,
    switchLocale,
    dir: locale === "ar" ? "rtl" : "ltr",
    isArabic: locale === "ar",
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

export function LanguageSwitcher() {
  const { locale, switchLocale } = useI18n();

  return (
    <button
      onClick={() => switchLocale(locale === "ar" ? "en" : "ar")}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20
                 text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-white/10"
      aria-label="Switch language"
    >
      <span className="text-lg">{locale === "ar" ? "🇬🇧" : "🇸🇦"}</span>
      <span>{locale === "ar" ? "English" : "عربي"}</span>
    </button>
  );
}

export type { Locale, I18nContextType };
