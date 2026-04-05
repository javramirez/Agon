import { NIVEL_LABELS, NIVEL_ICONOS, NIVEL_THRESHOLDS } from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'
import { cn } from '@/lib/utils'

const BENEFICIOS: Record<NivelKey, string> = {
  aspirante: 'Acceso completo a la plataforma. 3 aclamaciones diarias.',
  atleta: '5 aclamaciones diarias desbloqueadas.',
  agonista: 'Las Provocaciones desbloqueadas. La Voz del Agon habla.',
  luchador: 'Historial semanal detallado desbloqueado.',
  campeon: 'El Señalamiento disponible. Solo una vez en el Gran Agon.',
  heroe: 'Multiplicador de racha mejorado: +60% kleos con racha activa.',
  semidios: 'Puedes crear Pruebas Extraordinarias para el antagonista.',
  olimpico: 'Las inscripciones secretas se revelan. Aclamaciones ilimitadas un día.',
  leyenda_del_agon:
    'Marco dorado en el perfil. Días perfectos valen 50 kleos.',
  inmortal:
    'El Oráculo del antagonista se revela. Título permanente en el Altis.',
}

interface Props {
  nivel: string
  kleosTotal: number
  siguienteNivel: string | null
  kleosParaSiguiente: number
}

export function NivelDetalle({
  nivel,
  kleosTotal,
  siguienteNivel,
  kleosParaSiguiente,
}: Props) {
  const nivelKey = nivel as NivelKey
  const niveles = Object.keys(NIVEL_THRESHOLDS) as NivelKey[]
  const indice = niveles.indexOf(nivelKey)

  const kleosActual = NIVEL_THRESHOLDS[nivelKey]
  const kleosSiguiente = siguienteNivel
    ? NIVEL_THRESHOLDS[siguienteNivel as NivelKey]
    : null

  const progreso =
    kleosSiguiente !== null && kleosSiguiente > kleosActual
      ? Math.min(
          ((kleosTotal - kleosActual) / (kleosSiguiente - kleosActual)) * 100,
          100
        )
      : 100

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3 py-4">
        <span className="text-6xl block">{NIVEL_ICONOS[nivelKey]}</span>
        <div>
          <p className="text-xs text-amber tracking-widest uppercase font-body">
            Nivel {indice + 1}
          </p>
          <h2 className="font-display text-3xl font-bold text-foreground mt-1">
            {NIVEL_LABELS[nivelKey]}
          </h2>
        </div>
      </div>

      <div className="bg-surface-2 rounded-xl p-4 space-y-2">
        <p className="text-xs text-amber tracking-widest uppercase font-body">
          Beneficio desbloqueado
        </p>
        <p className="text-sm font-body text-foreground leading-relaxed">
          {BENEFICIOS[nivelKey]}
        </p>
      </div>

      {siguienteNivel && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-body gap-2">
            <span className="text-muted-foreground">
              Progreso hacia {NIVEL_LABELS[siguienteNivel as NivelKey]}
            </span>
            <span className="text-amber shrink-0">
              {kleosParaSiguiente.toLocaleString('es-CL')} kleos restantes
            </span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber rounded-full transition-all duration-700"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">
          El camino del agonista
        </p>
        <div className="space-y-1">
          {niveles.map((n, i) => {
            const esActual = n === nivelKey
            const esSuperado = i < indice
            const esFuturo = i > indice

            return (
              <div
                key={n}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                  esActual && 'bg-surface-2 border border-amber/20',
                  esSuperado && 'opacity-60',
                  esFuturo && 'opacity-30'
                )}
              >
                <span
                  className={cn(
                    'text-base',
                    esActual ? 'opacity-100' : 'opacity-70'
                  )}
                >
                  {NIVEL_ICONOS[n]}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-body',
                      esActual
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                    )}
                  >
                    {NIVEL_LABELS[n]}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground font-body tabular-nums">
                    {NIVEL_THRESHOLDS[n].toLocaleString('es-CL')} kleos
                  </p>
                </div>
                {esActual && (
                  <span className="text-xs text-amber font-body">←</span>
                )}
                {esSuperado && (
                  <span className="text-xs text-amber/60">✓</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
