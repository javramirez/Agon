import type { Hegemonia, Agonista } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

interface Props {
  hegemonias: Hegemonia[]
  agonista: Agonista
  antagonista: Agonista | null
}

export function HegemoniaCard({ hegemonias, agonista, antagonista }: Props) {
  const hegemoniaActual = hegemonias[0]
  const hegemoniasConGanador = hegemonias.filter((h) => !h.empate && h.ganadorId)

  const hegPropia = hegemoniasConGanador.filter(
    (h) => h.ganadorId === agonista.id
  ).length
  const hegAntagonista = hegemoniasConGanador.filter(
    (h) => h.ganadorId === antagonista?.id
  ).length

  return (
    <div className="space-y-4">
      {hegemoniaActual && (
        <div
          className={cn(
            'rounded-lg border p-4',
            hegemoniaActual.empate
              ? 'bg-surface-1 border-border'
              : hegemoniaActual.ganadorId === agonista.id
                ? 'bg-surface-1 border-amber/30'
                : 'bg-surface-1 border-border'
          )}
        >
          <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-2">
            La Hegemonía — Semana {hegemoniaActual.semana}
          </p>

          {hegemoniaActual.empate ? (
            <p className="font-display text-sm text-muted-foreground">
              El Altis no puede decidir. Nadie porta la Hegemonía.
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xl">👑</span>
              <div>
                <p className="font-display text-sm font-semibold text-amber">
                  {hegemoniaActual.ganadorId === agonista.id
                    ? agonista.nombre
                    : antagonista?.nombre ?? 'El Antagonista'}
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  {hegemoniaActual.kleosGanador.toLocaleString()} vs{' '}
                  {hegemoniaActual.kleosRival.toLocaleString()} kleos
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {hegemonias.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">
            Historial
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface-1 border border-border rounded-lg p-3 text-center">
              <p className="font-display text-2xl font-bold text-amber">
                {hegPropia}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-1">
                {agonista.nombre}
              </p>
            </div>
            <div className="bg-surface-1 border border-border rounded-lg p-3 text-center">
              <p className="font-display text-2xl font-bold text-foreground">
                {hegAntagonista}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-1">
                {antagonista?.nombre ?? 'Antagonista'}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            {hegemonias.slice(1).map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between px-3 py-2 bg-surface-1 rounded border border-border text-xs font-body"
              >
                <span className="text-muted-foreground">Semana {h.semana}</span>
                {h.empate ? (
                  <span className="text-muted-foreground/50">Empate</span>
                ) : (
                  <span
                    className={
                      h.ganadorId === agonista.id ? 'text-amber' : 'text-muted-foreground'
                    }
                  >
                    {h.ganadorId === agonista.id
                      ? agonista.nombre
                      : antagonista?.nombre ?? 'Antagonista'}{' '}
                    — ◆ {h.kleosGanador.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
