'use client'

import { useState, useEffect } from 'react'

interface Props {
  nivel: string
  nombreAntagonista: string
}

const NIVEL_MINIMO = [
  'campeon',
  'heroe',
  'semidios',
  'olimpico',
  'leyenda_del_agon',
  'inmortal',
] as const

export function SenalamientoPanel({ nivel, nombreAntagonista }: Props) {
  const [estado, setEstado] = useState<{
    usado: boolean
    recibido: boolean
  } | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const tieneAcceso = NIVEL_MINIMO.includes(nivel as (typeof NIVEL_MINIMO)[number])

  useEffect(() => {
    fetch('/api/senalamiento')
      .then((r) => r.json())
      .then((d: { usado?: boolean; recibido?: boolean }) =>
        setEstado({ usado: Boolean(d.usado), recibido: Boolean(d.recibido) })
      )
  }, [])

  async function ejecutarSenalamiento() {
    setEnviando(true)
    setError('')

    const res = await fetch('/api/senalamiento', { method: 'POST' })
    const data = (await res.json()) as { error?: string }

    if (res.ok) {
      setEstado((prev) => ({
        usado: true,
        recibido: prev?.recibido ?? false,
      }))
      setConfirmando(false)
    } else {
      setError(data.error ?? 'Error')
    }

    setEnviando(false)
  }

  if (!tieneAcceso) {
    return (
      <div className="bg-surface-1 rounded-lg border border-border p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg opacity-30">🎯</span>
          <p className="text-xs text-muted-foreground font-body">
            El Señalamiento se desbloquea en nivel Campeón.
          </p>
        </div>
      </div>
    )
  }

  if (!estado) {
    return (
      <div className="bg-surface-1 rounded-lg border border-border p-4">
        <p className="text-xs text-muted-foreground font-body animate-pulse">
          Consultando el estado del Señalamiento...
        </p>
      </div>
    )
  }

  if (estado.recibido && !estado.usado) {
    return (
      <div className="bg-surface-1 rounded-lg border border-amber/20 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <p className="text-sm font-display font-semibold text-amber">
            Has sido señalado.
          </p>
        </div>
        <p className="text-xs text-muted-foreground font-body leading-relaxed">
          Tu antagonista ha señalado e injuriado tus capacidades ante El Ágora. El agon
          espera tu respuesta con los hechos.
        </p>
      </div>
    )
  }

  if (estado.usado) {
    return (
      <div className="bg-surface-1 rounded-lg border border-border p-4 space-y-2 opacity-60">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <p className="text-xs text-muted-foreground font-body">
            El Señalamiento ya fue usado en este Gran Agon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-1 rounded-lg border border-border p-4 space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <p className="text-sm font-display font-semibold text-foreground">
            El Señalamiento
          </p>
          <span className="text-xs text-amber font-body ml-auto">1 disponible</span>
        </div>
        <p className="text-xs text-muted-foreground font-body leading-relaxed">
          Señala a {nombreAntagonista} e injuria sus capacidades ante El Ágora. Solo
          puedes usarlo una vez en todo el Gran Agon. Sin retorno.
        </p>
      </div>

      {error && <p className="text-xs text-red-400 font-body">{error}</p>}

      {!confirmando ? (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="w-full py-2.5 rounded-lg border border-border text-xs font-body text-muted-foreground hover:border-border-strong hover:text-foreground transition-all"
        >
          Usar El Señalamiento
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-amber font-body text-center">
            ¿Confirmas? Esta acción no tiene vuelta atrás.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="flex-1 py-2 rounded-lg border border-border text-xs font-body text-muted-foreground hover:text-foreground transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void ejecutarSenalamiento()}
              disabled={enviando}
              className="flex-1 py-2 rounded-lg bg-amber text-black text-xs font-body font-semibold hover:bg-amber/90 transition-all disabled:opacity-50"
            >
              {enviando ? 'Señalando...' : 'Señalar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
