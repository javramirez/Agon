import { DIOSES } from '@/lib/dioses/config'
import { cn } from '@/lib/utils'

interface Props {
  diosNombre: string
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

export function DiosAvatar({ diosNombre, size = 'md', showName = false }: Props) {
  const dios = DIOSES[diosNombre]
  if (!dios) return null

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'rounded-full bg-surface-2 border border-border flex items-center justify-center flex-shrink-0',
          size === 'sm' && 'w-6 h-6 text-xs',
          size === 'md' && 'w-8 h-8 text-sm',
          size === 'lg' && 'w-12 h-12 text-xl'
        )}
      >
        {dios.avatar}
      </div>
      {showName && (
        <div>
          <p
            className={cn(
              'font-display font-semibold',
              dios.color,
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base'
            )}
          >
            {dios.nombre}
          </p>
          <p className="text-xs text-muted-foreground font-body">
            {dios.dominio[0]}
          </p>
        </div>
      )}
    </div>
  )
}
