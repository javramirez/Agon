'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { ComentariosPanel } from './comentarios-panel'
import { DiosAvatar } from './dios-avatar'
import { DIOSES } from '@/lib/dioses/config'
import type { AgoraEvento, Cronica } from '@/lib/db/schema'
import { CronicaCard } from './cronica-card'

const ACLAMACIONES_CONFIG = [
  { tipo: 'fuego', emoji: '🔥', label: 'Fuego del agon' },
  { tipo: 'sin_piedad', emoji: '💀', label: 'Sin piedad' },
  { tipo: 'agonia', emoji: '😤', label: 'Agonía pura' },
  { tipo: 'digno_del_altis', emoji: '👑', label: 'Digno del Altis' },
  { tipo: 'el_agon_te_juzga', emoji: '😂', label: 'El agon te juzga' },
] as const

const TIPO_ICONOS: Record<string, string> = {
  prueba_completada: '⚡',
  dia_perfecto: '🏛️',
  foto_subida: '📷',
  nivel_subido: '⬆️',
  inscripcion_desbloqueada: '📜',
  hegemonia_ganada: '👑',
  senalamiento: '🎯',
  provocacion: '🗣️',
  cronica_semanal: '📰',
  semana_sagrada: '⚡',
  prueba_extraordinaria: '🌟',
}

interface Props {
  evento: AgoraEvento
  aclamacionesUsadas: number
  miAclamacion?: string | null
}

