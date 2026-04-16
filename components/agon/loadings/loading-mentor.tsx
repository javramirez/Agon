'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FRASES = [
  'El Mentor lee el cielo...',
  'Las estrellas revelan el camino...',
  'El destino toma forma en el firmamento...',
  'Tu guía consulta las constelaciones...',
]

interface Estrella {
  id: string
  x: number
  y: number
  r: number
  principal?: boolean
}

interface Constelacion {
  nombre: string
  estrellas: Estrella[]
  lineas: [string, string][]
}

// ─── LEÓNIDAS — figura con escudo y lanza ────────────────────────────────────
const LEONIDAS: Constelacion = {
  nombre: 'LEÓNIDAS',
  estrellas: [
    { id: 'cabeza', x: 48, y: 8, r: 2.5, principal: true },
    { id: 'hombro_d', x: 60, y: 20, r: 2 },
    { id: 'hombro_i', x: 36, y: 20, r: 2 },
    { id: 'lanza_a', x: 66, y: 10, r: 2, principal: true },
    { id: 'lanza_b', x: 72, y: 2, r: 1.5 },
    { id: 'escudo_a', x: 28, y: 30, r: 2.5, principal: true },
    { id: 'escudo_b', x: 22, y: 42, r: 1.8 },
    { id: 'pecho', x: 48, y: 34, r: 2 },
    { id: 'cadera', x: 48, y: 50, r: 1.8 },
    { id: 'rodilla_d', x: 56, y: 64, r: 1.5 },
    { id: 'rodilla_i', x: 40, y: 64, r: 1.5 },
    { id: 'pie_d', x: 58, y: 78, r: 1.5 },
    { id: 'pie_i', x: 38, y: 78, r: 1.5 },
  ],
  lineas: [
    ['cabeza', 'hombro_d'],
    ['cabeza', 'hombro_i'],
    ['hombro_d', 'lanza_a'],
    ['lanza_a', 'lanza_b'],
    ['hombro_i', 'escudo_a'],
    ['escudo_a', 'escudo_b'],
    ['hombro_d', 'pecho'],
    ['hombro_i', 'pecho'],
    ['pecho', 'cadera'],
    ['cadera', 'rodilla_d'],
    ['cadera', 'rodilla_i'],
    ['rodilla_d', 'pie_d'],
    ['rodilla_i', 'pie_i'],
  ],
}

// ─── DÉDALO — figura con alas extendidas ─────────────────────────────────────
const DEDALO: Constelacion = {
  nombre: 'DÉDALO',
  estrellas: [
    { id: 'cabeza', x: 48, y: 8, r: 2.5, principal: true },
    { id: 'hombro_d', x: 62, y: 20, r: 2 },
    { id: 'hombro_i', x: 34, y: 20, r: 2 },
    { id: 'ala_d1', x: 74, y: 16, r: 2, principal: true },
    { id: 'ala_d2', x: 84, y: 28, r: 1.8 },
    { id: 'ala_d3', x: 80, y: 40, r: 1.5 },
    { id: 'ala_i1', x: 22, y: 16, r: 2, principal: true },
    { id: 'ala_i2', x: 12, y: 28, r: 1.8 },
    { id: 'ala_i3', x: 16, y: 40, r: 1.5 },
    { id: 'pecho', x: 48, y: 34, r: 2 },
    { id: 'cadera', x: 48, y: 52, r: 1.8 },
    { id: 'pie_d', x: 56, y: 72, r: 1.5 },
    { id: 'pie_i', x: 40, y: 72, r: 1.5 },
  ],
  lineas: [
    ['cabeza', 'hombro_d'],
    ['cabeza', 'hombro_i'],
    ['hombro_d', 'ala_d1'],
    ['ala_d1', 'ala_d2'],
    ['ala_d2', 'ala_d3'],
    ['hombro_i', 'ala_i1'],
    ['ala_i1', 'ala_i2'],
    ['ala_i2', 'ala_i3'],
    ['hombro_d', 'pecho'],
    ['hombro_i', 'pecho'],
    ['pecho', 'cadera'],
    ['cadera', 'pie_d'],
    ['cadera', 'pie_i'],
  ],
}

