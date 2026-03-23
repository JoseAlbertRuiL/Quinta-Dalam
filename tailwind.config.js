/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a4d2e',
        secondary: '#4f7942',
        accent: '#d4a574',
      },
    },
  },
  plugins: [],
}

