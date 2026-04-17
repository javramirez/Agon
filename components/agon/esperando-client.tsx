'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  modo: 'solo' | 'duelo'
  estado: 'configurando' | 'programado'
  codigoInvitacion: string | null
  fechaInicio: string | null
  rolActual: 'creador' | 'invitado'
  ambosSellaronPacto: boolean
  fechaConfirmadaPorCreador: boolean
  fechaConfirmadaPorInvitado: boolean
}

function formatearFecha(fechaStr: string): string {
  return new Date(`${fechaStr}T12:00:00`).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function opcionesFecha() {
  const hoy = new Date()
  return [0, 1, 2].map((offset) => {
    const d = new Date(hoy)
    d.setDate(d.getDate() + offset)
    const iso = d.toISOString().split('T')[0]!
    const label = offset === 0 ? 'Hoy' : offset === 1 ? 'Mañana' : 'Pasado mañana'
    return { iso, label, fecha: formatearFecha(iso) }
  })
}

function SelectorFecha({
  onConfirmar,
  cargando,
  titulo,
  descripcion,
}: {
  onConfirmar: (fecha: string, accion: string) => void
  cargando: boolean
  titulo: string
  descripcion: string
}) {
  const [seleccionada, setSeleccionada] = useState<string | null>(null)
  const opciones = opcionesFecha()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold">{titulo}</h2>
        <p className="text-sm text-muted-foreground font-body leading-relaxed">
          {descripcion}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {opciones.map((op) => (
          <motion.button
            key={op.iso}
            type="button"
            onClick={() => setSeleccionada(op.iso)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="text-left p-4 rounded-xl border-2 transition-all duration-200"
            style={{
              borderColor:
                seleccionada === op.iso
                  ? 'rgba(245,158,11,0.8)'
                  : 'rgba(255,255,255,0.08)',
              background:
                seleccionada === op.iso
                  ? 'rgba(245,158,11,0.06)'
                  : 'rgba(255,255,255,0.02)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="font-display font-bold text-sm"
                  style={{ color: seleccionada === op.iso ? '#F59E0B' : undefined }}
                >
                  {op.label}
                </p>
                <p className="text-xs text-muted-foreground font-body capitalize">
                  {op.fecha}
                </p>
              </div>
              {seleccionada === op.iso && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-5 h-5 rounded-full bg-amber flex items-center justify-center"
                >
                  <span className="text-black text-xs font-bold">✓</span>
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <motion.button
        type="button"
        onClick={() => seleccionada && onConfirmar(seleccionada, 'proponer')}
        disabled={!seleccionada || cargando}
        whileHover={{ scale: seleccionada ? 1.02 : 1 }}
        whileTap={{ scale: seleccionada ? 0.97 : 1 }}
        className="w-full py-4 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-amber/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {cargando ? 'Guardando...' : 'Confirmar fecha'}
      </motion.button>
    </div>
  )
}

export function EsperandoClient({
  modo,
  estado,
  codigoInvitacion,
  fechaInicio,
  rolActual,
  ambosSellaronPacto,
  fechaConfirmadaPorCreador,
  fechaConfirmadaPorInvitado,
}: Props) {
  const { signOut } = useClerk()
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [emailEnviado, setEmailEnviado] = useState(false)
  const [errorEmail, setErrorEmail] = useState('')
  const [cargandoFecha, setCargandoFecha] = useState(false)
  const [errorFecha, setErrorFecha] = useState('')
  const [fechaGuardada, setFechaGuardada] = useState(fechaInicio)
  const [estadoLocal, setEstadoLocal] = useState(estado)
  const [confirmadoCreador, setConfirmadoCreador] = useState(fechaConfirmadaPorCreador)
  const [confirmadoInvitado, setConfirmadoInvitado] = useState(fechaConfirmadaPorInvitado)
  const router = useRouter()

  useEffect(() => {
    setFechaGuardada(fechaInicio)
    setEstadoLocal(estado)
    setConfirmadoCreador(fechaConfirmadaPorCreador)
    setConfirmadoInvitado(fechaConfirmadaPorInvitado)
  }, [fechaInicio, estado, fechaConfirmadaPorCreador, fechaConfirmadaPorInvitado])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const linkInvitacion = codigoInvitacion
    ? `${appUrl.replace(/\/$/, '')}/unirse/${codigoInvitacion}`
    : null

  async function enviarInvitacion() {
    if (!email || enviando) return
    setEnviando(true)
    setErrorEmail('')
    try {
      const res = await fetch('/api/retos/invitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailRival: email }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? 'Error al enviar')
      }
      setEmailEnviado(true)
      setEmail('')
    } catch (err) {
      setErrorEmail(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setEnviando(false)
    }
  }

  async function accionFecha(fecha: string, accion: string) {
    setCargandoFecha(true)
    setErrorFecha('')
    try {
      const res = await fetch('/api/retos/fecha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion, fecha }),
      })
      const data = (await res.json()) as { error?: string; estado?: string }
      if (!res.ok) {
        throw new Error(data.error ?? 'Error al guardar la fecha')
      }

      setFechaGuardada(fecha)

      if (data.estado === 'programado') {
        setEstadoLocal('programado')
        setConfirmadoCreador(true)
        setConfirmadoInvitado(true)
        setTimeout(() => router.refresh(), 1500)
      } else if (data.estado === 'esperando_confirmacion') {
        setConfirmadoCreador(true)
        setConfirmadoInvitado(false)
        setTimeout(() => router.refresh(), 800)
      } else if (data.estado === 'esperando_confirmacion_creador') {
        setConfirmadoInvitado(true)
        setConfirmadoCreador(false)
        setTimeout(() => router.refresh(), 800)
      }
    } catch (err) {
      setErrorFecha(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setCargandoFecha(false)
    }
  }

  const mostrarSelectorCreador =
    ambosSellaronPacto &&
    rolActual === 'creador' &&
    !confirmadoCreador &&
    modo === 'duelo'

  const mostrarSelectorInvitado =
    ambosSellaronPacto &&
    rolActual === 'invitado' &&
    confirmadoCreador &&
    !confirmadoInvitado &&
    Boolean(fechaGuardada) &&
    modo === 'duelo'

  const mostrarReconfirmacionCreador =
    rolActual === 'creador' &&
    !confirmadoCreador &&
    confirmadoInvitado &&
    Boolean(fechaGuardada) &&
    modo === 'duelo' &&
    ambosSellaronPacto

  const esperandoConfirmacionInvitadoPropuesta =
    estadoLocal === 'configurando' &&
    modo === 'duelo' &&
    ambosSellaronPacto &&
    rolActual === 'invitado' &&
    !confirmadoCreador &&
    !fechaGuardada &&
    !mostrarSelectorInvitado

  const esperandoConfirmacionCreador =
    estadoLocal === 'configurando' &&
    modo === 'duelo' &&
    ambosSellaronPacto &&
    rolActual === 'creador' &&
    confirmadoCreador &&
    !confirmadoInvitado &&
    !mostrarSelectorCreador

  const esperandoConfirmacionInvitadoAlternativa =
    estadoLocal === 'configurando' &&
    modo === 'duelo' &&
    ambosSellaronPacto &&
    rolActual === 'invitado' &&
    confirmadoInvitado &&
    !confirmadoCreador &&
    Boolean(fechaGuardada) &&
    !mostrarSelectorInvitado

  return (
    <div className="min-h-screen bg-[#080808] text-foreground flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full space-y-8"
      >
        {estadoLocal === 'programado' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <motion.div
              animate={{ rotate: [0, -3, 3, -2, 2, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="text-6xl"
            >
              ⏳
            </motion.div>
            <p className="text-xs text-amber/70 tracking-widest uppercase font-body">
              Reto programado
            </p>
            <h2 className="font-display text-2xl font-bold">
              El Gran Agon comienza pronto
            </h2>
            {fechaGuardada && (
              <p className="text-sm text-muted-foreground font-body">
                Fecha de inicio:{' '}
                <span className="text-amber font-bold capitalize">
                  {formatearFecha(fechaGuardada)}
                </span>
              </p>
            )}
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Cuando llegue el día, el dashboard se desbloqueará automáticamente.
            </p>
          </motion.div>
        )}

        {estadoLocal === 'configurando' && modo === 'solo' && ambosSellaronPacto && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <motion.div className="text-5xl">⚡</motion.div>
              <p className="text-xs text-amber/70 tracking-widest uppercase font-body">
                Modo Solo
              </p>
            </div>
            <SelectorFecha
              titulo="¿Cuándo comienza tu Agon?"
              descripcion="Tienes hasta pasado mañana para comenzar. Una vez elegida, la fecha queda inscrita en el Altis."
              onConfirmar={accionFecha}
              cargando={cargandoFecha}
            />
            {errorFecha && (
              <p className="text-red-400 text-xs font-body text-center">{errorFecha}</p>
            )}
          </div>
        )}

        {estadoLocal === 'configurando' && modo === 'solo' && !ambosSellaronPacto && (
          <div className="text-center space-y-4">
            <div className="text-5xl">📜</div>
            <p className="text-xs text-amber/70 tracking-widest uppercase font-body">Modo Solo</p>
            <h2 className="font-display text-2xl font-bold">Completa el Pacto</h2>
            <p className="text-sm text-muted-foreground font-body">
              Completa el Pacto Inicial para elegir tu fecha de inicio.
            </p>
          </div>
        )}

        {estadoLocal === 'configurando' && modo === 'duelo' && !ambosSellaronPacto && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: [0, -3, 3, -2, 2, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="text-6xl"
              >
                ⚔️
              </motion.div>
              <p className="text-xs text-amber/70 tracking-widest uppercase font-body">
                Modo Duelo
              </p>
              <h2 className="font-display text-2xl font-bold">
                Esperando al antagonista
              </h2>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Tu reto está listo. Comparte el link o código con tu rival.
                El desafío comenzará cuando ambos hayan completado el Pacto Inicial.
              </p>
            </div>

            {linkInvitacion && (
              <div className="space-y-3">
                <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-2">
                  <p className="text-xs text-amber/70 uppercase tracking-wide font-body">
                    Link de invitación
                  </p>
                  <p className="text-sm font-body text-foreground break-all">
                    {linkInvitacion}
                  </p>
                </div>
                <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-2">
                  <p className="text-xs text-amber/70 uppercase tracking-wide font-body">
                    Código
                  </p>
                  <p className="font-display text-3xl font-bold text-amber tracking-widest">
                    {codigoInvitacion}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs text-amber/70 uppercase tracking-wide font-body">
                    O invitar por email
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@rival.com"
                      className="flex-1 bg-surface-1 border border-border rounded-xl px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber/50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={enviarInvitacion}
                      disabled={!email || enviando}
                      className="px-4 py-3 bg-amber text-black font-display font-bold text-xs tracking-widest uppercase rounded-xl hover:bg-amber/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {enviando ? '...' : 'Enviar'}
                    </button>
                  </div>
                  <AnimatePresence>
                    {emailEnviado && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-green-400 font-body"
                      >
                        Invitación enviada correctamente.
                      </motion.p>
                    )}
                    {errorEmail && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-400 font-body"
                      >
                        {errorEmail}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}

        {estadoLocal === 'configurando' && mostrarSelectorCreador && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-5xl">📅</div>
              <p className="text-xs text-amber/70 tracking-widest uppercase font-body">
                Modo Duelo
              </p>
            </div>
            <SelectorFecha
              titulo="Propón la fecha de inicio"
              descripcion="Tu antagonista deberá confirmar o proponer una alternativa dentro de la ventana disponible."
              onConfirmar={(fecha, acc) => accionFecha(fecha, acc)}
              cargando={cargandoFecha}
            />
            {errorFecha && (
              <p className="text-red-400 text-xs font-body text-center">{errorFecha}</p>
            )}
          </div>
        )}

        {estadoLocal === 'configurando' && mostrarSelectorInvitado && fechaGuardada && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl">⚖️</div>
              <p className="text-xs text-amber/70 tracking-widest uppercase font-body">
                Modo Duelo
              </p>
              <h2 className="font-display text-2xl font-bold">Fecha propuesta</h2>
              <p className="text-sm text-muted-foreground font-body">
                Tu antagonista propone comenzar el{' '}
                <span className="text-amber font-bold capitalize">
                  {formatearFecha(fechaGuardada)}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <motion.button
                type="button"
                onClick={() => accionFecha(fechaGuardada, 'confirmar')}
                disabled={cargandoFecha}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-amber/90 transition-colors disabled:opacity-40"
              >
                {cargandoFecha ? 'Guardando...' : 'Aceptar esta fecha'}
              </motion.button>

              <p className="text-xs text-muted-foreground/60 font-body text-center">
                O propón una alternativa
              </p>

              {opcionesFecha()
                .filter((op) => op.iso !== fechaGuardada)
                .map((op) => (
                  <motion.button
                    key={op.iso}
                    type="button"
                    onClick={() => accionFecha(op.iso, 'alternativa')}
                    disabled={cargandoFecha}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3 border border-border bg-surface-1 text-foreground font-body text-sm rounded-xl hover:border-amber/40 transition-colors disabled:opacity-40"
                  >
                    {op.label} —{' '}
                    <span className="capitalize text-muted-foreground">{op.fecha}</span>
                  </motion.button>
                ))}
            </div>
            {errorFecha && (
              <p className="text-red-400 text-xs font-body text-center">{errorFecha}</p>
            )}
          </div>
        )}

        {estadoLocal === 'configurando' && mostrarReconfirmacionCreador && fechaGuardada && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl">🔄</div>
              <p className="text-xs text-amber/70 tracking-widest uppercase font-body">
                Modo Duelo
              </p>
              <h2 className="font-display text-2xl font-bold">Alternativa propuesta</h2>
              <p className="text-sm text-muted-foreground font-body">
                Tu antagonista prefiere comenzar el{' '}
                <span className="text-amber font-bold capitalize">
                  {formatearFecha(fechaGuardada)}
                </span>
              </p>
            </div>
            <motion.button
              type="button"
              onClick={() => accionFecha(fechaGuardada, 'confirmar')}
              disabled={cargandoFecha}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-amber/90 transition-colors disabled:opacity-40"
            >
              {cargandoFecha ? 'Guardando...' : 'Aceptar y comenzar'}
            </motion.button>
            {errorFecha && (
              <p className="text-red-400 text-xs font-body text-center">{errorFecha}</p>
            )}
          </div>
        )}

        {esperandoConfirmacionInvitadoPropuesta && (
          <div className="text-center space-y-4">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl"
            >
              ⏳
            </motion.div>
            <p className="text-xs text-amber/70 tracking-widest uppercase font-body">
              Esperando propuesta
            </p>
            <h2 className="font-display text-xl font-bold">
              Esperando que el creador proponga la fecha de inicio
            </h2>
          </div>
        )}

        {esperandoConfirmacionCreador && (
          <div className="text-center space-y-4">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl"
            >
              ⏳
            </motion.div>
            <p className="text-xs text-amber/70 tracking-widest uppercase font-body">
              Esperando confirmación
            </p>
            <h2 className="font-display text-xl font-bold">
              Esperando que tu antagonista confirme la fecha
            </h2>
            {fechaGuardada && (
              <p className="text-sm text-muted-foreground font-body">
                Fecha propuesta:{' '}
                <span className="text-amber font-bold capitalize">
                  {formatearFecha(fechaGuardada)}
                </span>
              </p>
            )}
          </div>
        )}

        {esperandoConfirmacionInvitadoAlternativa && (
          <div className="text-center space-y-4">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl"
            >
              ⏳
            </motion.div>
            <p className="text-xs text-amber/70 tracking-widest uppercase font-body">
              Esperando confirmación
            </p>
            <h2 className="font-display text-xl font-bold">
              Esperando que el creador confirme tu propuesta
            </h2>
            {fechaGuardada && (
              <p className="text-sm text-muted-foreground font-body">
                Tu alternativa:{' '}
                <span className="text-amber font-bold capitalize">
                  {formatearFecha(fechaGuardada)}
                </span>
              </p>
            )}
          </div>
        )}

        <motion.p
          className="text-xs text-muted-foreground/40 font-body text-center pt-4"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Los dioses del Olimpo aguardan.
        </motion.p>
      </motion.div>

      {modo === 'duelo' && estadoLocal === 'configurando' && (
        <motion.button
          type="button"
          onClick={() => void signOut({ redirectUrl: '/sign-in' })}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="w-full max-w-lg py-3 text-xs text-muted-foreground/50 font-body hover:text-muted-foreground transition-colors"
        >
          Cerrar sesión
        </motion.button>
      )}
    </div>
  )
}
