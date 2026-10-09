/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07090F',
          900: '#0B0E17',
          850: '#101422',
          800: '#161B2E',
          700: '#1E253E',
          600: '#2A3354',
        },
        brand: {
          purple: '#6E56CF',
          lavender: '#EBE7F7',
          blue: '#0284C7',
          rose: '#E11D48',
          gold: '#D97706',
          amber: '#F59E0B',
          emerald: '#059669',
        },
        glass: {
          border: 'rgba(255, 255, 255, 0.75)',
          darkBorder: 'rgba(255, 255, 255, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        gaming: ['Outfit', 'sans-serif'],
        pixel: ['Outfit', 'sans-serif'], // Redirect any legacy pixel call to sleek modern Outfit
      },
      boxShadow: {
        'glass': '0 10px 30px -4px rgba(45, 35, 75, 0.08), 0 1px 1px 0 rgba(255, 255, 255, 0.9) inset',
        'glass-lg': '0 20px 40px -8px rgba(45, 35, 75, 0.12), 0 1px 1.5px 0 rgba(255, 255, 255, 1) inset',
        'glow-purple': '0 0 25px rgba(110, 86, 207, 0.35)',
        'glow-blue': '0 0 25px rgba(2, 132, 199, 0.35)',
        'glow-rose': '0 0 25px rgba(225, 29, 72, 0.35)',
        'glow-gold': '0 0 25px rgba(217, 119, 6, 0.35)',
      },
      keyframes: {
        pulseVanish: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.92)' },
        },
        slideFromLeft: {
          '0%': { transform: 'translateX(-120%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideFromRight: {
          '0%': { transform: 'translateX(120%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        vsSlamIn: {
          '0%': { transform: 'scale(3) rotate(-8deg)', opacity: '0' },
          '60%': { transform: 'scale(0.95) rotate(2deg)', opacity: '1' },
          '80%': { transform: 'scale(1.05) rotate(-1deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        fightFlash: {
          '0%': { transform: 'scale(0.4)', opacity: '0', filter: 'blur(10px)' },
          '50%': { transform: 'scale(1.15)', opacity: '1', filter: 'blur(0px)' },
          '70%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1)', filter: 'blur(0px)' },
        },
        screenShake: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-3px, 2px)' },
          '20%': { transform: 'translate(3px, -2px)' },
          '30%': { transform: 'translate(-2px, -1px)' },
          '40%': { transform: 'translate(2px, 1px)' },
          '50%': { transform: 'translate(-1px, 1px)' },
          '60%': { transform: 'translate(1px, -1px)' },
          '70%': { transform: 'translate(-1px, 0)' },
          '80%': { transform: 'translate(1px, 0)' },
          '90%': { transform: 'translate(0, 0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '60%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        winPulse: {
          '0%, 100%': { boxShadow: '0 0 12px currentColor', opacity: '1' },
          '50%': { boxShadow: '0 0 28px currentColor', opacity: '0.85' },
        },
        countUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        confettiBurst: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        piggyDrop: {
          '0%': { transform: 'translateY(-60px) scale(0.8)', opacity: '0' },
          '60%': { transform: 'translateY(8px) scale(1.05)', opacity: '1' },
          '75%': { transform: 'translateY(-4px) scale(0.98)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        shockwave: {
          '0%': { transform: 'scale(0.2)', opacity: '0.9' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        }
      },
      animation: {
        'pulse-vanish': 'pulseVanish 1.2s infinite ease-in-out',
        'slide-left': 'slideFromLeft 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-right': 'slideFromRight 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'vs-slam': 'vsSlamIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'fight-flash': 'fightFlash 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'screen-shake': 'screenShake 0.45s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'scale-up': 'scaleUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'win-pulse': 'winPulse 1.2s infinite ease-in-out',
        'count-up': 'countUp 0.5s ease-out forwards',
        'confetti-burst': 'confettiBurst 0.6s ease-out forwards',
        'piggy-drop': 'piggyDrop 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'shockwave': 'shockwave 1s ease-out forwards',
      },
    },
  },
  plugins: [],
}
