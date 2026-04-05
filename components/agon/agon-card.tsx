import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'highlighted' | 'muted'
  onClick?: () => void
}

export function AgonCard({ children, className, variant = 'default', onClick }: Props) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        'rounded-lg border p-4 transition-all duration-200',
        variant === 'default' && 'bg-surface-1 border-border',
        variant === 'highlighted' && 'bg-surface-1 border-amber/30 glow-amber',
        variant === 'muted' && 'bg-surface-1/50 border-border/50',
        onClick && 'cursor-pointer hover:border-border-strong',
        className
      )}
    >
      {children}
    </div>
  )
}
