'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { DIOSES } from '@/lib/dioses/config'
import { DiosAvatar } from './dios-avatar'
import { cn } from '@/lib/utils'
import type { ComentarioAgora } from '@/lib/db/schema'

export interface ComentariosMeta {
  total: number
  yaPreguntoOraculo: boolean
  oraculoCerrado: boolean
}

interface Props {
  eventoId: string
  esOraculo?: boolean
  diosNombre?: string
  postDiosId?: string
  /** Tras enviar comentario o recargar, para sincronizar el badge en la card */
  onComentariosCambiados?: () => void
  /** Tras cada carga (incl. polling): sincronizar badge y estado del Oráculo */
  onComentariosMeta?: (meta: ComentariosMeta) => void
  /** Polling solo con panel abierto: 30000 normal, 10000 esperando Oráculo */
  pollIntervalMs?: number
}

export function ComentariosPanel({
  eventoId,
  esOraculo = false,
  diosNombre,
  postDiosId,
  onComentariosCambiados,
  onComentariosMeta,
  pollIntervalMs = 0,
}: Props) {
  const [comentarios, setComentarios] = useState<ComentarioAgora[]>([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [oraculoCerrado, setOraculoCerrado] = useState(false)
  const [yaPreguntoOraculo, setYaPreguntoOraculo] = useState(false)

  const onMetaRef = useRef(onComentariosMeta)
  onMetaRef.current = onComentariosMeta

  const cargar = useCallback(async () => {
    const params = new URLSearchParams({ eventoId })
    if (postDiosId) params.set('postDiosId', postDiosId)
    const res = await fetch(`/api/comentarios?${params.toString()}`)
    if (res.ok) {
      const data = (await res.json()) as {
        comentarios: ComentarioAgora[]
        oraculoCerrado?: boolean
        yaPreguntoOraculo?: boolean
      }
      setComentarios(data.comentarios)
      setOraculoCerrado(!!data.oraculoCerrado)
      setYaPreguntoOraculo(!!data.yaPreguntoOraculo)
      onMetaRef.current?.({
        total: data.comentarios.length,
        yaPreguntoOraculo: !!data.yaPreguntoOraculo,
        oraculoCerrado: !!data.oraculoCerrado,
      })
    }
    setCargando(false)
  }, [eventoId, postDiosId])

  useEffect(() => {
    void cargar()
  }, [cargar])

  useEffect(() => {
    if (!pollIntervalMs || pollIntervalMs <= 0) return
    const id = setInterval(() => {
      void cargar()
    }, pollIntervalMs)
    return () => clearInterval(id)
  }, [pollIntervalMs, cargar])

  async function enviar() {
    if (!input.trim() || enviando) return
    setEnviando(true)

    const res = await fetch('/api/comentarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventoId,
        contenido: input.trim(),
        esOraculo,
        diosNombre,
        postDiosId,
      }),
    })

    if (res.ok) {
      setInput('')
      await cargar()
      onComentariosCambiados?.()
    }

    setEnviando(false)
  }

  const puedeComentar = esOraculo
    ? !yaPreguntoOraculo && !oraculoCerrado
    : true

  return (
    <div className="space-y-3 pt-3 border-t border-border">
      {cargando ? (
        <p className="text-xs text-muted-foreground font-body animate-pulse">
          El Ágora consulta...
        </p>
      ) : comentarios.length === 0 ? (
        <p className="text-xs text-muted-foreground/50 font-body italic">
          {esOraculo
            ? 'El Oráculo espera tu pregunta.'
            : 'Sin comentarios aún.'}
        </p>
      ) : (
        <div className="space-y-3">
          {comentarios.map((c) => {
            const esDios = c.autorTipo === 'dios'
            const diosConfig = esDios ? DIOSES[c.autorId] : null

            return (
              <div key={c.id} className="flex gap-2.5">
                {esDios ? (
                  <DiosAvatar diosNombre={c.autorId} size="sm" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-surface-2 border border-border flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-muted-foreground font-display font-bold">
                      {c.autorNombre[0]}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        'text-xs font-body font-semibold',
                        esDios && diosConfig ? diosConfig.color : 'text-foreground'
                      )}
                    >
                      {c.autorNombre}
                    </span>
                    <span className="text-xs text-muted-foreground/40 font-body">
                      {formatDistanceToNow(new Date(c.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                  <p
                    className={cn(
                      'text-sm font-body leading-relaxed mt-0.5',
                      esDios ? 'text-foreground italic' : 'text-muted-foreground'
                    )}
                  >
                    {c.contenido}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {puedeComentar && (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void enviar()}
            placeholder={
              esOraculo
                ? `Pregunta a ${diosNombre ? DIOSES[diosNombre]?.nombre ?? 'el dios' : 'el dios'}...`
                : 'Comenta en El Ágora...'
            }
            maxLength={300}
            className={cn(
              'flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2',
              'text-sm font-body text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:border-amber/40 transition-colors'
            )}
          />
          <button
            type="button"
            onClick={() => void enviar()}
            disabled={enviando || !input.trim()}
            className="px-3 py-2 bg-amber text-black text-xs font-body font-semibold rounded-lg hover:bg-amber/90 transition-all disabled:opacity-40"
          >
            {enviando ? '...' : '↑'}
          </button>
        </div>
      )}

      {esOraculo && oraculoCerrado && (
        <p className="text-xs text-muted-foreground/50 font-body italic text-center">
          El Oráculo ha cerrado. El dios ha hablado.
        </p>
      )}

      {esOraculo && yaPreguntoOraculo && !oraculoCerrado && (
        <p className="text-xs text-muted-foreground/50 font-body italic text-center">
          Ya consultaste al Oráculo. El dios responderá.
        </p>
      )}
    </div>
  )
}