export function AgoraEventoCard({
  evento,
  aclamacionesUsadas,
  miAclamacion,
}: Props) {
  const router = useRouter()
  const [aclamacion, setAclamacion] = useState(miAclamacion ?? null)
  const [usadas, setUsadas] = useState(aclamacionesUsadas)
  const [cargando, setCargando] = useState(false)
  const [mostrarAcciones, setMostrarAcciones] = useState(false)
  const [mostrarComentarios, setMostrarComentarios] = useState(false)
  const [likes, setLikes] = useState(0)
  const [miLike, setMiLike] = useState(false)
  const [likesCargados, setLikesCargados] = useState(false)
  const [comentariosCount, setComentariosCount] = useState(0)
  const [vistos, setVistos] = useState(0)

  const isCronica = evento.tipo === 'cronica_semanal'
  const noLeidos = mostrarComentarios
    ? 0
    : Math.max(0, comentariosCount - vistos)

  useEffect(() => {
    setAclamacion(miAclamacion ?? null)
  }, [miAclamacion])

  useEffect(() => {
    setUsadas(aclamacionesUsadas)
  }, [aclamacionesUsadas])

  const metadata = evento.metadata as {
    esDios?: boolean
    diosNombre?: string
    tipoDios?: 'oraculo' | 'voz_olimpo'
    postDiosId?: string
  } | null

  const esDios = metadata?.esDios === true
  const diosNombre = metadata?.diosNombre
  const tipoDios = metadata?.tipoDios
  const postDiosId = metadata?.postDiosId
  const esOraculo = tipoDios === 'oraculo'

  const diosConfig = diosNombre ? DIOSES[diosNombre] : null
  const icono = esDios
    ? (diosConfig?.avatar ?? '⚡')
    : (TIPO_ICONOS[evento.tipo] ?? '◆')

  const tiempoAtras = formatDistanceToNow(new Date(evento.createdAt), {
    addSuffix: true,
    locale: es,
  })

  useEffect(() => {
    if (isCronica) return
    fetch(`/api/comentarios?eventoId=${evento.id}&countOnly=true`)
      .then((r) => r.json())
      .then((d: { total?: number }) => {
        const t = d.total ?? 0
        setComentariosCount(t)
        setVistos(t)
      })
      .catch(() => {})
  }, [evento.id, isCronica])

  useEffect(() => {
    if (isCronica) return
    const id = setInterval(() => {
      fetch(`/api/comentarios?eventoId=${evento.id}&countOnly=true`)
        .then((r) => r.json())
        .then((d: { total?: number }) => {
          const t = d.total ?? 0
          setComentariosCount(t)
          setVistos((prev) => (mostrarComentarios ? t : prev))
        })
        .catch(() => {})
    }, 30000)
    return () => clearInterval(id)
  }, [evento.id, isCronica, mostrarComentarios])

  useEffect(() => {
    if (isCronica) return
    async function cargarLikes() {
      const res = await fetch(`/api/likes?eventoId=${evento.id}`)
      if (res.ok) {
        const data = (await res.json()) as { total: number; miLike: boolean }
        setLikes(data.total)
        setMiLike(data.miLike)
      }
      setLikesCargados(true)
    }
    void cargarLikes()
  }, [evento.id, isCronica])

  async function toggleLike() {
    if (isCronica) return
    const res = await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventoId: evento.id }),
    })
    if (res.ok) {
      const data = (await res.json()) as { liked: boolean }
      setMiLike(data.liked)
      setLikes((prev) => (data.liked ? prev + 1 : Math.max(0, prev - 1)))
    }
  }

  async function aclamar(tipo: string) {
    if (aclamacion || usadas >= 5 || cargando) return
    setCargando(true)

    const res = await fetch('/api/aclamaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventoId: evento.id, tipo }),
    })

    if (res.ok) {
      setAclamacion(tipo)
      setUsadas((prev) => prev + 1)
      router.refresh()
    }

    setCargando(false)
    setMostrarAcciones(false)
  }

  async function abrirComentarios() {
    const nuevoEstado = !mostrarComentarios
    setMostrarComentarios(nuevoEstado)
    if (nuevoEstado) {
      try {
        const res = await fetch(
          `/api/comentarios?eventoId=${evento.id}&countOnly=true`
        )
        if (res.ok) {
          const d = (await res.json()) as { total?: number }
          const t = d.total ?? 0
          setComentariosCount(t)
          setVistos(t)
        }
      } catch {
        /* silencioso */
      }
    }
  }

  function sincronizarContadorComentarios() {
    void fetch(`/api/comentarios?eventoId=${evento.id}&countOnly=true`)
      .then((r) => r.json())
      .then((d: { total?: number }) => {
        const t = d.total ?? 0
        setComentariosCount(t)
        setVistos(t)
      })
      .catch(() => {})
  }

  if (isCronica) {
    const md = evento.metadata as {
      semana?: number
      fechaInicio?: string
      fechaFin?: string
    } | null
    const cronicaMock: Cronica = {
      id: evento.id,
      semana: md?.semana ?? 1,
      fechaInicio:
        md?.fechaInicio ??
        new Date(evento.createdAt).toISOString().split('T')[0],
      fechaFin:
        md?.fechaFin ??
        new Date(evento.createdAt).toISOString().split('T')[0],
      relato: evento.contenido,
      metadata: evento.metadata,
      createdAt: evento.createdAt,
    }
    return <CronicaCard cronica={cronicaMock} />
  }

  return (
    <div
      className={cn(
        'bg-surface-1 rounded-xl border p-4 space-y-3',
        esDios && diosConfig ? 'border-amber/20 bg-surface-1' : 'border-border'
      )}
    >
      <div className="flex items-start gap-3">
        {esDios && diosNombre ? (
          <DiosAvatar diosNombre={diosNombre} size="md" />
        ) : (
          <span className="text-lg mt-0.5 flex-shrink-0">{icono}</span>
        )}

        <div className="flex-1 min-w-0">
          {esDios && diosConfig && (
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={cn(
                  'text-xs font-display font-bold',
                  diosConfig.color
                )}
              >
                {diosConfig.nombre}
              </span>
              {esOraculo && (
                <span className="text-xs text-amber font-body">
                  · El Oráculo
                </span>
              )}
              {tipoDios === 'voz_olimpo' && (
                <span className="text-xs text-muted-foreground font-body">
                  · La Voz del Olimpo
                </span>
              )}
            </div>
          )}

          <p
            className={cn(
              'text-sm font-body leading-snug',
              esDios ? 'text-foreground italic' : 'text-foreground'
            )}
          >
            {evento.contenido}
          </p>
          <p className="text-xs text-muted-foreground font-body mt-1">
            {tiempoAtras}
          </p>
        </div>
      </div>

      {evento.fotoUrl && (
        <img
          src={evento.fotoUrl}
          alt="Comprobante del agon"
          className="w-full max-h-64 object-cover rounded-lg border border-border"
        />
      )}

      <div className="flex items-center gap-4 pt-1 border-t border-border flex-wrap">
        <button
          type="button"
          onClick={() => void toggleLike()}
          disabled={!likesCargados}
          className={cn(
            'flex items-center gap-1.5 text-xs font-body transition-all active:scale-95',
            miLike ? 'text-amber' : 'text-muted-foreground hover:text-foreground',
            !likesCargados && 'opacity-50'
          )}
        >
          <span className="text-sm">{miLike ? '♥' : '♡'}</span>
          {likes > 0 && (
            <span className="tabular-nums">{likes}</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => void abrirComentarios()}
          className="relative text-xs font-body text-muted-foreground hover:text-foreground transition-colors pr-1"
        >
          {esOraculo ? '🔮 Consultar' : '💬 Comentar'}
          {noLeidos > 0 && (
            <span className="absolute -top-2 -right-4 min-w-4 h-4 px-1 bg-amber text-black text-xs font-bold rounded-full flex items-center justify-center leading-none">
              {noLeidos > 9 ? '9+' : noLeidos}
            </span>
          )}
        </button>

        {!esDios && (
          <div className="ml-auto">
            {aclamacion ? (
              <span className="text-sm">
                {ACLAMACIONES_CONFIG.find((a) => a.tipo === aclamacion)?.emoji}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setMostrarAcciones(!mostrarAcciones)}
                disabled={usadas >= 5}
                className={cn(
                  'text-xs font-body transition-colors',
                  usadas >= 5
                    ? 'text-muted-foreground/30 cursor-not-allowed'
                    : 'text-muted-foreground hover:text-amber'
                )}
              >
                + Aclamar
              </button>
            )}
          </div>
        )}

        {esDios && tipoDios === 'voz_olimpo' && !aclamacion && (
          <div className="ml-auto flex gap-2">
            {ACLAMACIONES_CONFIG.slice(0, 3).map((a) => (
              <button
                key={a.tipo}
                type="button"
                onClick={() => void aclamar(a.tipo)}
                disabled={!!aclamacion || usadas >= 5}
                title={a.label}
                className="text-base opacity-40 hover:opacity-100 transition-opacity active:scale-95"
              >
                {a.emoji}
              </button>
            ))}
          </div>
        )}

        {esDios && tipoDios === 'voz_olimpo' && !!aclamacion && (
          <div className="ml-auto">
            <span className="text-sm">
              {ACLAMACIONES_CONFIG.find((a) => a.tipo === aclamacion)?.emoji}
            </span>
          </div>
        )}
      </div>

      {!esDios && (
        <p className="text-xs text-muted-foreground/50 font-body text-right">
          {5 - usadas} aclamaciones restantes hoy
        </p>
      )}

      {mostrarAcciones && !aclamacion && !esDios && (
        <div className="grid grid-cols-2 gap-2 pt-2 sm:flex sm:flex-wrap">
          {ACLAMACIONES_CONFIG.map((a) => (
            <button
              key={a.tipo}
              type="button"
              onClick={() => void aclamar(a.tipo)}
              disabled={cargando}
              title={a.label}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl border',
                'bg-surface-2 border-border active:scale-95',
                'transition-all text-sm justify-center sm:justify-start'
              )}
            >
              <span className="text-base">{a.emoji}</span>
              <span className="text-xs text-muted-foreground font-body">
                {a.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {mostrarComentarios && (
        <ComentariosPanel
          eventoId={evento.id}
          esOraculo={esOraculo}
          diosNombre={diosNombre}
          postDiosId={postDiosId}
          onComentariosCambiados={sincronizarContadorComentarios}
        />
      )}
    </div>
  )
}
