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
          // Disney+ Primary Gradient Colors
          royalBlue: '#0F0E47',
          vibrantPink: '#BD34FE',
          deepPurple: '#5D58F2',
          // Supporting & UI Colors
          background: '#0F172A',
          textLight: '#FFFFFF',
          textGray: '#94A3B8',
          // Legacy support (mapped to Disney+ colors)
          primary: '#5D58F2', // Deep Purple
          primaryDark: '#4B45DA',
          primaryMuted: '#7A76FF',
          accent: '#97A1FF',
          surface: '#151F3A',
          surfaceMuted: '#1B2644',
        },
      },
      backgroundImage: {
        // Simple two-color vertical gradient: Bright Blue -> Dark (top to bottom)
        'brand-gradient': 'linear-gradient(180deg, #0F0E47 0%, #0F172A 100%)',
        'brand-gradient-horizontal': 'linear-gradient(90deg, #0F0E47 0%, #5D58F2 50%, #BD34FE 100%)',
        'brand-gradient-diagonal': 'linear-gradient(135deg, #0F0E47 0%, #5D58F2 50%, #BD34FE 100%)',
        // Simple two-color background gradient: Bright Blue -> Dark (top to bottom)
        'brand-background-gradient': 'linear-gradient(180deg, #0F0E47 0%, #0F172A 100%)',
      },
      boxShadow: {
        'brand-glow': '0 10px 25px rgba(93, 88, 242, 0.35)',
        'brand-glow-blue': '0 10px 25px rgba(15, 14, 71, 0.35)',
        'brand-glow-pink': '0 10px 25px rgba(189, 52, 254, 0.35)',
        'brand-glow-purple': '0 10px 25px rgba(93, 88, 242, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};