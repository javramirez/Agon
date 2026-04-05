'use client'

import { useCierreDramatico } from '@/hooks/use-cierre-dramatico'
import { cn } from '@/lib/utils'

interface Props {
  diaPerfecto: boolean
  pruebasCompletadas: number
  nombreAntagonista: string
  pruebasAntagonista: number
  onCerrar: () => void
}

export function CierreDramatico({
  diaPerfecto,
  pruebasCompletadas,
  nombreAntagonista,
  pruebasAntagonista,
  onCerrar,
}: Props) {
  const { mostrar, minutosRestantes, cerrarIgual } = useCierreDramatico(diaPerfecto)

  if (!mostrar) return null

  const horas = Math.floor(minutosRestantes / 60)
  const minutos = minutosRestantes % 60
  const tiempoFormato =
    horas > 0 ? `${horas}h ${minutos}m` : `${minutos} minutos`

  const antagonistaYaTermino = pruebasAntagonista === 7
  const pruebasFaltantes = 7 - pruebasCompletadas

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="text-6xl mb-6 animate-pulse-amber">⚖️</div>

      <div className="text-center mb-8 space-y-2">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">
          El agon de hoy cierra en
        </p>
        <p className="font-display text-5xl font-bold text-amber">{tiempoFormato}</p>
      </div>

      <div className="w-full max-w-sm space-y-3 mb-8">
        <div className="bg-surface-1 rounded-lg border border-border p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-body text-foreground">Tus pruebas</span>
            <span
              className={cn(
                'text-sm font-body font-semibold',
                pruebasCompletadas === 7 ? 'text-amber' : 'text-danger'
              )}
            >
              {pruebasCompletadas}/7
            </span>
          </div>
          {pruebasFaltantes > 0 && (
            <p className="text-xs text-muted-foreground font-body mt-1">
              {pruebasFaltantes}{' '}
              {pruebasFaltantes === 1 ? 'prueba falta' : 'pruebas faltan'}. El Altis
              espera tu respuesta.
            </p>
          )}
        </div>

        <div className="bg-surface-1 rounded-lg border border-border p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-body text-muted-foreground">
              {nombreAntagonista}
            </span>
            <span
              className={cn(
                'text-sm font-body font-semibold',
                antagonistaYaTermino ? 'text-amber' : 'text-muted-foreground'
              )}
            >
              {pruebasAntagonista}/7
            </span>
          </div>
          {antagonistaYaTermino && (
            <p className="text-xs text-muted-foreground font-body mt-1">
              Tu antagonista ya cerró su agon. Hace rato.
            </p>
          )}
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <button
          type="button"
          onClick={() => {
            cerrarIgual()
            onCerrar()
          }}
          className="w-full py-4 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-amber/90 transition-colors"
        >
          Completar las pruebas ahora
        </button>
        <button
          type="button"
          onClick={() => {
            cerrarIgual()
            onCerrar()
          }}
          className="w-full py-3 bg-transparent text-muted-foreground font-body text-sm hover:text-foreground transition-colors"
        >
          Cerrar el agon así. El Altis registrará el silencio.
        </button>
      </div>
    </div>
  )
}
