'use client'

import { useState, useEffect, useCallback } from 'react'
import { AgonCard } from '@/components/agon/agon-card'
import { BalanzaDelAltis } from '@/components/agon/balanza-del-altis'
import { HegemoniaCard } from '@/components/agon/hegemonia-card'
import { StatsComparativa } from '@/components/agon/stats-comparativa'
import { HeatmapActividad } from '@/components/agon/heatmap-actividad'
import { ComparativaHabitos } from '@/components/agon/comparativa-habitos'
import { EvolucionKleosChart } from '@/components/agon/evolucion-kleos-chart'
import { MejoresDias } from '@/components/agon/mejores-dias'
import { SectionHeader } from '@/components/agon/section-header'
import { LoadingAltis } from '@/components/agon/loading-altis'
import { ErrorAltis } from '@/components/agon/error-altis'
import { cn } from '@/lib/utils'
import type { Agonista, Hegemonia } from '@/lib/db/schema'

type TabAltis = 'batalla' | 'habitos' | 'evolucion' | 'dias'

interface StatsComparativaRow {
  diasPerfectos: number
  mejorRacha: number
  rachaActual: number
  inscripciones: number
}

interface AltisData {
  agonista: Agonista
  antagonista: Agonista | null
  statsPropio: StatsComparativaRow
  statsAntagonista: StatsComparativaRow | null
  hegemonias: Hegemonia[]
  stats: {
    heatmap: { fecha: string; [k: string]: number | string }[]
    comparativaHabitos: {
      habito: string
      raw1: number
      raw2: number
      [k: string]: number | string
    }[]
    evolucionKleos: { fecha: string; [k: string]: number | string }[]
    mejoresDias: { fecha: string; agonista: string; kleos: number }[]
    rachaMaxima: { propio: number; antagonista: number }
  }
}

