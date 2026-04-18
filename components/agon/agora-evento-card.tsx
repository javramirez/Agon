'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
  ComentariosPanel,
  type ComentariosMeta,
} from './comentarios-panel'
import { DiosAvatar } from './dios-avatar'
import { DIOSES } from '@/lib/dioses/config'
import { getDiosVisual } from '@/lib/dioses/imagen-config'
import type { AgoraEvento, ComentarioAgora, Cronica } from '@/lib/db/schema'
import { CronicaCard } from './cronica-card'
import { PostVozOlimpo, type LinkPostVozOlimpo } from './post-voz-olimpo'
import { LikeButton } from './like-button'

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
  miAclamacion?: string | null
  /** Total de comentarios (batch desde AgoraFeed) */
  comentarioCountInicial?: number
}

export function AgoraEventoCard({
  evento,
  miAclamacion,
  comentarioCountInicial = 0,
}: Props) {
  const router = useRouter()
  const [aclamacion, setAclamacion] = useState(miAclamacion ?? null)
  const [cargando, setCargando] = useState(false)
  const [mostrarAcciones, setMostrarAcciones] = useState(false)
  const [mostrarComentarios, setMostrarComentarios] = useState(false)
  const [likes, setLikes] = useState(0)
  const [miLike, setMiLike] = useState(false)
  const [likesCargados, setLikesCargados] = useState(false)
  const [comentariosCount, setComentariosCount] = useState(comentarioCountInicial)
  const [vistos, setVistos] = useState(comentarioCountInicial)
  const [oracleState, setOracleState] = useState<{
    yaPregunto: boolean
    cerrado: boolean
  } | null>(null)
  const [tiempoAtras, setTiempoAtras] = useState('')

  const mostrarRef = useRef(false)
  mostrarRef.current = mostrarComentarios

  const isCronica = evento.tipo === 'cronica_semanal'

  const metadata = evento.metadata as {
    esDios?: boolean
    diosNombre?: string
    tipoDios?: 'oraculo' | 'voz_olimpo'
    postDiosId?: string
    titular?: string
    descripcion?: string
    links?: unknown
    esSobreexigencia?: boolean
    intensidad?: 'leve' | 'media' | 'fuerte'
    /** Likes simulados de adeptos (ver lib/facciones/adeptos) */
    likesAdeptos?: number
  } | null

  const eventoConLikes = evento as AgoraEvento & {
    totalLikes?: number
    likesReales?: number
  }
  const likesAdeptos =
    metadata != null && typeof metadata.likesAdeptos === 'number'
      ? metadata.likesAdeptos
      : eventoConLikes.totalLikes != null && eventoConLikes.likesReales != null
        ? eventoConLikes.totalLikes - eventoConLikes.likesReales
        : 0

  const esDios = metadata?.esDios === true
  const diosNombre = metadata?.diosNombre
  const tipoDios = metadata?.tipoDios
  const postDiosId = metadata?.postDiosId
  const esOraculo = tipoDios === 'oraculo'
  const esVozOlimpo = esDios && tipoDios === 'voz_olimpo'

  function normalizarTipoLink(t: string): LinkPostVozOlimpo['tipo'] {
    if (t === 'libro' || t === 'video' || t === 'articulo' || t === 'herramienta') return t
    return 'articulo'
  }

  const vozOlimpoPayload = (() => {
    if (!esVozOlimpo || !diosNombre || !metadata) return null
    const titular = metadata.titular
    const descripcion = metadata.descripcion
    if (typeof titular !== 'string' || typeof descripcion !== 'string') return null
    if (!Array.isArray(metadata.links)) return null
    const links: LinkPostVozOlimpo[] = metadata.links
      .filter((x): x is Record<string, unknown> => x != null && typeof x === 'object')
      .map((x) => ({
        titulo: String(x.titulo ?? ''),
        url: String(x.url ?? ''),
        tipo: normalizarTipoLink(String(x.tipo ?? 'articulo')),
      }))
      .filter((l) => l.titulo.length > 0 && l.url.length > 0)
    if (links.length === 0) return null
    const intensidad =
      metadata.intensidad === 'fuerte' ||
      metadata.intensidad === 'media' ||
      metadata.intensidad === 'leve'
        ? metadata.intensidad
        : 'leve'
    return {
      titular,
      descripcion,
      links,
      esSobreexigencia: metadata.esSobreexigencia === true,
      intensidad,
    }
  })()

  const esperandoOraculo = Boolean(
    esOraculo &&
      oracleState &&
      oracleState.yaPregunto &&
      !oracleState.cerrado
  )

  const pollIntervalMs = mostrarComentarios
    ? esperandoOraculo
      ? 10000
      : 30000
    : 0

  const diosConfig = diosNombre ? DIOSES[diosNombre] : null
  const icono = esDios
    ? (diosConfig?.avatar ?? '⚡')
    : (TIPO_ICONOS[evento.tipo] ?? '◆')

  const noLeidos = mostrarComentarios
    ? 0
    : Math.max(0, comentariosCount - vistos)

  useEffect(() => {
    setTiempoAtras(
      formatDistanceToNow(new Date(evento.createdAt), {
        addSuffix: true,
        locale: es,
      })
    )
    const interval = setInterval(() => {
      setTiempoAtras(
        formatDistanceToNow(new Date(evento.createdAt), {
          addSuffix: true,
          locale: es,
        })
      )
    }, 60000)
    return () => clearInterval(interval)
  }, [evento.createdAt])

  useEffect(() => {
    setAclamacion(miAclamacion ?? null)
  }, [miAclamacion])

  useEffect(() => {
    if (isCronica) return
    setComentariosCount(comentarioCountInicial)
    setVistos(comentarioCountInicial)
  }, [comentarioCountInicial, isCronica])

  useEffect(() => {
    if (isCronica || !esOraculo || !postDiosId) return
    const params = new URLSearchParams({ eventoId: evento.id, postDiosId })
    void fetch(`/api/comentarios?${params.toString()}`)
      .then((r) => r.json())
      .then(
        (d: {
          comentarios?: ComentarioAgora[]
          yaPreguntoOraculo?: boolean
          oraculoCerrado?: boolean
        }) => {
          setOracleState({
            yaPregunto: !!d.yaPreguntoOraculo,
            cerrado: !!d.oraculoCerrado,
          })
          const n = d.comentarios?.length ?? 0
          setComentariosCount((c) => Math.max(c, n))
        }
      )
      .catch(() => {})
  }, [evento.id, esOraculo, postDiosId, isCronica])

  const handleComentariosMeta = useCallback((meta: ComentariosMeta) => {
    setOracleState({
      yaPregunto: meta.yaPreguntoOraculo,
      cerrado: meta.oraculoCerrado,
    })
    setComentariosCount(meta.total)
    if (mostrarRef.current) setVistos(meta.total)
  }, [])

  useEffect(() => {
    if (isCronica || !esOraculo || !postDiosId) return
    if (!esperandoOraculo || mostrarComentarios) return

    const tick = async () => {
      const params = new URLSearchParams({ eventoId: evento.id, postDiosId })
      const res = await fetch(`/api/comentarios?${params.toString()}`)
      if (!res.ok) return
      const data = (await res.json()) as {
        comentarios?: ComentarioAgora[]
        yaPreguntoOraculo?: boolean
        oraculoCerrado?: boolean
      }
      const list = data.comentarios ?? []
      const tieneDios = list.some((c) => c.autorTipo === 'dios')
      const cerrado = !!data.oraculoCerrado || tieneDios

      setOracleState({
        yaPregunto: !!data.yaPreguntoOraculo,
        cerrado: cerrado,
      })
      setComentariosCount(list.length)

      if (cerrado && tieneDios && !mostrarRef.current) {
        setMostrarComentarios(true)
        setVistos(Math.max(0, list.length - 1))
      }
    }

    void tick()
    const id = setInterval(() => void tick(), 10000)
    return () => clearInterval(id)
  }, [
    isCronica,
    esOraculo,
    postDiosId,
    esperandoOraculo,
    mostrarComentarios,
    evento.id,
  ])

  useEffect(() => {
    if (isCronica) return
    let cancelled = false
    async function cargarLikes() {
      const res = await fetch(`/api/likes?eventoId=${evento.id}`)
      if (cancelled) return
      if (res.ok) {
        const data = (await res.json()) as { total: number; miLike: boolean }
        setMiLike(data.miLike)
        setLikesCargados(true)

        const adeptos = likesAdeptos
        const inicio = data.total
        const destino = data.total + adeptos

        if (adeptos === 0) {
          setLikes(inicio)
          return
        }

        // Animación orgánica: incrementos aleatorios hasta el destino
        let actual = inicio
        setLikes(actual)

        function tick() {
          if (cancelled) return
          const restante = destino - actual
          if (restante <= 0) return

          const progreso = (actual - inicio) / adeptos // 0 → 1

          // Incremento decrece exponencialmente al acercarse al final
          const factorVelocidad = Math.pow(1 - progreso, 2) // 1 → 0 cuadrático
          const tasaBase = 0.08 + factorVelocidad * 0.12 // rápido al inicio, lento al final
          const incremento = Math.min(
            restante,
            Math.max(1, Math.floor(restante * tasaBase))
          )
          actual += incremento
          setLikes(actual)

          if (actual < destino) {
            // Delay crece exponencialmente al final — casi se detiene antes de llegar
            const delayBase = 30 + Math.pow(progreso, 2) * 300
            const jitter = Math.random() * 40
            setTimeout(tick, delayBase + jitter)
          }
        }

        // Pequeño delay inicial antes de que "arranquen" los adeptos
        setTimeout(() => {
          if (!cancelled) tick()
        }, 800)
      } else {
        setLikesCargados(true)
      }
    }
    void cargarLikes()
    return () => {
      cancelled = true
    }
  }, [evento.id, isCronica, likesAdeptos])

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
    if (aclamacion || cargando) return
    setCargando(true)

    const res = await fetch('/api/aclamaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventoId: evento.id, tipo }),
    })

    if (res.ok) {
      setAclamacion(tipo)
      router.refresh()
    }

    setCargando(false)
    setMostrarAcciones(false)
  }

  function abrirComentarios() {
    setMostrarComentarios((prev) => !prev)
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
      retoId: null,
    }
    return <CronicaCard cronica={cronicaMock} />
  }

  return (
    <div
      className={cn(
        'rounded-xl border p-4 space-y-3 transition-all duration-300',
        esDios && diosConfig ? '' : 'bg-surface-1 border-border'
      )}
      style={
        esDios && diosNombre
          ? {
              background: `linear-gradient(135deg, rgba(12,12,12,0.95) 0%, ${getDiosVisual(diosNombre)?.colorFondo ?? 'rgba(12,12,12,0.95)'} 100%)`,
              borderColor:
                getDiosVisual(diosNombre)?.colorBorde ?? 'rgba(255,255,255,0.1)',
            }
          : undefined
      }
    >
      {esVozOlimpo && vozOlimpoPayload && diosNombre ? (
        <div className="space-y-3 min-w-0">
          <PostVozOlimpo
            diosNombre={diosNombre}
            titular={vozOlimpoPayload.titular}
            descripcion={vozOlimpoPayload.descripcion}
            links={vozOlimpoPayload.links}
            esSobreexigencia={vozOlimpoPayload.esSobreexigencia}
            intensidad={vozOlimpoPayload.intensidad}
          />
          <p className="text-xs text-muted-foreground font-body">{tiempoAtras}</p>
        </div>
      ) : (
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
      )}

      {evento.fotoUrl && (
        <img
          src={evento.fotoUrl}
          alt="Comprobante del agon"
          className="w-full max-h-64 object-cover rounded-lg border border-border"
        />
      )}

      <div className="flex items-center gap-4 pt-1 border-t border-border flex-wrap">
        <div
          className={cn(
            !likesCargados && 'opacity-50 pointer-events-none',
            'text-left'
          )}
        >
          <LikeButton
            totalLikes={likes}
            liked={miLike}
            onLike={toggleLike}
            disabled={!likesCargados}
          />
        </div>

        {esOraculo ? (
          <button
            type="button"
            onClick={() => void abrirComentarios()}
            className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>🔮</span>
            <span>Consultar al Oráculo</span>
            {noLeidos > 0 && (
              <span className="text-amber font-medium">
                · {noLeidos} nuevo{noLeidos > 1 ? 's' : ''}
              </span>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void abrirComentarios()}
            className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>💬</span>
            <span>
              {comentariosCount > 0
                ? `${comentariosCount} comentario${comentariosCount > 1 ? 's' : ''}`
                : 'Comentar'}
            </span>
            {noLeidos > 0 && (
              <span className="font-medium text-amber">
                · {noLeidos} nuevo{noLeidos > 1 ? 's' : ''}
              </span>
            )}
          </button>
        )}

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
                className="text-xs font-body transition-colors text-muted-foreground hover:text-amber"
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
                disabled={!!aclamacion}
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
          pollIntervalMs={pollIntervalMs}
          onComentariosMeta={handleComentariosMeta}
          onComentariosCambiados={sincronizarContadorComentarios}
        />
      )}
    </div>
  )
}
