'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NIVEL_LABELS, NIVEL_ICONOS } from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'

interface Props {
  nivelAnterior: string | null
  nivelActual: string
}

export function NivelSubida({ nivelAnterior, nivelActual }: Props) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (nivelAnterior && nivelAnterior !== nivelActual && !dismissed) {
      setVisible(true)
    }
  }, [nivelAnterior, nivelActual, dismissed])

  function cerrar() {
    setVisible(false)
    setDismissed(true)
  }

  const nivelKey = nivelActual as NivelKey
  const Icon = NIVEL_ICONOS[nivelKey]

  return (
    <AnimatePresence>
      {visible && nivelAnterior && (
        <>
          <motion.div
            key="nivel-backdrop"
            className="fixed inset-0 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: 'rgba(0,0,0,0.6)' }}
          />

          <motion.div
            key="nivel-panel"
            className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none"
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <div
              className="pointer-events-auto max-w-sm w-full rounded-2xl border border-amber/40 overflow-hidden"
              style={{ background: 'rgba(8,8,8,0.97)' }}
            >
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber to-transparent" />

              <div className="p-5 space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-xs text-amber tracking-widest uppercase font-body">
                    El Altis te reconoce
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 20,
                      delay: 0.2,
                    }}
                    className="relative flex-shrink-0"
                  >
                    <div
                      className="absolute inset-0 blur-md rounded-full"
                      style={{ background: 'rgba(245,158,11,0.3)' }}
                    />
                    <Icon size={48} className="relative text-amber" />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <motion.p
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="font-display text-xl font-bold text-foreground leading-tight"
                    >
                      {NIVEL_LABELS[nivelKey]}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="text-xs text-muted-foreground font-body mt-1"
                    >
                      Nuevo nivel desbloqueado en el Gran Agon
                    </motion.p>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={cerrar}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 border border-amber/30 text-amber font-display text-xs tracking-widest uppercase rounded-xl hover:bg-amber/10 transition-colors"
                >
                  El Altis lo inscribe
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
