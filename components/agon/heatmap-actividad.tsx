'use client'

import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface DiaDataDuelo {
  fecha: string
  [nombre: string]: number | string
}

interface DiaDataSolo {
  fecha: string
  valor: number
}

interface PropsDuelo {
  modo: 'duelo'
  datos: DiaDataDuelo[]
  nombre1: string
  nombre2: string
}

interface PropsSolo {
  modo: 'solo'
  datos: DiaDataSolo[]
  nombre1: string
}

type Props = PropsDuelo | PropsSolo

function getColor(valor: number): string {
  if (valor === 0) return 'bg-surface-2'
  if (valor <= 2) return 'bg-amber/20'
  if (valor <= 4) return 'bg-amber/40'
  if (valor <= 6) return 'bg-amber/70'
  return 'bg-amber'
}

export function HeatmapActividad(props: Props) {
  const vacio = props.datos.length === 0

  if (vacio) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-muted-foreground font-body">
          El heatmap se genera cuando haya datos registrados.
        </p>
      </div>
    )
  }

  const leyenda = (
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
  )

  if (props.modo === 'solo') {
    return (
      <div className="space-y-4">
        {leyenda}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-body font-medium">
            {props.nombre1}
          </p>
          <div className="flex flex-wrap gap-1">
            {props.datos.map((dia) => (
              <div
                key={dia.fecha}
                className={cn(
                  'w-5 h-5 rounded-sm transition-all duration-300',
                  getColor(dia.valor)
                )}
                title={`${format(parseISO(dia.fecha), 'd MMM', { locale: es })}: ${dia.valor}/7 pruebas`}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {leyenda}
      {[props.nombre1, props.nombre2].map((nombre) => (
        <div key={nombre} className="space-y-2">
          <p className="text-xs text-muted-foreground font-body font-medium">
            {nombre}
          </p>
          <div className="flex flex-wrap gap-1">
            {props.datos.map((dia) => {
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
