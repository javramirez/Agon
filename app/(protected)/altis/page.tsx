'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Droplets,
  ShieldCheck,
  Footprints,
  Moon,
  BookOpen,
  Dumbbell,
  Activity,
  Flame,
  Star,
  ScrollText,
} from 'lucide-react'
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
import { sleep } from '@/lib/utils/sleep'
import { useEventosDestino } from '@/hooks/use-eventos-destino'
import { EventoDestinoOverlay } from '@/components/agon/evento-destino-overlay'
import type { Agonista, Hegemonia } from '@/lib/db/schema'
import {
  NIVEL_LABELS,
  NIVEL_ICONOS,
  NIVEL_THRESHOLDS,
} from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'

type TabAltisDuelo = 'batalla' | 'habitos' | 'evolucion' | 'dias'

interface StatsRow {
  diasPerfectos: number
  mejorRacha: number
  rachaActual: number
  inscripciones: number
}

interface BenchmarkData {
  lineaBase: { gym: number; cardio: number; paginas: number }
  promedioActual: {
    gym: number
    cardio: number
    paginas: number
    pasos: number
    sueno: number
    agua: number
    comida: number
  }
  heatmap: { fecha: string; valor: number }[]
  diasRegistrados: number
}

interface AltisDueloData {
  modo: 'duelo'
  agonista: Agonista
  antagonista: Agonista | null
  statsPropio: StatsRow
  statsAntagonista: StatsRow | null
  hegemonias: Hegemonia[]
  stats: {
    heatmap: { fecha: string; [k: string]: number | string }[]
    comparativaHabitos: { habito: string; raw1: number; raw2: number; [k: string]: number | string }[]
    evolucionKleos: { fecha: string; [k: string]: number | string }[]
    mejoresDias: { fecha: string; agonista: string; kleos: number }[]
    rachaMaxima: { propio: number; antagonista: number }
  }
}

interface AltisSoloData {
  modo: 'solo'
  agonista: Agonista
  statsPropio: StatsRow
  benchmarks: BenchmarkData
  stats: {
    evolucionKleos: { fecha: string; [k: string]: number | string }[]
    mejoresDias: { fecha: string; agonista: string; kleos: number }[]
    rachaMaxima: { propio: number }
  }
}

type AltisData = AltisDueloData | AltisSoloData

type PulsoJson =
  | { esSolo: true; datos?: null; agonista?: Agonista & { pruebas?: unknown } }
  | {
      agonista: Agonista & { pruebas?: unknown }
      antagonista: (Agonista & { pruebas?: unknown }) | null
    }

