import Image from 'next/image'
import { DIOSES } from '@/lib/dioses/config'
import { getDiosVisual } from '@/lib/dioses/imagen-config'
import { cn } from '@/lib/utils'

interface Props {
  diosNombre: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showName?: boolean
  showGlow?: boolean
}

export function DiosAvatar({
  diosNombre,
  size = 'md',
  showName = false,
  showGlow = false,
}: Props) {
  const dios = DIOSES[diosNombre]
  const visual = getDiosVisual(diosNombre)
  if (!dios || !visual) return null

  const sizeClasses = {
    sm: { wrapper: 'w-7 h-7', ring: 'ring-1', text: 'text-xs', name: 'text-xs' },
    md: { wrapper: 'w-9 h-9', ring: 'ring-1', text: 'text-sm', name: 'text-sm' },
    lg: { wrapper: 'w-14 h-14', ring: 'ring-2', text: 'text-xl', name: 'text-base' },
    xl: { wrapper: 'w-20 h-20', ring: 'ring-2', text: 'text-3xl', name: 'text-lg' },
  }

  const s = sizeClasses[size]

  return (
    <div className="flex items-center gap-2.5 flex-shrink-0">
      <div className="relative flex-shrink-0">
        {showGlow && (
          <div
            className="absolute -inset-1 rounded-full blur-sm opacity-60"
            style={{ background: visual.colorGlow }}
          />
        )}

        <div
          className={cn(
            'relative rounded-full overflow-hidden flex-shrink-0',
            s.wrapper,
            s.ring,
            'ring-offset-0'
          )}
          style={{
            border: `1.5px solid ${visual.colorBorde}`,
          }}
        >
          <Image
            src={visual.imagen}
            alt={dios.nombre}
            fill
            className="object-cover object-top"
            sizes={
              size === 'sm'
                ? '28px'
                : size === 'md'
                  ? '36px'
                  : size === 'lg'
                    ? '56px'
                    : '80px'
            }
          />
        </div>
      </div>

      {showName && (
        <div>
          <p
            className={cn('font-display font-bold leading-tight', s.name)}
            style={{ color: visual.colorTexto }}
          >
            {dios.nombre}
          </p>
          <p className="text-xs text-muted-foreground font-body capitalize">
            {dios.dominio[0].replace(/_/g, ' ')}
          </p>
        </div>
      )}
    </div>
  )
}
