/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'youtube-red': '#FF0000',
        'youtube-dark': '#0F0F0F',
        'youtube-gray': '#272727',
        'youtube-light-gray': '#3F3F3F'
      }
    },
  },
  plugins: [],
}