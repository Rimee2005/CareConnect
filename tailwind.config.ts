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
        },
        secondary: {
          DEFAULT: "#fb923c", // Warm Coral/Orange
          dark: "#ea580c",
          light: "#fdba74",
        },
        sage: {
          DEFAULT: "#87a96b", // Sage Green
          dark: "#6b8e4f",
          light: "#a8c088",
        },
        background: {
          DEFAULT: "#fefbf6", // Off-white/Warm beige
          secondary: "#f5f1e8",
        },
        text: {
          DEFAULT: "#2d3748", // Charcoal gray
          light: "#4a5568",
          muted: "#718096",
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
        border: "hsl(var(--border))",
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
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

