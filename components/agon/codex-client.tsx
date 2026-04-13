'use client'

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
import { cn } from '@/lib/utils'
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
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="relative w-full aspect-[4/3] flex-shrink-0 bg-surface-2">
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
          <div className="space-y-3">
            {entrada.lore.split('\n\n').map((parrafo, i) => (
              <p key={i} className="text-sm text-muted-foreground font-body leading-relaxed">
                {parrafo}
              </p>
            ))}
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

            <span className={cn('text-xl flex-shrink-0', activa ? entrada.color : 'opacity-60')}>
              {entrada.avatar}
            </span>

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

  useEffect(() => {
    fetch('/api/inscripciones')
      .then((r) => r.json())
      .then((d) => setDesbloqueadas((d as { inscripciones: Inscripcion[] }).inscripciones ?? []))
      .finally(() => setCargando(false))
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

      <AnimatePresence>
        {seleccionada && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
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
      </AnimatePresence>
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
    subtitulo: `${fmtFecha(c.fechaInicio)} — ${fmtFecha(c.fechaFin)}`,
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
                  {fmtFecha(seleccionada.fechaInicio)} — {fmtFecha(seleccionada.fechaFin)}
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
    titulo: 'La Ekecheiria — Cláusula de Fuerza Mayor',
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
    agonista: 'Javier',
    cumple: 'Recibe un jockey.',
    falla: 'Publica una historia en inglés exponiendo sus objetivos deportivos y su proceso personal.',
  },
  {
    agonista: 'Matías',
    cumple: 'Recibe 3 Monster blancos de Javier.',
    falla: 'Compra una creatina a Javier.',
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
                Premios y Penitencias — Cláusula Sexta
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
                  { label: 'Mentor asignado', valor: mentorAsignado ?? '—' },
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

const EVENTO_CONFIG: Record<string, { icono: string; color: string; colorBg: string }> = {
  dia_perfecto: {
    icono: '⭐',
    color: 'text-amber',
    colorBg: 'bg-amber/10 border-amber/30',
  },
  nivel_subido: {
    icono: '🏅',
    color: 'text-blue-400',
    colorBg: 'bg-blue-400/10 border-blue-400/30',
  },
  inscripcion_desbloqueada: {
    icono: '📜',
    color: 'text-purple-400',
    colorBg: 'bg-purple-400/10 border-purple-400/30',
  },
  hegemonia_ganada: {
    icono: '👑',
    color: 'text-orange-400',
    colorBg: 'bg-orange-400/10 border-orange-400/30',
  },
  prueba_extraordinaria: {
    icono: '⚡',
    color: 'text-yellow-400',
    colorBg: 'bg-yellow-400/10 border-yellow-400/30',
  },
  senalamiento: {
    icono: '🎯',
    color: 'text-red-400',
    colorBg: 'bg-red-400/10 border-red-400/30',
  },
  cronica_semanal: {
    icono: '📰',
    color: 'text-green-400',
    colorBg: 'bg-green-400/10 border-green-400/30',
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

function SeccionBitacora({ bitacora }: { bitacora: AgoraEvento[] }) {
  const [narracionActiva, setNarracionActiva] = useState<{
    eventoId: string
    texto: string
    mentorNombre: string
    cargando: boolean
  } | null>(null)
  const [tooltipActivo, setTooltipActivo] = useState<string | null>(null)

  async function narrarEvento(evento: AgoraEvento) {
    if (narracionActiva?.eventoId === evento.id && !narracionActiva.cargando) {
      setNarracionActiva(null)
      return
    }

    setNarracionActiva({ eventoId: evento.id, texto: '', mentorNombre: '', cargando: true })

    try {
      const res = await fetch('/api/mentor/narrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoEvento: EVENTO_LABELS[evento.tipo] ?? evento.tipo,
          contenidoEvento: evento.contenido,
          fechaEvento: new Date(evento.createdAt).toLocaleDateString('es-CL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        }),
      })

      if (!res.ok) throw new Error('Error en API')
      const data = (await res.json()) as { narracion: string; mentorNombre: string }
      setNarracionActiva({
        eventoId: evento.id,
        texto: data.narracion,
        mentorNombre: data.mentorNombre,
        cargando: false,
      })
    } catch {
      setNarracionActiva(null)
    }
  }

  if (bitacora.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <span className="text-5xl opacity-20">📜</span>
        <p className="text-sm text-muted-foreground/60 font-body max-w-xs leading-relaxed">
          La Bitácora se escribe con el tiempo. Cada hito del Gran Agon quedará inscrito aquí.
        </p>
      </div>
    )
  }

  const eventos = [...bitacora].reverse()

  return (
    <div className="space-y-6">
      <div className="hidden sm:block">
        <div className="relative overflow-x-auto pb-4">
          <div className="absolute top-10 left-0 right-0 h-px bg-border/60" />

          <div className="flex gap-2 min-w-max px-4">
            {eventos.map((evento, i) => {
              const config = EVENTO_CONFIG[evento.tipo] ?? {
                icono: '◆',
                color: 'text-muted-foreground',
                colorBg: 'bg-surface-1 border-border',
              }
              const esActivo = narracionActiva?.eventoId === evento.id
              const esTooltipActivo = tooltipActivo === evento.id
              const fecha = new Date(evento.createdAt)

              return (
                <div key={evento.id} className="flex flex-col items-center gap-2 w-20 flex-shrink-0">
                  <p className="text-xs text-muted-foreground/50 font-body text-center leading-tight h-8 flex items-end">
                    {fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                  </p>

                  <div className="relative">
                    <motion.button
                      type="button"
                      onClick={() => void narrarEvento(evento)}
                      onMouseEnter={() => setTooltipActivo(evento.id)}
                      onMouseLeave={() => setTooltipActivo(null)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition-all duration-200 relative z-10',
                        esActivo
                          ? cn(config.colorBg, 'shadow-lg scale-110')
                          : cn('bg-surface-1 border-border hover:border-border-strong', config.color)
                      )}
                    >
                      {config.icono}
                    </motion.button>

                    <AnimatePresence>
                      {esTooltipActivo && !esActivo && (
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
                            <p className="text-xs text-muted-foreground/40 font-body mt-0.5">
                              Click para narración del Mentor
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
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="sm:hidden space-y-0">
        {eventos.map((evento, i) => {
          const config = EVENTO_CONFIG[evento.tipo] ?? {
            icono: '◆',
            color: 'text-muted-foreground',
            colorBg: 'bg-surface-1 border-border',
          }
          const esActivo = narracionActiva?.eventoId === evento.id
          const fecha = new Date(evento.createdAt)

          return (
            <motion.div
              key={evento.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex gap-4 items-start"
            >
              <div className="flex flex-col items-center flex-shrink-0">
                <motion.button
                  type="button"
                  onClick={() => void narrarEvento(evento)}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    'w-9 h-9 rounded-full border-2 flex items-center justify-center text-base transition-all duration-200',
                    esActivo ? cn(config.colorBg, 'shadow-md') : 'bg-surface-1 border-border'
                  )}
                >
                  {config.icono}
                </motion.button>
                {i < eventos.length - 1 && <div className="w-px bg-border/40 flex-1 min-h-[32px]" />}
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
                {!esActivo && (
                  <button
                    type="button"
                    onClick={() => void narrarEvento(evento)}
                    className="text-xs text-muted-foreground/40 font-body mt-1 hover:text-amber/60 transition-colors"
                  >
                    Escuchar al Mentor →
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {narracionActiva && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-amber/20 bg-surface-1 p-5 space-y-3"
          >
            {narracionActiva.cargando ? (
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((j) => (
                    <motion.div
                      key={j}
                      className="w-1.5 h-1.5 rounded-full bg-amber/60"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: j * 0.2 }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-body animate-pulse">
                  El Mentor recuerda ese momento...
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-amber/70 font-body tracking-widest uppercase">
                    {narracionActiva.mentorNombre} narra
                  </p>
                  <button
                    type="button"
                    onClick={() => setNarracionActiva(null)}
                    className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors font-body"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-foreground font-body leading-relaxed italic">
                  &ldquo;{narracionActiva.texto}&rdquo;
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
          {tab === 'bitacora' && <SeccionBitacora bitacora={bitacora} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
