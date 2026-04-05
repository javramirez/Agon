'use client'

import { useState, useEffect } from 'react'
import { INSCRIPCIONES } from '@/lib/db/constants'
import { cn } from '@/lib/utils'

interface Props {
  inscripcionId: string | null
  onCerrar: () => void
}

export function InscripcionOverlay({ inscripcionId, onCerrar }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (inscripcionId) {
      setVisible(true)
    }
  }, [inscripcionId])

  if (!inscripcionId || !visible) return null

  const config = INSCRIPCIONES.find((i) => i.id === inscripcionId)
  if (!config) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in"
      onClick={() => {
        setVisible(false)
        onCerrar()
      }}
    >
      <div
        className={cn(
          'max-w-sm w-full bg-surface-1 border border-amber/30 rounded-2xl p-8 text-center space-y-6 animate-scale-in'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl">{config.icono}</div>

        <div className="space-y-2">
          <p className="text-xs text-amber tracking-widest uppercase font-body">
            Inscripción desbloqueada
          </p>
          <h2 className="font-display text-xl font-bold text-foreground">
            {config.nombre}
          </h2>
          <p className="text-sm text-muted-foreground font-body leading-relaxed">
            {config.descripcion}
          </p>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground/60 font-body italic">
            En la antigüedad, las hazañas del agon quedaban grabadas en piedra en
            el Altis de Olimpia. Hoy quedan grabadas en tu temple.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setVisible(false)
            onCerrar()
          }}
          className="w-full py-3 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-amber/90 transition-colors"
        >
          El Altis lo registra
        </button>
      </div>
    </div>
  )
}
