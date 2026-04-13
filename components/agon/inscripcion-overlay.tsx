'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCinematicReveal, type CinematicPhase } from '@/hooks/use-cinematic-reveal'
import { useCinematicAudio } from '@/hooks/use-cinematic-audio'
import { InscripcionCard } from '@/components/agon/inscripcion-card'
import { getVisualTokens, getNarrativeIntensity } from '@/lib/inscripciones/visual-system'
import { INSCRIPCIONES } from '@/lib/db/constants'

// ─── PARTÍCULAS ───────────────────────────────────────────────────────────────

interface Particle {
  id: number
  x: number
  y: number
  angle: number
  distance: number
  size: number
  delay: number
}

function generateParticles(density: number, size: number): Particle[] {
  return Array.from({ length: density }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    angle: (i / density) * 360,
    distance: 80 + Math.random() * 120,
    size: size * (0.5 + Math.random() * 0.8),
    delay: Math.random() * 0.5,
  }))
}

function ParticleField({
  particles,
  color,
  phase,
}: {
  particles: Particle[]
  color: string
  phase: CinematicPhase
}) {
  const isConverging = phase === 'build' || phase === 'pre_reveal'
  const isExploding = phase === 'flash' || phase === 'reveal'
  const isFading = phase === 'afterglow'

  if (!isConverging && !isExploding && !isFading) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180
        const tx =
          isExploding || isFading
            ? Math.cos(rad) * p.distance
            : (50 - p.x) * 0.8
        const ty =
          isExploding || isFading
            ? Math.sin(rad) * p.distance
            : (50 - p.y) * 0.8

        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: color,
            }}
            animate={
              isConverging
                ? { x: tx, y: ty, opacity: [0, 0.8], scale: [0.5, 1] }
                : isExploding
                  ? {
                      x: [0, tx * 0.5, tx],
                      y: [0, ty * 0.5, ty],
                      opacity: [1, 0.6, 0],
                      scale: [1.5, 1, 0],
                    }
                  : { opacity: [0.4, 0], scale: [1, 0.5], x: tx * 0.3, y: ty * 0.3 }
            }
            transition={{
              duration: isConverging ? 0.7 : isExploding ? 0.8 : 2,
              delay: p.delay,
              ease: isConverging ? 'easeIn' : 'easeOut',
            }}
          />
        )
      })}
    </div>
  )
}

// ─── PUNTO DE ANTICIPACIÓN ───────────────────────────────────────────────────

function AnticipationDot({ color, phase }: { color: string; phase: CinematicPhase }) {
  const visible =
    phase === 'anticipation' || phase === 'build' || phase === 'pre_reveal'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: color }}
          initial={{ width: 4, height: 4, opacity: 0 }}
          animate={{
            width:
              phase === 'anticipation' ? [4, 8, 4] : phase === 'build' ? [8, 24, 8] : [24, 48, 24],
            height:
              phase === 'anticipation' ? [4, 8, 4] : phase === 'build' ? [8, 24, 8] : [24, 48, 24],
            opacity:
              phase === 'anticipation'
                ? [0, 0.6, 0]
                : phase === 'build'
                  ? [0.6, 1, 0.6]
                  : [1, 0.8, 1],
            boxShadow: [`0 0 8px ${color}`, `0 0 32px ${color}`, `0 0 8px ${color}`],
          }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </AnimatePresence>
  )
}

// ─── RAYOS DE LUZ ─────────────────────────────────────────────────────────────

function LightRays({ color, visible }: { color: string; visible: boolean }) {
  if (!visible) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: 2,
            height: '45%',
            background: `linear-gradient(180deg, ${color} 0%, transparent 100%)`,
            transformOrigin: 'bottom center',
            transform: `rotate(${i * 45}deg)`,
            bottom: '50%',
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: [0, 1, 0.8], opacity: [0, 0.8, 0.4] }}
          exit={{ scaleY: 0, opacity: 0 }}
          transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

// ─── SILUETA PRE-REVEAL ───────────────────────────────────────────────────────

function Silhouette({ icon, color }: { icon: string; color: string }) {
  return (
    <motion.div
      className="text-8xl select-none"
      style={{ filter: `drop-shadow(0 0 20px ${color})`, opacity: 0.3 }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: [0.8, 1.05, 1], opacity: [0, 0.3, 0.2] }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {icon}
    </motion.div>
  )
}

// ─── INDICADOR DE COLA ────────────────────────────────────────────────────────

function QueueIndicator({
  total,
  current,
  color,
}: {
  total: number
  current: number
  color: string
}) {
  if (total <= 1) return null

  return (
    <motion.div
      className="absolute top-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          animate={{
            width: i === current ? 20 : 6,
            height: 6,
            background: i <= current ? color : 'rgba(255,255,255,0.15)',
          }}
          transition={{ duration: 0.3 }}
        />
      ))}
      <p className="ml-2 font-body text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {current + 1} de {total}
      </p>
    </motion.div>
  )
}

