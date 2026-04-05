import { NIVEL_LABELS, NIVEL_ICONOS, NIVEL_THRESHOLDS } from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'

interface Props {
  nivel: string
  kleosTotal: number
  showProgress?: boolean
}

export function NivelBadge({ nivel, kleosTotal, showProgress = false }: Props) {
  const nivelKey = nivel as NivelKey
  const niveles = Object.keys(NIVEL_THRESHOLDS) as NivelKey[]
  const indiceActual = niveles.indexOf(nivelKey)
  const nivelSiguiente = indiceActual >= 0 ? niveles[indiceActual + 1] : undefined

  const kleosActual = NIVEL_THRESHOLDS[nivelKey]
  const kleosSiguiente = nivelSiguiente ? NIVEL_THRESHOLDS[nivelSiguiente] : null
  const progreso = kleosSiguiente
    ? Math.min(((kleosTotal - kleosActual) / (kleosSiguiente - kleosActual)) * 100, 100)
    : 100

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-lg">{NIVEL_ICONOS[nivelKey]}</span>
        <span className="font-display text-sm font-semibold text-foreground">
          {NIVEL_LABELS[nivelKey]}
        </span>
        {nivelSiguiente != null && kleosSiguiente != null && (
          <span className="text-xs text-muted-foreground ml-auto">
            {(kleosSiguiente - kleosTotal).toLocaleString()} kleos para {NIVEL_LABELS[nivelSiguiente]}
          </span>
        )}
      </div>

      {showProgress && (
        <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber rounded-full transition-all duration-700"
            style={{ width: `${progreso}%` }}
          />
        </div>
      )}
    </div>
  )
}