// ─── ODISEO — figura con arco ────────────────────────────────────────────────
const ODISEO: Constelacion = {
  nombre: 'ODISEO',
  estrellas: [
    { id: 'cabeza', x: 48, y: 8, r: 2.5, principal: true },
    { id: 'hombro_d', x: 60, y: 20, r: 2 },
    { id: 'hombro_i', x: 36, y: 20, r: 2 },
    { id: 'codo_d', x: 70, y: 28, r: 1.8 },
    { id: 'arco_sup', x: 76, y: 16, r: 2, principal: true },
    { id: 'arco_inf', x: 76, y: 40, r: 1.8 },
    { id: 'mano_i', x: 28, y: 28, r: 1.5 },
    { id: 'pecho', x: 48, y: 34, r: 2, principal: true },
    { id: 'cadera', x: 48, y: 50, r: 1.8 },
    { id: 'rodilla_d', x: 56, y: 64, r: 1.5 },
    { id: 'rodilla_i', x: 40, y: 64, r: 1.5 },
    { id: 'pie_d', x: 58, y: 78, r: 1.5 },
    { id: 'pie_i', x: 38, y: 78, r: 1.5 },
  ],
  lineas: [
    ['cabeza', 'hombro_d'],
    ['cabeza', 'hombro_i'],
    ['hombro_d', 'codo_d'],
    ['codo_d', 'arco_sup'],
    ['arco_sup', 'arco_inf'],
    ['hombro_i', 'mano_i'],
    ['hombro_d', 'pecho'],
    ['hombro_i', 'pecho'],
    ['pecho', 'cadera'],
    ['cadera', 'rodilla_d'],
    ['cadera', 'rodilla_i'],
    ['rodilla_d', 'pie_d'],
    ['rodilla_i', 'pie_i'],
  ],
}

// ─── DIÓGENES — figura sentada con linterna ───────────────────────────────────
const DIOGENES: Constelacion = {
  nombre: 'DIÓGENES',
  estrellas: [
    { id: 'cabeza', x: 48, y: 14, r: 2.5, principal: true },
    { id: 'hombro_d', x: 60, y: 26, r: 2 },
    { id: 'hombro_i', x: 36, y: 26, r: 2 },
    { id: 'linterna', x: 72, y: 20, r: 2.5, principal: true },
    { id: 'brazo_d', x: 66, y: 28, r: 1.5 },
    { id: 'pecho', x: 48, y: 38, r: 2 },
    { id: 'rodilla_d', x: 62, y: 54, r: 1.8, principal: true },
    { id: 'rodilla_i', x: 36, y: 54, r: 1.8 },
    { id: 'pie_d', x: 68, y: 68, r: 1.5 },
    { id: 'pie_i', x: 32, y: 66, r: 1.5 },
    { id: 'baston', x: 24, y: 72, r: 1.2 },
  ],
  lineas: [
    ['cabeza', 'hombro_d'],
    ['cabeza', 'hombro_i'],
    ['hombro_d', 'brazo_d'],
    ['brazo_d', 'linterna'],
    ['hombro_d', 'pecho'],
    ['hombro_i', 'pecho'],
    ['pecho', 'rodilla_d'],
    ['pecho', 'rodilla_i'],
    ['rodilla_d', 'pie_d'],
    ['rodilla_i', 'pie_i'],
    ['rodilla_i', 'baston'],
  ],
}

