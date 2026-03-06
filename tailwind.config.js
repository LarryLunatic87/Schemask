/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          0: '#08090e',
          1: '#0d0f18',
          2: '#141620',
          3: '#1b1e2c',
        },
        border: {
          subtle: '#1a1d2e',
          default: '#232740',
          strong: '#2e3352',
        },
        ink: {
          primary: '#dde0ed',
          secondary: '#6e7494',
          muted: '#3d4060',
        },
        accent: {
          DEFAULT: '#22c55e',
          dim: 'rgba(34,197,94,0.12)',
          glow: 'rgba(34,197,94,0.25)',
        },
        type: {
          number: '#5b9cf6',
          date: '#a78bfa',
          email: '#fb923c',
          percent: '#fbbf24',
          text: '#4b5563',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', '"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
