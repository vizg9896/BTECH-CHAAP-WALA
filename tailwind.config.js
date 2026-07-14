/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#030712',
          surface: 'rgba(24, 24, 27, 0.85)',
          'surface-elevated': '#1c1c1f',
          orange: '#ff6b00',
          'orange-hover': '#f76700',
          'orange-dim': '#ff9800',
          'orange-light': '#ffe0b2',
          'orange-logo': '#fff3e0',
          lime: '#CCFF00',
          text: '#f5f5f5',
          'text-muted': '#a1a1aa',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'orange-glow': '0 0 20px rgba(255, 107, 0, 0.45)',
        'lime-glow': '0 0 15px rgba(204, 255, 0, 0.35)',
        'glow': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
