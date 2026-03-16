/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        tv: {
          accent: '#00d4ff',
          purple: '#7c3aed',
          green: '#00e676',
          danger: '#ff4757',
          amber: '#ffb347',
          dark: '#12121a',
          card: '#1a1a26',
          border: '#2a2a3e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gamer-gradient': 'linear-gradient(135deg, #0f0f1a, #1a0030, #001a30)',
      },
    },
  },
  plugins: [],
}
