'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const FRASES = [
  'El Altis consulta las inscripciones...',
  'Los dioses observan el agon...',
  'La Balanza del Altis se ajusta...',
  'El kleos se cuenta en silencio...',
  'El oráculo medita en el Olimpo...',
  'El cronista prepara su relato...',
  'Las llamas del agon arden...',
  'El Altis registra cada acto...',
]

// Balanza SVG animada
function BalanzaAnimada({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const scale = size === 'sm' ? 0.5 : size === 'md' ? 0.75 : 1

  return (
    <motion.div initial={false} animate={{ scale }}>
      <svg width="80" height="70" viewBox="0 0 80 70" fill="none">
        {/* Poste central */}
        <motion.line
          x1="40" y1="8" x2="40" y2="60"
          stroke="rgba(245,158,11,0.6)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {/* Base */}
        <motion.line
          x1="24" y1="60" x2="56" y2="60"
          stroke="rgba(245,158,11,0.5)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        />
        {/* Brazo de la balanza — oscila */}
        <motion.line
          x1="12" y1="20" x2="68" y2="20"
          stroke="rgba(245,158,11,0.8)"
          strokeWidth="1.5"
          animate={{ rotate: [0, 5, -5, 3, -3, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.2, 0.4, 0.6, 0.8, 1],
          }}
          style={{ transformOrigin: '40px 20px' }}
        />
        {/* Cadena izquierda */}
        <motion.line
          x1="12" y1="20" x2="12" y2="36"
          stroke="rgba(245,158,11,0.5)"
          strokeWidth="1"
          animate={{ rotate: [0, 5, -5, 3, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '40px 20px' }}
        />
        {/* Cadena derecha */}
        <motion.line
          x1="68" y1="20" x2="68" y2="36"
          stroke="rgba(245,158,11,0.5)"
          strokeWidth="1"
          animate={{ rotate: [0, 5, -5, 3, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '40px 20px' }}
        />
        {/* Platillo izquierdo */}
        <motion.ellipse
          cx="12" cy="38" rx="10" ry="3"
          fill="none"
          stroke="rgba(245,158,11,0.6)"
          strokeWidth="1.5"
          animate={{ rotate: [0, 5, -5, 3, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '40px 20px' }}
        />
        {/* Platillo derecho */}
        <motion.ellipse
          cx="68" cy="38" rx="10" ry="3"
          fill="none"
          stroke="rgba(245,158,11,0.6)"
          strokeWidth="1.5"
          animate={{ rotate: [0, 5, -5, 3, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '40px 20px' }}
        />
        {/* Punto central — pivot */}
        <circle cx="40" cy="8" r="2.5" fill="rgba(245,158,11,0.8)" />
      </svg>
    </motion.div>
  )
}

interface Props {
  frase?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingAltis({ frase, size = 'md', className }: Props) {
  const [fraseActual, setFraseActual] = useState(
    frase ?? FRASES[Math.floor(Math.random() * FRASES.length)]
  )
  const [, setFraseIndex] = useState(0)

  // Rotar frases cada 2.5s si no hay frase fija
  useEffect(() => {
    if (frase) return
    const interval = setInterval(() => {
      setFraseIndex((i) => {
        const next = (i + 1) % FRASES.length
        setFraseActual(FRASES[next])
        return next
      })
    }, 2500)
    return () => clearInterval(interval)
  }, [frase])

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-5',
        size === 'sm' && 'py-4',
        size === 'md' && 'py-12',
        size === 'lg' && 'min-h-[60vh]',
        className
      )}
    >
      {/* Balanza animada */}
      <BalanzaAnimada size={size} />

      {/* Frase rotativa con fade */}
      <AnimatePresence mode="wait">
        <motion.p
          key={fraseActual}
          className={cn(
            'font-body text-muted-foreground text-center max-w-xs',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base'
          )}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
        >
          {fraseActual}
        </motion.p>
      </AnimatePresence>

      {/* Línea de carga */}
      <div className="w-24 h-px bg-surface-2 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-amber/60 rounded-full"
          animate={{ x: ['-100%', '200%'] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  )
}
