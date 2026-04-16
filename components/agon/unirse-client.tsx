'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface Props {
  codigo: string
  retoId: string
}

export function UnirseClient({ codigo, retoId }: Props) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function aceptar() {
    setCargando(true)
    setError('')

    try {
      const res = await fetch('/api/retos/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retoId }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? 'Error al unirse al reto')
      }

      router.push('/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] text-foreground flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-lg w-full text-center space-y-10"
      >
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="font-display text-6xl font-bold tracking-widest shimmer-text"
          >
            AGON
          </motion.h1>
          <p className="text-xs text-amber/70 tracking-widest uppercase font-body">
            Invitación al Gran Agon
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-surface-1 border border-amber/20 rounded-2xl p-8 space-y-3"
        >
          <p className="text-xs text-amber/70 uppercase tracking-wide font-body">
            Código de desafío
          </p>
          <p className="font-display text-4xl font-bold tracking-widest text-amber">
            {codigo}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <h2 className="font-display text-2xl font-bold">
            Has sido desafiado
          </h2>
          <p className="text-sm text-muted-foreground font-body leading-relaxed">
            29 días. Siete pruebas diarias. Los dioses del Olimpo como testigos.
            Al aceptar, iniciarás tu Pacto Inicial y quedarás ligado al Gran Agon.
          </p>
        </motion.div>

        {error && (
          <p className="text-red-400 text-xs font-body">{error}</p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="space-y-3"
        >
          <motion.button
            type="button"
            onClick={aceptar}
            disabled={cargando}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-amber/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {cargando ? 'Aceptando...' : 'Aceptar el desafío'}
          </motion.button>
          <p className="text-xs text-muted-foreground/40 font-body">
            Una vez aceptado, el Pacto no puede deshacerse.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
