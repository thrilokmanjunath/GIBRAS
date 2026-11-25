/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: {
            50: '#f0f5fa',
            100: '#e1ecf5',
            200: '#b8d4e9',
            600: '#1d5a8a',
            700: '#134670',
            800: '#0b3b60',
            900: '#003366',
            950: '#071f36',
          },
          saffron: {
            DEFAULT: '#ff9933',
            dark: '#e67300',
          },
          gold: {
            light: '#fef3c7',
            DEFAULT: '#d97706',
            dark: '#b45309',
          },
          green: {
            light: '#dcfce7',
            DEFAULT: '#138808',
            dark: '#15803d',
            forest: '#166534',
          },
          maroon: {
            DEFAULT: '#991b1b',
            dark: '#7f1d1d',
          },
        },
      },
    },
  },
  plugins: [],
}
