import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // NO BLUE - Using Teal/Sage Green as primary
        primary: {
          DEFAULT: "#14b8a6", // Teal
          dark: "#0d9488",
          light: "#5eead4",
          "dark-mode": "#2dd4bf", // Brighter teal for dark mode
          "dark-mode-hover": "#5eead4",
        },
        secondary: {
          DEFAULT: "#fb923c", // Warm Coral/Orange
          dark: "#ea580c",
          light: "#fdba74",
          "dark-mode": "#fb923c", // Keep warm for dark mode
          "dark-mode-hover": "#fdba74",
        },
        sage: {
          DEFAULT: "#87a96b", // Sage Green
          dark: "#6b8e4f",
          light: "#a8c088",
          "dark-mode": "#9fb87f", // Lighter sage for dark mode
          "dark-mode-hover": "#a8c088",
        },
        background: {
          DEFAULT: "#fefbf6", // Off-white/Warm beige
          secondary: "#f5f1e8",
          dark: "#1e2329", // Warm blue-grey charcoal (slightly bright, soft, not pure black)
          "dark-secondary": "#323842", // Lighter warm blue-grey - increased brightness for better card contrast
        },
        text: {
          DEFAULT: "#2d3748", // Charcoal gray
          light: "#4a5568",
          muted: "#718096",
          dark: "#f8f9fa", // Brighter off-white for headings and primary text (better contrast)
          "dark-light": "#e9ecef", // Brighter light-grey for labels (increased contrast)
          "dark-muted": "#adb5bd", // Brighter muted blue-grey for secondary text (better readability)
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          dark: "#3a4149", // Low-contrast blue-grey border (soft, not harsh)
        },
        success: {
          DEFAULT: "#22c55e",
          light: "#86efac",
          "dark-mode": "#9fb87f", // Sage green for dark mode (strictly for success states only)
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fde68a",
          "dark-mode": "#fbbf24", // Softer, warmer amber for dark mode
        },
        error: {
          DEFAULT: "#ef4444",
          light: "#fca5a5",
          "dark-mode": "#f87171", // Softer, cooler red for dark mode
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.08)",
        medium: "0 4px 16px rgba(0, 0, 0, 0.12)",
        "dark-soft": "0 2px 8px rgba(0, 0, 0, 0.3)",
        "dark-medium": "0 4px 16px rgba(0, 0, 0, 0.4)",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

