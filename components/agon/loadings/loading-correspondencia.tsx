'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FRASES = [
  'Las palabras cruzan el abismo...',
  'El mensajero alza el vuelo...',
  'Hermes prepara el camino...',
]

function LlamaViajando() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg width="40" height="56" viewBox="0 0 40 56" fill="none">
        <motion.path
          d="M 20 52 C 6 44 2 32 8 20 C 10 28 16 30 18 24 C 20 18 22 8 20 2 C 30 12 38 24 32 36 C 30 28 26 28 26 34 C 26 44 28 48 20 52 Z"
          fill="rgba(245,158,11,0.7)"
          animate={{
            d: [
              'M 20 52 C 6 44 2 32 8 20 C 10 28 16 30 18 24 C 20 18 22 8 20 2 C 30 12 38 24 32 36 C 30 28 26 28 26 34 C 26 44 28 48 20 52 Z',
              'M 20 52 C 4 42 2 30 10 18 C 12 26 16 32 19 22 C 21 16 23 6 20 2 C 32 10 40 22 33 34 C 31 26 27 30 27 36 C 27 46 30 49 20 52 Z',
              'M 20 52 C 6 44 2 32 8 20 C 10 28 16 30 18 24 C 20 18 22 8 20 2 C 30 12 38 24 32 36 C 30 28 26 28 26 34 C 26 44 28 48 20 52 Z',
            ],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.ellipse
          cx="20"
          cy="36"
          rx="5"
          ry="8"
          fill="rgba(255,220,100,0.6)"
          animate={{ ry: [8, 10, 8], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-0.5 w-0.5 rounded-full bg-amber"
          style={{ left: `${35 + i * 10}%`, bottom: '30%' }}
          animate={{ y: [0, -40], opacity: [0.8, 0], x: [0, (i - 2) * 6] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

export function LoadingCorrespondencia() {
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
      <LlamaViajando />
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
