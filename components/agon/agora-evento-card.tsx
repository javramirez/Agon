'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
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

  useEffect(() => {
    setAclamacion(miAclamacion ?? null)
  }, [miAclamacion])

  useEffect(() => {
    setUsadas(aclamacionesUsadas)
  }, [aclamacionesUsadas])

  if (evento.tipo === 'cronica_semanal') {
    const metadata = evento.metadata as {
      semana?: number
      fechaInicio?: string
      fechaFin?: string
    } | null
    const cronicaMock: Cronica = {
      id: evento.id,
      semana: metadata?.semana ?? 1,
      fechaInicio:
        metadata?.fechaInicio ??
        new Date(evento.createdAt).toISOString().split('T')[0],
      fechaFin:
        metadata?.fechaFin ??
        new Date(evento.createdAt).toISOString().split('T')[0],
      relato: evento.contenido,
      metadata: evento.metadata,
      createdAt: evento.createdAt,
    }
    return <CronicaCard cronica={cronicaMock} />
  }

  const icono = TIPO_ICONOS[evento.tipo] ?? '◆'
  const tiempoAtras = formatDistanceToNow(new Date(evento.createdAt), {
    addSuffix: true,
    locale: es,
  })

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

  return (
    <div className="bg-surface-1 rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5 flex-shrink-0">{icono}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-body text-foreground leading-snug">
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

      <div className="flex items-center justify-between pt-1 border-t border-border">
        {aclamacion ? (
          <div className="flex items-center gap-1.5">
            <span className="text-base">
              {ACLAMACIONES_CONFIG.find((a) => a.tipo === aclamacion)?.emoji}
            </span>
            <span className="text-xs text-muted-foreground font-body">
              {ACLAMACIONES_CONFIG.find((a) => a.tipo === aclamacion)?.label}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setMostrarAcciones(!mostrarAcciones)}
            disabled={usadas >= 5 || cargando}
            className={cn(
              'text-xs font-body transition-colors',
              usadas >= 5
                ? 'text-muted-foreground/40 cursor-not-allowed'
                : 'text-muted-foreground hover:text-amber'
            )}
          >
            {usadas >= 5 ? 'Sin aclamaciones' : '+ Aclamar'}
          </button>
        )}

        <span className="text-xs text-muted-foreground/50 font-body">
          {5 - usadas} aclamaciones restantes hoy
        </span>
      </div>

      {mostrarAcciones && !aclamacion && (
        <div className="grid grid-cols-2 gap-2 pt-2 sm:flex sm:flex-wrap">
          {ACLAMACIONES_CONFIG.map((a) => (
            <button
              key={a.tipo}
              type="button"
              onClick={() => aclamar(a.tipo)}
              disabled={cargando}
              title={a.label}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl border',
                'bg-surface-2 border-border active:scale-95',
                'transition-all text-sm justify-center sm:justify-start'
              )}
            >
              <span className="text-base">{a.emoji}</span>
              <span className="text-xs text-muted-foreground font-body">{a.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
