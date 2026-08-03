/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        accent: '#22C55E',
        secondary: '#2563EB',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#1E293B',
        },
        cricket: {
          grass: '#22C55E',
          pitch: '#E07B39',
          ball: '#B91C1C',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(15, 23, 42, 0.06)',
        card: '0 4px 24px -4px rgba(15, 23, 42, 0.12)',
        glow: '0 0 24px rgba(34, 197, 94, 0.25)',
        nav: '0 -4px 24px rgba(15, 23, 42, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.5' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s linear infinite',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};