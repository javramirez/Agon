'use client'

import { motion } from 'framer-motion'

interface LineaBase {
  gym: number
  cardio: number
  paginas: number
}

interface PromedioActual {
  gym: number
  cardio: number
  paginas: number
  pasos: number
  sueno: number
  agua: number
  comida: number
}

interface Props {
  lineaBase: LineaBase
  promedioActual: PromedioActual
  diasRegistrados: number
}

interface BenchmarkRowProps {
  label: string
  icono: string
  antes: string
  ahora: string
  mejora: boolean | null
  porcentaje?: string
}

function BenchmarkRow({
  label,
  icono,
  antes,
  ahora,
  mejora,
  porcentaje,
}: BenchmarkRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-3 border-b border-border last:border-0"
    >
      <span className="text-lg w-7 shrink-0">{icono}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-body">{label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground/50 font-body line-through">
            {antes}
          </span>
          <span className="text-xs text-muted-foreground/50">→</span>
          <span className="text-sm font-body font-medium text-foreground">
            {ahora}
          </span>
          {porcentaje && mejora !== null && (
            <span
              className="text-xs font-body font-medium"
              style={{ color: mejora ? '#22C55E' : '#EF4444' }}
            >
              {mejora ? '↑' : '↓'} {porcentaje}
            </span>
          )}
          {mejora === null && (
            <span className="text-xs text-muted-foreground/40 font-body">—</span>
          )}
        </div>
      </div>
      {mejora === true && (
        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
      )}
      {mejora === false && (
        <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
      )}
    </motion.div>
  )
}

function calcPorcentaje(antes: number, ahora: number): string {
  if (antes === 0) return 'nuevo'
  const diff = ((ahora - antes) / antes) * 100
  return `${Math.abs(Math.round(diff))}%`
}

function esMejora(antes: number, ahora: number): boolean | null {
  if (antes === 0 && ahora === 0) return null
  return ahora >= antes
}

export function BenchmarksSolo({
  lineaBase,
  promedioActual,
  diasRegistrados,
}: Props) {
  if (diasRegistrados < 1) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground font-body">
          Los benchmarks aparecen cuando tengas al menos un día registrado.
        </p>
      </div>
    )
  }

  const rows: BenchmarkRowProps[] = [
    {
      label: 'Gym (sesiones/semana)',
      icono: '🏋️',
      antes: lineaBase.gym === 0 ? 'nunca' : `${lineaBase.gym}x`,
      ahora: `${promedioActual.gym}x`,
      mejora: esMejora(lineaBase.gym, promedioActual.gym),
      porcentaje: calcPorcentaje(lineaBase.gym, promedioActual.gym),
    },
    {
      label: 'Cardio (sesiones/semana)',
      icono: '⚡',
      antes: lineaBase.cardio === 0 ? 'nunca' : `${lineaBase.cardio}x`,
      ahora: `${promedioActual.cardio}x`,
      mejora: esMejora(lineaBase.cardio, promedioActual.cardio),
      porcentaje: calcPorcentaje(lineaBase.cardio, promedioActual.cardio),
    },
    {
      label: 'Lectura (páginas/día)',
      icono: '📖',
      antes: lineaBase.paginas === 0 ? 'ninguna' : `${lineaBase.paginas} pág`,
      ahora: `${promedioActual.paginas} pág`,
      mejora: esMejora(lineaBase.paginas, promedioActual.paginas),
      porcentaje: calcPorcentaje(lineaBase.paginas, promedioActual.paginas),
    },
    {
      label: 'Pasos diarios (promedio)',
      icono: '👟',
      antes: '—',
      ahora: promedioActual.pasos.toLocaleString(),
      mejora:
        promedioActual.pasos >= 10000
          ? true
          : promedioActual.pasos > 0
            ? null
            : null,
    },
    {
      label: 'Sueño (horas/noche)',
      icono: '🌙',
      antes: '—',
      ahora: `${promedioActual.sueno}h`,
      mejora:
        promedioActual.sueno >= 7
          ? true
          : promedioActual.sueno > 0
            ? false
            : null,
    },
    {
      label: 'Solo agua (% días)',
      icono: '💧',
      antes: '—',
      ahora: `${promedioActual.agua}%`,
      mejora:
        promedioActual.agua >= 80
          ? true
          : promedioActual.agua >= 50
            ? null
            : false,
    },
    {
      label: 'Sin comida rápida (% días)',
      icono: '🛡️',
      antes: '—',
      ahora: `${promedioActual.comida}%`,
      mejora:
        promedioActual.comida >= 80
          ? true
          : promedioActual.comida >= 50
            ? null
            : false,
    },
  ]

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground/60 font-body pb-2">
        Promedio de {diasRegistrados} día{diasRegistrados !== 1 ? 's' : ''}{' '}
        registrados
      </p>
      {rows.map((row) => (
        <BenchmarkRow key={row.label} {...row} />
      ))}
    </div>
  )
}
