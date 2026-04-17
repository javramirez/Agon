'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface EstadoAgonista {
  id: string
  nombre: string
  clerkId: string
  rol: string
  nivel: string
  kleosTotal: number
  oraculoSellado: boolean
  mentorAsignado: string | null
  diasRegistrados: number
  inscripciones: number
  logsKleos: number
}

interface EstadoCrisis {
  id: string
  crisisId: string
  semana: number
  resuelta: boolean
  fechaExpiracion: string
  decisionAgonista1: string | null
  decisionAgonista2: string | null
}

interface EstadoReto {
  reto: {
    id: string
    modo: string
    estado: string
    fechaInicio: string | null
    fechaFin: string | null
    creadorClerkId: string
    codigoInvitacion: string | null
    createdAt: string
  }
  agonistas: EstadoAgonista[]
  crisis: EstadoCrisis[]
  totalPosts: number
  diaActual: number | null
  semanaActual: number | null
}

function Badge({ texto, color }: { texto: string; color: string }) {
  return (
    <span
      className="text-xs font-body font-medium px-2 py-0.5 rounded-full border"
      style={{ color, borderColor: `${color}40`, background: `${color}10` }}
    >
      {texto}
    </span>
  )
}

function AccionBtn({
  label,
  onClick,
  cargando,
  variante = 'default',
}: {
  label: string
  onClick: () => void
  cargando: boolean
  variante?: 'default' | 'danger' | 'amber'
}) {
  const colores = {
    default: 'border-border text-muted-foreground hover:border-white/30 hover:text-foreground',
    danger: 'border-red-500/30 text-red-400 hover:border-red-500/60',
    amber: 'border-amber/30 text-amber hover:border-amber/60',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={cargando}
      className={cn(
        'text-xs font-body px-3 py-1.5 rounded-lg border transition-all disabled:opacity-40',
        colores[variante]
      )}
    >
      {cargando ? '...' : label}
    </button>
  )
}