// ─── QUIRÓN — centauro ────────────────────────────────────────────────────────
const QUIRON: Constelacion = {
  nombre: 'QUIRÓN',
  estrellas: [
    { id: 'cabeza', x: 58, y: 10, r: 2.5, principal: true },
    { id: 'hombro_d', x: 66, y: 22, r: 2 },
    { id: 'hombro_i', x: 50, y: 22, r: 2 },
    { id: 'pecho', x: 58, y: 34, r: 2, principal: true },
    { id: 'union', x: 46, y: 46, r: 2 },
    { id: 'lomo', x: 32, y: 42, r: 1.8 },
    { id: 'cola', x: 18, y: 36, r: 1.5 },
    { id: 'pata_ad', x: 52, y: 62, r: 1.5 },
    { id: 'pata_ai', x: 40, y: 62, r: 1.5 },
    { id: 'pata_pd', x: 28, y: 60, r: 1.5, principal: true },
    { id: 'pata_pi', x: 16, y: 58, r: 1.2 },
  ],
  lineas: [
    ['cabeza', 'hombro_d'],
    ['cabeza', 'hombro_i'],
    ['hombro_d', 'pecho'],
    ['hombro_i', 'pecho'],
    ['pecho', 'union'],
    ['union', 'lomo'],
    ['lomo', 'cola'],
    ['union', 'pata_ad'],
    ['union', 'pata_ai'],
    ['lomo', 'pata_pd'],
    ['cola', 'pata_pi'],
  ],
}

// ─── HÉRCULES — figura con maza ──────────────────────────────────────────────
const HERCULES: Constelacion = {
  nombre: 'HÉRCULES',
  estrellas: [
    { id: 'cabeza', x: 48, y: 6, r: 2.5, principal: true },
    { id: 'hombro_d', x: 62, y: 18, r: 2.2 },
    { id: 'hombro_i', x: 34, y: 18, r: 2.2 },
    { id: 'maza_a', x: 72, y: 10, r: 2, principal: true },
    { id: 'maza_b', x: 80, y: 4, r: 2.5, principal: true },
    { id: 'codo_i', x: 26, y: 28, r: 1.8 },
    { id: 'pecho', x: 48, y: 32, r: 2.2, principal: true },
    { id: 'cadera', x: 48, y: 50, r: 2 },
    { id: 'rodilla_d', x: 58, y: 64, r: 1.8 },
    { id: 'rodilla_i', x: 38, y: 64, r: 1.8 },
    { id: 'pie_d', x: 62, y: 80, r: 1.5 },
    { id: 'pie_i', x: 34, y: 80, r: 1.5 },
  ],
  lineas: [
    ['cabeza', 'hombro_d'],
    ['cabeza', 'hombro_i'],
    ['hombro_d', 'maza_a'],
    ['maza_a', 'maza_b'],
    ['hombro_i', 'codo_i'],
    ['hombro_d', 'pecho'],
    ['hombro_i', 'pecho'],
    ['pecho', 'cadera'],
    ['cadera', 'rodilla_d'],
    ['cadera', 'rodilla_i'],
    ['rodilla_d', 'pie_d'],
    ['rodilla_i', 'pie_i'],
  ],
}

const CONSTELACIONES: Constelacion[] = [
  LEONIDAS,
  DEDALO,
  ODISEO,
  DIOGENES,
  QUIRON,
  HERCULES,
]

function getEstrella(c: Constelacion, id: string): Estrella {
  return c.estrellas.find((e) => e.id === id)!
}

// Sorteo estable por sesión
function sortearConstelacion(): Constelacion {
  const idx = Math.floor(Math.random() * CONSTELACIONES.length)
  return CONSTELACIONES[idx]
}

