'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { mostrarToast } from './toast-agon'

interface PruebaActiva {
  id: string
  pruebaId: string
  tipo: 'triptico' | 'destino'
  descripcion: string
  kleosBonus: number
  dificultad: string
  fechaExpira: string
}

interface PruebasData {
  triptico: {
    disponibles: PruebaActiva[]
    completadasEstaSemana: number
    maxSemana: number
  }
  destino: {
    disponibles: PruebaActiva[]
  }
}

export function PruebasExtraordinariasPanel() {
  const [datos, setDatos] = useState<PruebasData | null>(null)
  const [completando, setCompletando] = useState<string | null>(null)

  useEffect(() => {
    void cargar()
  }, [])

  async function cargar() {
    const res = await fetch('/api/prueba-extraordinaria')
    if (res.ok) {
      const data = (await res.json()) as PruebasData
      setDatos(data)
    }
  }

  async function completar(filaId: string) {
    setCompletando(filaId)
    const res = await fetch('/api/prueba-extraordinaria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pruebaId: filaId }),
    })

    if (res.ok) {
      const data = (await res.json()) as { kleos: number; multiplicador: number }
      mostrarToast({
        tipo: 'exito',
        icono: '🌟',
        mensaje: `Prueba completada. +${data.kleos} kleos${data.multiplicador === 2 ? ' (⚡ doble)' : ''}.`,
      })
      await cargar()
    } else {
      const data = (await res.json()) as { error?: string }
      mostrarToast({
        tipo: 'error',
        icono: '⚠️',
        mensaje: data.error ?? 'Error',
      })
    }

    setCompletando(null)
  }

  function tiempoRestante(fechaExpira: string): string {
    const diff = new Date(fechaExpira).getTime() - Date.now()
    if (diff <= 0) return 'Expirada'
    const horas = Math.floor(diff / (1000 * 60 * 60))
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (horas > 0) return `${horas}h ${minutos}m restantes`
    return `${minutos}m restantes`
  }

  const DIFICULTAD_COLOR: Record<string, string> = {
    facil: 'text-success',
    media: 'text-amber',
    dificil: 'text-danger',
  }

  if (!datos) return null

  const hayPruebas =
    datos.triptico.disponibles.length > 0 ||
    datos.destino.disponibles.length > 0

  if (!hayPruebas) return null

  return (
    <div className="space-y-4">
      {datos.triptico.disponibles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">
              El Tríptico Semanal
            </p>
            <p className="text-xs text-muted-foreground font-body">
              {datos.triptico.completadasEstaSemana}/
              {datos.triptico.maxSemana} completadas esta semana
            </p>
          </div>

          {datos.triptico.disponibles.map((p) => (
            <div
              key={p.id}
              className="bg-surface-1 border border-amber/20 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">📜</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        'text-xs font-body font-medium capitalize',
                        DIFICULTAD_COLOR[p.dificultad] ?? 'text-muted-foreground'
                      )}
                    >
                      {p.dificultad}
                    </span>
                    <span className="text-xs text-amber font-body">
                      ◆ +{p.kleosBonus} kleos
                    </span>
                  </div>
                  <p className="text-sm font-body text-foreground leading-relaxed italic">
                    &ldquo;{p.descripcion}&rdquo;
                  </p>
                  <p className="text-xs text-muted-foreground font-body mt-1">
                    Disponible hasta el domingo · {tiempoRestante(p.fechaExpira)}
                  </p>
                </div>
              </div>

              {datos.triptico.completadasEstaSemana <
              datos.triptico.maxSemana ? (
                <button
                  type="button"
                  onClick={() => completar(p.id)}
                  disabled={completando === p.id}
                  className="w-full py-2.5 bg-amber text-black text-xs font-body font-semibold rounded-lg hover:bg-amber/90 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {completando === p.id ? 'Registrando...' : 'Marcar como completada'}
                </button>
              ) : (
                <p className="text-xs text-muted-foreground font-body text-center py-1">
                  Ya completaste el máximo esta semana. La tercera expira el
                  domingo.
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {datos.destino.disponibles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">
            Evento del Destino
          </p>

          {datos.destino.disponibles.map((p) => (
            <div
              key={p.id}
              className="bg-surface-1 border border-amber/40 rounded-xl p-4 space-y-3 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber animate-pulse-amber" />

              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 animate-pulse-amber">
                  ⚡
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-amber font-body font-medium uppercase tracking-wider">
                      Evento del Destino
                    </span>
                    <span
                      className={cn(
                        'text-xs font-body font-medium capitalize',
                        DIFICULTAD_COLOR[p.dificultad] ?? 'text-muted-foreground'
                      )}
                    >
                      · {p.dificultad}
                    </span>
                  </div>
                  <p className="text-sm font-body text-foreground leading-relaxed italic">
                    &ldquo;{p.descripcion}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-amber font-body font-medium">
                      ◆ +{p.kleosBonus} kleos
                    </span>
                    <span className="text-xs text-danger font-body">
                      ⏱ {tiempoRestante(p.fechaExpira)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => completar(p.id)}
                  disabled={completando === p.id}
                  className="flex-1 py-2.5 bg-amber text-black text-xs font-body font-semibold rounded-lg hover:bg-amber/90 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {completando === p.id ? 'Registrando...' : 'Completar el Evento'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
