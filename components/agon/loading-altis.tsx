import { cn } from '@/lib/utils'

const FRASES = [
  'El Altis consulta...',
  'El cronista escribe...',
  'Las inscripciones se revelan...',
  'El agon no espera...',
  'El Altis registra...',
  'La Balanza se ajusta...',
  'El kleos se cuenta...',
  'El oráculo medita...',
]

interface Props {
  frase?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingAltis({ frase, size = 'md', className }: Props) {
  const fraseAleatoria =
    frase ?? FRASES[Math.floor(Math.random() * FRASES.length)]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        size === 'sm' && 'py-4',
        size === 'md' && 'py-12',
        size === 'lg' && 'min-h-[60vh]',
        className
      )}
    >
      <div className="relative">
        <span
          className={cn(
            'text-amber animate-pulse-amber',
            size === 'sm' && 'text-2xl',
            size === 'md' && 'text-4xl',
            size === 'lg' && 'text-6xl'
          )}
        >
          ⚖️
        </span>
      </div>
      <p
        className={cn(
          'font-body text-muted-foreground animate-pulse',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}
      >
        {fraseAleatoria}
      </p>
    </div>
  )
}
