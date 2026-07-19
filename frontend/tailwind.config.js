/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#090a0f',
        glassBg: 'rgba(15, 23, 42, 0.45)',
        glassBorder: 'rgba(255, 255, 255, 0.08)',
        accentPurple: '#8B5CF6',
        accentCyan: '#06B6D4',
        accentBlue: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
