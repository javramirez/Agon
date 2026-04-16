'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const FRASES = [
  'El Códex despierta...',
  'Las inscripciones se alinean...',
  'El pergamino se despliega...',
] as const

function Pergamino() {
  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <motion.div
        className="absolute h-24 w-24 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(245,158,11,0.14) 0%, transparent 70%)',
        }}
        animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.35, 0.75, 0.35] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="relative z-[1]">
        <motion.rect
          x="16"
          y="10"
          width="40"
          height="52"
          rx="4"
          stroke="rgba(245,158,11,0.75)"
          strokeWidth="1.5"
          fill="rgba(245,158,11,0.04)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.4 }}
        />

        {/* Bordes enrollados */}
        <motion.path
          d="M 16 14 C 16 8 22 7 26 10 C 22 10 20 14 16 14 Z"
          fill="rgba(245,158,11,0.20)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2.0, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M 56 14 C 56 8 50 7 46 10 C 50 10 52 14 56 14 Z"
          fill="rgba(245,158,11,0.20)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2.0, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
        />

        {/* Líneas del texto */}
        {[24, 32, 40, 48].map((y, i) => (
          <motion.line
            key={y}
            x1="24"
            y1={y}
            x2={i % 2 === 0 ? 50 : 44}
            y2={y}
            stroke="rgba(245,158,11,0.35)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0.2 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{
              duration: 0.5,
              delay: 0.35 + i * 0.12,
              repeat: Infinity,
              repeatDelay: 1.4,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Sello/insignia */}
        <motion.circle
          cx="36"
          cy="56"
          r="6.5"
          stroke="rgba(245,158,11,0.85)"
          strokeWidth="1.5"
          fill="rgba(245,158,11,0.10)"
          initial={{ scale: 0.9, opacity: 0.3 }}
          animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  )
}

export function LoadingCodex() {
  const [fraseActual, setFraseActual] = useState<(typeof FRASES)[number]>(FRASES[0])

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % FRASES.length
      setFraseActual(FRASES[i])
    }, 2400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-[#080808]">
      <Pergamino />
      <AnimatePresence mode="wait">
        <motion.p
          key={fraseActual}
          className="font-body max-w-xs text-center text-base text-muted-foreground"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
        >
          {fraseActual}
        </motion.p>
      </AnimatePresence>
      <div className="h-px w-24 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full bg-amber/60"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}

