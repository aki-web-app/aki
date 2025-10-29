// tailwind.config.ts (Ergänzung / replace extend)
import type { Config } from 'tailwindcss';
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1f1f23",
          50: "#f8f8f9", 100:"#f1f1f3", 200:"#e0e0e4", 300:"#c6c7cc", 400:"#a6a7ad",
          500:"#7f8086", 600:"#56575b", 700:"#343437", 800:"#1f1f23", 900:"#0f0f11"
        },
        accent: {
          DEFAULT: "#7c5bff",
          400: "#9a7bff", 600: "#6c3fff", 700: "#5a33e6"
        },
        muted: {
          DEFAULT: "#6b7280"
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 6px 18px rgba(16,24,40,0.06)",
      },
    }
  },
  plugins: [],
};
export default config;