export default function AltisPage() {
  const [datos, setDatos] = useState<AltisData | null>(null)
  const [tab, setTab] = useState<TabAltis>('batalla')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const [statsRes, pulsoRes, hegRes] = await Promise.all([
        fetch('/api/altis/stats'),
        fetch('/api/pulso'),
        fetch('/api/hegemonia'),
      ])

      if (!statsRes.ok || !pulsoRes.ok || !hegRes.ok) {
        setError('No se pudieron cargar los datos del Altis.')
        setDatos(null)
        return
      }

      const rawStats = (await statsRes.json()) as {
        heatmap: AltisData['stats']['heatmap']
        comparativaHabitos: AltisData['stats']['comparativaHabitos']
        evolucionKleos: AltisData['stats']['evolucionKleos']
        mejoresDias: AltisData['stats']['mejoresDias']
        rachaMaxima: AltisData['stats']['rachaMaxima']
        statsPropio: StatsComparativaRow
        statsAntagonista: StatsComparativaRow | null
      }
      const pulso = (await pulsoRes.json()) as {
        agonista: Agonista & { pruebas?: unknown }
        antagonista: (Agonista & { pruebas?: unknown }) | null
      }
      const heg = (await hegRes.json()) as { hegemonias: Hegemonia[] }

      const stripPruebas = (a: Agonista & { pruebas?: unknown }): Agonista => {
        const copy = { ...a }
        delete (copy as { pruebas?: unknown }).pruebas
        return copy as Agonista
      }

      setDatos({
        agonista: stripPruebas(pulso.agonista),
        antagonista: pulso.antagonista
          ? stripPruebas(pulso.antagonista)
          : null,
        statsPropio: rawStats.statsPropio,
        statsAntagonista: rawStats.statsAntagonista,
        hegemonias: heg.hegemonias ?? [],
        stats: {
          heatmap: rawStats.heatmap,
          comparativaHabitos: rawStats.comparativaHabitos,
          evolucionKleos: rawStats.evolucionKleos,
          mejoresDias: rawStats.mejoresDias,
          rachaMaxima: rawStats.rachaMaxima,
        },
      })
    } catch {
      setError('El Altis perdió la señal.')
      setDatos(null)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargar()
  }, [cargar])

  if (cargando) {
    return (
      <LoadingAltis size="lg" frase="La Balanza del Altis se ajusta..." />
    )
  }

  if (error || !datos) {
    return (
      <ErrorAltis
        tipo="network"
        mensaje={error ?? undefined}
        onReintentar={() => void cargar()}
      />
    )
  }

  const nombre1 = datos.agonista?.nombre ?? 'Agonista'
  const nombre2 = datos.antagonista?.nombre ?? 'Antagonista'

  const TABS: { id: TabAltis; label: string }[] = [
    { id: 'batalla', label: 'Batalla' },
    { id: 'habitos', label: 'Hábitos' },
    { id: 'evolucion', label: 'Kleos' },
    { id: 'dias', label: 'Días' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pt-2">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-1">
          El Altis
        </p>
        <h1 className="font-display text-2xl font-bold tracking-wide">
          El registro del Gran Agon.
        </h1>
      </div>

      <AgonCard variant="highlighted">
        <BalanzaDelAltis agonista={datos.agonista} antagonista={datos.antagonista} />
      </AgonCard>

      <div className="flex gap-0 border-b border-border overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 min-w-[4.5rem] pb-3 text-sm font-body transition-all border-b-2 -mb-px whitespace-nowrap px-1',
              tab === t.id
                ? 'text-foreground border-amber font-medium'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'batalla' && (
        <div className="space-y-4 animate-fade-in">
          <AgonCard>
            <HegemoniaCard
              hegemonias={datos.hegemonias}
              agonista={datos.agonista}
              antagonista={datos.antagonista}
            />
          </AgonCard>
          <AgonCard>
            <SectionHeader
              titulo="Comparativa general"
              subtitulo="El valor mayor en cada stat aparece en ámbar"
            />
            <StatsComparativa
              agonista={datos.agonista}
              antagonista={datos.antagonista}
              statsPropio={datos.statsPropio}
              statsAntagonista={datos.statsAntagonista}
            />
          </AgonCard>
        </div>
      )}

      {tab === 'habitos' && (
        <div className="space-y-4 animate-fade-in">
          <AgonCard>
            <SectionHeader
              titulo="Actividad diaria"
              subtitulo="Cada cuadro es un día — más oscuro, más pruebas"
            />
            <HeatmapActividad
              datos={datos.stats.heatmap}
              nombre1={nombre1}
              nombre2={nombre2}
            />
          </AgonCard>
          <AgonCard>
            <SectionHeader
              titulo="Adherencia por hábito"
              subtitulo="% de días que se completó cada prueba"
            />
            <ComparativaHabitos
              datos={datos.stats.comparativaHabitos}
              nombre1={nombre1}
              nombre2={nombre2}
            />
          </AgonCard>
        </div>
      )}

      {tab === 'evolucion' && (
        <div className="space-y-4 animate-fade-in">
          <AgonCard>
            <SectionHeader
              titulo="Evolución del kleos"
              subtitulo="Kleos acumulado a lo largo del Gran Agon"
            />
            <EvolucionKleosChart
              datos={datos.stats.evolucionKleos}
              nombre1={nombre1}
              nombre2={nombre2}
            />
          </AgonCard>
          <div className="grid grid-cols-2 gap-3">
            <AgonCard>
              <p className="text-xs text-muted-foreground font-body">
                Mejor racha {nombre1}
              </p>
              <p className="font-display text-3xl font-bold text-amber mt-1">
                {datos.stats.rachaMaxima.propio}
                <span className="text-sm font-body text-muted-foreground ml-1">
                  días
                </span>
              </p>
            </AgonCard>
            <AgonCard>
              <p className="text-xs text-muted-foreground font-body">
                Mejor racha {nombre2}
              </p>
              <p className="font-display text-3xl font-bold text-foreground mt-1">
                {datos.stats.rachaMaxima.antagonista}
                <span className="text-sm font-body text-muted-foreground ml-1">
                  días
                </span>
              </p>
            </AgonCard>
          </div>
        </div>
      )}

      {tab === 'dias' && (
        <div className="space-y-4 animate-fade-in">
          <AgonCard>
            <SectionHeader
              titulo="Top días perfectos"
              subtitulo="Los 10 mejores días del Gran Agon por kleos"
            />
            <MejoresDias
              dias={datos.stats.mejoresDias}
              nombrePropio={nombre1}
            />
          </AgonCard>
        </div>
      )}
    </div>
  )
}
