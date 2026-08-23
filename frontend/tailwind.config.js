/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07090e",
        surface: {
          DEFAULT: "#0f131c",
          elevated: "#151b28",
          border: "#1f293d",
        },
        cyber: {
          cyan: "#00f0ff",
          blue: "#0070f3",
          purple: "#8b5cf6",
          violet: "#a855f7",
          pink: "#ec4899",
          crimson: "#ff2a5f",
          emerald: "#10b981",
          amber: "#f59e0b",
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 240, 255, 0.3)',
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
        'glow-crimson': '0 0 30px -5px rgba(255, 42, 95, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'scanline': 'scanline 8s linear infinite',
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
