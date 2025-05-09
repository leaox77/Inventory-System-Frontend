/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  important: '#root',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4791db',
          main: '#1976D2',
          dark: '#115293',
        },
        secondary: {
          light: '#33ab9f',
          main: '#009688',
          dark: '#00695f',
        },
        success: {
          light: '#81c784',
          main: '#4CAF50',
          dark: '#388e3c',
        },
        warning: {
          light: '#ffb74d',
          main: '#FF9800',
          dark: '#f57c00',
        },
        error: {
          light: '#e57373',
          main: '#F44336',
          dark: '#d32f2f',
        },
      },
    },
  },
  plugins: [],
}