function MapaEstrellas() {
  // Sorteamos una sola vez al montar
  const constelacionRef = useRef<Constelacion | null>(null)
  if (constelacionRef.current === null) {
    const constelacionSorteada = sortearConstelacion()
    constelacionRef.current = constelacionSorteada
  }
  const constelacion = constelacionRef.current

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

      const MS_ESTRELLA = 80
      const MS_LINEA = 100

      constelacion.estrellas.forEach((_, i) => {
        schedule(() => setEstrellasVisibles(i + 1), i * MS_ESTRELLA + 100)
      })

      const baseLineas = constelacion.estrellas.length * MS_ESTRELLA + 200
      schedule(() => setFase('lineas'), baseLineas)

      constelacion.lineas.forEach((_, i) => {
        schedule(() => setLineasVisibles(i + 1), baseLineas + i * MS_LINEA)
      })

      const basePulso = baseLineas + constelacion.lineas.length * MS_LINEA + 200
      schedule(() => setFase('pulso'), basePulso)

      // Reinicio a los 4000ms
      schedule(() => ciclo(), 4000)
    }

    ciclo()
    return () => clearAll()
  }, [constelacion])

  return (
    <div className="relative flex h-48 w-48 items-center justify-center">
      {/* Halo */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)',
        }}
        animate={fase === 'pulso' ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.5 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Estrellas decorativas de fondo */}
      <svg className="absolute inset-0" width="192" height="192" viewBox="0 0 96 96">
        {[
          [6, 10],
          [84, 6],
          [92, 52],
          [4, 72],
          [90, 82],
          [14, 88],
          [78, 18],
          [52, 4],
          [2, 42],
          [94, 34],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.6" fill="rgba(255,255,255,0.12)" />
        ))}
      </svg>

      <svg width="160" height="160" viewBox="0 0 96 96" fill="none" className="relative z-10" overflow="visible">
        {/* Líneas */}
        {constelacion.lineas.map(([a, b], i) => {
          const ea = getEstrella(constelacion, a)
          const eb = getEstrella(constelacion, b)
          const visible = i < lineasVisibles
          return (
            <motion.line
              key={`${a}-${b}`}
              x1={ea.x}
              y1={ea.y}
              x2={eb.x}
              y2={eb.y}
              stroke="rgba(245,158,11,0.28)"
              strokeWidth="0.8"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                visible
                  ? fase === 'pulso'
                    ? { pathLength: 1, opacity: [0.2, 0.5, 0.2] }
                    : { pathLength: 1, opacity: 1 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={
                fase === 'pulso'
                  ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.25, ease: 'easeOut' }
              }
            />
          )
        })}

        {/* Estrellas */}
        {constelacion.estrellas.map((e, i) => {
          const visible = i < estrellasVisibles
          // Principales: azul. Secundarias: ámbar tenue
          const colorHalo = e.principal ? 'rgba(147,197,253,0.18)' : 'rgba(245,158,11,0.08)'
          const colorNucleo = e.principal ? 'rgba(147,197,253,0.95)' : 'rgba(245,200,100,0.80)'

          return (
            <g key={e.id}>
              {/* Halo */}
              <motion.circle
                cx={e.x}
                cy={e.y}
                r={e.r * 2.8}
                fill={colorHalo}
                initial={{ scale: 0, opacity: 0 }}
                animate={
                  visible
                    ? fase === 'pulso'
                      ? { scale: [1, 1.6, 1], opacity: [0.3, 0.8, 0.3] }
                      : { scale: 1, opacity: 0.7 }
                    : { scale: 0, opacity: 0 }
                }
                transition={
                  fase === 'pulso'
                    ? { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.06 }
                    : { duration: 0.25 }
                }
              />
              {/* Núcleo */}
              <motion.circle
                cx={e.x}
                cy={e.y}
                r={e.r}
                fill={colorNucleo}
                initial={{ scale: 0, opacity: 0 }}
                animate={
                  visible
                    ? fase === 'pulso'
                      ? { scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }
                      : { scale: 1, opacity: 1 }
                    : { scale: 0, opacity: 0 }
                }
                transition={
                  fase === 'pulso'
                    ? { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.06 }
                    : { duration: 0.25, type: 'spring', stiffness: 300 }
                }
              />
              {/* Brillo en principales */}
              {e.principal && (
                <motion.circle
                  cx={e.x + e.r * 0.3}
                  cy={e.y - e.r * 0.3}
                  r={e.r * 0.35}
                  fill="rgba(255,255,255,0.6)"
                  initial={{ opacity: 0 }}
                  animate={visible ? { opacity: 0.7 } : { opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              )}
            </g>
          )
        })}

        {/* Nombre en fase pulso */}
        <AnimatePresence>
          {fase === 'pulso' && (
            <motion.text
              key="label"
              x="48"
              y="94"
              textAnchor="middle"
              fontSize="5.5"
              fill="rgba(147,197,253,0.5)"
              fontFamily="serif"
              letterSpacing="3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {constelacion.nombre}
            </motion.text>
          )}
        </AnimatePresence>
      </svg>
    </div>
  )
}

export function LoadingMentor() {
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
      <MapaEstrellas />
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

