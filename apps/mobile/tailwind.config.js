/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // UstaTop brand — same shkala as web (oklch yo'q, hex bilan)
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2463eb',
          600: '#1e54d6',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        trust: {
          basic: '#94a3b8',
          verified: '#22c55e',
          pro: '#f59e0b',
          premium: '#8b5cf6',
        },
        success: '#16a34a',
        warning: '#d97706',
        danger: '#dc2626',
        info: '#0ea5e9',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
