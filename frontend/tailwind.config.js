/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // iOS 18 Color Palette
        'ios-blue': '#007AFF',
        'ios-blue-light': '#5AC8FA',
        'ios-green': '#34C759',
        'ios-orange': '#FF9500',
        'ios-red': '#FF3B30',
        'ios-gray': {
          900: '#1C1C1E',
          800: '#2C2C2E',
          700: '#3A3A3C',
          600: '#48484A',
          500: '#636366',
          400: '#8E8E93',
          300: '#C7C7CC',
          200: '#D1D1D6',
          100: '#F2F2F7',
        },
        // Cloud Provider Colors
        'aws': '#FF9900',
        'azure': '#0078D4',
        'gcp': '#4285F4',
      },
      fontFamily: {
        'sf': ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'xxs': '0.625rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'ios': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'ios-md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'ios-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'ios-xl': '0 20px 25px rgba(0, 0, 0, 0.15)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'ios': '12px',
        'ios-lg': '16px',
        'ios-xl': '20px',
      },
    },
  },
  plugins: [],
} 