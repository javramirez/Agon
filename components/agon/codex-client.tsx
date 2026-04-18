'use client'

import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { INSCRIPCIONES } from '@/lib/db/constants'
import {
  LORE_MUNDO,
  LORE_DIOSES,
  LORE_MENTORES,
  LORE_FACCIONES,
  type EntradaLore,
} from '@/lib/codex/lore'
import { cn, getDiaDelRetoRelativo } from '@/lib/utils'
import type { Inscripcion, AgoraEvento, PactoInicial, Cronica } from '@/lib/db/schema'

type TabKey =
  | 'mundo'
  | 'dioses'
  | 'mentores'
  | 'facciones'
  | 'inscripciones'
  | 'cronicas'
  | 'contrato'
  | 'bitacora'

interface Props {
  agonistaNombre: string
  agonistaNivel: string
  mentorAsignado: string | null
  pacto: PactoInicial | null
  bitacora: AgoraEvento[]
  cronicas: Cronica[]
  /** Inicio del reto (YYYY-MM-DD) para etiquetar días del Agon en la bitácora. */
  fechaInicioReto: string | null
}

const TABS: { key: TabKey; label: string; personal?: boolean }[] = [
  { key: 'mundo', label: 'El Mundo' },
  { key: 'dioses', label: 'Los Dioses' },
  { key: 'mentores', label: 'Los Mentores' },
  { key: 'facciones', label: 'Las Facciones' },
  { key: 'inscripciones', label: 'Inscripciones' },
  { key: 'cronicas', label: 'Las Crónicas' },
  { key: 'contrato', label: 'El Contrato', personal: true },
  { key: 'bitacora', label: 'La Bitácora', personal: true },
]

const TAB_KEYS = new Set<TabKey>(TABS.map((t) => t.key))

function parseTab(raw: string | null): TabKey {
  if (raw && TAB_KEYS.has(raw as TabKey)) return raw as TabKey
  return 'mundo'
}

const ARQUETIPO_LABELS: Record<string, string> = {
  constante: 'El Constante',
  explosivo: 'El Explosivo',
  metodico: 'El Metódico',
  caotico: 'El Caótico',
}

function fmtFecha(v: string | Date): string {
  if (typeof v === 'string') return v
  return v.toISOString().split('T')[0]
}

const tabScrollClass =
  'flex overflow-x-auto gap-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'

