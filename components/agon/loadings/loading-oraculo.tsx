'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FRASES = [
  'El Olimpo guarda silencio...',
  'El oráculo consulta el destino...',
  'Las sombras revelan la verdad...',
]

function OjoOraculo() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <motion.div
        className="absolute h-20 w-20 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        }}
        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <svg width="80" height="48" viewBox="0 0 80 48" fill="none" className="relative z-[1]">
        <motion.path
          d="M 8 24 Q 40 4 72 24"
          stroke="rgba(139,92,246,0.8)"
          strokeWidth="1.5"
          fill="none"
          animate={{ d: ['M 8 24 Q 40 4 72 24', 'M 8 24 Q 40 8 72 24', 'M 8 24 Q 40 4 72 24'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M 8 24 Q 40 44 72 24"
          stroke="rgba(139,92,246,0.8)"
          strokeWidth="1.5"
          fill="none"
          animate={{ d: ['M 8 24 Q 40 44 72 24', 'M 8 24 Q 40 40 72 24', 'M 8 24 Q 40 44 72 24'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="40"
          cy="24"
          r="10"
          stroke="rgba(139,92,246,0.9)"
          strokeWidth="1.5"
          fill="rgba(139,92,246,0.1)"
          animate={{ r: [10, 12, 10] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="40"
          cy="24"
          r="4"
          fill="rgba(139,92,246,0.8)"
          animate={{ r: [4, 5, 4], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle cx="43" cy="21" r="1.5" fill="rgba(255,255,255,0.4)" />
      </svg>
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-0.5 w-0.5 rounded-full bg-violet-400/60"
          style={{
            left: `${15 + i * 18}%`,
            top: `${20 + (i % 2) * 40}%`,
          }}
          animate={{ opacity: [0, 1, 0], y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </div>
  )
}

export function LoadingOraculo() {
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
      <OjoOraculo />
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
          className="h-full rounded-full bg-violet-400/60"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}
