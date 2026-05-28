/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'animate-in': 'animateIn 0.3s ease-in-out',
        'animate-out': 'animateOut 0.2s ease-in-out',
        'zoom-in-95': 'zoomIn95 0.3s ease-in-out',
        'zoom-out-95': 'zoomOut95 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        animateIn: {
          '0%': { opacity: '0', visibility: 'hidden' },
          '100%': { opacity: '1', visibility: 'visible' },
        },
        animateOut: {
          '0%': { opacity: '1', visibility: 'visible' },
          '100%': { opacity: '0', visibility: 'hidden' },
        },
        zoomIn95: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        zoomOut95: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.95)' },
        },
      },
    },
  },
  plugins: [],
}
