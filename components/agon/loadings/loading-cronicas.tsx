'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FRASES = [
  'El cronista prepara su relato...',
  'Las llamas del agon arden...',
  'El relato del período emerge...',
]

function ScrollDesplegandose() {
  const LINEAS = 5

  return (
    <div className="relative flex w-32 flex-col items-center gap-1.5">
      {Array.from({ length: LINEAS }).map((_, i) => (
        <motion.div
          key={i}
          className="h-px rounded-full bg-amber/50"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: ['0%', `${60 + i * 8}%`], opacity: [0, 0.6] }}
          transition={{
            duration: 0.6,
            delay: i * 0.25,
            repeat: Infinity,
            repeatDelay: LINEAS * 0.25 + 1,
            ease: 'easeOut',
          }}
        />
      ))}
      <motion.div
        className="font-display absolute -right-4 text-sm text-amber/60"
        animate={{ y: [0, LINEAS * 10, 0], opacity: [0, 1, 0] }}
        transition={{ duration: LINEAS * 0.25 + 1, repeat: Infinity, ease: 'linear' }}
      >
        ✦
      </motion.div>
    </div>
  )
}

export function LoadingCronicas() {
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
      <ScrollDesplegandose />
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
