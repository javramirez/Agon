'use client'

import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ICONOS_PRUEBAS } from './iconos-pruebas'
import { LlamaIndicator } from './llama-indicator'
import { FotoUpload } from './foto-upload'
import type { Llama } from '@/lib/db/schema'

interface PruebaConfig {
  id: string
  nombre: string
  tipo: 'toggle' | 'contador' | 'contador_semanal'
  kleos: number
  unidad?: string
  meta?: number
}

interface Props {
  prueba: PruebaConfig
  valor: boolean | number
  llama?: Llama
  fotoUrl?: string | null
  onFotoSubida?: () => void
  onChange: (campo: string, valor: boolean | number) => void
  disabled?: boolean
  antagonistaCompletó?: boolean
}

const campoMap: Record<string, string> = {
  agua: 'soloAgua',
  comida: 'sinComidaRapida',
  pasos: 'pasos',
  sueno: 'horasSueno',
  lectura: 'paginasLeidas',
  gym: 'sesionesGym',
  cardio: 'sesionesCardio',
}

export function PruebaCard({
  prueba,
  valor,
  llama,
  fotoUrl,
  onFotoSubida,
  onChange,
  disabled = false,
  antagonistaCompletó = false,
}: Props) {
  const campo = campoMap[prueba.id]

  const completado =
    prueba.tipo === 'toggle'
      ? valor === true
      : typeof valor === 'number' && prueba.meta
        ? valor >= prueba.meta
        : false

  const handleToggle = useCallback(() => {
    if (prueba.tipo !== 'toggle' || disabled) return
    onChange(campo, !valor)
  }, [prueba.tipo, disabled, onChange, campo, valor])

  const handleContador = useCallback(
    (delta: number) => {
      if (prueba.tipo === 'toggle' || disabled) return
      const actual = typeof valor === 'number' ? valor : 0
      const nuevo = Math.max(0, actual + delta)
      onChange(campo, nuevo)
    },
    [prueba.tipo, disabled, onChange, campo, valor]
  )

  const handleInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (disabled) return
      const nuevo = Math.max(0, parseInt(e.target.value, 10) || 0)
      onChange(campo, nuevo)
    },
    [disabled, onChange, campo]
  )

  return (
    <motion.div
      layout
      className={cn(
        'rounded-xl border p-4 transition-colors duration-300',
        completado
          ? 'bg-surface-2 border-amber/20'
          : 'bg-surface-1 border-border',
        disabled && 'opacity-60'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Ícono con micro-animación al completar */}
          {(() => {
            const Icono = ICONOS_PRUEBAS[prueba.id]
            return Icono ? (
              <motion.div
                className="flex-shrink-0"
                animate={{
                  opacity: completado ? 1 : 0.35,
                  scale: completado ? [1, 1.15, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <Icono
                  size={22}
                  className={completado ? 'text-amber' : 'text-muted-foreground'}
                />
              </motion.div>
            ) : null
          })()}

          {/* Marca del antagonista */}
          <AnimatePresence>
            {antagonistaCompletó && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 relative group"
                title="Tu antagonista ya superó esta prueba"
              >
                <Shield
                  size={13}
                  className="text-amber/50"
                />
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 hidden group-hover:flex px-2 py-1 bg-surface-2 border border-border rounded-lg whitespace-nowrap z-10">
                  <span className="text-xs text-muted-foreground font-body">
                    Tu antagonista ya superó esta prueba
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={cn(
                  'text-sm font-body font-medium transition-colors duration-200',
                  completado ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {prueba.nombre}
              </p>
              {llama && llama.rachaActual > 0 && (
                <LlamaIndicator
                  racha={llama.rachaActual}
                  habitoNombre={prueba.nombre}
                  size="sm"
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              {prueba.meta
                ? `Meta: ${prueba.meta.toLocaleString()} ${prueba.unidad}`
                : prueba.unidad}
              {' · '}
              <span className="text-amber-dim">{prueba.kleos} kleos</span>
            </p>
          </div>
        </div>

        {prueba.tipo === 'toggle' ? (
          <motion.button
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            whileTap={{ scale: 0.88 }}
            className={cn(
              'w-12 h-12 rounded-full border-2 flex items-center justify-center',
              'transition-colors duration-200 flex-shrink-0',
              completado
                ? 'bg-amber border-amber text-black'
                : 'bg-transparent border-border-strong text-muted-foreground hover:border-amber/40'
            )}
          >
            <AnimatePresence mode="wait">
              {completado ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="text-base font-bold"
                >
                  ✓
                </motion.span>
              ) : (
                <motion.span
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
          </motion.button>
        ) : prueba.tipo === 'contador' ? (
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={0}
            defaultValue={typeof valor === 'number' ? valor : 0}
            key={typeof valor === 'number' ? valor : 0}
            onBlur={handleInputBlur}
            disabled={disabled}
            className={cn(
              'w-24 text-center bg-surface-2 border border-border rounded-xl',
              'px-2 py-2 text-sm font-body font-semibold',
              'focus:outline-none focus:border-amber/50 transition-colors',
              'disabled:opacity-50',
              completado ? 'text-amber border-amber/20' : 'text-foreground'
            )}
          />
        ) : (
          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.button
              type="button"
              onClick={() => handleContador(-1)}
              disabled={disabled || valor === 0}
              whileTap={{ scale: 0.88 }}
              className={cn(
                'w-10 h-10 rounded-full bg-surface-2 border border-border',
                'text-muted-foreground flex items-center justify-center text-lg',
                'transition-all disabled:opacity-30',
                'hover:border-border-strong hover:text-foreground'
              )}
            >
              −
            </motion.button>
            <motion.span
              key={typeof valor === 'number' ? valor : 0}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={cn(
                'w-8 text-center font-body font-semibold text-sm tabular-nums',
                completado ? 'text-amber' : 'text-foreground'
              )}
            >
              {typeof valor === 'number' ? valor : 0}
            </motion.span>
            <motion.button
              type="button"
              onClick={() => handleContador(1)}
              disabled={disabled}
              whileTap={{ scale: 0.88 }}
              className={cn(
                'w-10 h-10 rounded-full bg-surface-2 border border-border',
                'text-muted-foreground flex items-center justify-center text-lg',
                'transition-all disabled:opacity-30',
                'hover:border-border-strong hover:text-foreground'
              )}
            >
              +
            </motion.button>
          </div>
        )}
      </div>

      {prueba.tipo !== 'toggle' && prueba.meta && typeof valor === 'number' && (
        <div className="mt-3 h-0.5 bg-surface-2 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full',
              completado ? 'bg-amber' : 'bg-border-strong'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((valor / prueba.meta) * 100, 100)}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      )}

      {(prueba.id === 'gym' || prueba.id === 'cardio') && (
        <FotoUpload
          tipo={prueba.id as 'gym' | 'cardio'}
          urlActual={fotoUrl}
          onSubida={() => { onFotoSubida?.() }}
        />
      )}
    </motion.div>
  )
}
