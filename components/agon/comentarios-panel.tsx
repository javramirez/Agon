'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { DIOSES } from '@/lib/dioses/config'
import { getDiosVisual } from '@/lib/dioses/imagen-config'
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
  onComentariosCambiados?: () => void
  onComentariosMeta?: (meta: ComentariosMeta) => void
  pollIntervalMs?: number
}

function ComentarioDios({ comentario }: { comentario: ComentarioAgora }) {
  const diosConfig = DIOSES[comentario.autorId]
  const visual = getDiosVisual(comentario.autorId)
  const [tiempo, setTiempo] = useState('')

  useEffect(() => {
    setTiempo(
      formatDistanceToNow(new Date(comentario.createdAt), {
        addSuffix: true,
        locale: es,
      })
    )
  }, [comentario.createdAt])

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl p-3 space-y-2.5"
      style={{
        background: visual?.colorFondo ?? 'rgba(255,255,255,0.03)',
        border: `1px solid ${visual?.colorBorde ?? 'rgba(255,255,255,0.08)'}`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <DiosAvatar diosNombre={comentario.autorId} size="sm" showGlow />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-display font-bold tracking-wide"
              style={{ color: visual?.colorTexto ?? '#f5f5f5' }}
            >
              {diosConfig?.nombre ?? comentario.autorNombre}
            </span>
            <span
              className="text-xs font-body px-1.5 py-0.5 rounded-full"
              style={{
                background: visual?.colorFondo ?? 'rgba(255,255,255,0.05)',
                color: visual?.colorTexto ?? '#888',
                border: `1px solid ${visual?.colorBorde ?? 'rgba(255,255,255,0.08)'}`,
              }}
            >
              Del Olimpo
            </span>
            {tiempo && (
              <span className="text-xs text-muted-foreground/40 font-body">{tiempo}</span>
            )}
          </div>
        </div>
      </div>

      <div
        className="h-px w-full"
        style={{
          background: `linear-gradient(to right, ${visual?.colorBorde ?? 'rgba(255,255,255,0.06)'}, transparent)`,
        }}
      />

      <p className="text-sm font-body leading-relaxed italic text-foreground/90 pl-1">
        &ldquo;{comentario.contenido}&rdquo;
      </p>
    </motion.div>
  )
}

function ComentarioHumano({ comentario }: { comentario: ComentarioAgora }) {
  const [tiempo, setTiempo] = useState('')

  useEffect(() => {
    setTiempo(
      formatDistanceToNow(new Date(comentario.createdAt), {
        addSuffix: true,
        locale: es,
      })
    )
  }, [comentario.createdAt])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-2.5"
    >
      <div className="w-6 h-6 rounded-full bg-surface-2 border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-xs text-muted-foreground font-display font-bold">
          {comentario.autorNombre[0]}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-xs font-body font-semibold text-foreground">
            {comentario.autorNombre}
          </span>
          {tiempo && (
            <span className="text-xs text-muted-foreground/40 font-body">{tiempo}</span>
          )}
        </div>
        <p className="text-sm font-body leading-relaxed mt-0.5 text-muted-foreground">
          {comentario.contenido}
        </p>
      </div>
    </motion.div>
  )
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
      let list = data.comentarios ?? []

      const idsNoVistos = list
        .filter((c) => c.autorTipo === 'dios' && !c.visto)
        .map((c) => c.id)

      if (idsNoVistos.length > 0) {
        const markRes = await fetch('/api/comentarios/recientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: idsNoVistos }),
        })
        if (markRes.ok) {
          const idSet = new Set(idsNoVistos)
          list = list.map((c) =>
            c.autorTipo === 'dios' && idSet.has(c.id) ? { ...c, visto: true } : c
          )
        }
      }

      setComentarios(list)
      setOraculoCerrado(!!data.oraculoCerrado)
      setYaPreguntoOraculo(!!data.yaPreguntoOraculo)
      onMetaRef.current?.({
        total: list.length,
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
    const id = setInterval(() => void cargar(), pollIntervalMs)
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

  const puedeComentar = esOraculo ? !yaPreguntoOraculo && !oraculoCerrado : true

  const comentariosDioses = comentarios.filter((c) => c.autorTipo === 'dios')
  const comentariosHumanos = comentarios.filter((c) => c.autorTipo !== 'dios')

  return (
    <div className="space-y-3 pt-3 border-t border-border">
      {cargando ? (
        <p className="text-xs text-muted-foreground font-body animate-pulse">
          El Ágora consulta...
        </p>
      ) : comentarios.length === 0 ? (
        <p className="text-xs text-muted-foreground/50 font-body italic">
          {esOraculo ? 'El Oráculo espera tu pregunta.' : 'Sin comentarios aún.'}
        </p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {comentariosDioses.map((c) => (
              <ComentarioDios key={c.id} comentario={c} />
            ))}
          </AnimatePresence>

          {comentariosDioses.length > 0 && comentariosHumanos.length > 0 && (
            <div className="flex items-center gap-2 py-1">
              <div className="h-px bg-border flex-1" />
              <span className="text-xs text-muted-foreground/40 font-body">El Ágora</span>
              <div className="h-px bg-border flex-1" />
            </div>
          )}

          <AnimatePresence>
            {comentariosHumanos.map((c) => (
              <ComentarioHumano key={c.id} comentario={c} />
            ))}
          </AnimatePresence>
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
        <p className="text-xs text-muted-foreground/50 font-body italic text-center animate-pulse">
          Ya consultaste al Oráculo. El dios responderá cuando el Olimpo lo decida.
        </p>
      )}
    </div>
  )
}
