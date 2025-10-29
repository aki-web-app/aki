import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1a1a1d",
          50:"#f6f6f7",100:"#e7e7ea",200:"#cfd0d6",300:"#b0b1b9",400:"#8b8d97",
          500:"#6d6f78",600:"#4c4d54",700:"#34343a",800:"#1f2023",900:"#141416",
        },
        accent: { DEFAULT:"#7c4dff", 600:"#6c3fff", 700:"#5a33e6" },
      },
      boxShadow: { subtle: "0 1px 2px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)" },
      borderRadius: { xl:"0.75rem", "2xl":"1rem" },
    },
  },
  plugins: [],
};
export default config;
