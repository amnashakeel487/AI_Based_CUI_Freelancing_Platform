/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#102B52', 700: '#1B3C6E', 800: '#0D2345', 900: '#081A36' },
        brand: { DEFAULT: '#1769E8', dark: '#1257C4', pale: '#EBF4FF' },
        page: '#F4F7FC',
        line: '#D6E5FA',
        muted: '#64748B',
        ok: '#10B981',
        warn: '#F59E0B',
        bad: '#EF4444',
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 1px 2px rgba(16,43,82,.05), 0 4px 16px rgba(16,43,82,.05)' },
      keyframes: {
        rise: { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'none' } },
        pop: { from: { opacity: 0, transform: 'scale(.97)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: { rise: 'rise .6s ease-out both', pop: 'pop .18s ease-out both' },
    },
  },
  plugins: [],
}
