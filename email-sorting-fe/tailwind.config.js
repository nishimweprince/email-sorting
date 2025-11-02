/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5f7',
          100: '#d9e7ec',
          200: '#b3cfd9',
          300: '#9bb4c0', // Main color from palette
          400: '#7a9aaa',
          500: '#5a7f93',
          600: '#4a6576',
          700: '#3a4f5c',
          800: '#2a3943',
          900: '#1a2329',
        },
        secondary: {
          50: '#f9f6f1',
          100: '#f2ebe0',
          200: '#e8dac6',
          300: '#e1d0b3', // Main color from palette
          400: '#d4bf99',
          500: '#c7ad7f',
          600: '#a08e68',
          700: '#796b4e',
          800: '#524735',
          900: '#2b241b',
        },
        accent: {
          50: '#f3f0ed',
          100: '#e3ddd5',
          200: '#c7bcab',
          300: '#a18d6d', // Main color from palette
          400: '#8a7759',
          500: '#726145',
          600: '#5c4d37',
          700: '#453a2a',
          800: '#2e271c',
          900: '#17140e',
        },
        dark: {
          50: '#e8e0e0',
          100: '#c6b3b3',
          200: '#a08080',
          300: '#7a4d4d',
          400: '#703b3b', // Main color from palette
          500: '#5e3232',
          600: '#4c2929',
          700: '#3a2020',
          800: '#281717',
          900: '#160d0d',
        },
      },
    },
  },
  plugins: [],
}
