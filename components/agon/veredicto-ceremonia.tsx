'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { KleosBadge } from './kleos-badge'
import { NIVEL_ICONOS, NIVEL_LABELS } from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'

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
  fraseVeredicto: string
}

type Fase = 'cargando' | 'intro' | 'stats' | 'oraculo' | 'veredicto'

// ─── BARRA COMPARATIVA ────────────────────────────────────────────────────────

function BarraComparativa({
  label,
  valor1,
  valor2,
  nombre1,
  nombre2,
  delay = 0,
}: {
  label: string
  valor1: number
  valor2: number
  nombre1: string
  nombre2: string
  delay?: number
}) {
  const total = valor1 + valor2
  const pct1 = total === 0 ? 50 : Math.round((valor1 / total) * 100)
  const pct2 = 100 - pct1
  const gana1 = valor1 > valor2
  const gana2 = valor2 > valor1

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between text-xs font-body">
        <span
          className={cn(
            'font-medium tabular-nums',
            gana1 ? 'text-amber' : 'text-muted-foreground'
          )}
        >
          {valor1.toLocaleString('es-CL')}
        </span>
        <span className="text-muted-foreground/60 tracking-widest uppercase text-[10px]">
          {label}
        </span>
        <span
          className={cn(
            'font-medium tabular-nums',
            gana2 ? 'text-amber' : 'text-muted-foreground'
          )}
        >
          {valor2.toLocaleString('es-CL')}
        </span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-surface-2">
        <motion.div
          className="h-full rounded-l-full"
          style={{ background: gana1 ? 'hsl(43 96% 56%)' : 'hsl(0 0% 25%)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct1}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
        />
        <motion.div
          className="h-full rounded-r-full"
          style={{ background: gana2 ? 'hsl(43 96% 56%)' : 'hsl(0 0% 25%)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct2}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}

// ─── TARJETA AGONISTA ─────────────────────────────────────────────────────────

function TarjetaAgonista({
  agonista,
  esGanador,
  delay = 0,
}: {
  agonista: DatosAgonista
  esGanador: boolean
  delay?: number
}) {
  // Buscar el nivel key a partir del label
  const nivelKey =
    (Object.keys(NIVEL_LABELS) as NivelKey[]).find((k) => NIVEL_LABELS[k] === agonista.nivel) ??
    'aspirante'
  const NivelIcon = NIVEL_ICONOS[nivelKey]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'rounded-2xl border p-5 space-y-4 relative overflow-hidden',
        esGanador ? 'border-amber/50 bg-surface-1' : 'border-border bg-surface-1/60'
      )}
    >
      {esGanador && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at top, rgba(245,158,11,0.06) 0%, transparent 70%)',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center border',
            esGanador ? 'border-amber/30 bg-amber/10' : 'border-border bg-surface-2'
          )}
        >
          <NivelIcon size={18} className={esGanador ? 'text-amber' : 'text-muted-foreground'} />
        </div>
        <div>
          <p className={cn('font-display text-base font-bold', esGanador ? 'text-amber' : 'text-foreground')}>
            {agonista.nombre}
          </p>
          <p className="text-xs text-muted-foreground font-body">{agonista.nivel}</p>
        </div>
        {esGanador && (
          <motion.span
            className="ml-auto text-lg"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            👑
          </motion.span>
        )}
      </div>

      <KleosBadge cantidad={agonista.kleosTotal} size="lg" />

      <div className="grid grid-cols-2 gap-2 text-xs font-body">
        {[
          { label: 'Días perfectos', valor: agonista.diasPerfectos },
          { label: 'Hegemonías', valor: agonista.hegemonias },
          { label: 'Inscripciones', valor: agonista.inscripciones },
          {
            label: 'Contrato',
            valor: agonista.cumplioContrato ? '✓' : '✗',
            esTexto: true,
            color: agonista.cumplioContrato ? 'text-amber' : 'text-danger',
          },
        ].map((m) => (
          <div key={m.label} className="bg-surface-2 rounded-lg px-3 py-2 space-y-0.5">
            <p className="text-muted-foreground/70">{m.label}</p>
            <p
              className={cn(
                'font-medium',
                m.color ?? (esGanador ? 'text-amber' : 'text-foreground')
              )}
            >
              {m.valor}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── BOTÓN DE ACCIÓN ──────────────────────────────────────────────────────────

function BotonAccion({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="w-full py-4 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-amber/90 transition-colors"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  )
}

// ─── CEREMONIA PRINCIPAL ──────────────────────────────────────────────────────

export function VeredictoCeremonia() {
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null)
  const [fase, setFase] = useState<Fase>('cargando')
  const [error, setError] = useState<string | null>(null)
  const [exportando, setExportando] = useState(false)

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

  async function exportarDatos() {
    setExportando(true)
    try {
      const res = await fetch('/api/veredicto/exportar')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'gran-agon-datos.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silencioso
    } finally {
      setExportando(false)
    }
  }

  if (fase === 'cargando') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="text-4xl opacity-30"
        >
          ⚖️
        </motion.div>
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

  const ganador1 = veredicto.ganador === veredicto.agonista1.nombre
  const ganador2 = veredicto.ganador === veredicto.agonista2.nombre

  return (
    <div className="space-y-8 pb-12">
      {/* ─── HEADER ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="pt-2 text-center space-y-3"
      >
        <p className="text-xs text-amber tracking-widest uppercase font-body">13 de mayo de 2026</p>
        <h1 className="font-display text-3xl font-bold tracking-wide">El Gran Agon ha concluido.</h1>
        <p className="text-sm text-muted-foreground font-body">
          29 días. Dos agonistas. El Altis emite su veredicto.
        </p>
      </motion.div>

      <div className="h-px bg-gradient-to-r from-transparent via-amber/30 to-transparent" />

      {/* ─── FASE STATS ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {(fase === 'stats' || fase === 'oraculo' || fase === 'veredicto') && (
          <motion.div
            key="stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <p className="text-xs text-muted-foreground tracking-widest uppercase font-body text-center">
              El registro del Altis
            </p>

            <div className="grid grid-cols-2 gap-3">
              <TarjetaAgonista agonista={veredicto.agonista1} esGanador={ganador1} delay={0.1} />
              <TarjetaAgonista agonista={veredicto.agonista2} esGanador={ganador2} delay={0.2} />
            </div>

            <div className="space-y-4 px-1">
              <BarraComparativa
                label="Kleos"
                valor1={veredicto.agonista1.kleosTotal}
                valor2={veredicto.agonista2.kleosTotal}
                nombre1={veredicto.agonista1.nombre}
                nombre2={veredicto.agonista2.nombre}
                delay={0.3}
              />
              <BarraComparativa
                label="Días perfectos"
                valor1={veredicto.agonista1.diasPerfectos}
                valor2={veredicto.agonista2.diasPerfectos}
                nombre1={veredicto.agonista1.nombre}
                nombre2={veredicto.agonista2.nombre}
                delay={0.4}
              />
              <BarraComparativa
                label="Hegemonías"
                valor1={veredicto.agonista1.hegemonias}
                valor2={veredicto.agonista2.hegemonias}
                nombre1={veredicto.agonista1.nombre}
                nombre2={veredicto.agonista2.nombre}
                delay={0.5}
              />
              <BarraComparativa
                label="Inscripciones"
                valor1={veredicto.agonista1.inscripciones}
                valor2={veredicto.agonista2.inscripciones}
                nombre1={veredicto.agonista1.nombre}
                nombre2={veredicto.agonista2.nombre}
                delay={0.6}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FASE ORÁCULO ───────────────────────────────────────────── */}
      <AnimatePresence>
        {(fase === 'oraculo' || fase === 'veredicto') && (
          <motion.div
            key="oraculo"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-px bg-border flex-1" />
              <p className="text-xs text-amber tracking-widest uppercase font-body">El Oráculo habla</p>
              <div className="h-px bg-border flex-1" />
            </div>

            {[veredicto.agonista1, veredicto.agonista2].map((a, i) => (
              <motion.div
                key={a.nombre}
                initial={{ opacity: 0, x: i === 0 ? -16 : 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="bg-surface-1 rounded-xl border border-amber/20 p-5 space-y-2"
              >
                <p className="text-xs text-amber/60 font-body tracking-widest uppercase">
                  {a.nombre} escribió el día 1:
                </p>
                <p className="text-sm font-body text-foreground leading-relaxed italic">
                  &ldquo;{a.oraculo ?? 'El Oráculo permanece en silencio.'}&rdquo;
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FASE VEREDICTO ─────────────────────────────────────────── */}
      <AnimatePresence>
        {fase === 'veredicto' && (
          <motion.div
            key="veredicto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="h-px bg-border flex-1" />
              <p className="text-xs text-amber tracking-widest uppercase font-body">El Veredicto del Altis</p>
              <div className="h-px bg-border flex-1" />
            </div>

            <motion.div
              className="relative rounded-2xl border border-amber/40 bg-surface-1 p-8 text-center space-y-6 overflow-hidden"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              {/* Halo de fondo */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(245,158,11,0.08) 0%, transparent 70%)',
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />

              {veredicto.empate ? (
                <div className="space-y-4 relative">
                  <motion.span
                    className="text-6xl block"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    ⚖️
                  </motion.span>
                  <div className="space-y-2">
                    <p className="font-display text-2xl font-bold text-foreground">
                      El Altis no puede decidir.
                    </p>
                    <p className="text-sm text-muted-foreground font-body leading-relaxed">
                      Ambos agonistas terminaron igualados. El Gran Agon los forjó por igual.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 relative">
                  <motion.span
                    className="text-6xl block"
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.2 }}
                  >
                    🏛️
                  </motion.span>
                  <div className="space-y-1">
                    <p className="text-xs text-amber/70 tracking-widest uppercase font-body">
                      El Altis inscribe en piedra
                    </p>
                    <motion.p
                      className="font-display text-3xl font-bold text-amber"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      {veredicto.ganador}
                    </motion.p>
                    <motion.p
                      className="text-sm text-muted-foreground font-body"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      conquistó el Gran Agon.
                    </motion.p>
                  </div>
                </div>
              )}

              {/* Frase generada por Claude */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.7 }}
                className="pt-4 border-t border-border/60 space-y-1"
              >
                <p className="text-xs text-muted-foreground/40 tracking-widest uppercase font-body">
                  El Altis inscribe
                </p>
                <p className="text-sm text-muted-foreground/80 font-body italic leading-relaxed">
                  &ldquo;{veredicto.fraseVeredicto}&rdquo;
                </p>
              </motion.div>
            </motion.div>

            {/* Botón exportar */}
            <motion.button
              type="button"
              onClick={exportarDatos}
              disabled={exportando}
              className="w-full py-3 rounded-xl border border-border text-xs text-muted-foreground font-body font-medium tracking-widest uppercase hover:border-amber/30 hover:text-foreground transition-all disabled:opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {exportando ? 'Exportando...' : 'Exportar datos del Gran Agon'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── BOTONES DE AVANCE ──────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {fase === 'intro' && (
          <BotonAccion key="btn-stats" onClick={() => setFase('stats')}>
            Ver los resultados del Gran Agon
          </BotonAccion>
        )}
        {fase === 'stats' && (
          <BotonAccion key="btn-oraculo" onClick={() => setFase('oraculo')}>
            Revelar el Oráculo
          </BotonAccion>
        )}
        {fase === 'oraculo' && (
          <BotonAccion key="btn-veredicto" onClick={() => setFase('veredicto')}>
            El Altis emite su veredicto
          </BotonAccion>
        )}
      </AnimatePresence>
    </div>
  )
}
