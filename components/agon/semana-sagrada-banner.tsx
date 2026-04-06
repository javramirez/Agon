'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function SemanaSagradaBanner() {
  const [datos, setDatos] = useState<{
    activa: boolean
    fechaFin?: string | null
  } | null>(null)

  useEffect(() => {
    fetch('/api/admin/semana-sagrada')
      .then((r) => r.json())
      .then((d: {
        activa?: boolean
        semanaSagrada?: { fechaFin?: string | null } | null
      }) => {
        setDatos({
          activa: !!d.activa,
          fechaFin: d.semanaSagrada?.fechaFin ?? undefined,
        })
      })
      .catch(() => {})
  }, [])

  if (!datos?.activa) return null

  const fechaFinTexto = datos.fechaFin
    ? format(parseISO(datos.fechaFin), "d 'de' MMMM", { locale: es })
    : null

  return (
    <div className="rounded-xl border border-amber bg-amber/5 p-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <span className="text-2xl animate-pulse-amber flex-shrink-0">⚡</span>
        <div className="min-w-0">
          <p className="text-sm font-display font-bold text-amber tracking-wide">
            La Semana Sagrada
          </p>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            Todo el kleos vale el doble esta semana.
            {fechaFinTexto && ` Termina el ${fechaFinTexto}.`}
          </p>
        </div>
      </div>
    </div>
  )
}
