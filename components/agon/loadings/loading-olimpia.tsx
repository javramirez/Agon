'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FRASES = [
  'Las facciones deliberan...',
  'La Ciudad de Olimpia despierta...',
  'Los dioses observan sus dominios...',
  'El Altis convoca a los líderes...',
]

// 5 columnas del templo
const COLUMNAS = [
  { x: 12, delay: 0 },
  { x: 24, delay: 0.18 },
  { x: 36, delay: 0.36 },
  { x: 48, delay: 0.54 },
  { x: 60, delay: 0.72 },
]

function Templo() {
  const [fase, setFase] = useState<'columnas' | 'fronton' | 'pulso'>('columnas')
  const [columnasVisibles, setColumnasVisibles] = useState(0)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const clearAll = () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms)
      timeoutsRef.current.push(id)
    }

    function ciclo() {
      clearAll()
      setFase('columnas')
      setColumnasVisibles(0)

      // Construir columnas una a una
      COLUMNAS.forEach((_, i) => {
        schedule(() => setColumnasVisibles(i + 1), i * 180 + 200)
      })

      // Frontón aparece después de todas las columnas
      const baseFreonton = COLUMNAS.length * 180 + 400
      schedule(() => setFase('fronton'), baseFreonton)

      // Pulso final
      schedule(() => setFase('pulso'), baseFreonton + 600)

      // Reinicio
      schedule(() => ciclo(), baseFreonton + 3200)
    }

    ciclo()
    return () => clearAll()
  }, [])

  return (
    <div className="relative flex h-40 w-44 items-center justify-center">
      {/* Halo de fondo */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)',
        }}
        animate={fase === 'pulso' ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.5 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg
        width="100"
        height="100"
        viewBox="0 0 80 90"
        fill="none"
        className="relative z-[1]"
        overflow="visible"
      >
        {/* ─── ESTILOBATO (base) ─────────────────────── */}
        <motion.rect
          x="8"
          y="74"
          width="64"
          height="4"
          rx="1"
          fill="rgba(245,158,11,0.12)"
          stroke="rgba(245,158,11,0.4)"
          strokeWidth="0.8"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          style={{ transformOrigin: '40px 76px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Estereóbato (escalón inferior) */}
        <motion.rect
          x="4"
          y="78"
          width="72"
          height="3"
          rx="1"
          fill="rgba(245,158,11,0.08)"
          stroke="rgba(245,158,11,0.25)"
          strokeWidth="0.8"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          style={{ transformOrigin: '40px 79px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        />

        {/* ─── COLUMNAS ──────────────────────────────── */}
        {COLUMNAS.map((col, i) => {
          const visible = i < columnasVisibles
          return (
            <g key={i}>
              {/* Capitel (cima de columna) */}
              <motion.rect
                x={col.x - 1}
                y={28}
                width={10}
                height={3}
                rx="0.5"
                fill="rgba(245,158,11,0.15)"
                stroke="rgba(245,158,11,0.4)"
                strokeWidth="0.8"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={visible ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
                style={{ transformOrigin: `${col.x + 4}px 31px` }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              />
              {/* Fuste (cuerpo columna) — crece de abajo hacia arriba */}
              <motion.rect
                x={col.x + 1}
                y={31}
                width={6}
                height={43}
                rx="0.5"
                fill="rgba(245,158,11,0.06)"
                stroke="rgba(245,158,11,0.35)"
                strokeWidth="0.8"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={
                  visible
                    ? fase === 'pulso'
                      ? { scaleY: 1, opacity: [0.6, 1, 0.6] }
                      : { scaleY: 1, opacity: 1 }
                    : { scaleY: 0, opacity: 0 }
                }
                style={{ transformOrigin: `${col.x + 4}px 74px` }}
                transition={
                  fase === 'pulso'
                    ? { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }
                    : { duration: 0.35, ease: 'easeOut' }
                }
              />
              {/* Base de columna */}
              <motion.rect
                x={col.x}
                y={71}
                width={8}
                height={3}
                rx="0.5"
                fill="rgba(245,158,11,0.12)"
                stroke="rgba(245,158,11,0.3)"
                strokeWidth="0.8"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={visible ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
                style={{ transformOrigin: `${col.x + 4}px 74px` }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            </g>
          )
        })}

        {/* ─── FRONTÓN (triángulo) ───────────────────── */}
        <motion.path
          d="M 8 28 L 40 10 L 72 28 Z"
          fill="rgba(245,158,11,0.06)"
          stroke="rgba(245,158,11,0.5)"
          strokeWidth="1"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={
            fase === 'fronton' || fase === 'pulso'
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: 0, opacity: 0 }
          }
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Línea del entablamento */}
        <motion.line
          x1="8"
          y1="28"
          x2="72"
          y2="28"
          stroke="rgba(245,158,11,0.35)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={
            fase === 'fronton' || fase === 'pulso'
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: 0, opacity: 0 }
          }
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Punto ámbar en el vértice del frontón */}
        <motion.circle
          cx="40"
          cy="10"
          r="2"
          fill="rgba(245,158,11,0.9)"
          initial={{ scale: 0, opacity: 0 }}
          animate={
            fase === 'pulso'
              ? { scale: [1, 1.6, 1], opacity: [0.7, 1, 0.7] }
              : fase === 'fronton'
                ? { scale: 1, opacity: 1 }
                : { scale: 0, opacity: 0 }
          }
          transition={
            fase === 'pulso'
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.3, type: 'spring', stiffness: 300 }
          }
        />

      </svg>
    </div>
  )
}

export function LoadingOlimpia() {
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
      <Templo />
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
