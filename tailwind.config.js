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
        'status-red': '#EE220C',
        'status-green': '#23C47C',
        'wine-white': '#FFD931',
        'wine-macerated': '#F27200',
        'wine-rose': '#FF96CA',
        'wine-red': '#B51800',
      },
      fontFamily: {
        display: ['TWKLausanne', 'sans-serif'],
        body: ['TWKLausanne', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

