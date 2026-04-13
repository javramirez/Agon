'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FRASES = [
  'El Altis consulta las inscripciones...',
  'La piedra guarda lo que el tiempo olvida...',
  'Cada hazaña merece ser grabada...',
]

const TEXTO_GRIEGO = 'ΑΓΩΝ'

function TextoGrabandose() {
  const [letras, setLetras] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLetras((l) => {
        if (l >= TEXTO_GRIEGO.length) {
          setTimeout(() => setLetras(0), 800)
          return l
        }
        return l + 1
      })
    }, 300)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex flex-col items-center gap-3">
      <div className="relative rounded border border-amber/20 px-8 py-4">
        <motion.div
          className="absolute inset-0 rounded"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.03), transparent)',
          }}
        />
        <div className="font-display flex text-4xl tracking-[0.3em] text-amber">
          {TEXTO_GRIEGO.split('').map((letra, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: i < letras ? 1 : 0, y: i < letras ? 0 : -4 }}
              transition={{ duration: 0.2 }}
            >
              {letra}
            </motion.span>
          ))}
        </div>
        <motion.div
          className="absolute right-2 bottom-2 h-3 w-0.5 bg-amber/60"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-0.5 w-0.5 rounded-full bg-amber/40"
          style={{ left: `${20 + i * 20}%`, bottom: 0 }}
          animate={{ y: [0, 12, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

export function LoadingInscripciones() {
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
      <TextoGrabandose />
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
