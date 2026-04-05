'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEventosDestino } from '@/hooks/use-eventos-destino'
import { EventoDestinoOverlay } from './evento-destino-overlay'
import { PruebasExtraordinariasPanel } from './pruebas-extraordinarias-panel'

export function DashboardEventos() {
  const router = useRouter()
  const [panelKey, setPanelKey] = useState(0)
  const {
    destinoLatente,
    eventoActivado,
    pruebaDestinoId,
    verificar,
    activarDestino,
    cerrarOverlay,
  } = useEventosDestino()

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    void verificar()
  }, [verificar])

  useEffect(() => {
    if (!destinoLatente || eventoActivado) return

    timerRef.current = setTimeout(() => {
      void activarDestino()
    }, 45000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [destinoLatente, eventoActivado, activarDestino])

  function handleCerrarOverlay() {
    cerrarOverlay()
    setPanelKey((k) => k + 1)
    router.refresh()
  }

  return (
    <>
      <PruebasExtraordinariasPanel key={panelKey} />

      <EventoDestinoOverlay
        pruebaId={eventoActivado ? pruebaDestinoId : null}
        onCerrar={handleCerrarOverlay}
      />
    </>
  )
}
