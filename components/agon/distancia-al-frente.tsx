interface Props {
  kleosPropio: number
  kleosAntagonista: number
  nombreAntagonista: string
}

const RANGOS = [
  {
    min: 300,
    max: Infinity,
    ganando: true,
    frase: 'El Altis inclina la balanza. Olimpia te contempla.',
  },
  {
    min: 100,
    max: 299,
    ganando: true,
    frase: 'Tu sombra cae sobre el antagonista.',
  },
  {
    min: -99,
    max: 99,
    ganando: null,
    frase: 'El filo de la balanza no distingue ganador.',
  },
  {
    min: -299,
    max: -100,
    ganando: false,
    frase: 'El antagonista avanza. El Altis espera tu respuesta.',
  },
  {
    min: -Infinity,
    max: -300,
    ganando: false,
    frase: 'Olimpia susurra tu nombre con duda.',
  },
]

function getFrase(diferencia: number): { frase: string; ganando: boolean | null } {
  for (const rango of RANGOS) {
    if (diferencia >= rango.min && diferencia <= rango.max) {
      return { frase: rango.frase, ganando: rango.ganando }
    }
  }
  return { frase: 'El Altis observa.', ganando: null }
}

export function DistanciaAlFrente({
  kleosPropio,
  kleosAntagonista,
  nombreAntagonista,
}: Props) {
  const diferencia = kleosPropio - kleosAntagonista
  const { frase, ganando } = getFrase(diferencia)
  const absDiferencia = Math.abs(diferencia)

  return (
    <div className="bg-surface-1 rounded-lg border border-border px-4 py-3 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">
          La Balanza
        </p>
        <p className="text-xs font-body tabular-nums">
          {ganando === true && (
            <span className="text-amber">
              +{absDiferencia.toLocaleString('es-CL')} sobre {nombreAntagonista}
            </span>
          )}
          {ganando === false && (
            <span className="text-muted-foreground">
              -{absDiferencia.toLocaleString('es-CL')} tras {nombreAntagonista}
            </span>
          )}
          {ganando === null && (
            <span className="text-muted-foreground">
              {absDiferencia === 0
                ? 'Igualados'
                : `${absDiferencia.toLocaleString('es-CL')} kleos`}
            </span>
          )}
        </p>
      </div>
      <p className="font-display text-sm font-medium text-foreground leading-snug">
        {frase}
      </p>
    </div>
  )
}
