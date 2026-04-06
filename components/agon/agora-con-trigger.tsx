'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useEventosDestino } from '@/hooks/use-eventos-destino'
import { EventoDestinoOverlay } from './evento-destino-overlay'
import { AgoraFeed } from './agora-feed'
import { EmptyState } from './empty-state'
import { mostrarToast } from './toast-agon'
import { DIOSES } from '@/lib/dioses/config'
import type { AgoraEvento, ComentarioAgora } from '@/lib/db/schema'

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

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const comentariosDiosVistos = useRef<Set<string>>(new Set())
  const primeraPasadaPolling = useRef(true)

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

  useEffect(() => {
    async function tick() {
      try {
        const res = await fetch('/api/comentarios/recientes')
        if (!res.ok) return
        const data = (await res.json()) as {
          comentariosDioses?: ComentarioAgora[]
        }
        const lista = data.comentariosDioses ?? []
        const esPrimera = primeraPasadaPolling.current

        for (const c of lista) {
          if (comentariosDiosVistos.current.has(c.id)) continue
          comentariosDiosVistos.current.add(c.id)
          if (esPrimera) continue

          const dios = DIOSES[c.autorId]
          if (dios) {
            mostrarToast({
              tipo: 'info',
              icono: dios.avatar,
              mensaje: `${dios.nombre} ha hablado en El Ágora.`,
            })
          }
        }

        primeraPasadaPolling.current = false
      } catch {
        /* silencioso */
      }
    }

    void tick()
    pollingRef.current = setInterval(() => {
      void tick()
    }, 30000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

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
