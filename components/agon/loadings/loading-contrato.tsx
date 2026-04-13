'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FRASES = [
  'Las reglas del Agon fueron escritas en sangre...',
  'Lo que se firma no puede deshacerse...',
  'El contrato es la primera prueba...',
  'Antes del combate, el juramento...',
  'El Altis fue testigo de lo que prometiste...',
]

function PergaminoSellado() {
  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <svg width="64" height="72" viewBox="0 0 64 72" fill="none">
        <motion.rect
          x="8"
          y="8"
          width="48"
          height="56"
          rx="3"
          stroke="rgba(245,158,11,0.6)"
          strokeWidth="1.5"
          fill="rgba(245,158,11,0.04)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', repeat: Infinity, repeatDelay: 2 }}
        />
        <motion.path
          d="M 8 8 C 8 4 12 2 16 4 C 12 4 12 8 8 8 Z"
          fill="rgba(245,158,11,0.3)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, repeat: Infinity, repeatDelay: 2.2 }}
        />
        <motion.path
          d="M 56 8 C 56 4 52 2 48 4 C 52 4 52 8 56 8 Z"
          fill="rgba(245,158,11,0.3)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, repeat: Infinity, repeatDelay: 2.2 }}
        />
        {[20, 28, 36, 44].map((y, i) => (
          <motion.line
            key={i}
            x1="16"
            y1={y}
            x2={i === 3 ? 36 : 48}
            y2={y}
            stroke="rgba(245,158,11,0.35)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.8 + i * 0.15,
              repeat: Infinity,
              repeatDelay: 1.8,
            }}
          />
        ))}
        <motion.circle
          cx="32"
          cy="58"
          r="8"
          stroke="rgba(245,158,11,0.9)"
          strokeWidth="1.5"
          fill="rgba(245,158,11,0.1)"
          initial={{ scale: 2, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 1.4,
            repeat: Infinity,
            repeatDelay: 1.3,
            ease: 'easeOut',
          }}
        />
        <motion.text
          x="32"
          y="62"
          textAnchor="middle"
          fontSize="8"
          fill="rgba(245,158,11,0.9)"
          fontFamily="serif"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, repeat: Infinity, repeatDelay: 1 }}
        >
          Α
        </motion.text>
      </svg>
      <motion.div
        className="absolute bottom-2 h-8 w-8 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)',
        }}
        animate={{ scale: [0, 1.5, 1], opacity: [0, 0.8, 0.3] }}
        transition={{ duration: 0.5, delay: 1.4, repeat: Infinity, repeatDelay: 1.3 }}
      />
    </div>
  )
}

export function LoadingContrato() {
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
      <PergaminoSellado />
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
