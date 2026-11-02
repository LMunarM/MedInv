/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medinv: {
          50: '#FDF2F4',
          100: '#FBE6EA',
          200: '#F7CCD5',
          300: '#F0A3B4',
          400: '#E4718C',
          500: '#D34468',
          600: '#BA274E',
          700: '#9C1B3E',
          800: '#6B1728', // Guinda principal de Figma
          900: '#52101E', // Guinda profundo
          950: '#30050E',
        },
      },
    },
  },
  plugins: [],
}