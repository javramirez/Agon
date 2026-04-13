'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ─── FASES DEL DIRECTOR ───────────────────────────────────────────────────────

export type CinematicPhase =
  | 'idle' // 0ms       — negro, silencio
  | 'anticipation' // 300ms     — punto de luz, pulso suave
  | 'build' // 900ms     — energía crece, partículas convergen
  | 'pre_reveal' // 1600ms    — silueta, rayos, micro zoom
  | 'flash' // 2000ms    — pantalla blanca, peak
  | 'reveal' // 2200ms    — carta aparece limpia
  | 'afterglow' // 3200ms    — partículas lentas, calma
  | 'control' // 4500ms    — botón continuar visible

// ─── TIMELINE ─────────────────────────────────────────────────────────────────

const TIMELINE: Record<CinematicPhase, number> = {
  idle: 0,
  anticipation: 300,
  build: 900,
  pre_reveal: 1600,
  flash: 2000,
  reveal: 2200,
  afterglow: 3200,
  control: 4500,
}

function getPhaseFromTime(elapsed: number): CinematicPhase {
  if (elapsed < TIMELINE.anticipation) return 'idle'
  if (elapsed < TIMELINE.build) return 'anticipation'
  if (elapsed < TIMELINE.pre_reveal) return 'build'
  if (elapsed < TIMELINE.flash) return 'pre_reveal'
  if (elapsed < TIMELINE.reveal) return 'flash'
  if (elapsed < TIMELINE.afterglow) return 'reveal'
  if (elapsed < TIMELINE.control) return 'afterglow'
  return 'control'
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

interface UseCinematicRevealOptions {
  autoStart?: boolean
  onPhaseChange?: (phase: CinematicPhase) => void
  onComplete?: () => void
}

export function useCinematicReveal(options: UseCinematicRevealOptions = {}) {
  const { autoStart = false, onPhaseChange, onComplete } = options

  const [phase, setPhase] = useState<CinematicPhase>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const lastPhaseRef = useRef<CinematicPhase>('idle')
  const completedRef = useRef(false)

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    setRunning(false)
    startTimeRef.current = null
  }, [])

  const reset = useCallback(() => {
    stop()
    setPhase('idle')
    setElapsed(0)
    setProgress(0)
    lastPhaseRef.current = 'idle'
    completedRef.current = false
  }, [stop])

  const tick = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp
      }

      const el = timestamp - startTimeRef.current
      setElapsed(el)

      const currentPhase = getPhaseFromTime(el)

      const phaseOrder: CinematicPhase[] = [
        'idle',
        'anticipation',
        'build',
        'pre_reveal',
        'flash',
        'reveal',
        'afterglow',
        'control',
      ]
      const phaseIdx = phaseOrder.indexOf(currentPhase)
      const nextPhase = phaseOrder[phaseIdx + 1]
      if (nextPhase) {
        const phaseStart = TIMELINE[currentPhase]
        const phaseEnd = TIMELINE[nextPhase]
        const phaseProgress = Math.min((el - phaseStart) / (phaseEnd - phaseStart), 1)
        setProgress(phaseProgress)
      } else {
        setProgress(1)
      }

      if (currentPhase !== lastPhaseRef.current) {
        lastPhaseRef.current = currentPhase
        setPhase(currentPhase)
        onPhaseChange?.(currentPhase)
      }

      if (currentPhase === 'control') {
        if (!completedRef.current) {
          completedRef.current = true
          onComplete?.()
        }
        setRunning(false)
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    },
    [onPhaseChange, onComplete]
  )

  const start = useCallback(() => {
    reset()
    setRunning(true)
    completedRef.current = false
    rafRef.current = requestAnimationFrame(tick)
  }, [reset, tick])

  useEffect(() => {
    if (autoStart) start()
    return () => stop()
  }, [autoStart, start, stop])

  const isFlashing = phase === 'flash'
  const isRevealed = phase === 'reveal' || phase === 'afterglow' || phase === 'control'
  const showCard = phase === 'reveal' || phase === 'afterglow' || phase === 'control'
  const showButton = phase === 'control'
  const showParticles =
    phase === 'build' ||
    phase === 'pre_reveal' ||
    phase === 'flash' ||
    phase === 'reveal' ||
    phase === 'afterglow'
  const showAnticipation = phase === 'anticipation' || phase === 'build' || phase === 'pre_reveal'
  const flashOpacity = phase === 'flash' ? Math.min(progress * 2, 1) : 0

  return {
    phase,
    elapsed,
    progress,
    running,
    isFlashing,
    isRevealed,
    showCard,
    showButton,
    showParticles,
    showAnticipation,
    flashOpacity,
    start,
    stop,
    reset,
  }
}
