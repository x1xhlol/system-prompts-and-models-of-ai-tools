/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#E8F0F8",
          100: "#C5D9EE",
          200: "#8BB3DD",
          300: "#518DCC",
          400: "#2A6AA8",
          500: "#0F4C81",
          600: "#0D4173",
          700: "#0A3460",
          800: "#08274D",
          900: "#051A3A",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: "#E0FFF9",
          100: "#B3FFE8",
          200: "#66FFD1",
          300: "#33EFBA",
          400: "#00D4B3",
          500: "#00BFA6",
          600: "#009C87",
          700: "#007A6A",
          800: "#00574C",
          900: "#00352E",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: "#FFF0EB",
          100: "#FFD9C8",
          200: "#FFB391",
          300: "#FF8D5A",
          400: "#FF7948",
          500: "#FF6B35",
          600: "#E55A28",
          700: "#CC4A1B",
          800: "#993813",
          900: "#66250D",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        dark: "#1A1A2E",
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        }
      },
      fontFamily: {
        arabic: ["IBM Plex Sans Arabic", "Tajawal", "sans-serif"],
        sans: ["Inter", "IBM Plex Sans Arabic", "sans-serif"],
      },
    },
  },
  plugins: [],
};
