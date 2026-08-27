/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#05070B",
        surface: {
          DEFAULT: "#0B0E17",
          elevated: "#121724",
          border: "#1D2538",
          charcoal: "#161B26",
        },
        cyber: {
          gold: "#F59E0B",
          yellow: "#FBBF24",
          amber: "#D97706",
          lightGold: "#FDE68A",
          cyan: "#00F0FF",
          blue: "#3B82F6",
          purple: "#8B5CF6",
          crimson: "#EF4444",
          emerald: "#10B981",
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
        'glow-yellow': '0 0 30px -5px rgba(251, 191, 36, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(0, 240, 255, 0.3)',
        'glow-crimson': '0 0 30px -5px rgba(239, 68, 68, 0.45)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'scanline': 'scanline 8s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%': { opacity: '0.6', filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.4))' },
          '100%': { opacity: '1', filter: 'drop-shadow(0 0 20px rgba(0, 240, 255, 0.8))' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
