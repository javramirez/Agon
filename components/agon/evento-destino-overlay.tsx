'use client'

import { useEffect, useState } from 'react'
import { PRUEBAS_DESTINO } from '@/lib/db/constants'
import { cn } from '@/lib/utils'

interface Props {
  pruebaId: string | null
  onCerrar: () => void
}

export function EventoDestinoOverlay({ pruebaId, onCerrar }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (pruebaId) {
      const t = setTimeout(() => setVisible(true), 100)
      return () => clearTimeout(t)
    }
    setVisible(false)
  }, [pruebaId])

  if (!pruebaId) return null

  const config = PRUEBAS_DESTINO.find((p) => p.id === pruebaId)
  if (!config) return null

  const DIFICULTAD_COLOR: Record<string, string> = {
    facil: 'text-success',
    media: 'text-amber',
    dificil: 'text-danger',
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-6',
        'bg-black/90 backdrop-blur-sm transition-opacity duration-500',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div
        className={cn(
          'max-w-sm w-full space-y-6 text-center',
          'transition-all duration-500',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        )}
      >
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber/10 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-amber/20" />
          <span className="text-4xl relative z-10">⚡</span>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-amber tracking-widest uppercase font-body animate-pulse-amber">
            Evento del Destino
          </p>
          <h2 className="font-display text-2xl font-bold text-foreground leading-tight">
            El Altis ha decidido.
          </h2>
          <p
            className={cn(
              'text-xs font-body font-medium uppercase tracking-wide',
              DIFICULTAD_COLOR[config.dificultad] ?? 'text-muted-foreground'
            )}
          >
            Dificultad: {config.dificultad}
          </p>
        </div>

        <div className="bg-surface-1 border border-amber/30 rounded-2xl p-5 space-y-3">
          <p className="text-base font-body text-foreground leading-relaxed italic">
            &ldquo;{config.descripcion}&rdquo;
          </p>
          <div className="flex items-center justify-center gap-3 text-xs font-body text-muted-foreground">
            <span className="text-amber font-medium">◆ +{config.kleos} kleos</span>
            <span>·</span>
            <span>{config.ventana.duracionHoras}h para completarlo</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/60 font-body italic leading-relaxed">
          El agon no avisa. Solo exige.
          <br />
          El Altis espera tu respuesta.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onCerrar}
            className="w-full py-4 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-amber/90 transition-all active:scale-[0.98]"
          >
            Aceptar el desafío
          </button>
          <button
            type="button"
            onClick={onCerrar}
            className="w-full py-2 text-xs text-muted-foreground/50 font-body hover:text-muted-foreground transition-colors"
          >
            Ignorar — el Altis lo registrará
          </button>
        </div>
      </div>
    </div>
  )
}
