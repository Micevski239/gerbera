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
        // Background variations for section contrast
        canvas: {
          50: '#FFFFFF',
          100: '#FDF8F9',  // Very subtle pink tint
          200: '#F9FAFB',  // Light neutral gray
        },
        surface: {
          base: '#FFFFFF',
          raised: '#FEFCFD',  // Barely tinted
          overlay: '#F9FAFB',
        },
        ink: {
          strong: '#1F1D1A',
          base: '#4A443D',
          muted: '#7A6D63',
        },
        // New accent colors
        accent: {
          burgundy: '#880f4f',
          sage: '#7CB342',
          gold: '#FFA000',
        },
        // Burgundy/Wine - Primary accent
        'accent-burgundy': {
          50: '#FCE4EC',
          100: '#F8BBD9',
          200: '#F48FB1',
          500: '#880f4f',
          600: '#880E4F',
          800: '#560027',
        },
        // Olive/Sage Green - Secondary accent
        'accent-sage': {
          50: '#F1F8E9',
          100: '#C5E1A5',
          200: '#AED581',
          500: '#7CB342',
          600: '#689F38',
          800: '#33691E',
        },
        // Gold - Highlights and stars
        'accent-gold': {
          50: '#FFF8E1',
          100: '#FFECB3',
          200: '#FFE082',
          500: '#FFA000',
          600: '#FF8F00',
          800: '#FF6F00',
        },
        border: {
          soft: '#E5E7EB',
          bold: '#D1D5DB',
        },
        state: {
          hover: '#FCE4EC',
          focus: '#880f4f',
        },
        // Primary palette (burgundy)
        primary: {
          50: '#FCE4EC',
          100: '#F8BBD9',
          200: '#F48FB1',
          300: '#F06292',
          400: '#EC407A',
          500: '#880f4f',
          600: '#880E4F',
          700: '#6D0A3D',
          800: '#560027',
          900: '#3E001A',
        },
        // Secondary palette (sage)
        secondary: {
          50: '#F1F8E9',
          100: '#DCEDC8',
          200: '#C5E1A5',
          300: '#AED581',
          400: '#9CCC65',
          500: '#7CB342',
          600: '#689F38',
          700: '#558B2F',
          800: '#33691E',
          900: '#1B5E20',
        },
        'accent-sage': {
          50: '#F2F7F3',
          100: '#E0EADF',
          200: '#CADDCB',
          300: '#B2CEB6',
          400: '#9BBC9F',
          500: '#7EA081',
          600: '#5D7C61',
          700: '#435B46',
          800: '#2C3B2D',
          900: '#19221A',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FAFAFA',
          200: '#F5F5F5',
          300: '#E5E7EB',
          400: '#D1D5DB',
          500: '#9CA3AF',
        },
      },
      fontFamily: {
        heading: ['var(--font-nunito)', 'Nunito', 'sans-serif'],
        body: ['var(--font-nunito)', 'Nunito', 'sans-serif'],
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
        soft: '0 2px 8px rgba(31, 29, 26, 0.08)',
        card: '0 4px 16px rgba(31, 29, 26, 0.06)',
        lift: '0 10px 25px rgba(173, 20, 87, 0.15)',
        hero: '0 20px 40px rgba(31, 29, 26, 0.12)',
        feature: '0 15px 35px rgba(173, 20, 87, 0.18)',
      },
      maxWidth: {
        shell: '82.5rem',
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #FFFFFF 0%, #FCE4EC 100%)',
        'gradient-cool': 'linear-gradient(135deg, #FFFFFF 0%, #F1F8E9 100%)',
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
      },
      animation: {
        'subtle-scale': 'subtle-scale 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-in',
      },
    },
  },
  plugins: [],
}

export default config
