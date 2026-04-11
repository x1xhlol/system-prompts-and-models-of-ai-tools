/**
 * Dealix Design System Tokens
 * Premium, Arabic-first, RTL-safe design system
 */

export const typography = {
  fontFamily: {
    primary: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif",
    display: "'IBM Plex Sans Arabic', sans-serif",
    mono: "'IBM Plex Mono', monospace",
    body: "'IBM Plex Sans Arabic', 'Inter', sans-serif",
  },
  fontSize: {
    xs: "0.75rem",     // 12px
    sm: "0.875rem",    // 14px
    base: "1rem",      // 16px
    lg: "1.125rem",    // 18px
    xl: "1.25rem",     // 20px
    "2xl": "1.5rem",   // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem",  // 36px
    "5xl": "3rem",     // 48px
    hero: "3.75rem",   // 60px
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    arabic: 1.8, // Arabic text needs more line height
  },
} as const;

export const colors = {
  // Primary - Professional blue (trust, reliability)
  primary: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6", // Main primary
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },
  // Secondary - Teal (growth, Saudi green connection)
  secondary: {
    50: "#F0FDFA",
    100: "#CCFBF1",
    200: "#99F6E4",
    300: "#5EEAD4",
    400: "#2DD4BF",
    500: "#14B8A6", // Main secondary
    600: "#0D9488",
    700: "#0F766E",
    800: "#115E59",
    900: "#134E4A",
  },
  // Accent - Warm orange (action, energy)
  accent: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316", // Main accent
    600: "#EA580C",
    700: "#C2410C",
  },
  // Neutrals
  neutral: {
    0: "#FFFFFF",
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
    950: "#030712",
  },
  // Semantic
  success: { light: "#DCFCE7", main: "#22C55E", dark: "#15803D" },
  warning: { light: "#FEF3C7", main: "#F59E0B", dark: "#B45309" },
  error: { light: "#FEE2E2", main: "#EF4444", dark: "#B91C1C" },
  info: { light: "#DBEAFE", main: "#3B82F6", dark: "#1D4ED8" },
} as const;

export const spacing = {
  0: "0",
  1: "0.25rem",   // 4px
  2: "0.5rem",    // 8px
  3: "0.75rem",   // 12px
  4: "1rem",      // 16px
  5: "1.25rem",   // 20px
  6: "1.5rem",    // 24px
  8: "2rem",      // 32px
  10: "2.5rem",   // 40px
  12: "3rem",     // 48px
  16: "4rem",     // 64px
  20: "5rem",     // 80px
  24: "6rem",     // 96px
  section: "5rem", // Section padding
} as const;

export const borderRadius = {
  none: "0",
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  full: "9999px",
  card: "0.75rem",
  button: "0.5rem",
  input: "0.375rem",
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  elevated: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  popup: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const animation = {
  duration: {
    instant: "0ms",
    fast: "150ms",
    normal: "250ms",
    slow: "400ms",
  },
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
} as const;

// RTL-specific tokens
export const rtl = {
  direction: "rtl" as const,
  textAlign: "right" as const,
  // Logical properties for RTL-safe spacing
  marginStart: "margin-inline-start",
  marginEnd: "margin-inline-end",
  paddingStart: "padding-inline-start",
  paddingEnd: "padding-inline-end",
  borderStart: "border-inline-start",
  borderEnd: "border-inline-end",
} as const;

// Component-specific tokens
export const components = {
  button: {
    height: { sm: "2rem", md: "2.5rem", lg: "3rem" },
    padding: { sm: "0.5rem 1rem", md: "0.625rem 1.25rem", lg: "0.75rem 1.5rem" },
    fontSize: { sm: "0.875rem", md: "1rem", lg: "1.125rem" },
  },
  input: {
    height: { sm: "2rem", md: "2.5rem", lg: "3rem" },
    padding: "0.5rem 0.75rem",
    borderColor: colors.neutral[300],
    focusBorderColor: colors.primary[500],
  },
  card: {
    padding: "1.5rem",
    borderRadius: borderRadius.card,
    shadow: shadows.card,
    background: colors.neutral[0],
  },
  sidebar: {
    width: "280px",
    collapsedWidth: "64px",
  },
  header: {
    height: "64px",
  },
} as const;
