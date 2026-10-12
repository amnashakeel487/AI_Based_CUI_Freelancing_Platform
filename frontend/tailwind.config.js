/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#102B52',
        'primary-blue': '#1769E8',
        'page-bg': '#F4F7FC',
        'primary-text': '#18314F',
        'muted-text': '#64748B',
        'border-color': '#E2E8F0',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}