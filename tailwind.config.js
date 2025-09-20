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
        },
        // Primary green system
        primary: {
          DEFAULT: '#2ECC71',
          bright: '#2ECC71',
          deep: '#27AE60',
          activeBg: '#1F7A5C',
        },
        // Secondary accents (default utilities will use violet). Others available for context-specific use.
        accent: {
          violet: '#9775FA',
          orange: '#FFA94D',
          cyan: '#3BC9DB',
          blueLight: '#74C0FC',
        },
        // Status colors
        status: {
          clean: '#2ECC71',
          worn: '#FFA94D',
          dirty: '#FF6B6B',
          new: '#74C0FC',
        },
        // Cool/Bluish greys
        coolgray: {
          900: '#2A2D34',
          700: '#3E4149',
          500: '#6C757D',
        },
      },
      backgroundImage: {
        // Subtle app/card gradients
        'app-gradient': 'linear-gradient(145deg, #0f1f1d, #152b29)',
        'card-gradient': 'linear-gradient(145deg, rgba(15,31,29,0.04), rgba(21,43,41,0.06))',
      }
    }
  },
  plugins: [],
}
