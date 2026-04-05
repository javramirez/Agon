import { AgonCard } from './agon-card'
import type { PruebaDiaria, Agonista } from '@/lib/db/schema'

interface Props {
  agonista: Agonista
  antagonista: Agonista | null
  pruebaPropia: PruebaDiaria | null
  pruebaAntagonista: PruebaDiaria | null
}

function contarPruebas(p: PruebaDiaria | null): number {
  if (!p) return 0
  let count = 0
  if (p.soloAgua) count++
  if (p.sinComidaRapida) count++
  if (p.pasos >= 10000) count++
  if (p.horasSueno >= 7) count++
  if (p.paginasLeidas >= 10) count++
  if (p.sesionesGym >= 4) count++
  if (p.sesionesCardio >= 3) count++
  return count
}

export function PulsoDelAgon({
  agonista,
  antagonista,
  pruebaPropia,
  pruebaAntagonista,
}: Props) {
  const pruebasPropia = contarPruebas(pruebaPropia)
  const pruebasAntagonista = contarPruebas(pruebaAntagonista)
  const total = 7

  const porcentajePropio = (pruebasPropia / total) * 100
  const porcentajeAntagonista = (pruebasAntagonista / total) * 100

  const vaTuGanando = agonista.kleosTotal > (antagonista?.kleosTotal ?? 0)

  return (
    <AgonCard>
      <div className="space-y-4">

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">
            El Pulso del Agon — hoy
          </p>
          {vaTuGanando ? (
            <span className="text-xs text-amber font-body">↑ vas ganando</span>
          ) : (
            <span className="text-xs text-muted-foreground font-body">↓ vas perdiendo</span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-body text-foreground font-medium">
              {agonista.nombre}
            </span>
            <span className="text-xs font-body text-amber">
              {pruebasPropia}/{total} pruebas
            </span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber rounded-full transition-all duration-700"
              style={{ width: `${porcentajePropio}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-body text-muted-foreground">
              {antagonista?.nombre ?? 'El Antagonista'}
            </span>
            <span className="text-xs font-body text-muted-foreground">
              {pruebasAntagonista}/{total} pruebas
            </span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-border-strong rounded-full transition-all duration-700"
              style={{ width: `${porcentajeAntagonista}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between pt-1 border-t border-border text-xs font-body text-muted-foreground">
          <span>{agonista.kleosTotal.toLocaleString()} kleos</span>
          <span className="text-muted-foreground/50">vs</span>
          <span>{(antagonista?.kleosTotal ?? 0).toLocaleString()} kleos</span>
        </div>

      </div>
    </AgonCard>
  )
}
