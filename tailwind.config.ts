import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pathway: {
          navy: '#0A1A2F',
          blue: '#1E3A5F',
          teal: '#1F6F78',
          slate: '#2C4A72',
          steel: '#3E5C89',
          softTeal: '#4FA3A5',
          warmGray: '#A9B4C2',
          success: '#3BB273',
          warning: '#E8A23A',
          error: '#D9534F',
          canvas: '#0F1F33',
          textPrimary: '#E8EEF4',
          textSecondary: '#C7D1DD',
          textMuted: '#8A96A5',
          frostedGlass: 'rgba(255,255,255,0.08)',
          overlayBlack: 'rgba(0,0,0,0.35)',
        },
      },
      spacing: {
        'pathway-xs': '4px',
        'pathway-sm': '8px',
        'pathway-md': '12px',
        'pathway-lg': '16px',
        'pathway-xl': '24px',
        'pathway-2xl': '32px',
        'pathway-3xl': '48px',
      },
      borderRadius: {
        card: '14px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 18px 40px rgba(0,0,0,0.35)',
        modal: '0 24px 60px rgba(0,0,0,0.5)',
        elevated: '0 8px 24px rgba(0,0,0,0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'app-title': ['28px', { lineHeight: '1.2', letterSpacing: '0.2px' }],
        'section-header': ['22px', { lineHeight: '1.2', letterSpacing: '0.2px' }],
        'card-title': ['18px', { lineHeight: '1.35', letterSpacing: '0.2px' }],
        body: ['16px', { lineHeight: '1.45' }],
        secondary: ['14px', { lineHeight: '1.45' }],
        micro: ['12px', { lineHeight: '1.45' }],
      },
      zIndex: {
        background: '-1',
        content: '0',
        sticky: '10',
        overlay: '40',
        modal: '50',
        toast: '60',
      },
      transitionTimingFunction: {
        pathway: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'card-enter': 'cardEnter 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'slide-in-right': 'slideInRight 0.25s ease-out forwards',
      },
      keyframes: {
        cardEnter: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
