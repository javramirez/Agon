'use client'

import { useState, useEffect } from 'react'
import { INSCRIPCIONES } from '@/lib/db/constants'
import { cn } from '@/lib/utils'
import type { Inscripcion } from '@/lib/db/schema'

interface Props {
  nivel: string
}

export function GaleriaInscripciones({ nivel }: Props) {
  const [desbloqueadas, setDesbloqueadas] = useState<Inscripcion[]>([])
  const [cargando, setCargando] = useState(true)
  const [seleccionada, setSeleccionada] = useState<
    (typeof INSCRIPCIONES)[number] | null
  >(null)

  useEffect(() => {
    fetch('/api/inscripciones')
      .then((r) => r.json())
      .then((d) => setDesbloqueadas(d.inscripciones ?? []))
      .finally(() => setCargando(false))
  }, [])

  const desbloqueadasIds = new Set(desbloqueadas.map((i) => i.inscripcionId))

  if (cargando) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-muted-foreground font-body animate-pulse">
          El Altis consulta las inscripciones...
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Contador */}
      <div
        className="flex items-center justify-between mb-4"
        data-nivel={nivel}
      >
        <p className="text-xs text-muted-foreground font-body">
          <span className="text-amber font-medium">
            {desbloqueadas.length}
          </span>{' '}
          de{' '}
          <span className="text-foreground font-medium">
            {INSCRIPCIONES.length}
          </span>{' '}
          inscripciones desbloqueadas
        </p>
        <p className="text-xs text-muted-foreground/50 font-body italic">
          Toca una desbloqueada para ver el detalle
        </p>
      </div>

      {/* Sección — Inscripciones regulares */}
      <div className="mb-6">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-3">
          Hazañas del Agon
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {INSCRIPCIONES.filter((i) => !i.secreto).map((inscripcion) => {
            const desbloqueada = desbloqueadasIds.has(inscripcion.id)

            return (
              <button
                key={inscripcion.id}
                type="button"
                onClick={() =>
                  desbloqueada ? setSeleccionada(inscripcion) : undefined
                }
                className={cn(
                  'rounded-xl border p-4 text-center space-y-2 transition-all',
                  desbloqueada
                    ? 'bg-surface-1 border-amber/20 hover:border-amber/50 cursor-pointer active:scale-95'
                    : 'bg-surface-1/40 border-border/30 cursor-default opacity-50'
                )}
              >
                <div
                  className={cn(
                    'text-3xl transition-all',
                    !desbloqueada && 'grayscale opacity-30'
                  )}
                >
                  {inscripcion.icono}
                </div>
                <div className="space-y-1">
                  <p
                    className={cn(
                      'text-xs font-display font-semibold leading-tight',
                      desbloqueada ? 'text-foreground' : 'text-muted-foreground/40'
                    )}
                  >
                    {inscripcion.nombre}
                  </p>
                  {desbloqueada ? (
                    <p className="text-xs text-amber font-body">
                      Ver detalle →
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/30 font-body">
                      Sin desbloquear
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sección — Inscripciones secretas */}
      <div>
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-1">
          Inscripciones ocultas
        </p>
        <p className="text-xs text-muted-foreground/50 font-body mb-3 italic">
          Se revelan al conseguirlas. Nadie sabe cuántas hay ni cómo obtenerlas.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {INSCRIPCIONES.filter((i) => i.secreto).map((inscripcion) => {
            const desbloqueada = desbloqueadasIds.has(inscripcion.id)

            return (
              <button
                key={inscripcion.id}
                type="button"
                onClick={() =>
                  desbloqueada ? setSeleccionada(inscripcion) : undefined
                }
                className={cn(
                  'rounded-xl border p-4 text-center space-y-2 transition-all',
                  desbloqueada
                    ? 'bg-surface-1 border-amber/20 hover:border-amber/50 cursor-pointer active:scale-95'
                    : 'bg-surface-1/30 border-border/20 cursor-default border-dashed'
                )}
              >
                <div
                  className={cn(
                    'text-3xl transition-all',
                    desbloqueada ? 'opacity-100' : 'opacity-15 grayscale'
                  )}
                >
                  {desbloqueada ? inscripcion.icono : '❓'}
                </div>
                <div className="space-y-1">
                  <p
                    className={cn(
                      'text-xs font-display font-semibold leading-tight',
                      desbloqueada ? 'text-foreground' : 'text-muted-foreground/30'
                    )}
                  >
                    {desbloqueada ? inscripcion.nombre : '???'}
                  </p>
                  {desbloqueada ? (
                    <p className="text-xs text-amber font-body">
                      Ver detalle →
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/25 font-body">
                      Inscripción oculta
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal de detalle */}
      {seleccionada && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inscripcion-modal-titulo"
          onClick={() => setSeleccionada(null)}
        >
          <div
            className={cn(
              'max-w-sm w-full bg-surface-1 rounded-2xl p-8 text-center space-y-5 animate-scale-in',
              seleccionada.secreto
                ? 'border border-amber/40'
                : 'border border-amber/20'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-7xl">{seleccionada.icono}</div>

            <div className="space-y-1">
              {seleccionada.secreto && (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-px bg-amber/30 flex-1" />
                  <p className="text-xs text-amber tracking-widest uppercase font-body">
                    Inscripción secreta
                  </p>
                  <div className="h-px bg-amber/30 flex-1" />
                </div>
              )}
              <h2
                id="inscripcion-modal-titulo"
                className="font-display text-xl font-bold text-foreground"
              >
                {seleccionada.nombre}
              </h2>
            </div>

            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              {seleccionada.descripcion}
            </p>

            <div className="border-t border-border pt-4 space-y-1">
              <p className="text-xs text-muted-foreground/50 font-body italic leading-relaxed">
                En la antigüedad, las hazañas del agon quedaban grabadas en
                piedra en el Altis de Olimpia.
              </p>
              <p className="text-xs text-amber/60 font-body italic">
                La tuya también quedó grabada.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSeleccionada(null)}
              className="w-full py-3 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-amber/90 transition-colors"
            >
              El Altis lo registra
            </button>
          </div>
        </div>
      )}
    </>
  )
}
