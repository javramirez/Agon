import { cn } from '@/lib/utils'

interface Props {
  titulo: string
  subtitulo?: string
  accion?: React.ReactNode
  className?: string
}

export function SectionHeader({ titulo, subtitulo, accion, className }: Props) {
  return (
    <div className={cn('flex items-end justify-between mb-4', className)}>
      <div>
        <h2 className="font-display text-lg font-semibold tracking-wide text-foreground">
          {titulo}
        </h2>
        {subtitulo && (
          <p className="text-xs text-muted-foreground mt-0.5 font-body">{subtitulo}</p>
        )}
      </div>
      {accion && <div>{accion}</div>}
    </div>
  )
}
