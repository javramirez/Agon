import { cn } from '@/lib/utils'

interface Props {
  cantidad: number
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

export function KleosBadge({ cantidad, size = 'md', animate = false }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-display font-semibold text-amber',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-xl',
        animate && 'animate-pulse-amber'
      )}
    >
      <span className="text-amber-dim">◆</span>
      {cantidad.toLocaleString()}
    </span>
  )
}
