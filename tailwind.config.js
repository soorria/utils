const { fontFamily } = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')
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

/** @type {import('tailwindcss').Config} */
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
      gridTemplateColumns: {
        '2/3': 'minmax(0,2fr) minmax(0,3fr)',
      },
      keyframes: {
        pulse: {
          '50%': {
            opacity: '.3',
          },
        },
      },
      animation: {
        'spin-fast': 'spin 0.5s linear infinite',
      },
    },
  },
  plugins: [
    require('daisyui'),
    plugin(({ addVariant }) => {
      addVariant('hocus', ['&:hover', '&:focus'])
      addVariant('hocus-within', ['&:hover', '&:focus-within'])
      addVariant('group-hocus', [
        ':merge(.group):hover &',
        ':merge(.group):focus &',
      ])
      addVariant('where', ':where(&)')
    }),
  ],
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
      ...Object.keys(themes).map(selector =>
        selector.replace('[data-theme=', '').replace(']', '')
      ),
    ],
  },
}
