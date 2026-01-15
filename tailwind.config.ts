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
          dark: "#1a1f2e", // Deep teal-tinted dark (not pure black)
          "dark-secondary": "#252b3d", // Slightly lighter dark
        },
        text: {
          DEFAULT: "#2d3748", // Charcoal gray
          light: "#4a5568",
          muted: "#718096",
          dark: "#e8edf3", // Light text for dark mode
          "dark-light": "#cbd5e1", // Lighter text for dark mode
          "dark-muted": "#94a3b8", // Muted text for dark mode
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          dark: "#2d3748", // Subtle border for dark mode
        },
        success: {
          DEFAULT: "#22c55e",
          light: "#86efac",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fde68a",
        },
        error: {
          DEFAULT: "#ef4444",
          light: "#fca5a5",
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

