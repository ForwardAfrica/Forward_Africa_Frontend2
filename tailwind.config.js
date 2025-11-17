/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#5D58F2',
          primaryDark: '#4B45DA',
          primaryMuted: '#7A76FF',
          accent: '#97A1FF',
          background: '#0F172A',
          surface: '#151F3A',
          surfaceMuted: '#1B2644',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #5D58F2 0%, #0F172A 100%)',
      },
      boxShadow: {
        'brand-glow': '0 10px 25px rgba(93, 88, 242, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};