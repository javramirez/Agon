interface Props {
  icono?: string
  titulo: string
  descripcion?: string
}

export function EmptyState({ icono = '🏛️', titulo, descripcion }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-4xl mb-4 opacity-40">{icono}</span>
      <p className="font-display text-sm font-medium text-muted-foreground tracking-wide">
        {titulo}
      </p>
      {descripcion && (
        <p className="text-xs text-muted-foreground/60 mt-1 font-body max-w-xs">
          {descripcion}
        </p>
      )}
    </div>
  )
}
