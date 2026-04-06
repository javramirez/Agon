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

  const pollingRecientesRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  )
  const primeraPasadaRecientes = useRef(true)

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

  useEffect(() => {
    async function tick() {
      try {
        const esPrimera = primeraPasadaRecientes.current

        if (esPrimera) {
          // Tras añadir `visto`, marcar históricos sin toasts (varios lotes de 10)
          for (;;) {
            const res = await fetch('/api/comentarios/recientes')
            if (!res.ok) break
            const data = (await res.json()) as {
              comentariosDioses?: ComentarioAgora[]
            }
            const lista = data.comentariosDioses ?? []
            if (lista.length === 0) break
            await fetch('/api/comentarios/recientes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: lista.map((c) => c.id) }),
            })
          }
          primeraPasadaRecientes.current = false
          return
        }

        const res = await fetch('/api/comentarios/recientes')
        if (!res.ok) return
        const data = (await res.json()) as {
          comentariosDioses?: ComentarioAgora[]
        }
        const lista = data.comentariosDioses ?? []

        if (lista.length > 0) {
          for (const c of lista) {
            const dios = DIOSES[c.autorId]
            if (dios) {
              mostrarToast({
                tipo: 'info',
                icono: dios.avatar,
                mensaje: `${dios.nombre} ha hablado en El Ágora.`,
              })
            }
          }
          await fetch('/api/comentarios/recientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: lista.map((c) => c.id) }),
          })
          router.refresh()
        }
      } catch {
        /* silencioso */
      }
    }

    void tick()
    pollingRecientesRef.current = setInterval(() => {
      void tick()
    }, 30000)

    return () => {
      if (pollingRecientesRef.current) clearInterval(pollingRecientesRef.current)
    }
  }, [router])

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
