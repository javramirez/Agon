'use client'

import { useState, useEffect } from 'react'

export function SemanaSagradaBanner() {
  const [activa, setActiva] = useState(false)

  useEffect(() => {
    fetch('/api/admin/semana-sagrada')
      .then((r) => r.json())
      .then((d) => {
        setActiva(d.activa)
      })
  }, [])

  if (!activa) return null

  return (
    <div className="rounded-lg border border-amber bg-amber/5 p-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <span className="text-2xl animate-pulse-amber">⚡</span>
        <div>
          <p className="text-sm font-display font-bold text-amber tracking-wide">
            La Semana Sagrada
          </p>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            Todo el kleos ganado esta semana vale el doble. El Gran Agon está en
            su momento más épico.
          </p>
        </div>
      </div>
    </div>
  )
}
