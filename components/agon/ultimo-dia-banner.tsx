'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export function UltimoDiaBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-amber/40 bg-surface-1"
    >
      {/* Fondo con gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber/5 via-amber/10 to-amber/5 pointer-events-none" />

      {/* Línea superior dorada */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber/60 to-transparent" />

      <div className="relative px-5 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <motion.span
            className="text-2xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            🏛️
          </motion.span>
          <div>
            <p className="text-xs text-amber tracking-widest uppercase font-body">
              Día 29 · El último día del Gran Agon
            </p>
            <p className="font-display text-base font-bold text-foreground mt-0.5">
              El Altis espera tu última inscripción.
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-body leading-relaxed">
          Hoy se cierra el Gran Agon. Completa tus pruebas. Los dioses del Olimpo emitirán su
          veredicto final al anochecer.
        </p>

        <Link
          href="/veredicto"
          className="inline-flex items-center gap-2 text-xs text-amber font-body font-medium hover:text-amber-glow transition-colors"
        >
          Ver La Ceremonia del Veredicto →
        </Link>
      </div>

      {/* Línea inferior dorada */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber/30 to-transparent" />
    </motion.div>
  )
}

