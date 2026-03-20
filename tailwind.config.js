/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito Sans', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#b769bd',
          dark: '#9b4fa6',
          light: '#d48fda',
          bg: '#faf0fb',
          bg2: '#f3e2f5',
        },
        brand: {
          50: '#faf0fb',
          100: '#f3e2f5',
          200: '#e8c8ec',
          300: '#d48fda',
          400: '#c47fcb',
          500: '#b769bd',
          600: '#9b4fa6',
          700: '#7d3a88',
          800: '#5f2a6a',
          900: '#421a4c',
        },
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.07)',
        'card-hover': '0 8px 32px rgba(183,105,189,0.15)',
        'accent': '0 4px 14px rgba(183,105,189,0.35)',
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}
