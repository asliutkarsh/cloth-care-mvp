/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // enable class-based dark mode
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          light: '#3b82f6',
          dark: '#1e40af'
        }
      }
    },
  },
  plugins: [],
}
