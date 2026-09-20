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
          orange: '#D96C43',
          pot: '#EADDCC',
          mint: '#A4DBC3',
          blue: '#A6D8E3',
        },
        brown: {
          light: '#7E5F43',
          DEFAULT: '#63432D',
          dark: '#4C301B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Fonte legível e moderna
      }
    },
  },
  plugins: [],
}

