import type { Agonista } from '@/lib/db/schema'
import { NIVEL_ICONOS } from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'

interface Stats {
  diasPerfectos: number
  mejorRacha: number
  rachaActual: number
  inscripciones: number
}

interface Props {
  agonista: Agonista
  antagonista: Agonista | null
  statsPropio: Stats
  statsAntagonista: Stats | null
}

function StatRow({
  label,
  valorPropio,
  valorAntagonista,
  ganaMayor = true,
}: {
  label: string
  valorPropio: number | string
  valorAntagonista: number | string
  ganaMayor?: boolean
}) {
  const p = typeof valorPropio === 'number' ? valorPropio : 0
  const a = typeof valorAntagonista === 'number' ? valorAntagonista : 0
  const propioGana = ganaMayor ? p > a : p < a
  const antagonistaGana = ganaMayor ? a > p : a < p

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <span
        className={`text-sm font-body font-medium tabular-nums w-12 text-right ${
          propioGana ? 'text-amber' : 'text-muted-foreground'
        }`}
      >
        {valorPropio}
      </span>
      <span className="text-xs text-muted-foreground font-body flex-1 text-center">
        {label}
      </span>
      <span
        className={`text-sm font-body font-medium tabular-nums w-12 ${
          antagonistaGana ? 'text-amber' : 'text-muted-foreground'
        }`}
      >
        {valorAntagonista}
      </span>
    </div>
  )
}

export function StatsComparativa({
  agonista,
  antagonista,
  statsPropio,
  statsAntagonista,
}: Props) {
  const nivelPropio = agonista.nivel as NivelKey
  const nivelAntagonista = antagonista?.nivel as NivelKey | undefined

  const IconPropio = NIVEL_ICONOS[nivelPropio]
  const IconAntagonista = nivelAntagonista ? NIVEL_ICONOS[nivelAntagonista] : null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 text-right">
          <p className="text-xs font-display font-semibold text-amber truncate">
            {agonista.nombre}
          </p>
        </div>
        <div className="flex-1" />
        <div className="w-12">
          <p className="text-xs font-display font-semibold text-muted-foreground truncate">
            {antagonista?.nombre ?? 'Antagonista'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 py-2 border-b border-border">
        <div className="w-12 flex justify-end">
          <IconPropio size={16} className="text-amber" />
        </div>
        <span className="text-xs text-muted-foreground font-body flex-1 text-center">
          Nivel
        </span>
        <div className="w-12">
          {IconAntagonista
            ? <IconAntagonista size={16} className="text-muted-foreground" />
            : <span className="text-sm text-muted-foreground">—</span>
          }
        </div>
      </div>

      <StatRow
        label="Kleos total"
        valorPropio={agonista.kleosTotal}
        valorAntagonista={antagonista?.kleosTotal ?? 0}
      />
      <StatRow
        label="Días perfectos"
        valorPropio={statsPropio.diasPerfectos}
        valorAntagonista={statsAntagonista?.diasPerfectos ?? 0}
      />
      <StatRow
        label="Mejor racha"
        valorPropio={statsPropio.mejorRacha}
        valorAntagonista={statsAntagonista?.mejorRacha ?? 0}
      />
      <StatRow
        label="Racha actual"
        valorPropio={statsPropio.rachaActual}
        valorAntagonista={statsAntagonista?.rachaActual ?? 0}
      />
      <StatRow
        label="Inscripciones"
        valorPropio={statsPropio.inscripciones}
        valorAntagonista={statsAntagonista?.inscripciones ?? 0}
      />
    </div>
  )
}