function DetalleLore({ entrada, onClose }: { entrada: EntradaLore; onClose?: () => void }) {
  const [mostrandoLider, setMostrandoLider] = useState(false)
  const lider = entrada.lider

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="relative w-full aspect-[16/9] flex-shrink-0 bg-surface-2">
        {entrada.imagen ? (
          <Image
            src={entrada.imagen}
            alt={entrada.nombre}
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, 50vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className={cn('text-8xl opacity-20', entrada.color)}>{entrada.avatar}</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 sm:hidden w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-foreground hover:bg-black/80 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-5 space-y-4 flex-1">
        <div className="space-y-1">
          <p className={cn('text-xs font-body tracking-widest uppercase', entrada.color)}>
            {entrada.subtitulo}
          </p>
          <h2 className="font-display text-xl font-bold">{entrada.nombre}</h2>
        </div>

        {entrada.bloqueada ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="text-4xl opacity-20">🔒</span>
            <p className="text-sm text-muted-foreground/60 font-body">
              Esta entrada se revelará cuando la Ciudad de Olimpia despierte.
            </p>
            <p className="text-xs text-amber/40 font-body tracking-widest uppercase">Próximamente</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {entrada.lore.split('\n\n').map((parrafo, i) => (
                <p key={i} className="text-sm text-muted-foreground font-body leading-relaxed">
                  {parrafo}
                </p>
              ))}
            </div>

            {lider && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setMostrandoLider((v) => !v)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all',
                    mostrandoLider
                      ? 'bg-surface-2 border-amber/20'
                      : 'bg-surface-1 border-border hover:border-border-strong'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lider.avatar}</span>
                    <div className="text-left">
                      <p className={cn('text-sm font-display font-semibold', entrada.color)}>
                        {lider.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground font-body">
                        {lider.subtitulo}
                      </p>
                    </div>
                  </div>
                  <motion.span
                    className="text-xs text-muted-foreground/50 flex-shrink-0"
                    animate={{ rotate: mostrandoLider ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▶
                  </motion.span>
                </button>

                <AnimatePresence>
                  {mostrandoLider && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 space-y-3">
                        {lider.imagen ? (
                          <div className="w-full aspect-[16/9] rounded-xl overflow-hidden border border-border/40">
                            <Image
                              src={lider.imagen}
                              alt={lider.nombre}
                              width={600}
                              height={338}
                              className="w-full h-full object-cover object-top"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <>
                            <div className="w-full aspect-[16/9] rounded-xl bg-surface-2 flex items-center justify-center border border-border/40">
                              <span className={cn('text-7xl opacity-15', entrada.color)}>
                                {lider.avatar}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground/50 font-body italic text-center">
                              El retrato del líder llegará pronto al Códex.
                            </p>
                          </>
                        )}
                        <div className="space-y-3 pt-1">
                          {lider.lore.split('\n\n').map((parrafo, i) => (
                            <p
                              key={i}
                              className="text-sm text-muted-foreground font-body leading-relaxed"
                            >
                              {parrafo}
                            </p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ListaEntradas({
  entradas,
  seleccionada,
  onSeleccionar,
  mentorAsignado,
}: {
  entradas: EntradaLore[]
  seleccionada: EntradaLore | null
  onSeleccionar: (e: EntradaLore) => void
  mentorAsignado?: string | null
}) {
  if (entradas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }}>📖</span>
        </div>
        <p className="text-sm text-muted-foreground/60 font-body max-w-xs leading-relaxed">
          Esta sección del Códex aún no tiene registros. El Altis los inscribirá con el tiempo.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/40">
      {entradas.map((entrada, i) => {
        const activa = seleccionada?.id === entrada.id
        const esTuMentor = mentorAsignado === entrada.id

        return (
          <motion.button
            key={entrada.id}
            type="button"
            onClick={() => onSeleccionar(entrada)}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              'w-full text-left px-4 py-3.5 flex items-center gap-3 transition-all',
              activa ? 'bg-amber/10' : 'hover:bg-surface-2/50',
              entrada.bloqueada && 'opacity-50'
            )}
          >
            <div
              className={cn(
                'w-0.5 self-stretch rounded-full flex-shrink-0 transition-all',
                activa ? 'bg-amber' : 'bg-transparent'
              )}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    'text-sm font-display font-semibold truncate',
                    activa ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {entrada.nombre}
                </p>
                {esTuMentor && (
                  <span className="text-xs text-amber font-body bg-amber/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    Tu Mentor
                  </span>
                )}
                {entrada.bloqueada && (
                  <span className="text-xs text-muted-foreground/40 flex-shrink-0">🔒</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground/60 font-body truncate mt-0.5">
                {entrada.descripcion}
              </p>
            </div>

            <span
              className={cn(
                'text-xs flex-shrink-0 transition-colors',
                activa ? 'text-amber' : 'text-muted-foreground/30'
              )}
            >
              ▶
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

type CatalogInscripcion = (typeof INSCRIPCIONES)[number]

function SeccionInscripciones() {
  const [desbloqueadas, setDesbloqueadas] = useState<Inscripcion[]>([])
  const [cargando, setCargando] = useState(true)
  const [seleccionada, setSeleccionada] = useState<CatalogInscripcion | null>(null)
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    fetch('/api/inscripciones')
      .then((r) => r.json())
      .then((d) => setDesbloqueadas((d as { inscripciones: Inscripcion[] }).inscripciones ?? []))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    setMontado(true)
  }, [])

  const ids = new Set(desbloqueadas.map((i) => i.inscripcionId))
  const publicas = INSCRIPCIONES.filter((i) => i.tipo === 'publica')
  const secretas = INSCRIPCIONES.filter((i) => i.tipo === 'secreta')
  const eggs = INSCRIPCIONES.filter((i) => i.tipo === 'easter_egg')
  const secretasDesbloqueadas = secretas.filter((i) => ids.has(i.id))
  const secretasNo = secretas.filter((i) => !ids.has(i.id))
  const eggsDesbloqueados = eggs.filter((i) => ids.has(i.id))

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-xs text-muted-foreground font-body animate-pulse">
          El Altis consulta las inscripciones...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">
            Hazañas del Agon
          </p>
          <p className="text-xs text-muted-foreground/50 font-body">
            <span className="text-amber">{publicas.filter((i) => ids.has(i.id)).length}</span> /{' '}
            {publicas.length}
          </p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {publicas.map((ins, i) => {
            const desbloqueada = ids.has(ins.id)
            return (
              <motion.button
                key={ins.id}
                type="button"
                onClick={() => setSeleccionada(ins)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                whileTap={{ scale: 0.96 }}
                className={cn(
                  'rounded-xl border p-3 text-center space-y-1.5 transition-all',
                  desbloqueada
                    ? 'bg-surface-1 border-amber/20 hover:border-amber/50'
                    : 'bg-surface-1/40 border-border/30 hover:border-border/60'
                )}
              >
                <div className={cn('text-2xl', !desbloqueada && 'grayscale opacity-25')}>
                  {ins.icono}
                </div>
                <p
                  className={cn(
                    'text-xs font-display font-semibold leading-tight',
                    desbloqueada ? 'text-foreground' : 'text-muted-foreground/40'
                  )}
                >
                  {ins.nombre}
                </p>
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">
            Inscripciones Ocultas
          </p>
          <p className="text-xs text-muted-foreground/50 font-body italic">
            <span className="text-amber not-italic">
              {secretasDesbloqueadas.length + eggsDesbloqueados.length}
            </span>{' '}
            descubiertas · nadie sabe cuántas hay
          </p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {[...secretasDesbloqueadas, ...eggsDesbloqueados].map((ins, i) => (
            <motion.button
              key={ins.id}
              type="button"
              onClick={() => setSeleccionada(ins)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-xl border border-amber/40 bg-surface-1 p-3 text-center space-y-1.5 hover:border-amber/70 transition-all"
            >
              <div className="text-2xl">{ins.icono}</div>
              <p className="text-xs font-display font-semibold text-foreground">{ins.nombre}</p>
              {ins.tipo === 'easter_egg' && <p className="text-xs text-amber/60">✦</p>}
            </motion.button>
          ))}
          {secretasNo.map((ins, i) => (
            <motion.button
              key={ins.id}
              type="button"
              onClick={() => setSeleccionada(ins)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (secretasDesbloqueadas.length + eggsDesbloqueados.length + i) * 0.02 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-xl border border-border/30 bg-surface-1/40 p-3 text-center space-y-1.5 hover:border-border/60 transition-all"
            >
              <div className="text-2xl grayscale opacity-20">❓</div>
              <p className="text-xs font-display font-semibold text-muted-foreground/25">???</p>
            </motion.button>
          ))}
        </div>
      </div>

      {montado
        ? createPortal(
            <AnimatePresence>
              {seleccionada && (
                <motion.div
                  className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSeleccionada(null)}
                >
                  <motion.div
                    className="relative max-w-sm w-full rounded-2xl p-8 text-center space-y-4 border border-amber/20"
                    style={{ background: 'rgba(10,10,10,0.98)' }}
                    initial={{ opacity: 0, scale: 0.92, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={cn('text-6xl', !ids.has(seleccionada.id) && 'grayscale opacity-30')}>
                      {ids.has(seleccionada.id) ? seleccionada.icono : '🔒'}
                    </div>
                    <h2
                      className={cn(
                        'font-display text-xl font-bold',
                        ids.has(seleccionada.id) ? 'text-foreground' : 'text-muted-foreground/50'
                      )}
                    >
                      {ids.has(seleccionada.id) ? seleccionada.nombre : 'Inscripción Bloqueada'}
                    </h2>
                    {ids.has(seleccionada.id) ? (
                      <p className="text-sm text-muted-foreground font-body leading-relaxed">
                        {seleccionada.descripcion}
                      </p>
                    ) : seleccionada.tipo === 'publica' ? (
                      <p className="text-sm text-muted-foreground font-body">{seleccionada.condicion}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground/40 font-body italic">
                        Esta inscripción se revela al conseguirla.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setSeleccionada(null)}
                      className="w-full py-3 font-display font-bold text-xs tracking-widest uppercase rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cerrar
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )
        : null}
    </div>
  )
}

function previewRelato(relato: string): string {
  if (relato.length <= 80) return relato
  return relato.slice(0, 80) + '...'
}

function SeccionCronicas({ cronicas: cronicasProp }: { cronicas: Cronica[] }) {
  const [seleccionada, setSeleccionada] = useState<Cronica | null>(cronicasProp[0] ?? null)

  if (cronicasProp.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <span className="text-5xl opacity-20">📰</span>
        <p className="text-sm text-muted-foreground/60 font-body max-w-xs leading-relaxed">
          Las Crónicas se escriben al final de cada semana del Gran Agon. La primera aparecerá al
          cerrar la primera semana.
        </p>
      </div>
    )
  }

  const listaCronicas: EntradaLore[] = cronicasProp.map((c) => ({
    id: c.id,
    nombre: `Semana ${c.semana}`,
    subtitulo: `${fmtFecha(c.fechaInicio)} - ${fmtFecha(c.fechaFin)}`,
    avatar: '📰',
    color: 'text-amber',
    descripcion: previewRelato(c.relato),
    lore: c.relato,
  }))

  const seleccionadaLore = seleccionada
    ? listaCronicas.find((l) => l.id === seleccionada.id) ?? null
    : null

  return (
    <div className="sm:grid sm:grid-cols-[240px_1fr] sm:border sm:border-border sm:rounded-xl sm:overflow-hidden min-h-[400px]">
      <div className="hidden sm:block border-r border-border overflow-y-auto bg-surface-1/50">
        <ListaEntradas
          entradas={listaCronicas}
          seleccionada={seleccionadaLore}
          onSeleccionar={(e) => setSeleccionada(cronicasProp.find((c) => c.id === e.id) ?? null)}
        />
      </div>

      <div className="sm:hidden space-y-2">
        {listaCronicas.map((l, i) => (
          <motion.button
            key={l.id}
            type="button"
            onClick={() => setSeleccionada(cronicasProp.find((c) => c.id === l.id) ?? null)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="w-full text-left rounded-xl border border-border bg-surface-1 p-4 hover:border-border/60 transition-all"
          >
            <p className="font-display font-bold text-sm">{l.nombre}</p>
            <p className="text-xs text-muted-foreground font-body mt-0.5">{l.subtitulo}</p>
          </motion.button>
        ))}
      </div>

      {seleccionadaLore && (
        <div className="hidden sm:block overflow-y-auto p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-amber/70 font-body tracking-widest uppercase">
              {seleccionadaLore.subtitulo}
            </p>
            <h2 className="font-display text-xl font-bold">{seleccionadaLore.nombre}</h2>
          </div>
          <div className="space-y-3">
            {seleccionadaLore.lore.split('\n\n').map((p, i) => (
              <p key={i} className="text-sm text-muted-foreground font-body leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {seleccionada && (
          <motion.div
            key={seleccionada.id}
            className="fixed inset-0 z-50 sm:hidden bg-background overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
          >
            <div className="p-5 space-y-4">
              <button
                type="button"
                onClick={() => setSeleccionada(null)}
                className="text-xs text-muted-foreground font-body hover:text-foreground transition-colors"
              >
                ← Volver
              </button>
              <div className="space-y-1">
                <p className="text-xs text-amber/70 font-body tracking-widest uppercase">
                  {fmtFecha(seleccionada.fechaInicio)} - {fmtFecha(seleccionada.fechaFin)}
                </p>
                <h2 className="font-display text-xl font-bold">Semana {seleccionada.semana}</h2>
              </div>
              <div className="space-y-3">
                {seleccionada.relato.split('\n\n').map((p, i) => (
                  <p key={i} className="text-sm text-muted-foreground font-body leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── DATOS DEL CONTRATO ───────────────────────────────

const CLAUSULAS_CONTRATO: {
  numero: string
  titulo: string
  texto: string
  muted?: boolean
}[] = [
  {
    numero: 'Primero',
    titulo: 'Objeto',
    texto:
      'Formalizar un compromiso personal orientado al cumplimiento de hábitos de disciplina física, salud y desarrollo personal.',
  },
  {
    numero: 'Segundo',
    titulo: 'Duración',
    texto: 'Desde el lunes 15 de abril de 2026 hasta el día 13 de mayo de 2026, inclusive.',
  },
  {
    numero: 'Tercero',
    titulo: 'Obligaciones',
    texto:
      'Consumir exclusivamente agua, abstenerse de comida rápida, cumplir mínimo 4 sesiones de gimnasio semanales, 3 sesiones de cardio adicionales, 10.000 pasos diarios, 7-8 horas de sueño y 10 páginas de lectura diaria.',
  },
  {
    numero: 'Cuarto',
    titulo: 'Registro y Verificación',
    texto:
      'El principal criterio de verificación es la palabra de cada participante. La palabra de un hombre íntegro no debe ser puesta en duda.',
  },
  {
    numero: 'Quinto',
    titulo: 'Incumplimiento',
    texto: 'El incumplimiento de cualquier obligación será considerado una falta dentro del desafío.',
  },
  {
    numero: 'Séptimo',
    titulo: 'La Ekecheiria: Cláusula de Fuerza Mayor',
    texto:
      'En caso de enfermedad o lesión real, la parte afectada puede invocar La Ekecheiria. Se dispone de 7 días corridos posteriores al 13 de mayo como colchón de recuperación.',
    muted: true,
  },
  {
    numero: 'Octavo',
    titulo: 'Consumo de Alcohol',
    texto:
      'El contrato no prohíbe el consumo de alcohol, quedando a libre disposición de cada parte.',
  },
  {
    numero: 'Noveno',
    titulo: 'Principio Fundamental',
    texto:
      'El verdadero valor del contrato radica en su cumplimiento íntegro, en cuanto representa una prueba concreta de disciplina, carácter y capacidad de sostener un compromiso en el tiempo.',
  },
]

const PREMIOS_CONTRATO = [
  {
    agonista: 'Agonista A',
    cumple: 'Recibe un jockey.',
    falla: 'Publica una historia en inglés exponiendo sus objetivos deportivos y su proceso personal.',
  },
  {
    agonista: 'Agonista B',
    cumple: 'Recibe 3 bebidas energéticas de Agonista A.',
    falla: 'Compra suplementación deportiva a Agonista A.',
  },
] as const

function SeccionContrato({
  pacto,
  mentorAsignado,
}: {
  pacto: PactoInicial | null
  mentorAsignado: string | null
}) {
  const [tabContrato, setTabContrato] = useState<'contrato' | 'pacto'>('contrato')

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTabContrato('contrato')}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-xs font-display font-bold uppercase tracking-wide transition-all border',
            tabContrato === 'contrato'
              ? 'bg-amber text-black border-amber'
              : 'bg-surface-1 border-border text-muted-foreground hover:text-foreground'
          )}
        >
          El Contrato
        </button>
        <button
          type="button"
          onClick={() => setTabContrato('pacto')}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-xs font-display font-bold uppercase tracking-wide transition-all border',
            tabContrato === 'pacto'
              ? 'bg-amber text-black border-amber'
              : 'bg-surface-1 border-border text-muted-foreground hover:text-foreground'
          )}
        >
          El Pacto Personal
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tabContrato === 'contrato' && (
          <motion.div
            key="contrato"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="rounded-xl border border-amber/20 bg-surface-1 p-4 space-y-1.5">
              <p className="text-xs text-amber/60 font-body tracking-widest uppercase">
                El Contrato entre Agonistas
              </p>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                La palabra de un hombre íntegro no debe ser puesta en duda.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">
                Premios y Penitencias: Cláusula Sexta
              </p>
              {PREMIOS_CONTRATO.map((p) => (
                <div key={p.agonista} className="rounded-xl border border-border bg-surface-1 p-4 space-y-3">
                  <p className="text-sm font-display font-semibold text-foreground">{p.agonista}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-surface-2 rounded-lg p-3 space-y-1">
                      <p className="text-xs text-amber font-body font-medium">Si cumple</p>
                      <p className="text-xs text-muted-foreground font-body leading-relaxed">{p.cumple}</p>
                    </div>
                    <div className="bg-surface-2 rounded-lg p-3 space-y-1">
                      <p className="text-xs text-red-400 font-body font-medium">Si falla</p>
                      <p className="text-xs text-muted-foreground font-body leading-relaxed">{p.falla}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">
                Las Cláusulas
              </p>
              {CLAUSULAS_CONTRATO.map((c, i) => (
                <motion.div
                  key={c.numero}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'rounded-xl border p-4 space-y-1.5',
                    c.muted ? 'border-border/40 bg-surface-1/60' : 'border-border bg-surface-1'
                  )}
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        'text-xs font-body font-medium uppercase tracking-wider',
                        c.muted ? 'text-muted-foreground/50' : 'text-amber'
                      )}
                    >
                      {c.numero}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-display font-semibold',
                        c.muted ? 'text-muted-foreground' : 'text-foreground'
                      )}
                    >
                      {c.titulo}
                    </span>
                  </div>
                  <p
                    className={cn(
                      'text-sm font-body leading-relaxed',
                      c.muted ? 'text-muted-foreground/60' : 'text-muted-foreground'
                    )}
                  >
                    {c.texto}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {tabContrato === 'pacto' && (
          <motion.div
            key="pacto"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {!pacto ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <span className="text-5xl opacity-20">⚖️</span>
                <p className="text-sm text-muted-foreground/60 font-body">
                  El Pacto Personal aún no ha sido sellado.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-amber/20 bg-surface-1 p-4 space-y-1">
                  <p className="text-xs text-amber/60 font-body tracking-widest uppercase">
                    Sellado en el Altis
                  </p>
                  <p className="text-xs text-muted-foreground/50 font-body">
                    {new Date(pacto.completadoEn).toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {[
                  { label: 'El Objetivo', valor: pacto.objetivo },
                  { label: 'El Arquetipo', valor: ARQUETIPO_LABELS[pacto.arquetipo] ?? pacto.arquetipo },
                  { label: 'Si gano...', valor: pacto.apuestaGanas },
                  { label: 'Si pierdo...', valor: pacto.apuestaPierdes },
                  { label: 'Mentor asignado', valor: mentorAsignado ?? 'sin asignar' },
                ].map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-xl border border-border bg-surface-1 p-4 space-y-1"
                  >
                    <p className="text-xs text-amber/70 font-body tracking-widest uppercase">{c.label}</p>
                    <p className="text-sm text-foreground font-body leading-relaxed">{c.valor}</p>
                  </motion.div>
                ))}

                <p className="text-center text-xs text-muted-foreground/30 font-body italic pt-1">
                  El Pacto Personal es privado. Solo tú puedes verlo.
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── BITÁCORA CONFIG ──────────────────────────────────

type EventoBitacoraConfig = {
  icono: string
  color: string
  colorBg: string
  svgColor: string
  svgAccent: string
  lucideIcon: string
}

const EVENTO_CONFIG: Record<string, EventoBitacoraConfig> = {
  dia_perfecto: {
    icono: '⭐',
    color: 'text-amber',
    colorBg: 'bg-amber/10 border-amber/30',
    svgColor: '#78350f',
    svgAccent: '#fbbf24',
    lucideIcon: 'Star',
  },
  nivel_subido: {
    icono: '🏅',
    color: 'text-blue-400',
    colorBg: 'bg-blue-400/10 border-blue-400/30',
    svgColor: '#1e3a5f',
    svgAccent: '#60a5fa',
    lucideIcon: 'TrendingUp',
  },
  inscripcion_desbloqueada: {
    icono: '📜',
    color: 'text-purple-400',
    colorBg: 'bg-purple-400/10 border-purple-400/30',
    svgColor: '#3b1f6e',
    svgAccent: '#a78bfa',
    lucideIcon: 'Scroll',
  },
  hegemonia_ganada: {
    icono: '👑',
    color: 'text-orange-400',
    colorBg: 'bg-orange-400/10 border-orange-400/30',
    svgColor: '#7c2d12',
    svgAccent: '#fb923c',
    lucideIcon: 'Crown',
  },
  prueba_extraordinaria: {
    icono: '⚡',
    color: 'text-yellow-400',
    colorBg: 'bg-yellow-400/10 border-yellow-400/30',
    svgColor: '#713f12',
    svgAccent: '#facc15',
    lucideIcon: 'Zap',
  },
  senalamiento: {
    icono: '🎯',
    color: 'text-red-400',
    colorBg: 'bg-red-400/10 border-red-400/30',
    svgColor: '#7f1d1d',
    svgAccent: '#f87171',
    lucideIcon: 'Crosshair',
  },
  cronica_semanal: {
    icono: '📰',
    color: 'text-green-400',
    colorBg: 'bg-green-400/10 border-green-400/30',
    svgColor: '#14532d',
    svgAccent: '#4ade80',
    lucideIcon: 'BookOpen',
  },
}

const EVENTO_LABELS: Record<string, string> = {
  dia_perfecto: 'Día perfecto',
  nivel_subido: 'Nivel alcanzado',
  inscripcion_desbloqueada: 'Inscripción desbloqueada',
  hegemonia_ganada: 'Hegemonía conquistada',
  prueba_extraordinaria: 'Prueba extraordinaria',
  senalamiento: 'Señalamiento',
  cronica_semanal: 'Crónica semanal',
}

const DEFAULT_EVENTO_CONFIG: EventoBitacoraConfig = {
  icono: '◆',
  color: 'text-muted-foreground',
  colorBg: 'bg-surface-1 border-border',
  svgColor: '#1a1a1a',
  svgAccent: '#888888',
  lucideIcon: 'Circle',
}

const BITACORA_IMAGENES: Record<string, string> = {
  dia_perfecto: '/bitacora/dia_perfecto.png',
  nivel_subido: '/bitacora/nivel_subido.png',
  inscripcion_desbloqueada: '/bitacora/inscripcion_desbloqueada.png',
  hegemonia_ganada: '/bitacora/hegemonia_ganada.png',
  prueba_extraordinaria: '/bitacora/prueba_extraordinaria.png',
  senalamiento: '/bitacora/senalamiento.png',
  cronica_semanal: '/bitacora/cronica_semanal.png',
}

function PlaceholderEvento({
  tipo,
  config,
}: {
  tipo: string
  config: EventoBitacoraConfig
}) {
  const imagenSrc = BITACORA_IMAGENES[tipo]

  if (imagenSrc) {
    return (
      <div
        className="w-full h-full relative overflow-hidden"
        style={{ backgroundColor: config.svgColor }}
      >
        <Image
          src={imagenSrc}
          alt={tipo}
          fill
          className="object-cover object-top"
          unoptimized
        />
        <div
          className="absolute inset-x-0 bottom-0 h-16"
          style={{
            background: `linear-gradient(to top, ${config.svgColor}, transparent)`,
          }}
        />
      </div>
    )
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: config.svgColor }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`grid-${tipo}`} width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${tipo})`} />
      </svg>
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{
            backgroundColor: `${config.svgAccent}22`,
            border: `2px solid ${config.svgAccent}44`,
          }}
        >
          {config.icono}
        </div>
        <p
          className="text-xs uppercase tracking-widest font-medium"
          style={{ color: `${config.svgAccent}99` }}
        >
          {EVENTO_LABELS[tipo] ?? tipo}
        </p>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-16"
        style={{ background: `linear-gradient(to top, ${config.svgColor}, transparent)` }}
      />
    </div>
  )
}

function PanelBitacora({
  evento,
  onCerrar,
  fechaInicioReto,
}: {
  evento: AgoraEvento
  onCerrar: () => void
  fechaInicioReto: string | null
}) {
  const config = EVENTO_CONFIG[evento.tipo] ?? DEFAULT_EVENTO_CONFIG

  const [narracion, setNarracion] = useState<string | null>(null)
  const [mentorNombre, setMentorNombre] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [montado, setMontado] = useState(false)
  const fecha = new Date(evento.createdAt)

  useEffect(() => {
    async function cargar() {
      if (evento.narracion && evento.narracionMentor) {
        setNarracion(evento.narracion)
        setMentorNombre(evento.narracionMentor)
        return
      }

      setCargando(true)
      try {
        const res = await fetch('/api/mentor/narrar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventoId: evento.id,
            tipoEvento: EVENTO_LABELS[evento.tipo] ?? evento.tipo,
            contenidoEvento: evento.contenido,
            fechaEvento: fecha.toLocaleDateString('es-CL', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
          }),
        })
        if (!res.ok) throw new Error('Error en API')
        const data = (await res.json()) as { narracion: string; mentorNombre: string }
        setNarracion(data.narracion)
        setMentorNombre(data.mentorNombre)
      } catch {
        setNarracion(null)
      } finally {
        setCargando(false)
      }
    }
    void cargar()
  }, [
    evento.id,
    evento.narracion,
    evento.narracionMentor,
    evento.tipo,
    evento.contenido,
    evento.createdAt,
  ])

  useEffect(() => {
    setMontado(true)
  }, [])

  const diaAgonNum =
    fechaInicioReto && fechaInicioReto.trim().length > 0
      ? getDiaDelRetoRelativo(fechaInicioReto, fecha)
      : null
  const diaAgonLabel =
    diaAgonNum != null && Number.isFinite(diaAgonNum)
      ? `Día ${diaAgonNum} del Agon`
      : null

  const contenidoPanel = (
    <div className="flex flex-col h-full relative min-h-0">
      <button
        type="button"
        onClick={onCerrar}
        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150"
        style={{
          backgroundColor: 'rgba(0,0,0,0.4)',
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        ✕
      </button>

      <div className="relative flex-shrink-0 aspect-[16/9] w-full">
        <PlaceholderEvento tipo={evento.tipo} config={config} />
      </div>

      <div
        className="px-5 py-4 flex flex-col gap-2 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p
          className="text-[10px] uppercase tracking-widest"
          style={{ color: `${config.svgAccent}99` }}
        >
          {EVENTO_LABELS[evento.tipo] ?? evento.tipo}
        </p>
        <p
          className="text-lg font-semibold leading-tight"
          style={{ color: 'rgba(255,255,255,0.9)' }}
        >
          {evento.contenido}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {fecha.toLocaleDateString('es-CL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          {diaAgonLabel && (
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {diaAgonLabel}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-5 flex-1 min-h-0 overflow-y-auto">
        {cargando ? (
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((j) => (
                <motion.div
                  key={j}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: config.svgAccent }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: j * 0.2 }}
                />
              ))}
            </div>
            <p
              className="text-xs animate-pulse"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              El Mentor recuerda ese momento...
            </p>
          </div>
        ) : narracion ? (
          <div className="flex flex-col gap-2">
            <p
              className="text-[10px] uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              {mentorNombre} narra
            </p>
            <p
              className="text-sm leading-relaxed italic"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              &ldquo;{narracion}&rdquo;
            </p>
          </div>
        ) : (
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            No se pudo cargar la narración.
          </p>
        )}
      </div>
    </div>
  )

  if (!montado) return null

  return createPortal(
    <>
      {/* Desktop: Modal centrado */}
      <div className="hidden sm:flex fixed inset-0 z-[9999] items-center justify-center">
        <motion.div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCerrar}
        />
        <motion.div
          className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            backgroundColor: '#0f0f0f',
            border: '1px solid rgba(255,255,255,0.08)',
            marginTop: '72px', // compensar navbar
          }}
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2 }}
        >
          {contenidoPanel}
        </motion.div>
      </div>

      {/* Mobile: Drawer desde abajo */}
      <div className="sm:hidden fixed inset-0 z-[9999] flex items-end">
        <motion.div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCerrar}
        />
        <motion.div
          className="relative z-10 w-full rounded-t-2xl overflow-hidden"
          style={{
            backgroundColor: '#0f0f0f',
            border: '1px solid rgba(255,255,255,0.08)',
            maxHeight: '85vh',
          }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div
              className="w-10 h-1 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            />
          </div>
          {contenidoPanel}
        </motion.div>
      </div>
    </>,
    document.body
  )
}

function SeccionBitacora({
  bitacora,
  fechaInicioReto,
}: {
  bitacora: AgoraEvento[]
  fechaInicioReto: string | null
}) {
  const [eventoActivo, setEventoActivo] = useState<AgoraEvento | null>(null)
  const [tooltipActivo, setTooltipActivo] = useState<string | null>(null)

  if (bitacora.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }}>📜</span>
        </div>
        <p className="text-sm text-muted-foreground/60 font-body max-w-xs leading-relaxed">
          La Bitácora se escribe con el tiempo. Cada hito del Gran Agon quedará inscrito aquí.
        </p>
      </div>
    )
  }

  const eventos = [...bitacora].reverse()

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  }

  const nodoVariants = {
    hidden: { opacity: 0, scale: 0.6, y: 8 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring' as const, damping: 20, stiffness: 300 },
    },
  }

  const nodoMobileVariants = {
    hidden: { opacity: 0, x: -12 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring' as const, damping: 22, stiffness: 280 },
    },
  }

  return (
    <>
      <div className="space-y-6">
        <div className="hidden sm:block">
          <div className="relative overflow-x-auto pb-4">
            <motion.div
              className="absolute top-10 left-0 right-0 h-px origin-left"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            />
            <motion.div
              className="flex gap-2 min-w-max px-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {eventos.map((evento) => {
                const config = EVENTO_CONFIG[evento.tipo] ?? DEFAULT_EVENTO_CONFIG
                const esActivo = eventoActivo?.id === evento.id
                const fecha = new Date(evento.createdAt)

                return (
                  <motion.div
                    key={evento.id}
                    className="flex flex-col items-center gap-2 w-20 flex-shrink-0"
                    variants={nodoVariants}
                  >
                    <p className="text-xs text-muted-foreground/50 font-body text-center leading-tight h-8 flex items-end">
                      {fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                    </p>

                    <div className="relative">
                      <motion.button
                        type="button"
                        onClick={() => setEventoActivo(evento)}
                        onMouseEnter={() => setTooltipActivo(evento.id)}
                        onMouseLeave={() => setTooltipActivo(null)}
                        whileHover={{
                          scale: 1.18,
                          transition: { type: 'spring' as const, damping: 15, stiffness: 400 },
                        }}
                        whileTap={{ scale: 0.92 }}
                        className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition-all duration-200 relative z-10"
                        style={{
                          backgroundColor: esActivo
                            ? `${config.svgAccent}22`
                            : 'rgba(255,255,255,0.04)',
                          borderColor: esActivo ? config.svgAccent : 'rgba(255,255,255,0.12)',
                          boxShadow: esActivo ? `0 0 0 3px ${config.svgAccent}22` : 'none',
                        }}
                      >
                        {config.icono}
                      </motion.button>

                      <AnimatePresence>
                        {tooltipActivo === evento.id && !esActivo && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none"
                          >
                            <div className="bg-surface-2 border border-border rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                              <p className={cn('text-xs font-display font-bold', config.color)}>
                                {EVENTO_LABELS[evento.tipo] ?? evento.tipo}
                              </p>
                              <p className="text-xs text-muted-foreground font-body max-w-[180px] truncate mt-0.5">
                                {evento.contenido}
                              </p>
                            </div>
                            <div className="w-2 h-2 bg-surface-2 border-b border-r border-border rotate-45 mx-auto -mt-1" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <p
                      className={cn(
                        'text-xs font-body text-center leading-tight',
                        esActivo ? config.color : 'text-muted-foreground/50'
                      )}
                    >
                      {EVENTO_LABELS[evento.tipo]?.split(' ')[0] ?? evento.tipo}
                    </p>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </div>

        <motion.div
          className="sm:hidden space-y-0"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {eventos.map((evento, i) => {
            const config = EVENTO_CONFIG[evento.tipo] ?? DEFAULT_EVENTO_CONFIG
            const esActivo = eventoActivo?.id === evento.id
            const fecha = new Date(evento.createdAt)

            return (
              <motion.div
                key={evento.id}
                variants={nodoMobileVariants}
                className="flex gap-4 items-start"
              >
                <div className="flex flex-col items-center flex-shrink-0">
                  <motion.button
                    type="button"
                    onClick={() => setEventoActivo(evento)}
                    whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-base transition-all duration-200"
                    style={{
                      backgroundColor: esActivo
                        ? `${config.svgAccent}22`
                        : 'rgba(255,255,255,0.04)',
                      borderColor: esActivo ? config.svgAccent : 'rgba(255,255,255,0.12)',
                    }}
                  >
                    {config.icono}
                  </motion.button>
                  {i < eventos.length - 1 && (
                    <div
                      className="w-px flex-1 min-h-[32px]"
                      style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                    />
                  )}
                </div>

                <div className="pb-5 flex-1 min-w-0 pt-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={cn(
                        'text-xs font-body tracking-widest uppercase font-medium',
                        config.color
                      )}
                    >
                      {EVENTO_LABELS[evento.tipo] ?? evento.tipo}
                    </p>
                    <p className="text-xs text-muted-foreground/40 font-body flex-shrink-0">
                      {fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed mt-0.5">
                    {evento.contenido}
                  </p>
                  <button
                    type="button"
                    onClick={() => setEventoActivo(evento)}
                    className="text-xs text-muted-foreground/40 font-body mt-1 hover:text-amber/60 transition-colors"
                  >
                    Ver detalle →
                  </button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      <AnimatePresence>
        {eventoActivo && (
          <PanelBitacora
            evento={eventoActivo}
            onCerrar={() => setEventoActivo(null)}
            fechaInicioReto={fechaInicioReto}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function LayoutLore({
  entradas,
  mentorAsignado,
}: {
  entradas: EntradaLore[]
  mentorAsignado?: string | null
}) {
  const [seleccionada, setSeleccionada] = useState<EntradaLore>(() => entradas[0])
  const [mobileDetalle, setMobileDetalle] = useState(false)

  function seleccionar(e: EntradaLore) {
    setSeleccionada(e)
    setMobileDetalle(true)
  }

  return (
    <>
      <div className="hidden sm:grid grid-cols-[280px_1fr] border border-border rounded-xl overflow-hidden min-h-[540px]">
        <div className="border-r border-border overflow-y-auto bg-surface-1/50">
          <ListaEntradas
            entradas={entradas}
            seleccionada={seleccionada}
            onSeleccionar={setSeleccionada}
            mentorAsignado={mentorAsignado}
          />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={seleccionada.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-y-auto"
          >
            <DetalleLore entrada={seleccionada} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="sm:hidden">
        <ListaEntradas
          entradas={entradas}
          seleccionada={seleccionada}
          onSeleccionar={seleccionar}
          mentorAsignado={mentorAsignado}
        />
      </div>

      <AnimatePresence>
        {mobileDetalle && (
          <motion.div
            key={seleccionada.id}
            className="fixed inset-0 z-50 sm:hidden bg-background overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
          >
            <DetalleLore entrada={seleccionada} onClose={() => setMobileDetalle(false)} />
            <div className="px-5 pb-8">
              <button
                type="button"
                onClick={() => setMobileDetalle(false)}
                className="w-full py-3 text-xs text-muted-foreground font-body border border-border rounded-xl hover:text-foreground transition-colors"
              >
                ← Volver a la lista
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function CodexClient({
  agonistaNombre,
  agonistaNivel,
  mentorAsignado,
  pacto,
  bitacora,
  cronicas: cronicasProp,
  fechaInicioReto,
}: Props) {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<TabKey>(() => parseTab(searchParams.get('seccion')))

  useEffect(() => {
    setTab(parseTab(searchParams.get('seccion')))
  }, [searchParams])

  const tabsUniverso = TABS.filter((t) => !t.personal)
  const tabsPersonales = TABS.filter((t) => t.personal)

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground/70 font-body">
        <span className="text-foreground font-medium">{agonistaNombre}</span>
        {' · '}
        <span className="text-amber/80">{agonistaNivel}</span>
      </p>

      <div className="space-y-2">
        <div className={tabScrollClass}>
          {tabsUniverso.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'flex-shrink-0 px-3.5 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-wide transition-all',
                tab === t.key
                  ? 'bg-amber text-black'
                  : 'bg-surface-1 border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={tabScrollClass}>
          <span className="flex-shrink-0 text-xs text-muted-foreground/40 font-body self-center pr-1">
            Tu historia:
          </span>
          {tabsPersonales.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'flex-shrink-0 px-3.5 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-wide transition-all',
                tab === t.key
                  ? 'bg-amber text-black'
                  : 'bg-surface-1 border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'mundo' && <LayoutLore entradas={LORE_MUNDO} />}
          {tab === 'dioses' && <LayoutLore entradas={LORE_DIOSES} />}
          {tab === 'mentores' && (
            <LayoutLore entradas={LORE_MENTORES} mentorAsignado={mentorAsignado} />
          )}
          {tab === 'facciones' && <LayoutLore entradas={LORE_FACCIONES} />}
          {tab === 'inscripciones' && <SeccionInscripciones />}
          {tab === 'cronicas' && <SeccionCronicas cronicas={cronicasProp} />}
          {tab === 'contrato' && <SeccionContrato pacto={pacto} mentorAsignado={mentorAsignado} />}
          {tab === 'bitacora' && (
            <SeccionBitacora
              bitacora={bitacora}
              fechaInicioReto={fechaInicioReto}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
