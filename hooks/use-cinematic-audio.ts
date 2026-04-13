'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { CinematicPhase } from './use-cinematic-reveal'

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────

const BASE_SOUNDS: Partial<Record<CinematicPhase, string>> = {
  build: '/sounds/build.mp3',
  flash: '/sounds/impact.mp3',
  reveal: '/sounds/reveal.mp3',
  afterglow: '/sounds/afterglow.mp3',
}

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface UseCinematicAudioOptions {
  easterEggId?: string
  enabled?: boolean
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useCinematicAudio(options: UseCinematicAudioOptions = {}) {
  const { easterEggId, enabled = true } = options

  const audioMapRef = useRef<Partial<Record<CinematicPhase, HTMLAudioElement>>>({})

  useEffect(() => {
    if (!enabled) {
      for (const audio of Object.values(audioMapRef.current)) {
        audio.pause()
        audio.src = ''
      }
      audioMapRef.current = {}
      return
    }

    const map: Partial<Record<CinematicPhase, HTMLAudioElement>> = {}

    for (const [phase, src] of Object.entries(BASE_SOUNDS) as [CinematicPhase, string][]) {
      const audio = new Audio()
      audio.preload = 'auto'

      if (phase === 'reveal' && easterEggId) {
        audio.src = `/sounds/easter/${easterEggId}.mp3`
      } else {
        audio.src = src
      }

      map[phase] = audio
    }

    audioMapRef.current = map

    return () => {
      for (const audio of Object.values(map)) {
        audio.pause()
        audio.src = ''
      }
      audioMapRef.current = {}
    }
  }, [enabled, easterEggId])

  const playPhase = useCallback(
    (phase: CinematicPhase) => {
      if (!enabled) return
      const audio = audioMapRef.current[phase]
      if (!audio) return
      audio.currentTime = 0
      void audio.play().catch(() => {})
    },
    [enabled]
  )

  const resetAudio = useCallback(() => {
    for (const audio of Object.values(audioMapRef.current)) {
      audio.pause()
      audio.currentTime = 0
    }
  }, [])

  return { playPhase, resetAudio }
}
