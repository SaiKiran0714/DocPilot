/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f2937',
        paper: '#f8fafc',
        civic: '#0f766e',
        amberline: '#b45309'
      }
    }
  },
  plugins: []
};