// ─── OVERLAY PRINCIPAL ────────────────────────────────────────────────────────

interface Props {
  inscripcionIds: string[]
  onCerrar: () => void
}

export function InscripcionOverlay({ inscripcionIds, onCerrar }: Props) {
  const [indiceActual, setIndiceActual] = useState(0)
  const [visible, setVisible] = useState(false)
  const particlesRef = useRef<Particle[]>([])

  const inscripcionId = inscripcionIds[indiceActual] ?? null
  const config = INSCRIPCIONES.find((i) => i.id === inscripcionId)
  const tokens = inscripcionId ? getVisualTokens(inscripcionId) : null
  const { narrative, intensity } = inscripcionId
    ? getNarrativeIntensity(inscripcionId)
    : { narrative: 'origen' as const, intensity: 'forjada' as const }

  const isEpica = intensity === 'epica'
  const isEasterEgg = narrative === 'easter_egg'
  const esUltima = indiceActual === inscripcionIds.length - 1

  useEffect(() => {
    if (tokens) {
      particlesRef.current = generateParticles(tokens.particleDensity, tokens.particleSize)
    }
  }, [indiceActual, tokens])

  const handleComplete = useCallback(() => {
    // Director en 'control' — el botón ya es visible
  }, [])

  const { playPhase, resetAudio } = useCinematicAudio({
    easterEggId: isEasterEgg && inscripcionId ? inscripcionId : undefined,
  })

  const onPhaseChange = useCallback(
    (p: CinematicPhase) => {
      playPhase(p)
    },
    [playPhase]
  )

  const { phase, start, reset, showButton } = useCinematicReveal({
    onPhaseChange,
    onComplete: handleComplete,
  })

  useEffect(() => {
    if (inscripcionIds.length === 0) {
      setVisible(false)
      return
    }
    setIndiceActual(0)
    setVisible(true)
  }, [inscripcionIds])

  useEffect(() => {
    if (visible && inscripcionId) {
      start()
    }
  }, [visible, inscripcionId, start])

  function handleSiguiente() {
    if (esUltima) {
      cerrar()
      return
    }
    resetAudio()
    reset()
    setTimeout(() => {
      setIndiceActual((prev) => prev + 1)
    }, 300)
  }

  function cerrar() {
    resetAudio()
    reset()
    setVisible(false)
    setTimeout(onCerrar, 300)
  }

  if (!visible || !inscripcionId || !config || !tokens) return null

  const primaryColor = tokens.primaryColor
  const glowColor = tokens.glowColor
  const flashColor = tokens.flashColor

  return (
    <AnimatePresence>
      <motion.div
        key={`overlay-${indiceActual}`}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.97)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence>
          {phase === 'flash' && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-40"
              style={{ background: flashColor }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, tokens.flashIntensity, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          )}
        </AnimatePresence>

        {phase === 'control' && (
          <QueueIndicator
            total={inscripcionIds.length}
            current={indiceActual}
            color={primaryColor}
          />
        )}

        <AnimatePresence>
          {(phase === 'reveal' || phase === 'afterglow' || phase === 'control') && (
            <>
              <motion.div
                className="pointer-events-none absolute top-0 right-0 left-0 h-px"
                style={{
                  background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)`,
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              />
              <motion.div
                className="pointer-events-none absolute right-0 bottom-0 left-0 h-px"
                style={{
                  background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)`,
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </>
          )}
        </AnimatePresence>

        <ParticleField particles={particlesRef.current} color={primaryColor} phase={phase} />

        {tokens.lightRays && (
          <LightRays
            color={tokens.lightRayColor}
            visible={phase === 'pre_reveal' || phase === 'flash'}
          />
        )}

        <div className="relative z-30 flex min-h-[420px] w-full max-w-sm flex-col items-center justify-center gap-6">
          <AnticipationDot color={primaryColor} phase={phase} />

          <AnimatePresence>
            {phase === 'pre_reveal' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Silhouette icon={config.icono} color={glowColor} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(phase === 'reveal' || phase === 'afterglow' || phase === 'control') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 24 }}
                animate={{
                  opacity: 1,
                  scale: tokens.scaleOnReveal,
                  y: 0,
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  duration: 0.6,
                }}
              >
                <motion.div
                  animate={
                    phase === 'reveal' && (isEpica || isEasterEgg)
                      ? {
                          x: [0, -tokens.shake * 4, tokens.shake * 4, -tokens.shake * 2, 0],
                          y: [0, tokens.shake * 2, -tokens.shake * 2, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <InscripcionCard inscripcionId={inscripcionId} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showButton && (
              <motion.button
                type="button"
                onClick={handleSiguiente}
                className="rounded-xl font-display font-bold tracking-widest uppercase transition-colors"
                style={{
                  padding: '14px 32px',
                  fontSize: 11,
                  background: primaryColor,
                  color: '#000',
                  minWidth: 240,
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {esUltima
                  ? 'El Altis lo registra'
                  : `Ver siguiente (${indiceActual + 2} de ${inscripcionIds.length})`}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
