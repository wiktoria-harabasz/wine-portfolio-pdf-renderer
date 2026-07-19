/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.html'],
  theme: {
    extend: {
      colors: {
        'champagne': '#FFFDF1',
        'off-black': '#140A0A',
        'merlot': '#5350E4',
        'muted': '#A0A3AB',
        'soldout': '#EE220C',
        'new': '#3FDA7D',
        'wine-white': '#FFD931',
        'wine-macerated': '#F27200',
        'wine-rose': '#FF96CA',
        'wine-red': '#B51800',
      },
      fontFamily: {
        display: ['TWK Lausanne', 'sans-serif'],
        body: ['TWK Lausanne', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

