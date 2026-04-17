'use client'

import { useState, useCallback, useEffect } from 'react'
import { AgoraEventoCard } from './agora-evento-card'
import type { AgoraEvento } from '@/lib/db/schema'

/** Respuesta GET /api/agora + carga inicial (totalLikes opcional hasta refrescar) */
export type AgoraEventoConLikes = AgoraEvento & {
  likesReales?: number
  totalLikes?: number
}

interface Props {
  eventosIniciales: AgoraEventoConLikes[]
  aclamacionesHoy: number
  tiposPorEvento: Record<string, string>
}

export function AgoraFeed({
  eventosIniciales,
  aclamacionesHoy: aclamacionesInicial,
  tiposPorEvento: tiposInicial,
}: Props) {
  const [eventos, setEventos] = useState<AgoraEventoConLikes[]>(eventosIniciales)
  const [aclamacionesHoy, setAclamacionesHoy] = useState(aclamacionesInicial)
  const [tiposPorEvento, setTiposPorEvento] = useState(tiposInicial)
  const [refrescando, setRefrescando] = useState(false)
  const [comentarioCounts, setComentarioCounts] = useState<
    Record<string, number>
  >({})

  useEffect(() => {
    setEventos(eventosIniciales)
    setAclamacionesHoy(aclamacionesInicial)
    setTiposPorEvento(tiposInicial)
  }, [eventosIniciales, aclamacionesInicial, tiposInicial])

  useEffect(() => {
    if (eventos.length === 0) return

    fetch('/api/comentarios/counts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventoIds: eventos.map((e) => e.id) }),
    })
      .then((r) => r.json())
      .then((d: { counts?: Record<string, number> }) =>
        setComentarioCounts(d.counts ?? {})
      )
      .catch(() => {})
  }, [eventos])

  const refrescar = useCallback(async () => {
    setRefrescando(true)
    try {
      const res = await fetch('/api/agora')
      if (res.ok) {
        const data = (await res.json()) as {
          eventos: AgoraEventoConLikes[]
          aclamacionesHoy: number
          tiposPorEvento: Record<string, string>
        }
        setEventos(data.eventos)
        setAclamacionesHoy(data.aclamacionesHoy)
        setTiposPorEvento(data.tiposPorEvento)
      }
    } finally {
      setRefrescando(false)
    }
  }, [])

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void refrescar()}
        disabled={refrescando}
        className="w-full py-2 text-xs text-muted-foreground font-body border border-border rounded-lg hover:text-foreground transition-colors disabled:opacity-50"
      >
        {refrescando ? 'Actualizando el Ágora...' : '↻ Actualizar El Ágora'}
      </button>

      {eventos.map((evento) => (
        <AgoraEventoCard
          key={evento.id}
          evento={evento}
          aclamacionesUsadas={aclamacionesHoy}
          miAclamacion={tiposPorEvento[evento.id] ?? null}
          comentarioCountInicial={comentarioCounts[evento.id] ?? 0}
        />
      ))}
    </div>
  )
}
