'use client'

interface DatoSemana {
  semana: string
  kleos: number
}

interface Props {
  datos: DatoSemana[]
}

export function KleosChart({ datos }: Props) {
  if (datos.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center">
        <p className="text-xs text-muted-foreground font-body">
          El kleos se acumula semana a semana.
        </p>
      </div>
    )
  }

  const max = Math.max(...datos.map((d) => d.kleos), 1)

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2 h-32">
        {datos.map((d) => {
          const altura = Math.max((d.kleos / max) * 100, 4)
          return (
            <div
              key={d.semana}
              className="flex-1 flex flex-col items-center gap-1 min-w-0"
            >
              <span className="text-xs text-amber font-body font-medium truncate w-full text-center">
                {d.kleos > 0 ? d.kleos : ''}
              </span>
              <div className="w-full flex items-end justify-center flex-1 min-h-0">
                <div
                  className="w-full max-w-full bg-amber/80 rounded-t-sm transition-all duration-700"
                  style={{ height: `${altura}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-2">
        {datos.map((d) => (
          <div key={d.semana} className="flex-1 text-center min-w-0">
            <span className="text-xs text-muted-foreground font-body">
              {d.semana}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
