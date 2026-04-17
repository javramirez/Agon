'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Agonista, PruebaDiaria } from '@/lib/db/schema'

/** Fila de agonista + prueba de hoy (si existe) desde /api/pulso */
export type AgonistaPulso = Agonista & { pruebas: PruebaDiaria | null }

interface PulsoData {
  agonista: AgonistaPulso
  antagonista: AgonistaPulso | null
}

export function usePulso(intervaloMs = 8000) {
  const [data, setData] = useState<PulsoData | null>(null)
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(
    null
  )
  const [antagonistaActivo, setAntagonistaActivo] = useState(false)
  const kleosAntagonistaPrev = useRef<number | null>(null)

  const fetchPulso = useCallback(async () => {
    try {
      const res = await fetch('/api/pulso')
      if (!res.ok) return

      const nuevo = (await res.json()) as
        | PulsoData
        | { esSolo: true; datos: null }

      if ('esSolo' in nuevo && nuevo.esSolo) {
        setData(null)
        setUltimaActualizacion(new Date())
        return
      }

      const pulsoDuelo = nuevo as PulsoData

      if (pulsoDuelo.antagonista) {
        const kleosNuevo = pulsoDuelo.antagonista.kleosTotal
        const anterior = kleosAntagonistaPrev.current
        if (anterior !== null && kleosNuevo > anterior) {
          setAntagonistaActivo(true)
          setTimeout(() => setAntagonistaActivo(false), 3000)
        }
        kleosAntagonistaPrev.current = kleosNuevo
      }

      setData(pulsoDuelo)
      setUltimaActualizacion(new Date())
    } catch {
      // Silencioso — no interrumpir la UI por fallos de polling
    }
  }, [])

  useEffect(() => {
    fetchPulso()

    const handlePruebaCompletada = () => void fetchPulso()
    window.addEventListener('agon:prueba-completada', handlePruebaCompletada)

    const intervalo = setInterval(fetchPulso, intervaloMs)
    return () => {
      clearInterval(intervalo)
      window.removeEventListener(
        'agon:prueba-completada',
        handlePruebaCompletada
      )
    }
  }, [fetchPulso, intervaloMs])

  return { data, ultimaActualizacion, antagonistaActivo, refetch: fetchPulso }
}
