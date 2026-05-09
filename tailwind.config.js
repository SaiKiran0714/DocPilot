/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#F4F4F5',
        paper: '#121212',
        surface: '#2C2C2C',
        panel: '#1E1E2E',
        civic: '#7DD3B0',
        forest: '#86EFAC',
        amberline: '#FBBF24'
      }
    }
  },
  plugins: []
};
