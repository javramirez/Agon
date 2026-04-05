'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
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
  icono: string
}

interface Props {
  prueba: PruebaConfig
  valor: boolean | number
  llama?: Llama
  fotoUrl?: string | null
  onFotoSubida?: () => void
  onChange: (campo: string, valor: boolean | number) => Promise<void>
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
}: Props) {
  const [cargando, setCargando] = useState(false)
  const [valorLocal, setValorLocal] = useState(valor)
  const campo = campoMap[prueba.id]

  useEffect(() => {
    setValorLocal(valor)
  }, [valor])

  const completado =
    prueba.tipo === 'toggle'
      ? valorLocal === true
      : typeof valorLocal === 'number' && prueba.meta
        ? valorLocal >= prueba.meta
        : false

  async function handleToggle() {
    if (prueba.tipo !== 'toggle' || cargando) return
    setCargando(true)
    const nuevo = !valorLocal
    setValorLocal(nuevo)
    await onChange(campo, nuevo)
    setCargando(false)
  }

  async function handleContador(delta: number) {
    if (prueba.tipo === 'toggle' || cargando) return
    setCargando(true)
    const actual = typeof valorLocal === 'number' ? valorLocal : 0
    const nuevo = Math.max(0, actual + delta)
    setValorLocal(nuevo)
    await onChange(campo, nuevo)
    setCargando(false)
  }

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all duration-300',
        completado
          ? 'bg-surface-2 border-amber/20'
          : 'bg-surface-1 border-border'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span
            className={cn(
              'text-2xl flex-shrink-0 transition-all duration-300',
              completado ? 'opacity-100' : 'opacity-40'
            )}
          >
            {prueba.icono}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={cn(
                  'text-sm font-body font-medium',
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
          <button
            type="button"
            onClick={() => void handleToggle()}
            disabled={cargando}
            className={cn(
              'w-12 h-12 rounded-full border-2 flex items-center justify-center',
              'transition-all duration-300 flex-shrink-0 active:scale-95',
              completado
                ? 'bg-amber border-amber text-black'
                : 'bg-transparent border-border-strong text-muted-foreground'
            )}
          >
            {completado && <span className="text-base font-bold">✓</span>}
          </button>
        ) : prueba.tipo === 'contador' ? (
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={0}
            value={typeof valorLocal === 'number' ? valorLocal : 0}
            onChange={(e) => {
              const nuevo = Math.max(0, parseInt(e.target.value, 10) || 0)
              setValorLocal(nuevo)
            }}
            onBlur={async (e) => {
              const nuevo = Math.max(0, parseInt(e.target.value, 10) || 0)
              setCargando(true)
              await onChange(campo, nuevo)
              setCargando(false)
            }}
            disabled={cargando}
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
            <button
              type="button"
              onClick={() => void handleContador(-1)}
              disabled={cargando || valorLocal === 0}
              className={cn(
                'w-10 h-10 rounded-full bg-surface-2 border border-border',
                'text-muted-foreground flex items-center justify-center text-lg',
                'transition-all active:scale-95 disabled:opacity-30'
              )}
            >
              −
            </button>
            <span
              className={cn(
                'w-8 text-center font-body font-semibold text-sm tabular-nums',
                completado ? 'text-amber' : 'text-foreground'
              )}
            >
              {typeof valorLocal === 'number' ? valorLocal : 0}
            </span>
            <button
              type="button"
              onClick={() => void handleContador(1)}
              disabled={cargando}
              className={cn(
                'w-10 h-10 rounded-full bg-surface-2 border border-border',
                'text-muted-foreground flex items-center justify-center text-lg',
                'transition-all active:scale-95 disabled:opacity-30'
              )}
            >
              +
            </button>
          </div>
        )}
      </div>

      {prueba.tipo !== 'toggle' && prueba.meta && typeof valorLocal === 'number' && (
        <div className="mt-3 h-0.5 bg-surface-3 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              completado ? 'bg-amber' : 'bg-border-strong'
            )}
            style={{
              width: `${Math.min((valorLocal / prueba.meta) * 100, 100)}%`,
            }}
          />
        </div>
      )}

      {(prueba.id === 'gym' || prueba.id === 'cardio') && (
        <FotoUpload
          tipo={prueba.id}
          urlActual={fotoUrl}
          onSubida={() => onFotoSubida?.()}
        />
      )}
    </div>
  )
}
