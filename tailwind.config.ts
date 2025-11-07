import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:"#f5f7ff",100:"#e8edff",200:"#d2dcff",300:"#a9bfff",
          400:"#7a9bff",500:"#567dff",600:"#3d5fe0",700:"#2f49b3",
          800:"#263a8b",900:"#1e2f6d"
        },
        accent: "#10b981"
      }
    }
  },
  plugins: []
}
export default config
