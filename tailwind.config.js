/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "./app/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          100: "#F1F1F3",
          200: "#E0E0E4",
          300: "#C6C7CC",
          600: "#56575B",
          800: "#1F1F23",
          900: "#0F0F11",
        },
        accent: {
          DEFAULT: "#7C5BFF",
          700: "#5A33E6",
        },
        muted: "#6B7280",
      },
      boxShadow: {
        soft: "0 6px 18px rgba(16,24,40,0.06)",
        subtle: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.1)",
      },
    },
  },
  plugins: [],
};
