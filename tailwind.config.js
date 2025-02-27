/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0078d4', // Microsoft blue
        secondary: '#106ebe',
        light: '#f3f2f1',
        dark: '#201f1e',
      },
    },
  },
  plugins: [],
}
