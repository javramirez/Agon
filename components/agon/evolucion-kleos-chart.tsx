'use client'

interface PuntoData {
  fecha: string
  [nombre: string]: number | string
}

interface Props {
  datos: PuntoData[]
  nombre1: string
  nombre2: string
}

export function EvolucionKleosChart({ datos, nombre1, nombre2 }: Props) {
  if (datos.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-muted-foreground font-body">
          La evolución del kleos aparecerá aquí.
        </p>
      </div>
    )
  }

  const max1 = Math.max(
    ...datos.map((d) =>
      typeof d[nombre1] === 'number' ? (d[nombre1] as number) : 0
    ),
    1
  )
  const max2 = Math.max(
    ...datos.map((d) =>
      typeof d[nombre2] === 'number' ? (d[nombre2] as number) : 0
    ),
    1
  )
  const maxGlobal = Math.max(max1, max2)

  const ultimo = datos[datos.length - 1]
  const kleosUltimo1 =
    typeof ultimo?.[nombre1] === 'number' ? (ultimo[nombre1] as number) : 0
  const kleosUltimo2 =
    typeof ultimo?.[nombre2] === 'number' ? (ultimo[nombre2] as number) : 0

  const width = Math.max(datos.length * 8, 1)

  return (
    <div className="space-y-3">
      <div className="relative h-24">
        <svg
          viewBox={`0 0 ${width} 80`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <polyline
            points={datos
              .map((d, i) => {
                const y =
                  typeof d[nombre2] === 'number'
                    ? 80 - ((d[nombre2] as number) / maxGlobal) * 70
                    : 80
                return `${i * 8 + 4},${y}`
              })
              .join(' ')}
            fill="none"
            stroke="hsl(0 0% 20%)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <polyline
            points={datos
              .map((d, i) => {
                const y =
                  typeof d[nombre1] === 'number'
                    ? 80 - ((d[nombre1] as number) / maxGlobal) * 70
                    : 80
                return `${i * 8 + 4},${y}`
              })
              .join(' ')}
            fill="none"
            stroke="hsl(43 96% 56%)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex justify-between text-xs font-body gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-amber shrink-0" />
          <span className="text-muted-foreground truncate">{nombre1}</span>
          <span className="text-amber font-medium tabular-nums">
            ◆ {kleosUltimo1.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-border-strong shrink-0" />
          <span className="text-muted-foreground truncate">{nombre2}</span>
          <span className="text-muted-foreground font-medium tabular-nums">
            ◆ {kleosUltimo2.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
