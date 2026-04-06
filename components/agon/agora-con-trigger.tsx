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

const POLL_RECIENTES_MS = 120000

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
  /** Evita toasts repetidos para el mismo comentario en la sesión. */
  const idsToastYaMostrados = useRef<Set<string>>(new Set())
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
        const res = await fetch('/api/comentarios/recientes')
        if (!res.ok) return
        const data = (await res.json()) as {
          comentariosDioses?: ComentarioAgora[]
        }
        const lista = data.comentariosDioses ?? []

        if (primeraPasadaRecientes.current) {
          lista.forEach((c) => idsToastYaMostrados.current.add(c.id))
          primeraPasadaRecientes.current = false
          return
        }

        let huboToastNuevo = false
        for (const c of lista) {
          if (idsToastYaMostrados.current.has(c.id)) continue
          idsToastYaMostrados.current.add(c.id)
          const dios = DIOSES[c.autorId]
          if (dios) {
            mostrarToast({
              tipo: 'info',
              icono: dios.avatar,
              mensaje: `${dios.nombre} ha hablado en El Ágora.`,
            })
            huboToastNuevo = true
          }
        }

        if (huboToastNuevo) {
          router.refresh()
        }
      } catch {
        /* silencioso */
      }
    }

    void tick()
    pollingRecientesRef.current = setInterval(() => {
      void tick()
    }, POLL_RECIENTES_MS)

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
