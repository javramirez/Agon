'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface Props {
  agonistId: string
  motivo: string | null
  fechaInicio: string
  diasRestantes: number
  yaConfirmo: boolean
  confirmaciones: number
}

export function EkecheiriaActivaClient({
  motivo,
  fechaInicio,
  diasRestantes,
  yaConfirmo,
  confirmaciones,
}: Props) {
  const [confirmando, setConfirmando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function confirmarLevantamiento() {
    setEnviando(true)
    setError('')

    const res = await fetch('/api/ekecheiria/levantar', { method: 'POST' })
    const data = (await res.json()) as {
      ok?: boolean
      levantada?: boolean
      error?: string
    }

    if (res.ok) {
      if (data.levantada) {
        router.push('/dashboard')
      } else {
        router.refresh()
      }
    } else {
      setError(data.error ?? 'Error al confirmar')
    }

    setEnviando(false)
    setConfirmando(false)
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#080808] px-6">
      <motion.div
        className="w-full max-w-sm space-y-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="space-y-4 text-center">
          <motion.div
            className="text-6xl"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            ⚖️
          </motion.div>
          <div className="space-y-2">
            <p className="font-body text-xs uppercase tracking-widest text-amber">
              La Tregua Sagrada
            </p>
            <h1 className="font-display text-2xl font-bold tracking-wide text-foreground">
              La Ekecheiria está activa.
            </h1>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-amber/20 bg-surface-1 p-5">
          <div className="space-y-1">
            <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
              Declarada el
            </p>
            <p className="font-body text-sm text-foreground">
              {new Date(`${fechaInicio}T00:00:00`).toLocaleDateString('es-CL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>

          {motivo && (
            <div className="space-y-1">
              <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                Motivo
              </p>
              <p className="font-body text-sm italic leading-relaxed text-foreground/80">
                &ldquo;{motivo}&rdquo;
              </p>
            </div>
          )}

          <div className="space-y-1">
            <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
              Tiempo restante
            </p>
            <p className="font-body text-sm text-foreground">
              {diasRestantes === 0
                ? 'La tregua expira hoy'
                : `${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} restante${diasRestantes !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-center font-body text-xs text-muted-foreground">
            Para reanudar el agon, ambos deben confirmar el levantamiento.
          </p>
          <div className="flex justify-center gap-3">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-full border transition-colors ${
                  i < confirmaciones
                    ? 'border-amber bg-amber'
                    : 'border-border bg-transparent'
                }`}
              />
            ))}
          </div>
          <p className="text-center font-body text-xs text-muted-foreground/60">
            {confirmaciones === 0 && 'Ninguno ha confirmado aún'}
            {confirmaciones === 1 && 'Un agonista confirmó — falta el otro'}
            {confirmaciones === 2 && 'Ambos confirmaron'}
          </p>
        </div>

        {error && (
          <p className="text-center font-body text-xs text-red-400">{error}</p>
        )}

        {yaConfirmo ? (
          <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
            <p className="font-body text-xs text-muted-foreground">
              Ya confirmaste el levantamiento. Esperando al otro agonista.
            </p>
          </div>
        ) : confirmando ? (
          <div className="space-y-3">
            <p className="text-center font-body text-xs text-amber">
              ¿Confirmas levantar La Ekecheiria y reanudar el agon?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className="flex-1 rounded-xl border border-border py-3 font-body text-xs text-muted-foreground transition-all hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmarLevantamiento()}
                disabled={enviando}
                className="flex-1 rounded-xl bg-amber py-3 font-body text-xs font-semibold text-black transition-all hover:bg-amber/90 disabled:opacity-50"
              >
                {enviando ? 'Confirmando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="w-full rounded-xl border border-amber/30 py-3 font-body text-sm text-amber transition-all hover:bg-amber/10"
          >
            Levantar La Ekecheiria
          </button>
        )}
      </motion.div>
    </div>
  )
}
