'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FRASES = [
  'El juicio se aproxima...',
  'El Altis pesa cada decisión...',
  'Lo que hiciste no puede deshacerse...',
]

function SelloGriego() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <motion.div
        className="absolute h-20 w-20 rounded-full border-2 border-amber/40"
        animate={{ scale: [1.4, 1], opacity: [0, 0.8] }}
        transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute h-14 w-14 rounded-full border border-amber/30"
        animate={{ scale: [1.6, 1], opacity: [0, 0.6] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatDelay: 1,
          delay: 0.1,
          ease: 'easeOut',
        }}
      />
      <motion.span
        className="font-display relative z-10 text-2xl text-amber"
        animate={{ scale: [1.5, 1], opacity: [0, 1] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatDelay: 1,
          delay: 0.2,
          ease: 'easeOut',
        }}
      >
        ⚖
      </motion.span>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)',
        }}
        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1, delay: 0.3 }}
      />
    </div>
  )
}

export function LoadingVeredicto() {
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
      <SelloGriego />
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
