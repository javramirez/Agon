import { cn } from '@/lib/utils'

interface Props {
  racha: number
  habitoNombre: string
  size?: 'sm' | 'md'
}

export function LlamaIndicator({ racha, habitoNombre, size = 'md' }: Props) {
  if (racha === 0) return null

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-amber',
        size === 'sm' ? 'text-xs' : 'text-sm'
      )}
      title={`${racha} días seguidos de ${habitoNombre}`}
    >
      <span className={racha >= 7 ? 'animate-pulse-amber' : ''}>🔥</span>
      <span className="font-body font-medium">{racha}</span>
    </div>
  )
}
