/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        obsidian: {
          50: '#f7f7f8',
          100: '#ececf1',
          200: '#d9d9e3',
          300: '#babac5',
          400: '#999aa5',
          500: '#7d7d8c',
          600: '#63636f',
          700: '#505059',
          800: '#42424a',
          900: '#34341a',
          950: '#0d0d12',
        },
        mint: {
          400: '#6ee7b7',
          500: '#34d399',
          600: '#10b981',
        },
        coral: {
          400: '#fb923c',
          500: '#f97316',
        },
        electric: {
          400: '#a78bfa',
          500: '#8b5cf6',
        },
        surface: {
          primary: '#0d0d12',
          secondary: '#1a1a22',
          tertiary: '#252530',
          elevated: '#2d2d3a',
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-mint': '0 0 40px rgba(52, 211, 153, 0.15)',
        'glow-coral': '0 0 40px rgba(249, 115, 22, 0.15)',
        'elevated': '0 8px 30px rgba(0, 0, 0, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
      },
    },
  },
  plugins: [],
};
