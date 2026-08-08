/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eafaf1',
          100: '#d1f2e0',
          400: '#25d366',
          500: '#128c7e',
          600: '#075e54',
          700: '#054c40',
        },
      },
    },
  },
  plugins: [],
};
