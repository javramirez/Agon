'use client'

import { usePulso } from '@/hooks/use-pulso'
import { cn } from '@/lib/utils'

interface Props {
  nombrePropio: string
  nombreAntagonista: string
}

function contarPruebas(p: {
  soloAgua: boolean
  sinComidaRapida: boolean
  pasos: number
  horasSueno: number
  paginasLeidas: number
  sesionesGym: number
  sesionesCardio: number
} | null): number {
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

export function PulsoRealtime({ nombrePropio, nombreAntagonista }: Props) {
  const { data, antagonistaActivo } = usePulso(15000)

  if (!data) {
    return (
      <div className="bg-surface-1 rounded-lg border border-border p-4">
        <div className="h-16 flex items-center justify-center">
          <p className="text-xs text-muted-foreground font-body animate-pulse">
            El Altis consulta...
          </p>
        </div>
      </div>
    )
  }

  const pruebasPropia = contarPruebas(data.agonista.pruebas)
  const pruebasAntagonista = contarPruebas(data.antagonista?.pruebas ?? null)
  const total = 7

  const kleosPropio = data.agonista.kleosTotal
  const kleosAntagonista = data.antagonista?.kleosTotal ?? 0
  const vaGanando = kleosPropio > kleosAntagonista
  const empate = kleosPropio === kleosAntagonista

  return (
    <div
      className={cn(
        'bg-surface-1 rounded-lg border p-4 transition-all duration-500',
        antagonistaActivo ? 'border-amber/40' : 'border-border'
      )}
    >
      {antagonistaActivo && (
        <div className="mb-3 px-3 py-2 bg-amber/10 rounded border border-amber/20 text-xs text-amber font-body animate-fade-in">
          ⚡ {nombreAntagonista} completó una prueba del agon.
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">
            El Pulso del Agon — hoy
          </p>
          {empate ? (
            <span className="text-xs text-muted-foreground font-body">— empate</span>
          ) : vaGanando ? (
            <span className="text-xs text-amber font-body">↑ vas ganando</span>
          ) : (
            <span className="text-xs text-muted-foreground font-body">
              ↓ vas perdiendo
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-xs font-body text-foreground font-medium">
              {nombrePropio}
            </span>
            <span className="text-xs font-body text-amber">
              {pruebasPropia}/{total} pruebas
            </span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber rounded-full transition-all duration-700"
              style={{ width: `${(pruebasPropia / total) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-xs font-body text-muted-foreground">
              {nombreAntagonista}
            </span>
            <span className="text-xs font-body text-muted-foreground">
              {pruebasAntagonista}/{total} pruebas
            </span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-border-strong rounded-full transition-all duration-700"
              style={{ width: `${(pruebasAntagonista / total) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between pt-1 border-t border-border text-xs font-body text-muted-foreground">
          <span className={vaGanando ? 'text-amber font-medium' : ''}>
            ◆ {kleosPropio.toLocaleString()}
          </span>
          <span className="text-muted-foreground/40">vs</span>
          <span
            className={
              !vaGanando && !empate ? 'text-amber font-medium' : ''
            }
          >
            ◆ {kleosAntagonista.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
