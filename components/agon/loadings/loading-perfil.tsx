'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FRASES = [
  'La leyenda toma forma...',
  'El Altis mide tu camino...',
  'Tu historia en el Agon se despliega...',
]

const ESTRELLAS = [
  { id: 'betelgeuse', x: 32, y: 18, r: 2.5, nombre: 'Betelgeuse' },
  { id: 'bellatrix', x: 68, y: 20, r: 2, nombre: 'Bellatrix' },
  { id: 'mintaka', x: 42, y: 48, r: 1.5, nombre: 'Mintaka' },
  { id: 'alnilam', x: 54, y: 50, r: 1.5, nombre: 'Alnilam' },
  { id: 'alnitak', x: 63, y: 52, r: 1.5, nombre: 'Alnitak' },
  { id: 'saiph', x: 36, y: 78, r: 2, nombre: 'Saiph' },
  { id: 'rigel', x: 70, y: 76, r: 2.5, nombre: 'Rigel' },
  { id: 'cabeza', x: 50, y: 6, r: 1.5, nombre: 'Cabeza' },
  { id: 'mano_izq', x: 14, y: 38, r: 1.2, nombre: 'Mano izq' },
  { id: 'mano_der', x: 82, y: 34, r: 1.2, nombre: 'Mano der' },
  { id: 'pie_izq', x: 32, y: 94, r: 1.5, nombre: 'Pie izq' },
  { id: 'pie_der', x: 68, y: 92, r: 1.5, nombre: 'Pie der' },
] as const

const LINEAS: [string, string][] = [
  ['cabeza', 'betelgeuse'],
  ['cabeza', 'bellatrix'],
  ['betelgeuse', 'bellatrix'],
  ['betelgeuse', 'mintaka'],
  ['bellatrix', 'alnitak'],
  ['mintaka', 'alnilam'],
  ['alnilam', 'alnitak'],
  ['mintaka', 'saiph'],
  ['alnitak', 'rigel'],
  ['saiph', 'pie_izq'],
  ['rigel', 'pie_der'],
  ['betelgeuse', 'mano_izq'],
  ['bellatrix', 'mano_der'],
]

function getEstrella(id: string) {
  return ESTRELLAS.find((e) => e.id === id)!
}

function ConstellationOrion() {
  const [fase, setFase] = useState<'estrellas' | 'lineas' | 'pulso'>('estrellas')
  const [estrellasVisibles, setEstrellasVisibles] = useState(0)
  const [lineasVisibles, setLineasVisibles] = useState(0)
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

      setFase('estrellas')
      setEstrellasVisibles(0)
      setLineasVisibles(0)

      ESTRELLAS.forEach((_, i) => {
        schedule(() => setEstrellasVisibles(i + 1), i * 120)
      })

      const baseLineas = ESTRELLAS.length * 120 + 200
      schedule(() => setFase('lineas'), baseLineas)

      LINEAS.forEach((_, i) => {
        schedule(() => setLineasVisibles(i + 1), baseLineas + i * 150)
      })

      const basePulso = baseLineas + LINEAS.length * 150 + 400
      schedule(() => setFase('pulso'), basePulso)
      schedule(() => ciclo(), basePulso + 2500)
    }

    ciclo()
    return () => clearAll()
  }, [])

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)',
        }}
        animate={fase === 'pulso' ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.5 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg
        width="96"
        height="112"
        viewBox="0 0 96 112"
        fill="none"
        className="relative z-[1]"
        overflow="visible"
      >
        {LINEAS.map(([a, b], i) => {
          const ea = getEstrella(a)
          const eb = getEstrella(b)
          const visible = i < lineasVisibles
          return (
            <motion.path
              key={`${a}-${b}`}
              d={`M ${ea.x} ${ea.y} L ${eb.x} ${eb.y}`}
              stroke="rgba(245,158,11,0.35)"
              strokeWidth="0.8"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                visible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }
              }
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          )
        })}

        {ESTRELLAS.map((e, i) => {
          const visible = i < estrellasVisibles
          const esPrincipal = ['betelgeuse', 'rigel', 'bellatrix', 'saiph'].includes(e.id)
          const esCinturon = ['mintaka', 'alnilam', 'alnitak'].includes(e.id)

          return (
            <g key={e.id} style={{ transformOrigin: `${e.x}px ${e.y}px` }}>
              <motion.circle
                cx={e.x}
                cy={e.y}
                r={e.r * 2.5}
                fill={
                  esPrincipal
                    ? 'rgba(245,158,11,0.15)'
                    : esCinturon
                      ? 'rgba(200,220,255,0.12)'
                      : 'rgba(245,158,11,0.08)'
                }
                initial={{ scale: 0, opacity: 0 }}
                animate={
                  visible
                    ? fase === 'pulso'
                      ? { scale: [1, 1.5, 1], opacity: [0.4, 0.9, 0.4] }
                      : { scale: 1, opacity: 0.6 }
                    : { scale: 0, opacity: 0 }
                }
                transition={
                  fase === 'pulso'
                    ? { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }
                    : { duration: 0.3 }
                }
              />
              <motion.circle
                cx={e.x}
                cy={e.y}
                r={e.r}
                fill={
                  esCinturon ? 'rgba(200,220,255,0.95)' : 'rgba(245,158,11,0.95)'
                }
                initial={{ scale: 0, opacity: 0 }}
                animate={
                  visible
                    ? fase === 'pulso'
                      ? { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }
                      : { scale: 1, opacity: 1 }
                    : { scale: 0, opacity: 0 }
                }
                transition={
                  fase === 'pulso'
                    ? { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }
                    : { duration: 0.3, type: 'spring', stiffness: 300 }
                }
              />
            </g>
          )
        })}

        <AnimatePresence>
          {fase === 'pulso' && (
            <motion.text
              key="orion-label"
              x="48"
              y="108"
              textAnchor="middle"
              fontSize="6"
              fill="rgba(245,158,11,0.5)"
              fontFamily="serif"
              letterSpacing="3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              ORION
            </motion.text>
          )}
        </AnimatePresence>
      </svg>
    </div>
  )
}

export function LoadingPerfil() {
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
      <ConstellationOrion />
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