function RetoCard({
  datos,
  onAccion,
}: {
  datos: EstadoReto
  onAccion: (accion: string, retoId?: string, agonistId?: string) => Promise<void>
}) {
  const [cargando, setCargando] = useState<string | null>(null)

  async function ejecutar(accion: string, retoIdArg?: string, agonistIdArg?: string) {
    setCargando(accion + (agonistIdArg ?? ''))
    await onAccion(accion, retoIdArg, agonistIdArg)
    setCargando(null)
  }

  const estadoColor = {
    activo: '#22C55E',
    programado: '#F59E0B',
    configurando: '#3B82F6',
    completado: '#9CA3AF',
  }[datos.reto.estado] ?? '#9CA3AF'

  const esSeed = datos.reto.creadorClerkId.startsWith('seed_')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-1 border border-border rounded-2xl p-5 space-y-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge texto={datos.reto.estado} color={estadoColor} />
            <Badge
              texto={datos.reto.modo}
              color={datos.reto.modo === 'duelo' ? '#C41E1E' : '#F59E0B'}
            />
            {esSeed && <Badge texto="SEED" color="#7C3AED" />}
          </div>
          <p className="text-xs text-muted-foreground font-body font-mono break-all">
            {datos.reto.id}
          </p>
        </div>
        <div className="text-right shrink-0 space-y-0.5">
          {datos.diaActual != null && (
            <p className="font-display text-2xl font-bold text-amber">Día {datos.diaActual}</p>
          )}
          {datos.semanaActual != null && (
            <p className="text-xs text-muted-foreground font-body">Semana {datos.semanaActual}</p>
          )}
        </div>
      </div>

      {datos.reto.fechaInicio && (
        <div className="grid grid-cols-2 gap-2 text-xs font-body">
          <div className="bg-surface-2 rounded-lg p-2 space-y-0.5">
            <p className="text-muted-foreground/60">Inicio</p>
            <p className="text-foreground font-medium">{datos.reto.fechaInicio}</p>
          </div>
          <div className="bg-surface-2 rounded-lg p-2 space-y-0.5">
            <p className="text-muted-foreground/60">Fin</p>
            <p className="text-foreground font-medium">{datos.reto.fechaFin ?? '—'}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs text-amber/70 uppercase tracking-wide font-body">Agonistas</p>
        {datos.agonistas.map((a) => (
          <div key={a.id} className="bg-surface-2 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-body font-medium text-foreground">{a.nombre}</p>
                <p className="text-xs text-muted-foreground font-body font-mono truncate">
                  {a.clerkId}
                </p>
              </div>
              <div className="text-right shrink-0 space-y-0.5">
                <p className="text-sm font-display font-bold text-amber">
                  {a.kleosTotal.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground font-body">kleos</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-xs font-body">
              {[
                { label: 'Días', valor: a.diasRegistrados },
                { label: 'Inscrip.', valor: a.inscripciones },
                { label: 'Logs', valor: a.logsKleos },
              ].map((s) => (
                <div key={s.label} className="bg-surface-1 rounded-lg p-1.5 text-center">
                  <p className="text-foreground font-medium">{s.valor}</p>
                  <p className="text-muted-foreground/60">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              <AccionBtn
                label="Reset kleos"
                onClick={() => ejecutar('resetear_kleos', datos.reto.id, a.id)}
                cargando={cargando === 'resetear_kleos' + a.id}
                variante="danger"
              />
              <AccionBtn
                label="Limpiar notif."
                onClick={() => ejecutar('limpiar_notificaciones', datos.reto.id, a.id)}
                cargando={cargando === 'limpiar_notificaciones' + a.id}
              />
            </div>
          </div>
        ))}
      </div>

      {datos.crisis.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-amber/70 uppercase tracking-wide font-body">
            Crisis ({datos.crisis.length})
          </p>
          {datos.crisis.slice(0, 3).map((c) => (
            <div key={c.id} className="bg-surface-2 rounded-xl p-3 text-xs font-body space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">{c.crisisId}</span>
                <Badge
                  texto={c.resuelta ? 'resuelta' : 'activa'}
                  color={c.resuelta ? '#22C55E' : '#F59E0B'}
                />
              </div>
              <p className="text-muted-foreground">
                Sem {c.semana} · D1: {c.decisionAgonista1 ?? '—'} · D2:{' '}
                {c.decisionAgonista2 ?? '—'}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs text-amber/70 uppercase tracking-wide font-body">Acciones del reto</p>
        <div className="flex gap-2 flex-wrap">
          {datos.reto.estado !== 'activo' && (
            <AccionBtn
              label="Activar reto"
              onClick={() => ejecutar('activar_reto', datos.reto.id)}
              cargando={cargando === 'activar_reto'}
              variante="amber"
            />
          )}
          {datos.reto.estado !== 'completado' && (
            <AccionBtn
              label="Marcar completado"
              onClick={() => ejecutar('completar_reto', datos.reto.id)}
              cargando={cargando === 'completar_reto'}
              variante="danger"
            />
          )}
          <AccionBtn
            label="Limpiar crisis"
            onClick={() => ejecutar('limpiar_crisis', datos.reto.id)}
            cargando={cargando === 'limpiar_crisis'}
            variante="danger"
          />
          <AccionBtn
            label="Limpiar posts dioses"
            onClick={() => ejecutar('limpiar_posts_dioses', datos.reto.id)}
            cargando={cargando === 'limpiar_posts_dioses'}
          />
        </div>
      </div>
    </motion.div>
  )
}

export function AdminClient() {
  const [datos, setDatos] = useState<EstadoReto[]>([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'ok' | 'error' } | null>(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const res = await fetch('/api/admin/debug')
      const data = (await res.json()) as { retos: EstadoReto[] }
      setDatos(data.retos ?? [])
    } catch {
      setMensaje({ texto: 'Error cargando datos', tipo: 'error' })
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargar()
  }, [cargar])

  async function ejecutarAccion(accion: string, retoId?: string, agonistId?: string) {
    try {
      const res = await fetch('/api/admin/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion, retoId, agonistId }),
      })
      const data = (await res.json()) as { ok?: boolean; mensaje?: string; error?: string }
      if (data.ok) {
        setMensaje({ texto: data.mensaje ?? 'Acción ejecutada', tipo: 'ok' })
        void cargar()
      } else {
        setMensaje({ texto: data.error ?? 'Error', tipo: 'error' })
      }
    } catch {
      setMensaje({ texto: 'Error de conexión', tipo: 'error' })
    }
    setTimeout(() => setMensaje(null), 3000)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="pt-2 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-amber/60 tracking-widest uppercase font-body">Admin</p>
          <h1 className="font-display text-2xl font-bold">Panel de Debug</h1>
        </div>
        <button
          type="button"
          onClick={() => void cargar()}
          className="text-xs text-muted-foreground font-body hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5"
        >
          Recargar
        </button>
      </div>

      {mensaje && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={cn(
            'text-xs font-body px-4 py-3 rounded-xl border',
            mensaje.tipo === 'ok'
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          )}
        >
          {mensaje.texto}
        </motion.div>
      )}

      {cargando ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground font-body animate-pulse">
            Cargando estado del Altis...
          </p>
        </div>
      ) : datos.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <p className="text-sm text-muted-foreground font-body">No hay retos en DB.</p>
          <p className="text-xs text-muted-foreground/50 font-body font-mono">
            npx tsx scripts/seed.ts --clerk-id=tu_id --dias=10
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground font-body">
            {datos.length} reto{datos.length !== 1 ? 's' : ''} en DB
          </p>
          {datos.map((d) => (
            <RetoCard key={d.reto.id} datos={d} onAccion={ejecutarAccion} />
          ))}
        </div>
      )}
    </div>
  )
}
