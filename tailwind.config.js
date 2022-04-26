const { fontFamily } = require('tailwindcss/defaultTheme')
const themes = require('daisyui/src/colors/themes')

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
    themes: [
      {
        dracula: {
          ...themes['[data-theme=dracula]'],
          success: drac.green,
          error: drac.red,
          warning: drac.yellow,
          info: drac.cyan,
        },
      },
      ...Object.keys(themes).map(selector => selector.replace('[data-theme=', '').replace(']', '')),
    ],
  },
}
