import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        serif: ['var(--font-playfair)'],
      },
      colors: {
        gold: {
          DEFAULT: '#C9A55A',
          light: '#D4AF37',
          dark: '#B8935F',
        },
        sage: {
          DEFAULT: '#7a8c7e',
          light: '#8a9c8e',
          dark: '#6d7a6e',
        },
        cream: {
          DEFAULT: '#fafaf8',
          light: '#ffffff',
          dark: '#f5f3f0',
        },
        taupe: {
          DEFAULT: '#b8a696',
          light: '#c8b6a6',
          dark: '#a89686',
        },
      },
    },
  },
  plugins: [],
};
export default config;
