'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface Props {
  nombreAgonista: string
}

export function EkecheiriaExpiradaClient({ nombreAgonista }: Props) {
  const [aceptado, setAceptado] = useState(false)
  const router = useRouter()

  function continuar() {
    setAceptado(true)
    setTimeout(() => router.push('/dashboard'), 600)
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#080808] px-6">
      <AnimatePresence>
        {!aceptado && (
          <motion.div
            className="w-full max-w-sm space-y-8"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="h-px w-full"
              style={{
                background:
                  'linear-gradient(to right, transparent, rgba(245,158,11,0.6), transparent)',
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />

            <div className="space-y-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.span
                  className="block text-5xl"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ⚖️
                </motion.span>
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <p className="font-body text-xs uppercase tracking-widest text-amber">
                  El Altis ha hablado
                </p>
                <h1 className="font-display text-2xl font-bold tracking-wide text-foreground">
                  La tregua ha expirado.
                </h1>
              </motion.div>

              <motion.div
                className="space-y-4 rounded-xl border border-amber/20 bg-surface-1 p-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <p className="font-body text-sm leading-relaxed text-foreground/80">
                  La Ekecheiria duró 7 días. El plazo máximo se cumplió y el Altis
                  levantó la tregua por mandato propio.
                </p>
                <div className="h-px bg-border" />
                <p className="font-body text-sm leading-relaxed text-foreground">
                  {nombreAgonista}, el Gran Agon se reanuda ahora. Las pruebas no
                  esperaron. El agon tampoco.
                </p>
                <p className="font-body text-xs italic text-amber">
                  &ldquo;La tregua sagrada protege al guerrero herido — no al que
                  simplemente descansa.&rdquo;
                </p>
              </motion.div>
            </div>

            <motion.button
              type="button"
              onClick={continuar}
              className="w-full rounded-xl bg-amber py-4 font-display text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-amber/90"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Reanudar el Agon
            </motion.button>

            <motion.div
              className="h-px w-full"
              style={{
                background:
                  'linear-gradient(to right, transparent, rgba(245,158,11,0.3), transparent)',
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
