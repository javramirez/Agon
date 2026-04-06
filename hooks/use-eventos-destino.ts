'use client'

import { useState, useCallback, useRef } from 'react'
import { mostrarToast } from '@/components/agon/toast-agon'

interface EventosState {
  destinoLatente: string | null
  eventoActivado: boolean
  pruebaDestinoId: string | null
}

export function useEventosDestino() {
  const [estado, setEstado] = useState<EventosState>({
    destinoLatente: null,
    eventoActivado: false,
    pruebaDestinoId: null,
  })
  const verificadoRef = useRef(false)

  const verificar = useCallback(async () => {
    if (verificadoRef.current) return
    verificadoRef.current = true

    try {
      const res = await fetch('/api/eventos/verificar')
      if (!res.ok) return
      const data = (await res.json()) as {
        destinoLatente?: string | null
        semanaSagradaActivada?: boolean
      }

      if (data.semanaSagradaActivada) {
        mostrarToast({
          tipo: 'exito',
          icono: '⚡',
          mensaje:
            'El Altis proclama La Semana Sagrada. Todo el kleos vale el doble.',
        })
      }

      if (data.destinoLatente) {
        setEstado((prev) => ({
          ...prev,
          destinoLatente: data.destinoLatente ?? null,
        }))
      }
    } catch {
      // Silencioso
    }
  }, [])

  const activarDestino = useCallback(async () => {
    if (!estado.destinoLatente || estado.eventoActivado) return

    try {
      const res = await fetch('/api/eventos/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pruebaId: estado.destinoLatente }),
      })

      if (!res.ok) return
      const data = (await res.json()) as { activado?: boolean }

      if (data.activado) {
        setEstado((prev) => ({
          ...prev,
          eventoActivado: true,
          pruebaDestinoId: prev.destinoLatente,
        }))
      }
    } catch {
      // Silencioso
    }
  }, [estado.destinoLatente, estado.eventoActivado])

  const cerrarOverlay = useCallback(() => {
    setEstado((prev) => ({ ...prev, eventoActivado: false }))
  }, [])

  return {
    destinoLatente: estado.destinoLatente,
    eventoActivado: estado.eventoActivado,
    pruebaDestinoId: estado.pruebaDestinoId,
    verificar,
    activarDestino,
    cerrarOverlay,
  }
}
