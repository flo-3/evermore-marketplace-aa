import type { Config } from 'tailwindcss';
const plugin = require('tailwindcss/plugin');


const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    plugin(function({ addComponents }: { addComponents: Function }) {
      addComponents({
        '.btn': {
          padding: '.5rem 1rem',
          borderRadius: '.25rem',
          fontWeight: '600',
          '&:disabled': {
            opacity: '.5',
            cursor: 'not-allowed',
            backgroundColor: '#c6c4c4',
          },
        },
        '.btn-blue': {
          backgroundColor: '#3490dc',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#2779bd'
          },
        },
        '.btn-black': {
          backgroundColor: 'black',
          color: '#fff',
          '&:hover': {
            backgroundColor: 'lightblack'
          },
        },
        '.bg-container': {
          backgroundColor: "#d2d6de"
        },
      })
    })
  ]
}
export default config
