import type { Llama } from '@/lib/db/schema'
import { cn } from '@/lib/utils'
import { ICONOS_PRUEBAS } from './iconos-pruebas'

const HABITOS_CONFIG: Record<string, { nombre: string }> = {
  agua: { nombre: 'Solo agua' },
  comida: { nombre: 'Sin comida rápida' },
  pasos: { nombre: 'Pasos' },
  sueno: { nombre: 'Sueño' },
  lectura: { nombre: 'Lectura' },
  gym: { nombre: 'Gym' },
  cardio: { nombre: 'Cardio' },
}

interface Props {
  llamas: Llama[]
}

export function LlamasPanel({ llamas }: Props) {
  const llamasOrdenadas = Object.keys(HABITOS_CONFIG).map((habitoId) => {
    const llama = llamas.find((l) => l.habitoId === habitoId)
    return {
      habitoId,
      ...HABITOS_CONFIG[habitoId],
      rachaActual: llama?.rachaActual ?? 0,
      rachMaxima: llama?.rachMaxima ?? 0,
    }
  })

  return (
    <div className="space-y-2">
      {llamasOrdenadas.map((h) => (
        <div
          key={h.habitoId}
          className="flex items-center gap-3 py-2 border-b border-border last:border-0"
        >
          {(() => {
            const Icono = ICONOS_PRUEBAS[h.habitoId]
            return Icono ? (
              <Icono
                size={18}
                className={
                  h.rachaActual > 0
                    ? 'text-amber flex-shrink-0'
                    : 'text-muted-foreground/40 flex-shrink-0'
                }
              />
            ) : null
          })()}
          <span className="text-sm font-body text-muted-foreground flex-1 truncate">
            {h.nombre}
          </span>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-body">racha</p>
              <p
                className={cn(
                  'text-sm font-body font-semibold tabular-nums',
                  h.rachaActual > 0 ? 'text-amber' : 'text-muted-foreground/40'
                )}
              >
                {h.rachaActual > 0 ? `🔥 ${h.rachaActual}` : '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-body">máx.</p>
              <p className="text-sm font-body font-medium text-muted-foreground tabular-nums">
                {h.rachMaxima > 0 ? h.rachMaxima : '—'}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
