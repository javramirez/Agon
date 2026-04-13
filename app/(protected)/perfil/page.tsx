'use client'

import { useState, useEffect, useRef } from 'react'
import { AgonCard } from '@/components/agon/agon-card'
import { SectionHeader } from '@/components/agon/section-header'
import { KleosChart } from '@/components/agon/kleos-chart'
import { LlamasPanel } from '@/components/agon/llamas-panel'
import { NivelDetalle } from '@/components/agon/nivel-detalle'
import { LoadingPerfil } from '@/components/agon/loadings/loading-perfil'
import { KleosBadge } from '@/components/agon/kleos-badge'
import { ErrorAltis } from '@/components/agon/error-altis'
import { cn } from '@/lib/utils'
import { sleep } from '@/lib/utils/sleep'
import type { Agonista, Llama } from '@/lib/db/schema'

interface PerfilData {
  agonista: Agonista
  stats: {
    diasPerfectos: number
    totalDias: number
    mejorRacha: number
    inscripciones: number
    hegemonias: number
    habitoMasCumplido: string
    habitoMasFallado: string
  }
  llamas: Llama[]
  kleosPorSemana: { semana: string; kleos: number }[]
  siguienteNivel: string | null
  kleosParaSiguienteNivel: number
}

type Tab = 'nivel' | 'stats' | 'llamas'

export default function PerfilPage() {
  const [datos, setDatos] = useState<PerfilData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('nivel')
  const pageEnterAt = useRef(Date.now())

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch('/api/perfil')
        const d = await r.json()
        if (!r.ok) {
          setError(typeof d.error === 'string' ? d.error : 'Error al cargar')
          return
        }
        const elapsed = Date.now() - pageEnterAt.current
        await sleep(Math.max(0, 4000 - elapsed))
        setDatos(d as PerfilData)
      } catch {
        setError('El Altis no pudo cargar tu perfil.')
      }
    })()
  }, [])

  if (error) {
    return (
      <div className="pt-4">
        <ErrorAltis mensaje={error} />
      </div>
    )
  }

  if (!datos) {
    return <LoadingPerfil />
  }

  const {
    agonista,
    stats,
    llamas,
    kleosPorSemana,
    siguienteNivel,
    kleosParaSiguienteNivel,
  } = datos

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pt-2">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-1">
          El Agonista
        </p>
        <h1 className="font-display text-2xl font-bold tracking-wide">
          {agonista.nombre}.
        </h1>
        <div className="mt-1">
          <KleosBadge cantidad={agonista.kleosTotal} size="md" />
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        {(
          [
            { id: 'nivel' as const, label: 'Nivel' },
            { id: 'stats' as const, label: 'Stats' },
            { id: 'llamas' as const, label: 'Llamas' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'pb-3 px-1 text-sm font-body transition-all border-b-2 -mb-px',
              tab === t.id
                ? 'text-foreground border-amber font-medium'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'nivel' && (
        <div className="animate-fade-in">
          <NivelDetalle
            nivel={agonista.nivel}
            kleosTotal={agonista.kleosTotal}
            siguienteNivel={siguienteNivel}
            kleosParaSiguiente={kleosParaSiguienteNivel}
          />
        </div>
      )}

      {tab === 'stats' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Días perfectos', valor: stats.diasPerfectos, icono: '🏛️' },
              { label: 'Mejor racha', valor: stats.mejorRacha, icono: '🔥' },
              { label: 'Hegemonías', valor: stats.hegemonias, icono: '👑' },
              { label: 'Inscripciones', valor: stats.inscripciones, icono: '📜' },
            ].map((m) => (
              <AgonCard key={m.label}>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-body">{m.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base">{m.icono}</span>
                    <span className="font-display text-2xl font-bold text-foreground">
                      {m.valor}
                    </span>
                  </div>
                </div>
              </AgonCard>
            ))}
          </div>

          <AgonCard>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-body">Más cumplido</p>
                <p className="text-sm font-body font-medium text-amber">
                  {stats.habitoMasCumplido}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-body">Más fallado</p>
                <p className="text-sm font-body font-medium text-foreground">
                  {stats.habitoMasFallado}
                </p>
              </div>
            </div>
          </AgonCard>

          <AgonCard>
            <div className="space-y-2">
              <div className="flex justify-between items-center gap-2">
                <p className="text-xs text-muted-foreground font-body">
                  Adherencia general
                </p>
                <p className="text-sm font-body font-semibold text-amber shrink-0">
                  {stats.totalDias > 0
                    ? Math.round((stats.diasPerfectos / stats.totalDias) * 100)
                    : 0}
                  %
                </p>
              </div>
              <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber rounded-full transition-all duration-700"
                  style={{
                    width: `${
                      stats.totalDias > 0
                        ? (stats.diasPerfectos / stats.totalDias) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground font-body">
                {stats.diasPerfectos} días perfectos de {stats.totalDias}{' '}
                registrados
              </p>
            </div>
          </AgonCard>

          {kleosPorSemana.length > 0 && (
            <AgonCard>
              <SectionHeader
                titulo="Kleos por semana"
                subtitulo="Evolución del kleos a lo largo del Gran Agon"
              />
              <KleosChart datos={kleosPorSemana} />
            </AgonCard>
          )}
        </div>
      )}

      {tab === 'llamas' && (
        <div className="space-y-4 animate-fade-in">
          <AgonCard>
            <SectionHeader
              titulo="La Llama del Agon"
              subtitulo="Rachas activas por hábito"
            />
            <LlamasPanel llamas={llamas} />
          </AgonCard>

          <div className="px-1">
            <p className="text-xs text-muted-foreground font-body leading-relaxed italic">
              &ldquo;La llama del agon no se apaga sola — solo el agonista que
              deja de alimentarla la pierde.&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
