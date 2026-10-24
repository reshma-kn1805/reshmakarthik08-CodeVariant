/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Direct named tokens as required by checklist
        deepGreen: '#1D4D3F',
        green: '#2E7D5B',
        amber: '#E39A2D',
        rust: '#C8553D',
        tint: '#EEF3EF',
        workshopSidebar: '#16382E',
        workshopPaper: '#F4EFE4',
        ink: {
          DEFAULT: '#17211C',
          muted: '#4A5B53',
          faint: '#7A8C84',
          subtle: '#A7B5AE',
          border: '#D1DDD6',
        },
        // Semantic aliases
        brand: {
          deep: '#16382E',
          DEFAULT: '#2E7D5B',
          light: '#3E9871',
          tint: '#EEF3EF',
          surface: '#F4EFE4',
          surfaceAlt: '#E8E2D5',
        },
        action: {
          amber: '#E39A2D',
          amberHover: '#C9831F',
          amberLight: '#FDF5E8',
        },
        safety: {
          rust: '#C8553D',
          rustLight: '#FBEBE8',
          rustBorder: '#E59585',
        },
      },
      fontFamily: {
        heading: ['Fraunces', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'brand-sm': '6px',
        'brand': '10px',
        'brand-md': '14px',
        'brand-lg': '18px',
        'brand-xl': '22px',
        'brand-2xl': '26px',
        'brand-pill': '9999px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(22, 56, 46, 0.05), 0 1px 2px rgba(22, 56, 46, 0.03)',
        'card': '0 4px 16px rgba(22, 56, 46, 0.06), 0 1px 3px rgba(22, 56, 46, 0.04)',
        'elevated': '0 12px 28px -4px rgba(22, 56, 46, 0.1), 0 4px 8px -2px rgba(22, 56, 46, 0.04)',
        'amber-glow': '0 4px 14px rgba(227, 154, 45, 0.35)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
};
