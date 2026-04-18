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
  tiposPorEvento: Record<string, string>
}

export function AgoraConTrigger({
  eventosIniciales,
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

  /** Tras procesar comentarios pendientes en el servidor, refrescar el feed. */
  useEffect(() => {
    async function checkComentariosProcesados() {
      try {
        const res = await fetch('/api/eventos/verificar')
        if (!res.ok) return
        const data = (await res.json()) as { comentariosNuevos?: boolean }
        if (data.comentariosNuevos) {
          router.refresh()
        }
      } catch {
        /* silencioso */
      }
    }

    void checkComentariosProcesados()
    const interval = setInterval(() => {
      void checkComentariosProcesados()
    }, 30000)

    return () => clearInterval(interval)
  }, [router])

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
