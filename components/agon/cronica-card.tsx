import type { Cronica } from '@/lib/db/schema'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  cronica: Cronica
}

export function CronicaCard({ cronica }: Props) {
  const fechaInicio = new Date(
    typeof cronica.fechaInicio === 'string'
      ? cronica.fechaInicio
      : String(cronica.fechaInicio)
  )
  const fechaFin = new Date(
    typeof cronica.fechaFin === 'string'
      ? cronica.fechaFin
      : String(cronica.fechaFin)
  )

  return (
    <div className="bg-surface-1 rounded-lg border border-amber/20 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">📜</span>
            <p className="text-xs text-amber tracking-widest uppercase font-body">
              La Crónica del Período — Semana {cronica.semana}
            </p>
          </div>
          <p className="text-xs text-muted-foreground font-body pl-7">
            {format(fechaInicio, "d 'de' MMMM", { locale: es })} —{' '}
            {format(fechaFin, "d 'de' MMMM", { locale: es })}
          </p>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="relative">
        <span className="absolute -top-1 -left-1 text-3xl text-amber/20 font-display leading-none select-none">
          &ldquo;
        </span>
        <p className="text-sm font-body text-foreground leading-relaxed pl-4 pr-2 italic">
          {cronica.relato}
        </p>
        <span className="text-3xl text-amber/20 font-display leading-none select-none float-right -mt-2">
          &rdquo;
        </span>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <div className="h-px bg-border flex-1" />
        <p className="text-xs text-muted-foreground/50 font-body italic">
          El Altis lo inscribió para siempre
        </p>
        <div className="h-px bg-border flex-1" />
      </div>
    </div>
  )
}
