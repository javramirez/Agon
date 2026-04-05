'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface PruebaExtraordinariaData {
  id: string
  descripcion: string
  kleosBonus: number
  fechaExpira: string
}

export function PruebaExtraordinariaBanner() {
  const [prueba, setPrueba] = useState<PruebaExtraordinariaData | null>(null)
  const [completada, setCompletada] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch('/api/prueba-extraordinaria')
      .then((r) => r.json())
      .then((d) => {
        setPrueba(d.prueba ?? null)
        if (d.completada) setCompletada(true)
      })
      .finally(() => setCargando(false))
  }, [])

  async function completar() {
    setEnviando(true)
    const res = await fetch('/api/prueba-extraordinaria', { method: 'POST' })
    if (res.ok) {
      setCompletada(true)
    }
    setEnviando(false)
  }

  if (cargando || !prueba) return null

  return (
    <div
      className={cn(
        'rounded-lg border p-4 space-y-3 animate-fade-in',
        completada
          ? 'bg-surface-1 border-amber/20'
          : 'bg-surface-1 border-amber/40'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">🌟</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-amber tracking-widest uppercase font-body mb-1">
            La Prueba Extraordinaria
          </p>
          <p className="text-sm font-body text-foreground leading-relaxed">
            {prueba.descripcion}
          </p>
          <p className="text-xs text-amber font-body mt-1">
            ◆ +{prueba.kleosBonus} kleos bonus
          </p>
        </div>
      </div>

      {completada ? (
        <div className="text-center py-1">
          <p className="text-xs text-amber font-display font-semibold">
            Prueba Extraordinaria completada. El Altis lo registró.
          </p>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={completar}
            disabled={enviando}
            className="flex-1 py-2.5 bg-amber text-black text-xs font-body font-semibold rounded-lg hover:bg-amber/90 transition-all disabled:opacity-50"
          >
            {enviando ? 'Registrando...' : 'Marcar como completada'}
          </button>
          <button
            type="button"
            onClick={() => setPrueba(null)}
            className="px-3 py-2.5 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-all font-body"
          >
            Omitir
          </button>
        </div>
      )}
    </div>
  )
}
