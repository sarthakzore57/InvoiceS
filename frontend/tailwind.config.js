/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#172026',
        brand: '#0f8f72',
        saffron: '#ef9f24',
        berry: '#9d315b',
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15, 31, 38, 0.12)',
      },
    },
  },
  plugins: [],
};
