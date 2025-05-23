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
          light: '#FFA726',  // Naranja claro (promociones)
          main: '#FF8F00',    // Naranja vibrante
          dark: '#F57C00',    // Naranja intenso
        },
        secondary: {
          light: '#66BB6A',   // Verde fresco (productos naturales)
          main: '#4CAF50',    // Verde estándar
          dark: '#388E3C',    // Verde intenso
        },
        accent: {
          light: '#BA68C8',   // Morado claro (frescura)
          main: '#9C27B0',    // Morado medio
          dark: '#7B1FA2',    // Morado intenso
        },
        highlight: {
          light: '#FF80AB',   // Rosado suave (ofertas)
          main: '#FF4081',    // Rosado medio
          dark: '#F50057',    // Rosado intenso
        },
        special: {
          light: '#BA68C8',   // Morado suave (productos premium)
          main: '#9C27B0',    // Morado estándar
          dark: '#7B1FA2',    // Morado intenso
        },
        success: {
          light: '#81C784',   // Verde claro (éxito)
          main: '#4CAF50',     // Verde estándar
          dark: '#388E3C',     // Verde intenso
        },
        warning: {
          light: '#FFD54F',    // Amarillo claro (alerta)
          main: '#FFC107',     // Amarillo vibrante
          dark: '#FFA000',     // Amarillo intenso
        },
        error: {
          light: '#E57373',    // Rojo claro (error)
          main: '#F44336',     // Rojo estándar
          dark: '#D32F2F',     // Rojo intenso
        },
      },
    },
  },
  plugins: [],
}