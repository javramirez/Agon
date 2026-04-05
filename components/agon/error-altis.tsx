'use client'

import { cn } from '@/lib/utils'

const MENSAJES_ERROR: Record<string, string> = {
  default: 'El Altis no puede conectarse. El agon continúa sin él.',
  auth: 'El Altis no te reconoce. El agon requiere identificación.',
  notFound: 'El Altis no encuentra lo que buscas. Quizás nunca existió.',
  forbidden: 'El Altis no te permite entrar aquí. El kleos insuficiente.',
  network: 'El Altis perdió la señal. Verifica tu conexión e intenta de nuevo.',
}

interface Props {
  tipo?: keyof typeof MENSAJES_ERROR
  mensaje?: string
  onReintentar?: () => void
  className?: string
}

export function ErrorAltis({
  tipo = 'default',
  mensaje,
  onReintentar,
  className,
}: Props) {
  const textoError = mensaje ?? MENSAJES_ERROR[tipo] ?? MENSAJES_ERROR.default

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-12 text-center',
        className
      )}
    >
      <span className="text-4xl opacity-30">⚠️</span>
      <div className="space-y-1 max-w-xs">
        <p className="text-sm font-display font-semibold text-foreground">
          El Altis interrumpió.
        </p>
        <p className="text-xs text-muted-foreground font-body leading-relaxed">
          {textoError}
        </p>
      </div>
      {onReintentar && (
        <button
          type="button"
          onClick={onReintentar}
          className="px-4 py-2 border border-border rounded-lg text-xs font-body text-muted-foreground hover:text-foreground hover:border-border-strong transition-all"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
