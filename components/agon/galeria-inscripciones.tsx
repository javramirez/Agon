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

  const nivelIndex = [
    'aspirante',
    'atleta',
    'agonista',
    'luchador',
    'campeon',
    'heroe',
    'semidios',
    'olimpico',
    'leyenda_del_agon',
    'inmortal',
  ].indexOf(nivel)

  const secretasVisibles = nivelIndex >= 7

  useEffect(() => {
    fetch('/api/inscripciones')
      .then((r) => r.json())
      .then((d: { inscripciones?: Inscripcion[] }) =>
        setDesbloqueadas(d.inscripciones ?? [])
      )
      .finally(() => setCargando(false))
  }, [])

  const desbloqueadasIds = new Set(desbloqueadas.map((i) => i.inscripcionId))

  const visibles = INSCRIPCIONES.filter(
    (i) => !i.secreto || secretasVisibles || desbloqueadasIds.has(i.id)
  )

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
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {visibles.map((inscripcion) => {
        const desbloqueada = desbloqueadasIds.has(inscripcion.id)
        const esSecreta = inscripcion.secreto && !desbloqueada

        return (
          <div
            key={inscripcion.id}
            className={cn(
              'rounded-lg border p-4 text-center space-y-2 transition-all',
              desbloqueada
                ? 'bg-surface-1 border-amber/20'
                : 'bg-surface-1/50 border-border/50 opacity-50'
            )}
          >
            <div
              className={cn(
                'text-3xl',
                !desbloqueada && 'grayscale opacity-30'
              )}
            >
              {esSecreta ? '❓' : inscripcion.icono}
            </div>
            <div>
              <p
                className={cn(
                  'text-xs font-display font-semibold',
                  desbloqueada ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {esSecreta ? '???' : inscripcion.nombre}
              </p>
              {desbloqueada && (
                <p className="text-xs text-muted-foreground font-body mt-1 leading-tight">
                  {inscripcion.descripcion}
                </p>
              )}
              {esSecreta && (
                <p className="text-xs text-muted-foreground/50 font-body mt-1">
                  Inscripción secreta
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
