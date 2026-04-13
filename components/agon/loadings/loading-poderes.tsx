'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FRASES = [
  'Los dioses deliberan tu destino...',
  'El poder no se pide. Se gana.',
  'El Olimpo revisa tus méritos...',
]

function RayoDelOlimpo() {
  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <motion.div
        className="absolute h-24 w-24 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)',
        }}
        animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.2, 0.9, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute h-12 w-12 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      />

      <motion.svg
        width="40"
        height="68"
        viewBox="0 0 40 68"
        fill="none"
        className="relative z-[1]"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.path
          d="M 26 2 L 14 34 L 22 34 L 12 66 L 34 28 L 24 28 Z"
          stroke="rgba(245,158,11,1)"
          strokeWidth="1.5"
          fill="rgba(245,158,11,0.2)"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            fill: [
              'rgba(245,158,11,0.1)',
              'rgba(245,158,11,0.4)',
              'rgba(245,158,11,0.1)',
            ],
            stroke: [
              'rgba(245,158,11,0.7)',
              'rgba(245,158,11,1)',
              'rgba(245,158,11,0.7)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.svg>
    </div>
  )
}

export function LoadingPoderes() {
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
      <RayoDelOlimpo />
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
