/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060d17',
          900: '#0b192c',
          850: '#112239',
          800: '#1e3e62',
          700: '#2b527d',
          600: '#3a6699',
          500: '#4d7eb8'
        },
        cyan: {
          400: '#38bdf8',
          500: '#06b6d4',
          600: '#0891b2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
