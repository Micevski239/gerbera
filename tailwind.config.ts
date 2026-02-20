import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background variations
        canvas: {
          50: '#F5F5F5',
          100: '#F9F7F5',
          200: '#FFF5F0',
        },
        surface: {
          base: '#FFFFFF',
          raised: '#FAFAFA',
          overlay: '#F5F5F5',
        },
        ink: {
          strong: '#1A1A1A',
          base: '#333333',
          muted: '#666666',
        },
        // Primary — Coral
        primary: {
          50: '#FFF5F0',
          100: '#FFE8DE',
          200: '#FFD5C4',
          300: '#F2BBA8',
          400: '#E8A699',
          500: '#E8A699',
          600: '#D4907F',
          700: '#B87161',
          800: '#965A4C',
          900: '#6E3F35',
        },
        // Secondary — Muted Sage (unchanged)
        secondary: {
          50: '#EEF6F1',
          100: '#D4EAE0',
          200: '#B8DCC9',
          300: '#9ECEB4',
          400: '#8DC5A7',
          500: '#81B29A',
          600: '#6E9D85',
          700: '#5B886F',
          800: '#476A57',
          900: '#334D3F',
        },
        // Accent — Warm Saffron (unchanged)
        accent: {
          50: '#FFF9EE',
          100: '#FFF0D4',
          200: '#FFE7BA',
          300: '#F7D9A2',
          400: '#F2CC8F',
          500: '#E8BE7D',
          600: '#D4A96A',
          700: '#B88F57',
          800: '#937043',
          900: '#6B5130',
        },
        border: {
          soft: '#E5E5E5',
          bold: '#CCCCCC',
        },
        state: {
          hover: '#FFF5F0',
          focus: '#E8A699',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Pastel palette for service features
        pastel: {
          peach: '#F4D9C6',
          lime: '#E8F5C6',
          pink: '#F5D9F0',
          blue: '#D9F5F0',
        },
        softPink: '#FFE0D6',
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'Playfair Display', 'serif'],
        body: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
      fontSize: {
        'ds-display': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'ds-title': ['2.25rem', { lineHeight: '1.2' }],
        'ds-section': ['2rem', { lineHeight: '1.3' }],
        'ds-body': ['1rem', { lineHeight: '1.55' }],
        'ds-body-lg': ['1.125rem', { lineHeight: '1.5' }],
        'ds-body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'ds-eyebrow': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.18em' }],
      },
      letterSpacing: {
        eyebrow: '0.18em',
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '11': '2.75rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(26, 26, 26, 0.08)',
        card: '0 4px 16px rgba(26, 26, 26, 0.06)',
        lift: '0 10px 25px rgba(232, 166, 153, 0.15)',
        hero: '0 20px 40px rgba(26, 26, 26, 0.12)',
        feature: '0 15px 35px rgba(232, 166, 153, 0.12)',
      },
      maxWidth: {
        shell: '82.5rem',
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F0 100%)',
        'gradient-cool': 'linear-gradient(135deg, #FFFFFF 0%, #EEF6F1 100%)',
        'gradient-linen': 'linear-gradient(135deg, #F9F7F5 0%, #FFF5F0 100%)',
      },
      keyframes: {
        'subtle-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(22px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'splash-logo': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'subtle-scale': 'subtle-scale 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-in',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
        'slide-up': 'slide-up 0.7s ease-out both',
        'blink': 'blink 0.9s step-end infinite',
        'splash-logo': 'splash-logo 0.8s ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
