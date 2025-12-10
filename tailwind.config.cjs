/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ey-yellow': '#FFE600',
        'primary-dark': '#2D3748',
        'bg-primary': '#F7FAFC',
        'bg-secondary': '#FFFFFF',
        'bg-subtle': '#EDF2F7',
        'status-done': '#48BB78',
        'status-in-progress': '#ED8936',
        'status-blocked': '#F56565',
        'status-not-started': '#A0AEC0',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
