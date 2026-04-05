'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { KleosBadge } from './kleos-badge'

interface DatosAgonista {
  nombre: string
  nivel: string
  kleosTotal: number
  diasPerfectos: number
  totalDias: number
  inscripciones: number
  hegemonias: number
  cumplioContrato: boolean
  oraculo: string | null
}

interface Veredicto {
  agonista1: DatosAgonista
  agonista2: DatosAgonista
  ganador: string | null
  empate: boolean
  totalHegemonias: number
}

type Fase = 'cargando' | 'intro' | 'stats' | 'oraculo' | 'veredicto'

export function VeredictoCeremonia() {
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null)
  const [fase, setFase] = useState<Fase>('cargando')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/veredicto')
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) {
          setError(typeof d.error === 'string' ? d.error : 'Error al cargar')
          setFase('intro')
          return
        }
        setVeredicto(d as Veredicto)
        setFase('intro')
      })
      .catch(() => {
        setError('No se pudo cargar el veredicto.')
        setFase('intro')
      })
  }, [])

  if (fase === 'cargando') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-muted-foreground font-body animate-pulse">
          El Altis prepara el veredicto...
        </p>
      </div>
    )
  }

  if (error && !veredicto) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-sm text-danger font-body text-center px-4">{error}</p>
      </div>
    )
  }

  if (!veredicto) return null

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="pt-2 text-center space-y-3">
        <p className="text-xs text-amber tracking-widest uppercase font-body">
          4 de mayo de 2026
        </p>
        <h1 className="font-display text-3xl font-bold tracking-wide">
          El Gran Agon ha concluido.
        </h1>
        <p className="text-sm text-muted-foreground font-body">
          29 días. Dos agonistas. El Altis emite su veredicto.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px bg-border flex-1" />
        <span className="text-amber text-sm">⚖️</span>
        <div className="h-px bg-border flex-1" />
      </div>

      {(fase === 'stats' || fase === 'oraculo' || fase === 'veredicto') && (
        <div className="grid grid-cols-2 gap-4 animate-fade-in">
          {[veredicto.agonista1, veredicto.agonista2].map((a) => (
            <div
              key={a.nombre}
              className={cn(
                'bg-surface-1 rounded-xl border p-4 space-y-3',
                veredicto.ganador === a.nombre
                  ? 'border-amber/40'
                  : 'border-border'
              )}
            >
              <div>
                <p className="font-display text-base font-bold text-foreground">
                  {a.nombre}
                </p>
                <p className="text-xs text-muted-foreground font-body">{a.nivel}</p>
              </div>

              <KleosBadge cantidad={a.kleosTotal} size="lg" />

              <div className="space-y-1.5 text-xs font-body">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Días perfectos</span>
                  <span className="text-foreground font-medium">{a.diasPerfectos}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Hegemonías</span>
                  <span className="text-foreground font-medium">{a.hegemonias}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Inscripciones</span>
                  <span className="text-foreground font-medium">{a.inscripciones}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Contrato</span>
                  <span
                    className={
                      a.cumplioContrato
                        ? 'text-amber font-medium'
                        : 'text-danger font-medium'
                    }
                  >
                    {a.cumplioContrato ? 'Cumplido' : 'Incumplido'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(fase === 'oraculo' || fase === 'veredicto') && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="h-px bg-border flex-1" />
            <p className="text-xs text-amber tracking-widest uppercase font-body">
              El Oráculo habla
            </p>
            <div className="h-px bg-border flex-1" />
          </div>

          {[veredicto.agonista1, veredicto.agonista2].map((a) => (
            <div
              key={a.nombre}
              className="bg-surface-1 rounded-xl border border-amber/20 p-5 space-y-3"
            >
              <p className="text-xs text-muted-foreground font-body tracking-wide uppercase">
                {a.nombre} escribió el día 1:
              </p>
              <p className="text-sm font-body text-foreground leading-relaxed italic">
                &ldquo;{a.oraculo ?? 'El Oráculo permanece en silencio.'}&rdquo;
              </p>
            </div>
          ))}
        </div>
      )}

      {fase === 'veredicto' && (
        <div className="animate-fade-in space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px bg-border flex-1" />
            <p className="text-xs text-amber tracking-widest uppercase font-body">
              El Veredicto del Altis
            </p>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="bg-surface-1 rounded-xl border border-amber/40 p-6 text-center space-y-4">
            {veredicto.empate ? (
              <>
                <p className="font-display text-2xl font-bold text-foreground">
                  El Altis no puede decidir.
                </p>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  Ambos agonistas terminaron igualados en kleos. El Gran Agon los
                  forjó por igual.
                </p>
              </>
            ) : (
              <>
                <span className="text-5xl">🏛️</span>
                <div className="space-y-1">
                  <p className="text-xs text-amber tracking-widest uppercase font-body">
                    El Altis inscribe en piedra
                  </p>
                  <p className="font-display text-2xl font-bold text-amber">
                    {veredicto.ganador}
                  </p>
                  <p className="text-sm text-muted-foreground font-body">
                    conquistó el Gran Agon.
                  </p>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground/60 font-body italic">
                &ldquo;La excelencia no se declara. Se inscribe.&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {fase === 'intro' && (
        <button
          type="button"
          onClick={() => setFase('stats')}
          className="w-full py-4 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-amber/90 transition-colors"
        >
          Ver los resultados del Gran Agon
        </button>
      )}

      {fase === 'stats' && (
        <button
          type="button"
          onClick={() => setFase('oraculo')}
          className="w-full py-4 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-amber/90 transition-colors"
        >
          Revelar El Oráculo
        </button>
      )}

      {fase === 'oraculo' && (
        <button
          type="button"
          onClick={() => setFase('veredicto')}
          className="w-full py-4 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-amber/90 transition-colors"
        >
          El Altis emite su veredicto
        </button>
      )}
    </div>
  )
}
