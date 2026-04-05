'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEventosDestino } from '@/hooks/use-eventos-destino'
import { EventoDestinoOverlay } from './evento-destino-overlay'
import { AgoraFeed } from './agora-feed'
import { EmptyState } from './empty-state'
import type { AgoraEvento } from '@/lib/db/schema'

interface Props {
  eventosIniciales: AgoraEvento[]
  aclamacionesHoy: number
  tiposPorEvento: Record<string, string>
}

export function AgoraConTrigger({
  eventosIniciales,
  aclamacionesHoy,
  tiposPorEvento,
}: Props) {
  const router = useRouter()
  const {
    destinoLatente,
    eventoActivado,
    pruebaDestinoId,
    verificar,
    activarDestino,
    cerrarOverlay,
  } = useEventosDestino()

  useEffect(() => {
    void verificar()
  }, [verificar])

  useEffect(() => {
    if (!destinoLatente || eventoActivado) return

    const timer = setTimeout(() => {
      void activarDestino()
    }, 3000)

    return () => clearTimeout(timer)
  }, [destinoLatente, eventoActivado, activarDestino])

  function handleCerrarOverlay() {
    cerrarOverlay()
    router.refresh()
  }

  return (
    <>
      {eventosIniciales.length === 0 ? (
        <EmptyState
          icono="🏛️"
          titulo="El Ágora está en silencio."
          descripcion="Las hazañas del Gran Agon aparecerán aquí."
        />
      ) : (
        <AgoraFeed
          eventosIniciales={eventosIniciales}
          aclamacionesHoy={aclamacionesHoy}
          tiposPorEvento={tiposPorEvento}
        />
      )}

      <EventoDestinoOverlay
        pruebaId={eventoActivado ? pruebaDestinoId : null}
        onCerrar={handleCerrarOverlay}
      />
    </>
  )
}
