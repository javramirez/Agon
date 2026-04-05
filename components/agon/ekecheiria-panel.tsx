'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { Ekecheiria } from '@/lib/db/schema'

export function EkecheiriaPanel() {
  const [estado, setEstado] = useState<{
    activa: boolean
    ekecheiria: Ekecheiria | null
  } | null>(null)
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/ekecheiria')
      .then((r) => r.json())
      .then((d: { activa?: boolean; ekecheiria?: Ekecheiria | null }) =>
        setEstado({
          activa: Boolean(d.activa),
          ekecheiria: d.ekecheiria ?? null,
        })
      )
  }, [])

  async function invocar() {
    if (motivo.trim().length < 10) return
    setEnviando(true)
    setError('')

    const res = await fetch('/api/ekecheiria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo }),
    })

    if (res.ok) {
      const r = await fetch('/api/ekecheiria')
      const d = (await r.json()) as {
        activa?: boolean
        ekecheiria?: Ekecheiria | null
      }
      setEstado({
        activa: Boolean(d.activa),
        ekecheiria: d.ekecheiria ?? null,
      })
      setConfirmando(false)
      setMotivo('')
    } else {
      const data = (await res.json()) as { error?: string }
      setError(data.error ?? 'Error')
    }

    setEnviando(false)
  }

  if (estado === null) {
    return (
      <div className="bg-surface-1 rounded-lg border border-border p-4">
        <p className="text-xs text-muted-foreground font-body animate-pulse">
          Consultando La Ekecheiria...
        </p>
      </div>
    )
  }

  if (estado.activa) {
    return (
      <div className="bg-surface-1 rounded-lg border border-border p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚖️</span>
          <p className="text-sm font-display font-semibold text-foreground">
            La Ekecheiria está activa.
          </p>
        </div>
        <p className="text-xs text-muted-foreground font-body leading-relaxed">
          La tregua sagrada fue declarada. El agon continúa cuando ambas partes lo
          acuerden.
        </p>
        {estado.ekecheiria?.motivo && (
          <p className="text-xs text-muted-foreground/60 font-body italic">
            &ldquo;{estado.ekecheiria.motivo}&rdquo;
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-surface-1 rounded-lg border border-border p-4 space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚖️</span>
          <p className="text-sm font-display font-semibold text-foreground">
            La Ekecheiria
          </p>
        </div>
        <p className="text-xs text-muted-foreground font-body leading-relaxed">
          La tregua olímpica sagrada. Invócala en caso de enfermedad o lesión real. El
          Ágora lo presenciará todo.
        </p>
      </div>

      {!confirmando ? (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="w-full py-2.5 rounded-lg border border-border text-xs font-body text-muted-foreground hover:border-border-strong hover:text-foreground transition-all"
        >
          Invocar La Ekecheiria
        </button>
      ) : (
        <div className="space-y-3">
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Explica el motivo de la tregua. El Ágora lo leerá."
            rows={3}
            className={cn(
              'w-full bg-surface-2 border border-border rounded-lg px-3 py-2',
              'text-sm font-body text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:border-amber/40 transition-colors resize-none'
            )}
          />
          {error && <p className="text-xs text-red-400 font-body">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmando(false)
                setMotivo('')
              }}
              className="flex-1 py-2 rounded-lg border border-border text-xs font-body text-muted-foreground hover:text-foreground transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void invocar()}
              disabled={enviando || motivo.trim().length < 10}
              className="flex-1 py-2 rounded-lg bg-amber text-black text-xs font-body font-semibold hover:bg-amber/90 transition-all disabled:opacity-50"
            >
              {enviando ? 'Invocando...' : 'Declarar tregua'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
