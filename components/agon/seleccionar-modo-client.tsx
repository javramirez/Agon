'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

type Modo = 'solo' | 'duelo' | null

const PARTICLES = [
  { left: '8%', top: '15%', duration: 4.2, delay: 0 },
  { left: '88%', top: '12%', duration: 3.8, delay: 0.6 },
  { left: '20%', top: '78%', duration: 5.1, delay: 1.2 },
  { left: '75%', top: '82%', duration: 4.5, delay: 0.3 },
  { left: '50%', top: '8%', duration: 3.5, delay: 1.8 },
  { left: '92%', top: '50%', duration: 4.8, delay: 0.9 },
]

function ParticleField() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-amber/30"
          style={{ left: p.left, top: p.top }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0], y: [0, -24, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        />
      ))}
    </div>
  )
}

export function SeleccionarModoClient() {
  const [seleccionado, setSeleccionado] = useState<Modo>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function confirmar() {
    if (!seleccionado || cargando) return
    setCargando(true)
    setError('')

    try {
      const res = await fetch('/api/retos/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo: seleccionado }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? 'Error al crear el reto')
      }

      router.push('/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] text-foreground flex flex-col items-center justify-center p-6 relative">
      <ParticleField />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-lg w-full space-y-10 text-center"
      >
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="font-display text-6xl font-bold tracking-widest shimmer-text"
          >
            AGON
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-amber/70 tracking-widest uppercase font-body"
          >
            El Gran Reto
          </motion.p>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-display text-2xl font-bold"
          >
            ¿Cómo afrontas el desafío?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-muted-foreground font-body"
          >
            29 días. Siete pruebas diarias. Los dioses del Olimpo como testigos.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="grid grid-cols-1 gap-4"
        >
          <motion.button
            type="button"
            onClick={() => setSeleccionado('solo')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="relative text-left p-6 rounded-2xl border-2 transition-all duration-300"
            style={{
              borderColor:
                seleccionado === 'solo'
                  ? 'rgba(245,158,11,0.8)'
                  : 'rgba(255,255,255,0.08)',
              background:
                seleccionado === 'solo'
                  ? 'rgba(245,158,11,0.06)'
                  : 'rgba(255,255,255,0.02)',
            }}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚡</span>
              <div className="space-y-1">
                <p className="font-display font-bold text-lg text-amber">Solo</p>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  La competencia más difícil: contra ti mismo. Sin rival, sin
                  excusas. Solo el Altis y tus resultados.
                </p>
              </div>
            </div>
            {seleccionado === 'solo' && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4 w-5 h-5 rounded-full bg-amber flex items-center justify-center"
              >
                <span className="text-black text-xs font-bold">✓</span>
              </motion.div>
            )}
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setSeleccionado('duelo')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="relative text-left p-6 rounded-2xl border-2 transition-all duration-300"
            style={{
              borderColor:
                seleccionado === 'duelo'
                  ? 'rgba(196,30,30,0.8)'
                  : 'rgba(255,255,255,0.08)',
              background:
                seleccionado === 'duelo'
                  ? 'rgba(196,30,30,0.06)'
                  : 'rgba(255,255,255,0.02)',
            }}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚔️</span>
              <div className="space-y-1">
                <p
                  className="font-display font-bold text-lg"
                  style={{ color: seleccionado === 'duelo' ? '#C41E1E' : undefined }}
                >
                  Duelo
                </p>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  Desafía a un antagonista. Invítalo por link o email. La
                  rivalidad es el combustible.
                </p>
              </div>
            </div>
            {seleccionado === 'duelo' && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: '#C41E1E' }}
              >
                <span className="text-white text-xs font-bold">✓</span>
              </motion.div>
            )}
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          {seleccionado && (
            <motion.p
              key={seleccionado}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-xs text-muted-foreground/60 font-body italic"
            >
              {seleccionado === 'solo'
                ? 'Competirás contra tus propias metas y línea base declarada en el Pacto Inicial.'
                : 'Crearás el reto y podrás invitar a tu antagonista por link o email antes de comenzar.'}
            </motion.p>
          )}
        </AnimatePresence>

        {error && <p className="text-red-400 text-xs font-body text-center">{error}</p>}

        <motion.button
          type="button"
          onClick={confirmar}
          disabled={!seleccionado || cargando}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          whileHover={{ scale: seleccionado ? 1.02 : 1 }}
          whileTap={{ scale: seleccionado ? 0.97 : 1 }}
          className="w-full py-4 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-amber/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {cargando ? 'Iniciando...' : 'Comenzar el Agon'}
        </motion.button>

        <p className="text-xs text-muted-foreground/40 font-body">
          El modo no puede cambiarse una vez iniciado el reto.
        </p>
      </motion.div>
    </div>
  )
}

