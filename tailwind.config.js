/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mbare-black': '#0a0a0a', // Nero profondo per lo sfondo
        'mbare-white': '#f4f4f5', // Bianco leggermente sporco, non accecante
        'mbare-accent': '#ff3b00', // Arancione/Rosso acceso per i CTA
        'mbare-muted': '#a1a1aa', // Grigio per i testi secondari
        'mbare-border': '#27272a', // Bordo scuro per le card
      },
      fontFamily: {
        // Usiamo 'Inter' o 'Space Grotesk' per un look moderno e d'impatto
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'huge': '8rem',
        'massive': '12rem',
      },
      letterSpacing: {
        'tighter': '-0.05em',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}