'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FRASES = [
  'Los dioses observan el agon...',
  'Las voces del Ágora despiertan...',
  'El ágora convoca a los agonistas...',
]

const PUNTOS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2
  return {
    x: Math.cos(angle) * 36,
    y: Math.sin(angle) * 36,
    delay: i * 0.08,
  }
})

function CirculoConvergente() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      {PUNTOS.map((p, i) => (
        <motion.div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-amber"
          style={{ left: '50%', top: '50%', marginLeft: -3, marginTop: -3 }}
          animate={{
            x: [p.x, p.x * 0.3, p.x],
            y: [p.y, p.y * 0.3, p.y],
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.4, 0.8],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
      <motion.div
        className="h-3 w-3 rounded-full bg-amber/60"
        animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

export function LoadingAgora() {
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
      <CirculoConvergente />
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
