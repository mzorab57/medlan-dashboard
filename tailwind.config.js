/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
 theme: {
    extend: {
      colors: {
        primary: '#4BB7D8',   // #4BB7D8
        secondary: '#1F2A5A', // #1F2A5A
      },
    },
  },
  plugins: [],
}
