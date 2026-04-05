'use client'

import { cn } from '@/lib/utils'
import type { Agonista } from '@/lib/db/schema'

interface Props {
  agonista: Agonista
  antagonista: Agonista | null
}

export function BalanzaDelAltis({ agonista, antagonista }: Props) {
  const kleosPropio = agonista.kleosTotal
  const kleosAntagonista = antagonista?.kleosTotal ?? 0
  const total = kleosPropio + kleosAntagonista

  const porcentajePropio = total === 0 ? 50 : (kleosPropio / total) * 100
  const porcentajeAntagonista = 100 - porcentajePropio

  const vaGanando = kleosPropio > kleosAntagonista
  const empate = kleosPropio === kleosAntagonista
  const diferencia = Math.abs(kleosPropio - kleosAntagonista)

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">
          La Balanza del Altis
        </p>
        {empate ? (
          <p className="text-sm font-display text-muted-foreground">
            El Altis no puede decidir. Están igualados.
          </p>
        ) : (
          <p className="text-sm font-display">
            <span className={vaGanando ? 'text-amber' : 'text-foreground'}>
              {vaGanando ? agonista.nombre : antagonista?.nombre ?? 'El Antagonista'}
            </span>
            <span className="text-muted-foreground"> va ganando por </span>
            <span className="text-amber">◆ {diferencia.toLocaleString()} kleos</span>
          </p>
        )}
      </div>

      <div className="relative h-8 rounded-full overflow-hidden bg-surface-2 flex">
        <div
          className={cn(
            'h-full transition-all duration-1000 flex items-center justify-start pl-3',
            vaGanando ? 'bg-amber' : 'bg-border-strong'
          )}
          style={{ width: `${porcentajePropio}%` }}
        >
          {porcentajePropio > 20 && (
            <span
              className={cn(
                'text-xs font-body font-semibold truncate',
                vaGanando ? 'text-black' : 'text-muted-foreground'
              )}
            >
              {agonista.nombre}
            </span>
          )}
        </div>

        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-background z-10 -translate-x-px" />

        <div
          className={cn(
            'h-full transition-all duration-1000 flex items-center justify-end pr-3 ml-auto',
            !vaGanando && !empate ? 'bg-amber' : 'bg-border-strong'
          )}
          style={{ width: `${porcentajeAntagonista}%` }}
        >
          {porcentajeAntagonista > 20 && (
            <span
              className={cn(
                'text-xs font-body font-semibold truncate',
                !vaGanando && !empate ? 'text-black' : 'text-muted-foreground'
              )}
            >
              {antagonista?.nombre ?? 'Antagonista'}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between text-xs font-body text-muted-foreground px-1">
        <span className={vaGanando ? 'text-amber font-medium' : ''}>
          ◆ {kleosPropio.toLocaleString()}
        </span>
        <span className={!vaGanando && !empate ? 'text-amber font-medium' : ''}>
          ◆ {kleosAntagonista.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
