'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FRASES = [
  'El Altis consulta las inscripciones...',
  'Los dioses observan el agon...',
  'El kleos se cuenta en silencio...',
  'El oráculo medita en el Olimpo...',
  'El cronista prepara su relato...',
  'Las llamas del agon arden...',
  'El Altis registra cada acto...',
  'El agon de hoy te espera...',
]

function EscudoGriego() {
  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <motion.div
        className="absolute h-20 w-20 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
        }}
        animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg width="64" height="72" viewBox="0 0 64 72" fill="none" className="relative z-[1]">
        <motion.path
          d="M 32 4 L 58 14 L 58 38 C 58 54 32 68 32 68 C 32 68 6 54 6 38 L 6 14 Z"
          stroke="rgba(245,158,11,0.85)"
          strokeWidth="1.5"
          fill="rgba(245,158,11,0.04)"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 1.4, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.2 },
            opacity: { duration: 0.4 },
          }}
        />
        <motion.line
          x1="32"
          y1="14"
          x2="32"
          y2="58"
          stroke="rgba(245,158,11,0.4)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.9, repeat: Infinity, repeatDelay: 2 }}
        />
        <motion.line
          x1="12"
          y1="36"
          x2="52"
          y2="36"
          stroke="rgba(245,158,11,0.4)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 1.1, repeat: Infinity, repeatDelay: 2 }}
        />
        <motion.ellipse
          cx="32"
          cy="36"
          rx="8"
          ry="10"
          stroke="rgba(245,158,11,0.5)"
          strokeWidth="1"
          fill="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.3, repeat: Infinity, repeatDelay: 1.7 }}
        />
        <motion.path
          d="M 18 18 C 22 14 28 12 32 12"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          animate={{ opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>

      <motion.div
        className="absolute h-2 w-2 rounded-full bg-amber"
        animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 0.4, delay: 1.4, repeat: Infinity, repeatDelay: 2.2 }}
      />
    </div>
  )
}

export function LoadingDashboard() {
  const [fraseActual, setFraseActual] = useState(FRASES[0])

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % FRASES.length
      setFraseActual(FRASES[i])
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-[#080808]">
      <EscudoGriego />
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
