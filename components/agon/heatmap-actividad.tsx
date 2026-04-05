'use client'

import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface DiaData {
  fecha: string
  [nombre: string]: number | string
}

interface Props {
  datos: DiaData[]
  nombre1: string
  nombre2: string
}

function getColor(valor: number): string {
  if (valor === 0) return 'bg-surface-2'
  if (valor <= 2) return 'bg-amber/20'
  if (valor <= 4) return 'bg-amber/40'
  if (valor <= 6) return 'bg-amber/70'
  return 'bg-amber'
}

export function HeatmapActividad({ datos, nombre1, nombre2 }: Props) {
  if (datos.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-muted-foreground font-body">
          El heatmap se genera cuando haya datos registrados.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-body flex-wrap">
        <span>Menos</span>
        <div className="flex gap-1">
          {[0, 2, 4, 6, 7].map((v) => (
            <div key={v} className={cn('w-4 h-4 rounded-sm', getColor(v))} />
          ))}
        </div>
        <span>Más</span>
        <span className="ml-auto text-muted-foreground/60">
          pruebas completadas / día
        </span>
      </div>

      {[nombre1, nombre2].map((nombre) => (
        <div key={nombre} className="space-y-2">
          <p className="text-xs text-muted-foreground font-body font-medium">
            {nombre}
          </p>
          <div className="flex flex-wrap gap-1">
            {datos.map((dia) => {
              const valor =
                typeof dia[nombre] === 'number' ? (dia[nombre] as number) : 0
              return (
                <div
                  key={`${nombre}-${dia.fecha}`}
                  className={cn(
                    'w-5 h-5 rounded-sm transition-all duration-300',
                    getColor(valor)
                  )}
                  title={`${format(parseISO(dia.fecha), 'd MMM', { locale: es })}: ${valor}/7 pruebas`}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
