'use client'

import { useState, useEffect } from 'react'
import { NIVEL_LABELS, NIVEL_ICONOS } from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'
import { cn } from '@/lib/utils'

interface Props {
  nivelAnterior: string | null
  nivelActual: string
}

export function NivelSubida({ nivelAnterior, nivelActual }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (nivelAnterior && nivelAnterior !== nivelActual) {
      setVisible(true)
      const t = setTimeout(() => setVisible(false), 5000)
      return () => clearTimeout(t)
    }
  }, [nivelAnterior, nivelActual])

  if (!visible || !nivelAnterior) return null

  const nivelKey = nivelActual as NivelKey

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center pb-24 sm:pb-8 px-4">
      <div
        className={cn(
          'bg-surface-1 border border-amber/40 rounded-2xl px-6 py-4 max-w-sm w-full',
          'animate-scale-in pointer-events-auto shadow-lg'
        )}
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl">{NIVEL_ICONOS[nivelKey]}</span>
          <div>
            <p className="text-xs text-amber tracking-widest uppercase font-body">
              El Altis te reconoce
            </p>
            <p className="font-display text-lg font-bold text-foreground">
              {NIVEL_LABELS[nivelKey]}
            </p>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              Nuevo nivel desbloqueado en el Gran Agon.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
