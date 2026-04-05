import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface MejorDia {
  fecha: string
  agonista: string
  kleos: number
}

interface Props {
  dias: MejorDia[]
  nombrePropio: string
}

export function MejoresDias({ dias, nombrePropio }: Props) {
  if (dias.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground font-body">
          Los mejores días del Gran Agon aparecerán aquí.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {dias.map((dia, i) => {
        const esPropio = dia.agonista === nombrePropio
        const esPrimero = i === 0

        return (
          <div
            key={`${dia.fecha}-${dia.agonista}-${i}`}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg',
              esPrimero
                ? 'bg-surface-2 border border-amber/20'
                : 'bg-surface-1 border border-border'
            )}
          >
            <span className="text-sm text-muted-foreground font-body tabular-nums w-5 text-center flex-shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm font-body font-medium truncate',
                  esPropio ? 'text-amber' : 'text-muted-foreground'
                )}
              >
                {dia.agonista}
              </p>
              <p className="text-xs text-muted-foreground font-body">
                {format(parseISO(dia.fecha), "EEEE d 'de' MMMM", { locale: es })}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-display font-semibold text-amber tabular-nums">
                ◆ {dia.kleos}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
