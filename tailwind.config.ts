import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        y: {
          DEFAULT: "#c8954a",
          soft: "#f4e9d2",
          bg: "#fbf6ea",
        },
        h: {
          DEFAULT: "#4a5a8a",
          soft: "#d8dde8",
          bg: "#eef0f6",
        },
        paper: {
          DEFAULT: "#faf7f0",
          dark: "#f0ebde",
        },
        ink: {
          DEFAULT: "#2c2a26",
          soft: "#6b6357",
        },
        line: "#d8d1bd",
      },
      fontFamily: {
        sans: ["var(--font-pretendard)", "Pretendard Variable", "sans-serif"],
        serif: ["var(--font-noto-serif)", "Noto Serif KR", "serif"],
        hand: ["var(--font-gaegu)", "Gaegu", "cursive"],
      },
      backgroundImage: {
        "paper-noise":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.2 0 0 0 0 0.18 0 0 0 0 0.15 0 0 0 0 0.05 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
