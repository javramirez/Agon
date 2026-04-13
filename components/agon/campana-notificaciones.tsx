'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNotificacionesCount, useNotificaciones } from '@/hooks/use-notificaciones'
import { cn } from '@/lib/utils'
import type { Notificacion } from '@/lib/db/schema'

type TipoConfig = {
  icono: string
  color: string
  colorFondo: string
  borde: string
}

// ─── ICONOS Y CONFIG POR TIPO ─────────────────────────────────────────────────

const TIPO_CONFIG: Record<string, TipoConfig> = {
  inscripcion_desbloqueada: {
    icono: '📜',
    color: 'text-amber',
    colorFondo: 'rgba(245,158,11,0.08)',
    borde: 'rgba(245,158,11,0.45)',
  },
  nivel_subido: {
    icono: '⬆️',
    color: 'text-amber',
    colorFondo: 'rgba(245,158,11,0.08)',
    borde: 'rgba(245,158,11,0.45)',
  },
  comentario_dios: {
    icono: '⚡',
    color: 'text-blue-400',
    colorFondo: 'rgba(59,130,246,0.06)',
    borde: 'rgba(59,130,246,0.45)',
  },
  hegemonia_ganada: {
    icono: '👑',
    color: 'text-amber',
    colorFondo: 'rgba(245,158,11,0.08)',
    borde: 'rgba(245,158,11,0.45)',
  },
  prueba_extraordinaria: {
    icono: '🌟',
    color: 'text-amber',
    colorFondo: 'rgba(245,158,11,0.06)',
    borde: 'rgba(245,158,11,0.35)',
  },
  senalamiento: {
    icono: '🎯',
    color: 'text-red-400',
    colorFondo: 'rgba(239,68,68,0.06)',
    borde: 'rgba(239,68,68,0.45)',
  },
  provocacion: {
    icono: '🗣️',
    color: 'text-orange-400',
    colorFondo: 'rgba(251,146,60,0.06)',
    borde: 'rgba(251,146,60,0.45)',
  },
  antagonista_activo: {
    icono: '⚔️',
    color: 'text-muted-foreground',
    colorFondo: 'rgba(255,255,255,0.03)',
    borde: 'rgba(255,255,255,0.15)',
  },
  mentor: {
    icono: '🏛️',
    color: 'text-amber',
    colorFondo: 'rgba(245,158,11,0.08)',
    borde: 'rgba(245,158,11,0.35)',
  },
}

const DEFAULT_TIPO: TipoConfig = {
  icono: '◆',
  color: 'text-muted-foreground',
  colorFondo: 'rgba(255,255,255,0.03)',
  borde: 'rgba(255,255,255,0.12)',
}

// ─── ITEM INDIVIDUAL ─────────────────────────────────────────────────────────

function NotificacionItem({
  notificacion,
  index,
}: {
  notificacion: Notificacion
  index: number
}) {
  const config = TIPO_CONFIG[notificacion.tipo] ?? DEFAULT_TIPO

  const [tiempo, setTiempo] = useState('')

  useEffect(() => {
    setTiempo(
      formatDistanceToNow(new Date(notificacion.createdAt as string | Date), {
        addSuffix: true,
        locale: es,
      })
    )
  }, [notificacion.createdAt])

  const esNueva = !notificacion.leida

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={cn(
        'flex gap-3 px-4 py-3 transition-all duration-200 border-l-2 border-transparent',
        esNueva ? 'opacity-100' : 'opacity-50'
      )}
      style={{
        background: esNueva ? config.colorFondo : 'transparent',
        borderLeftColor: esNueva ? config.borde : 'transparent',
      }}
    >
      <span className="text-lg flex-shrink-0 mt-0.5">{config.icono}</span>

      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-xs font-display font-bold leading-tight',
              esNueva ? config.color : 'text-muted-foreground'
            )}
          >
            {notificacion.titulo}
          </p>
          {esNueva && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-xs text-muted-foreground font-body leading-snug">
          {notificacion.descripcion}
        </p>
        {tiempo && (
          <p className="text-xs text-muted-foreground/40 font-body">{tiempo}</p>
        )}
      </div>
    </motion.div>
  )
}

// ─── PANEL DE NOTIFICACIONES ──────────────────────────────────────────────────

function NotificacionesPanel({
  onMarcarLeidas,
}: {
  onCerrar: () => void
  onMarcarLeidas: () => void
}) {
  const { notificaciones, cargando, cargar, marcarLeidas } = useNotificaciones()

  useEffect(() => {
    void cargar()
  }, [cargar])

  async function handleMarcarLeidas() {
    await marcarLeidas()
    await cargar()
    onMarcarLeidas()
  }

  const tienenNoLeidas = notificaciones.some((n) => !n.leida)

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden z-[70]"
      style={{
        background: 'rgba(10,10,10,0.98)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,158,11,0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="h-px bg-gradient-to-r from-transparent via-amber/40 to-transparent" />

      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <p className="text-xs font-display font-bold tracking-widest uppercase text-foreground">
          Notificaciones
        </p>
        {tienenNoLeidas && (
          <button
            type="button"
            onClick={() => void handleMarcarLeidas()}
            className="text-xs text-amber/60 hover:text-amber font-body transition-colors"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {cargando ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-muted-foreground font-body animate-pulse">
              El Altis consulta...
            </p>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="px-4 py-8 text-center space-y-2">
            <p className="text-2xl opacity-20">⚖️</p>
            <p className="text-xs text-muted-foreground/50 font-body">
              Sin notificaciones aún.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notificaciones.map((n, i) => (
              <NotificacionItem key={n.id} notificacion={n} index={i} />
            ))}
          </div>
        )}
      </div>

      {notificaciones.length > 0 && (
        <div className="border-t border-white/5 px-4 py-2.5 text-center">
          <p className="text-xs text-muted-foreground/30 font-body">
            Últimas 50 notificaciones
          </p>
        </div>
      )}
    </motion.div>
  )
}

// ─── CAMPANA PRINCIPAL ────────────────────────────────────────────────────────

export function CampanaNotificaciones() {
  const [open, setOpen] = useState(false)
  const { count, refetch } = useNotificacionesCount()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const handleAbrir = useCallback(async () => {
    const abriendo = !open
    setOpen(abriendo)

    if (abriendo) {
      await new Promise((r) => setTimeout(r, 300))
      try {
        await fetch('/api/notificaciones', { method: 'PATCH' })
        void refetch()
      } catch {
        // Silencioso
      }
    }
  }, [open, refetch])

  function handleMarcarLeidas() {
    void refetch()
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => void handleAbrir()}
        className={cn(
          'relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200',
          open
            ? 'text-amber bg-amber/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-surface-1'
        )}
        aria-label={`Notificaciones${count > 0 ? ` (${count} nuevas)` : ''}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-amber text-black text-[10px] font-bold font-body flex items-center justify-center px-1 leading-none"
            >
              {count > 9 ? '9+' : count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <NotificacionesPanel
            onCerrar={() => setOpen(false)}
            onMarcarLeidas={handleMarcarLeidas}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
