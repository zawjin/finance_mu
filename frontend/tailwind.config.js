/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#cbd9fd',
          300: '#91b1fa',
          400: '#5c81f5',
          500: '#3455eb',
          600: '#233abf',
          700: '#1d2d99',
          800: '#1d287d',
          900: '#1c2669',
          950: '#111740',
        },
      },
    },
  },
  plugins: [],
}