export default function AltisPage() {
  const [datos, setDatos] = useState<AltisData | null>(null)
  const [tabDuelo, setTabDuelo] = useState<TabAltisDuelo>('batalla')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    destinoLatente,
    eventoActivado,
    pruebaDestinoId,
    verificar,
    activarDestino,
    cerrarOverlay,
  } = useEventosDestino()

  useEffect(() => {
    void verificar()
  }, [verificar])

  useEffect(() => {
    if (!datos || !destinoLatente || eventoActivado) return
    if (datos.modo === 'duelo' && tabDuelo !== 'batalla') return
    const timer = setTimeout(() => {
      void activarDestino()
    }, 5000)
    return () => clearTimeout(timer)
  }, [datos, destinoLatente, eventoActivado, activarDestino, tabDuelo])

  const cargar = useCallback(async () => {
    const __pageLoadT0 = Date.now()
    setCargando(true)
    setError(null)
    try {
      const pulsoRes = await fetch('/api/pulso')
      if (!pulsoRes.ok) throw new Error('Sin datos')

      const pulsoJson = (await pulsoRes.json()) as PulsoJson
      const esSolo = 'esSolo' in pulsoJson && pulsoJson.esSolo === true

      let agonistaFuente: Agonista & { pruebas?: unknown }
      let antagonistaFuente: (Agonista & { pruebas?: unknown }) | null = null

      if (esSolo) {
        if ('agonista' in pulsoJson && pulsoJson.agonista) {
          agonistaFuente = pulsoJson.agonista
        } else {
          const perfilRes = await fetch('/api/perfil')
          if (!perfilRes.ok) throw new Error('Sin datos')
          const perfil = (await perfilRes.json()) as { agonista: Agonista }
          agonistaFuente = perfil.agonista
        }
      } else {
        const duelo = pulsoJson as {
          agonista: Agonista & { pruebas?: unknown }
          antagonista: (Agonista & { pruebas?: unknown }) | null
        }
        agonistaFuente = duelo.agonista
        antagonistaFuente = duelo.antagonista ?? null
      }

      const stripPruebas = (a: Agonista & { pruebas?: unknown }): Agonista => {
        const copy = { ...a }
        delete (copy as { pruebas?: unknown }).pruebas
        return copy as Agonista
      }

      if (esSolo) {
        const [statsRes, benchRes] = await Promise.all([
          fetch('/api/altis/stats'),
          fetch('/api/altis/benchmarks'),
          sleep(Math.max(0, 4000 - (Date.now() - __pageLoadT0))),
        ])

        if (!statsRes.ok || !benchRes.ok) throw new Error('Sin datos')

        const rawStats = (await statsRes.json()) as {
          evolucionKleos: AltisSoloData['stats']['evolucionKleos']
          mejoresDias: AltisSoloData['stats']['mejoresDias']
          rachaMaxima: { propio: number }
          statsPropio: StatsRow
        }
        const benchmarks = (await benchRes.json()) as BenchmarkData

        setDatos({
          modo: 'solo',
          agonista: stripPruebas(agonistaFuente),
          statsPropio: rawStats.statsPropio,
          benchmarks,
          stats: {
            evolucionKleos: rawStats.evolucionKleos,
            mejoresDias: rawStats.mejoresDias,
            rachaMaxima: rawStats.rachaMaxima,
          },
        })
      } else {
        const [statsRes, hegRes] = await Promise.all([
          fetch('/api/altis/stats'),
          fetch('/api/hegemonia'),
          sleep(Math.max(0, 4000 - (Date.now() - __pageLoadT0))),
        ])

        if (!statsRes.ok || !hegRes.ok) throw new Error('Sin datos')

        const rawStats = (await statsRes.json()) as {
          heatmap: AltisDueloData['stats']['heatmap']
          comparativaHabitos: AltisDueloData['stats']['comparativaHabitos']
          evolucionKleos: AltisDueloData['stats']['evolucionKleos']
          mejoresDias: AltisDueloData['stats']['mejoresDias']
          rachaMaxima: { propio: number; antagonista: number }
          statsPropio: StatsRow
          statsAntagonista: StatsRow | null
        }
        const heg = (await hegRes.json()) as { hegemonias: Hegemonia[] }

        setDatos({
          modo: 'duelo',
          agonista: stripPruebas(agonistaFuente),
          antagonista: antagonistaFuente
            ? stripPruebas(antagonistaFuente)
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
      }
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
    return <LoadingAltis size="lg" frase="La Balanza del Altis se ajusta..." />
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

  // ── RENDER MODO SOLO ──────────────────────────────────────────────────────
  if (datos.modo === 'solo') {
    const b = datos.benchmarks
    const nivelRaw = datos.agonista.nivel as string
    const nivel: NivelKey =
      nivelRaw in NIVEL_THRESHOLDS ? (nivelRaw as NivelKey) : 'aspirante'
    const NivelIcono = NIVEL_ICONOS[nivel]
    const nivelLabel = NIVEL_LABELS[nivel]

    const ordenados = (
      Object.entries(NIVEL_THRESHOLDS) as [NivelKey, number][]
    ).sort((a, b) => a[1] - b[1])
    const idxActual = ordenados.findIndex(([k]) => k === nivel)
    const siguiente = ordenados[idxActual + 1]
    const actual = ordenados[Math.max(0, idxActual)]
    const pctNivel = siguiente
      ? Math.min(
          100,
          Math.round(
            ((datos.agonista.kleosTotal - actual[1]) /
              (siguiente[1] - actual[1])) *
              100
          )
        )
      : 100

    const STATS_RAPIDAS = [
      {
        label: 'Días perfectos',
        valor: datos.statsPropio.diasPerfectos,
        Icono: Star,
      },
      {
        label: 'Racha actual',
        valor: `${datos.statsPropio.rachaActual}d`,
        Icono: Flame,
      },
      {
        label: 'Inscripciones',
        valor: datos.statsPropio.inscripciones,
        Icono: ScrollText,
      },
    ]

    const BENCHMARK_ROWS = [
      {
        Icono: Dumbbell,
        label: 'Gym',
        unidad: 'x/sem',
        antes: b.lineaBase.gym,
        ahora: b.promedioActual.gym,
        meta: 4,
        tieneBase: true,
      },
      {
        Icono: Activity,
        label: 'Cardio',
        unidad: 'x/sem',
        antes: b.lineaBase.cardio,
        ahora: b.promedioActual.cardio,
        meta: 3,
        tieneBase: true,
      },
      {
        Icono: BookOpen,
        label: 'Lectura',
        unidad: 'pág/día',
        antes: b.lineaBase.paginas,
        ahora: b.promedioActual.paginas,
        meta: 10,
        tieneBase: true,
      },
      {
        Icono: Footprints,
        label: 'Pasos',
        unidad: 'prom',
        antes: null as number | null,
        ahora: b.promedioActual.pasos,
        meta: 10000,
        tieneBase: false,
      },
      {
        Icono: Moon,
        label: 'Sueño',
        unidad: 'h/noche',
        antes: null as number | null,
        ahora: b.promedioActual.sueno,
        meta: 7,
        tieneBase: false,
      },
      {
        Icono: Droplets,
        label: 'Agua',
        unidad: '% días',
        antes: null as number | null,
        ahora: b.promedioActual.agua,
        meta: 80,
        tieneBase: false,
      },
      {
        Icono: ShieldCheck,
        label: 'Comida',
        unidad: '% días',
        antes: null as number | null,
        ahora: b.promedioActual.comida,
        meta: 80,
        tieneBase: false,
      },
    ]

    return (
      <div className="space-y-10 animate-fade-in pb-8">
        <div className="pt-2 space-y-1">
          <p className="text-xs text-amber/60 tracking-widest uppercase font-body">
            El Altis
          </p>
          <h1 className="font-display text-2xl font-bold tracking-wide">Mi Agon.</h1>
          <p className="text-xs text-muted-foreground/50 font-body italic">
            &ldquo;El Altis no olvida nada.&rdquo;
          </p>
        </div>

        <AgonCard variant="highlighted">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-body tracking-wide uppercase">
                  Kleos acumulado
                </p>
                <p className="font-display text-4xl font-bold text-amber tracking-tight">
                  {datos.agonista.kleosTotal.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-surface-2 px-3 py-2 rounded-xl border border-border">
                <NivelIcono size={16} className="text-amber shrink-0" />
                <span className="text-xs font-display font-bold text-foreground">
                  {nivelLabel}
                </span>
              </div>
            </div>

            {siguiente && (
              <div className="space-y-1.5">
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-amber rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pctNivel}%` }}
                    transition={{
                      duration: 1.2,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.3,
                    }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground/50 font-body">
                    {pctNivel}% al siguiente nivel
                  </span>
                  <span className="text-xs text-muted-foreground/50 font-body">
                    {NIVEL_LABELS[siguiente[0]]}
                  </span>
                </div>
              </div>
            )}
          </div>
        </AgonCard>

        <div className="grid grid-cols-3 gap-3">
          {STATS_RAPIDAS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
            >
              <AgonCard>
                <s.Icono size={18} className="text-amber mb-1" />
                <p className="font-display text-2xl font-bold text-amber">{s.valor}</p>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  {s.label}
                </p>
              </AgonCard>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
          <div className="text-center space-y-0.5">
            <p className="text-xs text-amber/80 tracking-widest uppercase font-body">
              Tu Progreso
            </p>
            <p className="text-xs text-muted-foreground/40 font-body italic">
              &ldquo;Esto es lo que el Altis ha visto.&rdquo;
            </p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
        </div>

        <AgonCard>
          {b.diasRegistrados < 1 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground font-body">
                Los benchmarks aparecen cuando tengas al menos un día registrado.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              <p className="text-xs text-muted-foreground/50 font-body pb-3">
                Promedio de {b.diasRegistrados} día{b.diasRegistrados !== 1 ? 's' : ''}{' '}
                registrados
              </p>
              {BENCHMARK_ROWS.map((row, i) => {
                const vsMeta =
                  row.ahora > 0 ? row.ahora >= row.meta : null
                let pct = ''
                if (row.tieneBase && row.antes !== null && row.antes > 0) {
                  const diff = ((row.ahora - row.antes) / row.antes) * 100
                  pct = `${Math.abs(Math.round(diff))}%`
                } else if (row.tieneBase && row.antes === 0 && row.ahora > 0) {
                  pct = 'nuevo'
                }

                return (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.35 }}
                    className="flex items-center gap-3 py-3 border-b border-border last:border-0"
                  >
                    <row.Icono size={16} className="text-muted-foreground shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-body">
                          {row.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {row.tieneBase && row.antes !== null && (
                          <>
                            <span className="text-xs text-muted-foreground/40 font-body line-through">
                              {row.antes === 0
                                ? 'nunca'
                                : `${row.antes} ${row.unidad}`}
                            </span>
                            <span className="text-muted-foreground/30 text-xs">→</span>
                          </>
                        )}
                        <span className="text-sm font-body font-semibold text-foreground">
                          {row.label === 'Pasos'
                            ? row.ahora.toLocaleString()
                            : `${row.ahora}`}{' '}
                          <span className="text-xs text-muted-foreground/60 font-normal">
                            {row.unidad}
                          </span>
                        </span>
                        {pct && (
                          <span
                            className="text-xs font-body font-medium"
                            style={{
                              color:
                                row.ahora >= (row.antes ?? 0)
                                  ? '#22C55E'
                                  : '#EF4444',
                            }}
                          >
                            {row.ahora >= (row.antes ?? 0) ? '↑' : '↓'} {pct}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-0.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background:
                            vsMeta === true
                              ? '#22C55E'
                              : vsMeta === false
                                ? '#EF4444'
                                : '#404040',
                        }}
                      />
                      <span className="text-xs text-muted-foreground/30 font-body">
                        /
                        {row.label === 'Pasos'
                          ? row.meta.toLocaleString()
                          : row.meta}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AgonCard>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
          <div className="text-center space-y-0.5">
            <p className="text-xs text-amber/80 tracking-widest uppercase font-body">
              Actividad
            </p>
            <p className="text-xs text-muted-foreground/40 font-body italic">
              &ldquo;29 días bajo la mirada del Olimpo.&rdquo;
            </p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
        </div>

        <AgonCard>
          <HeatmapActividad
            modo="solo"
            datos={b.heatmap}
            nombre1={nombre1}
          />
        </AgonCard>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
          <div className="text-center space-y-0.5">
            <p className="text-xs text-amber/80 tracking-widest uppercase font-body">
              Evolución del Kleos
            </p>
            <p className="text-xs text-muted-foreground/40 font-body italic">
              &ldquo;La curva no miente.&rdquo;
            </p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
        </div>

        <AgonCard>
          <EvolucionKleosChart
            datos={datos.stats.evolucionKleos}
            nombre1={nombre1}
            nombre2=""
          />
        </AgonCard>

        <div className="grid grid-cols-2 gap-3">
          <AgonCard>
            <p className="text-xs text-muted-foreground font-body">Mejor racha</p>
            <p className="font-display text-3xl font-bold text-amber mt-1">
              {datos.statsPropio.mejorRacha}
              <span className="text-sm font-body text-muted-foreground ml-1">días</span>
            </p>
          </AgonCard>
          <AgonCard>
            <p className="text-xs text-muted-foreground font-body">Racha actual</p>
            <p className="font-display text-3xl font-bold text-foreground mt-1">
              {datos.statsPropio.rachaActual}
              <span className="text-sm font-body text-muted-foreground ml-1">días</span>
            </p>
          </AgonCard>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
          <div className="text-center space-y-0.5">
            <p className="text-xs text-amber/80 tracking-widest uppercase font-body">
              Tus Mejores Días
            </p>
            <p className="text-xs text-muted-foreground/40 font-body italic">
              &ldquo;Los días que el Altis marcó en oro.&rdquo;
            </p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
        </div>

        <AgonCard>
          <MejoresDias dias={datos.stats.mejoresDias} nombrePropio={nombre1} />
        </AgonCard>

        <EventoDestinoOverlay
          pruebaId={eventoActivado ? pruebaDestinoId : null}
          onCerrar={cerrarOverlay}
        />
      </div>
    )
  }

  // ── RENDER MODO DUELO ───────────────────────────────────────────────────────
  const nombre2 = datos.antagonista?.nombre ?? 'Antagonista'
  const TABS_DUELO: { id: TabAltisDuelo; label: string }[] = [
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
        {TABS_DUELO.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTabDuelo(t.id)}
            className={cn(
              'flex-1 min-w-[4.5rem] pb-3 text-sm font-body transition-all border-b-2 -mb-px whitespace-nowrap px-1',
              tabDuelo === t.id
                ? 'text-foreground border-amber font-medium'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabDuelo === 'batalla' && (
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

      {tabDuelo === 'habitos' && (
        <div className="space-y-4 animate-fade-in">
          <AgonCard>
            <SectionHeader
              titulo="Actividad diaria"
              subtitulo="Cada cuadro es un día — más oscuro, más pruebas"
            />
            <HeatmapActividad
              modo="duelo"
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

      {tabDuelo === 'evolucion' && (
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
              <p className="text-xs text-muted-foreground font-body">Mejor racha {nombre1}</p>
              <p className="font-display text-3xl font-bold text-amber mt-1">
                {datos.stats.rachaMaxima.propio}
                <span className="text-sm font-body text-muted-foreground ml-1">días</span>
              </p>
            </AgonCard>
            <AgonCard>
              <p className="text-xs text-muted-foreground font-body">Mejor racha {nombre2}</p>
              <p className="font-display text-3xl font-bold text-foreground mt-1">
                {datos.stats.rachaMaxima.antagonista}
                <span className="text-sm font-body text-muted-foreground ml-1">días</span>
              </p>
            </AgonCard>
          </div>
        </div>
      )}

      {tabDuelo === 'dias' && (
        <div className="space-y-4 animate-fade-in">
          <AgonCard>
            <SectionHeader
              titulo="Top días perfectos"
              subtitulo="Los 10 mejores días del Gran Agon por kleos"
            />
            <MejoresDias dias={datos.stats.mejoresDias} nombrePropio={nombre1} />
          </AgonCard>
        </div>
      )}

      <EventoDestinoOverlay
        pruebaId={eventoActivado ? pruebaDestinoId : null}
        onCerrar={cerrarOverlay}
      />
    </div>
  )
}
