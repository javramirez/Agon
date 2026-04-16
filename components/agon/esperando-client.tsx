'use client'

import { motion } from 'framer-motion'

interface Props {
  modo: 'solo' | 'duelo'
  estado: 'configurando' | 'programado'
  codigoInvitacion: string | null
  fechaInicio: string | null
}

export function EsperandoClient({
  modo,
  estado,
  codigoInvitacion,
  fechaInicio,
}: Props) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const linkInvitacion = codigoInvitacion
    ? `${appUrl}/unirse/${codigoInvitacion}`
    : null

  return (
    <div className="min-h-screen bg-[#080808] text-foreground flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full text-center space-y-8"
      >
        {/* Ícono animado */}
        <motion.div
          animate={{ rotate: [0, -3, 3, -2, 2, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="text-6xl"
        >
          {modo === 'duelo' && estado === 'configurando' ? '⚔️' : '⏳'}
        </motion.div>

        {/* Título y descripción */}
        {modo === 'duelo' && estado === 'configurando' && (
          <div className="space-y-4">
            <p className="text-xs text-amber/70 tracking-widest uppercase font-body">
              Modo Duelo
            </p>
            <h2 className="font-display text-2xl font-bold">
              Esperando al antagonista
            </h2>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Tu reto está listo. Comparte el link o código con tu rival.
              El desafío comenzará cuando ambos hayan completado el Pacto Inicial.
            </p>

            {linkInvitacion && (
              <div className="space-y-3 pt-2">
                <div className="bg-surface-1 border border-border rounded-xl p-4 text-left space-y-2">
                  <p className="text-xs text-amber/70 uppercase tracking-wide font-body">
                    Link de invitación
                  </p>
                  <p className="text-sm font-body text-foreground break-all">
                    {linkInvitacion}
                  </p>
                </div>
                <div className="bg-surface-1 border border-border rounded-xl p-4 text-left space-y-2">
                  <p className="text-xs text-amber/70 uppercase tracking-wide font-body">
                    Código
                  </p>
                  <p className="font-display text-3xl font-bold text-amber tracking-widest">
                    {codigoInvitacion}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {modo === 'solo' && estado === 'configurando' && (
          <div className="space-y-4">
            <p className="text-xs text-amber/70 tracking-widest uppercase font-body">
              Modo Solo
            </p>
            <h2 className="font-display text-2xl font-bold">
              Casi listo
            </h2>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              El Pacto está sellado. Solo falta elegir cuándo comienza tu reto.
            </p>
          </div>
        )}

        {estado === 'programado' && (
          <div className="space-y-4">
            <p className="text-xs text-amber/70 tracking-widest uppercase font-body">
              Reto programado
            </p>
            <h2 className="font-display text-2xl font-bold">
              El Gran Agon comienza pronto
            </h2>
            {fechaInicio && (
              <p className="text-sm text-muted-foreground font-body">
                Fecha de inicio:{' '}
                <span className="text-amber font-bold">
                  {new Date(fechaInicio + 'T12:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
              </p>
            )}
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Cuando llegue el día, el dashboard se desbloqueará automáticamente.
            </p>
          </div>
        )}

        {/* Nota al pie */}
        <motion.p
          className="text-xs text-muted-foreground/40 font-body"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Los dioses del Olimpo aguardan.
        </motion.p>
      </motion.div>
    </div>
  )
}
