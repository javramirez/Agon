'use client'

import { cn } from '@/lib/utils'

interface HabitoData {
  habito: string
  raw1: number
  raw2: number
  [nombre: string]: number | string
}

interface Props {
  datos: HabitoData[]
  nombre1: string
  nombre2: string
}

export function ComparativaHabitos({ datos, nombre1, nombre2 }: Props) {
  if (datos.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-muted-foreground font-body">
          Sin datos suficientes para comparar.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-body mb-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber" />
          <span className="text-muted-foreground">{nombre1}</span>
        </div>
        <div className="flex items-center gap-1.5 ml-3">
          <div className="w-3 h-3 rounded-sm bg-border-strong" />
          <span className="text-muted-foreground">{nombre2}</span>
        </div>
      </div>

      {datos.map((h) => {
        const pct1 = typeof h[nombre1] === 'number' ? (h[nombre1] as number) : 0
        const pct2 = typeof h[nombre2] === 'number' ? (h[nombre2] as number) : 0
        const gana1 = pct1 >= pct2

        return (
          <div key={h.habito} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-body gap-2">
              <span className="text-muted-foreground truncate">{h.habito}</span>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={cn(
                    'tabular-nums font-medium',
                    gana1 ? 'text-amber' : 'text-muted-foreground'
                  )}
                >
                  {pct1}%
                </span>
                <span className="text-muted-foreground/40">vs</span>
                <span
                  className={cn(
                    'tabular-nums font-medium',
                    !gana1 && pct1 !== pct2
                      ? 'text-amber'
                      : 'text-muted-foreground'
                  )}
                >
                  {pct2}%
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber rounded-full transition-all duration-700"
                  style={{ width: `${pct1}%` }}
                />
              </div>
              <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-border-strong rounded-full transition-all duration-700"
                  style={{ width: `${pct2}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
