const { fontFamily } = require('tailwindcss/defaultTheme')

const drac = {
  cyan: '#8be9fd',
  green: '#50fa7b',
  orange: '#ffb86c',
  pink: '#ff79c6',
  purple: '#bd93f9',
  red: '#ff5555',
  yellow: '#f1fa8c',
}

module.exports = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Poppins'", ...fontFamily.sans],
      },
      colors: { ...drac },
      animation: {
        spin: 'spin 0.5s linear infinite',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    logs: false,
  },
}
