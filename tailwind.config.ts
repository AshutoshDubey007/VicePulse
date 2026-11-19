import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CLEAN DARK EDITORIAL PALETTE (VICE CITY INTEL)
        ink: {
          DEFAULT: '#111114',
          dark: '#0B0B0D',
          card: '#1C1B20',
          border: '#28272F',
        },
        surface: {
          DEFAULT: '#1C1B20',
          elevated: '#24232B',
          border: '#28272F',
        },
        cream: {
          DEFAULT: '#F4F0E8',
          dark: '#DDD8CE',
          light: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#9B969F',
          dark: '#76717A',
          light: '#BDB8C1',
        },
        'hot-pink': {
          DEFAULT: '#FF4F91',
          hover: '#E83E7E',
          dark: '#C92066',
        },
        orange: {
          DEFAULT: '#FF8247',
          hover: '#E86F36',
          dark: '#C8581F',
        },
        sun: {
          DEFAULT: '#FFD45A',
          hover: '#E8C045',
          dark: '#CFA72B',
        },
        teal: {
          DEFAULT: '#19C7B8',
          hover: '#13B2A4',
          dark: '#0D8E83',
        },
        sand: {
          DEFAULT: '#FFB347',
          hover: '#F2A332',
          dark: '#D98918',
        },

        // Backward compatibility mappings with refined GTA poster hues
        sunset: {
          DEFAULT: '#FF7A3D',
          hover: '#E8662B',
          subtle: 'rgba(255, 122, 61, 0.15)',
        },
        coral: {
          DEFAULT: '#FF7A3D',
          subtle: 'rgba(255, 122, 61, 0.15)',
        },
        'vice-pink': {
          DEFAULT: '#FF4FA0',
          accent: '#FF4FA0',
          subtle: 'rgba(255, 79, 160, 0.15)',
        },
        'ocean-teal': {
          DEFAULT: '#19C7B8',
          accent: '#13B2A4',
          subtle: 'rgba(25, 199, 184, 0.15)',
        },
        'pale-sand': {
          DEFAULT: '#FFF1DC',
          surface: '#F5E4CA',
        },
        'warm-white': '#FFF1DC',
        asphalt: {
          950: '#1A0B2E',
          900: '#22103B',
          850: '#2C164D',
          800: '#371E5E',
          750: '#462775',
          700: '#5A3594',
          600: '#7B4CBF',
        },
        'muted-gray': '#D4C4B5',
      },
      fontFamily: {
        display: ['var(--font-pricedown)', 'var(--font-bowlby)', 'Impact', 'sans-serif'],
        body: ['var(--font-archivo)', 'sans-serif'],
        sans: ['var(--font-archivo)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        hard: '4px 4px 0px #1A0B2E',
        'hard-lg': '6px 6px 0px #1A0B2E',
        'hard-sm': '2px 2px 0px #1A0B2E',
        'hard-orange': '4px 4px 0px #FF7A3D',
        'hard-pink': '4px 4px 0px #FF4FA0',
        'hard-teal': '4px 4px 0px #19C7B8',
        'hard-sun': '4px 4px 0px #FFE066',
        'hard-cream': '4px 4px 0px #FFF1DC',
        // Legacy shadow mappings converted to flat hard shadows
        'vice-orange': '4px 4px 0px #FF7A3D',
        'vice-teal': '4px 4px 0px #19C7B8',
        'vice-pink': '4px 4px 0px #FF4FA0',
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        widest: '0.2em',
      },
    },
  },
  plugins: [],
}
export default config
