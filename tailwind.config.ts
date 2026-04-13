import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'surface-1': 'hsl(var(--surface-1))',
        'surface-2': 'hsl(var(--surface-2))',
        'surface-3': 'hsl(var(--surface-3))',
        border: 'hsl(var(--border))',
        'border-strong': 'hsl(var(--border-strong))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        amber: 'hsl(var(--amber))',
        'amber-dim': 'hsl(var(--amber-dim))',
        'amber-glow': 'hsl(var(--amber-glow))',
        danger: 'hsl(var(--danger))',
        success: 'hsl(var(--success))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        // ─── COLORES DE LOS DIOSES ───────────────────────────
        'dios-ares': '#C41E1E',
        'dios-apolo': '#3B82F6',
        'dios-demeter': '#22C55E',
        'dios-eris': '#9CA3AF',
        'dios-hermes': '#D97706',
        'dios-morfeo': '#7C3AED',
        'dios-nike': '#F59E0B',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        // ─── EXISTENTES ───────────────────────────────────────
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-amber': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        // ─── NUEVOS ───────────────────────────────────────────
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px 2px var(--glow-color, #F59E0B44)' },
          '50%': { boxShadow: '0 0 20px 6px var(--glow-color, #F59E0B88)' },
        },
        'god-enter': {
          from: { opacity: '0', transform: 'translateY(-16px) scale(0.97)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'particle-float': {
          '0%': { transform: 'translateY(0px) rotate(0deg)', opacity: '0.8' },
          '50%': { transform: 'translateY(-12px) rotate(180deg)', opacity: '0.4' },
          '100%': { transform: 'translateY(0px) rotate(360deg)', opacity: '0.8' },
        },
        'epic-scale': {
          from: { opacity: '0', transform: 'scale(0.6)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '33%': { opacity: '0.85' },
          '66%': { opacity: '0.95' },
        },
        'draw-line': {
          from: { strokeDashoffset: '1000' },
          to: { strokeDashoffset: '0' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% center' },
          to: { backgroundPosition: '200% center' },
        },
      },
      animation: {
        // ─── EXISTENTES ───────────────────────────────────────
        'fade-in': 'fade-in 0.4s ease forwards',
        'pulse-amber': 'pulse-amber 2s ease-in-out infinite',
        'scale-in': 'scale-in 0.3s ease forwards',
        // ─── NUEVOS ───────────────────────────────────────────
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        'god-enter': 'god-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'particle-float': 'particle-float 4s ease-in-out infinite',
        'epic-scale': 'epic-scale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        flicker: 'flicker 3s ease-in-out infinite',
        'draw-line': 'draw-line 2s ease forwards',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config

export default config
