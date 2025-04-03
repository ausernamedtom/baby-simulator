/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'game-bg': '#2c3e50',
        'game-border': '#34495e',
        'game-canvas': '#1a1a1a',
        'game-text': '#ecf0f1',
        'game-blue': '#3498db',
        'game-green': '#27ae60',
        'game-hover-green': '#219a52',
        'game-input-bg': '#2c3e50',
        'game-placeholder': '#95a5a6',
      },
      animation: {
        'fade-in-down': 'fadeInDown 0.8s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
      },
      keyframes: {
        fadeInDown: {
          'from': {
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        }
      }
    },
  },
  plugins: [],
} 