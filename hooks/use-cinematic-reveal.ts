'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

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

export type CinematicIntensity = 'forjada' | 'epica' | 'easter_egg'

function buildTimeline(
  intensity: CinematicIntensity
): Record<CinematicPhase, number> {
  switch (intensity) {
    case 'epica':
      return {
        idle: 0,
        anticipation: 300,
        build: 900,
        pre_reveal: 1600,
        flash: 2000,
        reveal: 2200,
        afterglow: 3200,
        control: 5800, // afterglow más largo — 2.6s en vez de 1.3s
      }
    case 'easter_egg':
      return {
        idle: 0,
        anticipation: 200,
        build: 700,
        pre_reveal: 1400,
        flash: 1800,
        reveal: 2000,
        afterglow: 3000,
        control: 6200, // el más largo — easter eggs merecen el momento
      }
    default: // forjada
      return {
        idle: 0,
        anticipation: 300,
        build: 900,
        pre_reveal: 1600,
        flash: 2000,
        reveal: 2200,
        afterglow: 3200,
        control: 4500,
      }
  }
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

interface UseCinematicRevealOptions {
  autoStart?: boolean
  intensity?: CinematicIntensity
  onPhaseChange?: (phase: CinematicPhase) => void
  onComplete?: () => void
}

export function useCinematicReveal(options: UseCinematicRevealOptions = {}) {
  const { autoStart = false, intensity = 'forjada', onPhaseChange, onComplete } =
    options
  const timeline = useMemo(() => buildTimeline(intensity), [intensity])

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

  function getPhase(elapsedMs: number): CinematicPhase {
    if (elapsedMs < timeline.anticipation) return 'idle'
    if (elapsedMs < timeline.build) return 'anticipation'
    if (elapsedMs < timeline.pre_reveal) return 'build'
    if (elapsedMs < timeline.flash) return 'pre_reveal'
    if (elapsedMs < timeline.reveal) return 'flash'
    if (elapsedMs < timeline.afterglow) return 'reveal'
    if (elapsedMs < timeline.control) return 'afterglow'
    return 'control'
  }

  const tick = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp
      }

      const el = timestamp - startTimeRef.current
      setElapsed(el)

      const currentPhase = getPhase(el)

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
        const phaseStart = timeline[currentPhase]
        const phaseEnd = timeline[nextPhase]
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
    [onPhaseChange, onComplete, timeline]
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
