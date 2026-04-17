'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PruebaCard } from './prueba-card'
import { AgonCard } from './agon-card'
import { InscripcionOverlay } from './inscripcion-overlay'
import { CierreDramatico } from './cierre-dramatico'
import { mostrarToast } from './toast-agon'
import {
  calcularKleosLocal,
  esDiaPerfectoLocal,
  aplicarCambio,
  type EstadoPruebas,
  type MetasUmbralHabito,
} from '@/lib/kleos-client'
import { NIVEL_LABELS, type NivelKey } from '@/lib/db/constants'
import { METAS_HABITO } from '@/lib/facciones/config'
import type { PruebaDiaria, Llama } from '@/lib/db/schema'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function estadoDesdePrueba(prueba: PruebaDiaria): EstadoPruebas {
  return {
    soloAgua: prueba.soloAgua,
    sinComidaRapida: prueba.sinComidaRapida,
    pasos: prueba.pasos,
    horasSueno: prueba.horasSueno,
    paginasLeidas: prueba.paginasLeidas,
    sesionesGym: prueba.sesionesGym,
    sesionesCardio: prueba.sesionesCardio,
  }
}

function contarCompletados(estado: EstadoPruebas, metas: MetasUmbralHabito): number {
  return [
    estado.soloAgua,
    estado.sinComidaRapida,
    estado.pasos >= metas.pasos,
    estado.horasSueno >= metas.horasSueno,
    estado.paginasLeidas >= metas.paginasLeidas,
    estado.sesionesGym >= metas.sesionesGym,
    estado.sesionesCardio >= metas.sesionesCardio,
  ].filter(Boolean).length
}

function hayCambiosEntre(a: EstadoPruebas, b: EstadoPruebas): boolean {
  return (
    a.soloAgua !== b.soloAgua ||
    a.sinComidaRapida !== b.sinComidaRapida ||
    a.pasos !== b.pasos ||
    a.horasSueno !== b.horasSueno ||
    a.paginasLeidas !== b.paginasLeidas ||
    a.sesionesGym !== b.sesionesGym ||
    a.sesionesCardio !== b.sesionesCardio
  )
}

interface ResumenItem {
  id: string
  label: string
  completado: boolean
  valor: string
}

function buildResumen(estado: EstadoPruebas, metas: MetasUmbralHabito): ResumenItem[] {
  return [
    {
      id: 'agua',
      label: 'Solo agua',
      completado: estado.soloAgua,
      valor: estado.soloAgua ? 'Sí' : 'No',
    },
    {
      id: 'comida',
      label: 'Sin comida rápida',
      completado: estado.sinComidaRapida,
      valor: estado.sinComidaRapida ? 'Sí' : 'No',
    },
    {
      id: 'pasos',
      label: 'Pasos',
      completado: estado.pasos >= metas.pasos,
      valor: `${estado.pasos.toLocaleString()} pasos`,
    },
    {
      id: 'sueno',
      label: 'Horas de sueño',
      completado: estado.horasSueno >= metas.horasSueno,
      valor: `${estado.horasSueno}h`,
    },
    {
      id: 'lectura',
      label: 'Páginas leídas',
      completado: estado.paginasLeidas >= metas.paginasLeidas,
      valor: `${estado.paginasLeidas} páginas`,
    },
    {
      id: 'gym',
      label: 'Gym',
      completado: estado.sesionesGym >= metas.sesionesGym,
      valor: `${estado.sesionesGym} sesiones`,
    },
    {
      id: 'cardio',
      label: 'Cardio',
      completado: estado.sesionesCardio >= metas.sesionesCardio,
      valor: `${estado.sesionesCardio} sesiones`,
    },
  ]
}

// ─── Panel de resumen (desktop + mobile vía portal) ───────────────────────────

function PanelResumen({
  visible,
  estado,
  estadoGuardado,
  kleos,
  diaPerfecto,
  confirmando,
  esEdicion,
  metas,
  onConfirmar,
  onCancelar,
}: {
  visible: boolean
  estado: EstadoPruebas
  estadoGuardado: EstadoPruebas
  kleos: number
  diaPerfecto: boolean
  confirmando: boolean
  esEdicion: boolean
  metas: MetasUmbralHabito
  onConfirmar: () => void
  onCancelar: () => void
}) {
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    setMontado(true)
  }, [])

  if (!montado) return null

  const resumen = buildResumen(estado, metas)
  const completados = contarCompletados(estado, metas)

  return createPortal(
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            key="panel-resumen-backdrop"
            className="fixed inset-0 z-[9999]"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancelar}
            aria-hidden
          />
          <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              key="panel-resumen-sheet"
              className="relative z-10 w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl pointer-events-auto"
              style={{
                backgroundColor: '#0f0f0f',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                />
              </div>

              <div className="px-6 py-5 flex flex-col gap-5">
                <div>
                  <p
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    {esEdicion ? 'Confirmar cambios' : 'Sellar el día'}
                  </p>
                  <h3 className="text-lg font-semibold mt-1" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    {completados}/7 pruebas completadas
                  </h3>
                  {diaPerfecto && (
                    <p className="text-xs mt-1" style={{ color: '#fbbf24' }}>
                      ★ Día perfecto — el Altis lo inscribirá
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  {resumen.map((item) => {
                    const guardadoMap: Record<string, boolean> = {
                      agua: estadoGuardado.soloAgua,
                      comida: estadoGuardado.sinComidaRapida,
                      pasos: estadoGuardado.pasos >= metas.pasos,
                      sueno: estadoGuardado.horasSueno >= metas.horasSueno,
                      lectura: estadoGuardado.paginasLeidas >= metas.paginasLeidas,
                      gym: estadoGuardado.sesionesGym >= metas.sesionesGym,
                      cardio: estadoGuardado.sesionesCardio >= metas.sesionesCardio,
                    }
                    const cambio = item.completado !== guardadoMap[item.id]
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg"
                        style={{
                          backgroundColor: cambio
                            ? item.completado
                              ? 'rgba(251,191,36,0.08)'
                              : 'rgba(239,68,68,0.08)'
                            : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${
                            cambio
                              ? item.completado
                                ? 'rgba(251,191,36,0.2)'
                                : 'rgba(239,68,68,0.2)'
                              : 'rgba(255,255,255,0.06)'
                          }`,
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            style={{
                              color: item.completado ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                              fontSize: 12,
                            }}
                          >
                            {item.completado ? '✓' : '○'}
                          </span>
                          <span
                            className="text-sm truncate"
                            style={{
                              color: item.completado
                                ? 'rgba(255,255,255,0.8)'
                                : 'rgba(255,255,255,0.35)',
                            }}
                          >
                            {item.label}
                          </span>
                          {cambio && (
                            <span
                              className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0"
                              style={{
                                backgroundColor: item.completado
                                  ? 'rgba(251,191,36,0.15)'
                                  : 'rgba(239,68,68,0.15)',
                                color: item.completado ? '#fbbf24' : '#f87171',
                              }}
                            >
                              {item.completado ? '+' : '−'}
                            </span>
                          )}
                        </div>
                        <span className="text-xs shrink-0 ml-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {item.valor}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: 'rgba(251,191,36,0.06)',
                    border: '1px solid rgba(251,191,36,0.15)',
                  }}
                >
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Kleos del día
                  </span>
                  <span className="text-lg font-semibold" style={{ color: '#fbbf24' }}>
                    ◆ {kleos}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={onConfirmar}
                    disabled={confirmando}
                    className="w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                    style={{
                      backgroundColor: 'rgba(251,191,36,0.12)',
                      border: '1px solid rgba(251,191,36,0.3)',
                      color: '#fbbf24',
                    }}
                  >
                    {confirmando ? 'El Altis registra...' : esEdicion ? 'Confirmar cambios' : 'Sellar el día'}
                  </button>
                  <button
                    type="button"
                    onClick={onCancelar}
                    className="w-full py-2.5 rounded-xl text-sm transition-all duration-200"
                    style={{
                      color: 'rgba(255,255,255,0.3)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    Seguir editando
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ─── Botón flotante desktop ───────────────────────────────────────────────────

function BotonFlotanteDesktop({
  visible,
  kleos,
  completados,
  confirmando,
  esEdicion,
  onVerResumen,
  onConfirmar,
}: {
  visible: boolean
  kleos: number
  completados: number
  confirmando: boolean
  esEdicion: boolean
  onVerResumen: () => void
  onConfirmar: () => void
}) {
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    setMontado(true)
  }, [])

  if (!montado) return null

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pruebas-fab-desktop"
          className="hidden sm:flex fixed bottom-8 right-8 z-[9998] flex-col gap-2"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{
              backgroundColor: '#0f0f0f',
              border: '1px solid rgba(251,191,36,0.2)',
              minWidth: 200,
            }}
          >
            <div>
              <p
                className="text-[10px] uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                Cambios pendientes
              </p>
              <p className="text-sm font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {completados}/7 · <span style={{ color: '#fbbf24' }}>◆ {kleos}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onConfirmar}
              disabled={confirmando}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
              style={{
                backgroundColor: 'rgba(251,191,36,0.15)',
                border: '1px solid rgba(251,191,36,0.35)',
                color: '#fbbf24',
              }}
            >
              {confirmando ? 'Registrando...' : esEdicion ? 'Confirmar cambios' : 'Sellar el día'}
            </button>
            <button
              type="button"
              onClick={onVerResumen}
              className="text-xs text-center transition-colors"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Ver resumen →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ─── Botón flotante mobile ───────────────────────────────────────────────────

function BotonFlotanteMobile({
  visible,
  confirmando,
  esEdicion,
  onConfirmar,
}: {
  visible: boolean
  confirmando: boolean
  esEdicion: boolean
  onConfirmar: () => void
}) {
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    setMontado(true)
  }, [])

  if (!montado) return null

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pruebas-fab-mobile"
          className="sm:hidden fixed bottom-20 left-4 right-4 z-[9998]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <button
            type="button"
            onClick={onConfirmar}
            disabled={confirmando}
            className="w-full py-4 rounded-2xl text-base font-semibold transition-all duration-200 disabled:opacity-50"
            style={{ backgroundColor: '#fbbf24', color: '#0a0a0a' }}
          >
            {confirmando ? 'El Altis registra...' : esEdicion ? '✓ Confirmar cambios' : '✓ Sellar el día'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ─── Componente principal ───────────────────────────────────────────────────

interface Props {
  prueba: PruebaDiaria
  llamas: Llama[]
  nivel: string
  modo: 'solo' | 'duelo'
  nombreAntagonista?: string | null
  pruebasAntagonista?: Record<string, boolean>
  metasEfectivas?: {
    pasos: number
    horasSueno: number
    paginasLeidas: number
    sesionesGym: number
    sesionesCardio: number
  }
}

export function PruebasDelDia({
  prueba,
  llamas,
  nivel,
  modo,
  nombreAntagonista = null,
  pruebasAntagonista = {},
  metasEfectivas,
}: Props) {
  const router = useRouter()
  const esDuelo = modo === 'duelo'
  const nombreRival = nombreAntagonista ?? 'El Antagonista'

  const metasUmbral = useMemo<MetasUmbralHabito>(
    () => ({
      pasos: metasEfectivas?.pasos ?? METAS_HABITO.pasos,
      horasSueno: metasEfectivas?.horasSueno ?? METAS_HABITO.horasSueno,
      paginasLeidas: metasEfectivas?.paginasLeidas ?? METAS_HABITO.paginasLeidas,
      sesionesGym: metasEfectivas?.sesionesGym ?? METAS_HABITO.sesionesGym,
      sesionesCardio: metasEfectivas?.sesionesCardio ?? METAS_HABITO.sesionesCardio,
    }),
    [metasEfectivas]
  )

  const PRUEBAS_CONFIG_EFECTIVO = useMemo(
    () => [
      {
        id: 'agua',
        nombre: 'Solo agua',
        tipo: 'toggle' as const,
        kleos: 10,
        unidad: 'sin bebidas azucaradas',
      },
      {
        id: 'comida',
        nombre: 'Sin comida rápida',
        tipo: 'toggle' as const,
        kleos: 10,
        unidad: 'disciplina alimentaria',
      },
      {
        id: 'pasos',
        nombre: 'Pasos',
        tipo: 'contador' as const,
        kleos: 20,
        unidad: 'pasos',
        meta: metasUmbral.pasos,
        metaOriginal: 10000,
      },
      {
        id: 'sueno',
        nombre: 'Horas de sueño',
        tipo: 'contador' as const,
        kleos: 15,
        unidad: 'horas',
        meta: metasUmbral.horasSueno,
        metaOriginal: 7,
      },
      {
        id: 'lectura',
        nombre: 'Páginas leídas',
        tipo: 'contador' as const,
        kleos: 15,
        unidad: 'páginas',
        meta: metasUmbral.paginasLeidas,
        metaOriginal: 10,
      },
      {
        id: 'gym',
        nombre: 'Gym',
        tipo: 'contador_semanal' as const,
        kleos: 30,
        unidad: 'sesiones esta semana',
        meta: metasUmbral.sesionesGym,
        metaOriginal: METAS_HABITO.sesionesGym,
      },
      {
        id: 'cardio',
        nombre: 'Cardio',
        tipo: 'contador_semanal' as const,
        kleos: 25,
        unidad: 'sesiones esta semana',
        meta: metasUmbral.sesionesCardio,
        metaOriginal: METAS_HABITO.sesionesCardio,
      },
    ],
    [metasUmbral]
  )

  const [estado, setEstado] = useState<EstadoPruebas>(() => estadoDesdePrueba(prueba))
  const [estadoGuardado, setEstadoGuardado] = useState<EstadoPruebas>(() => estadoDesdePrueba(prueba))
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [colaInscripciones, setColaInscripciones] = useState<string[]>([])
  const estadoRef = useRef(estado)
  estadoRef.current = estado

  useEffect(() => {
    const next = estadoDesdePrueba(prueba)
    estadoRef.current = next
    setEstado(next)
    setEstadoGuardado(next)
  }, [prueba])

  const kleos = calcularKleosLocal(estado, 1, 1, nivel, metasUmbral)
  const diaPerfecto = esDiaPerfectoLocal(estado, metasUmbral)
  const completados = contarCompletados(estado, metasUmbral)
  const hayCambios = hayCambiosEntre(estado, estadoGuardado)
  const esEdicion = contarCompletados(estadoGuardado, metasUmbral) > 0

  const handleChange = useCallback((campo: string, valor: boolean | number) => {
    const anterior = estadoRef.current
    const nuevoEstado = aplicarCambio(anterior, campo, valor)
    estadoRef.current = nuevoEstado
    setEstado(nuevoEstado)

    if (
      esDiaPerfectoLocal(nuevoEstado, metasUmbral) &&
      !esDiaPerfectoLocal(anterior, metasUmbral)
    ) {
      mostrarToast({
        tipo: 'exito',
        icono: '🏛️',
        mensaje: '¡Día perfecto alcanzado! Confírmalo para sellarlo.',
      })
    }
  }, [metasUmbral])

  const handleConfirmar = useCallback(async () => {
    const guardadoAntesConfirmar = estadoGuardado
    setConfirmando(true)
    try {
      const res = await fetch('/api/pruebas/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soloAgua: estadoRef.current.soloAgua,
          sinComidaRapida: estadoRef.current.sinComidaRapida,
          pasos: estadoRef.current.pasos,
          horasSueno: estadoRef.current.horasSueno,
          paginasLeidas: estadoRef.current.paginasLeidas,
          sesionesGym: estadoRef.current.sesionesGym,
          sesionesCardio: estadoRef.current.sesionesCardio,
        }),
      })

      if (!res.ok) throw new Error('Error del servidor')

      const data = (await res.json()) as {
        inscripcionesDesbloqueadas?: string[]
        inscripcionDesbloqueada?: string | null
        nivelSubido: { nivelAnterior: string; nivelNuevo: string } | null
        estadoReal?: {
          soloAgua: boolean
          sinComidaRapida: boolean
          pasos: number
          horasSueno: number
          paginasLeidas: number
          sesionesGym: number
          sesionesCardio: number
          kleosGanado: number
          diaPerfecto: boolean
        } | null
        kleosTotal?: number
        diaPerfecto?: boolean
      }

      if (data.estadoReal) {
        const confirmado: EstadoPruebas = {
          soloAgua: data.estadoReal.soloAgua,
          sinComidaRapida: data.estadoReal.sinComidaRapida,
          pasos: data.estadoReal.pasos,
          horasSueno: data.estadoReal.horasSueno,
          paginasLeidas: data.estadoReal.paginasLeidas,
          sesionesGym: data.estadoReal.sesionesGym,
          sesionesCardio: data.estadoReal.sesionesCardio,
        }
        estadoRef.current = confirmado
        setEstado(confirmado)
        setEstadoGuardado(confirmado)
      }

      setPanelAbierto(false)

      const diaPerfectoRecienLogrado =
        Boolean(data.diaPerfecto ?? data.estadoReal?.diaPerfecto) &&
        !esDiaPerfectoLocal(guardadoAntesConfirmar, metasUmbral)

      if (diaPerfectoRecienLogrado) {
        mostrarToast({
          tipo: 'exito',
          icono: '🏛️',
          mensaje: 'El agon es tuyo. El Altis lo ha inscrito.',
        })
      }

      if (data.nivelSubido) {
        const nk = data.nivelSubido.nivelNuevo as NivelKey
        mostrarToast({
          tipo: 'exito',
          icono: '⬆️',
          mensaje: `El Altis te reconoce: ${NIVEL_LABELS[nk] ?? data.nivelSubido.nivelNuevo}`,
        })
        router.refresh()
      }

      const inscripciones = data.inscripcionesDesbloqueadas?.length
        ? data.inscripcionesDesbloqueadas
        : data.inscripcionDesbloqueada
          ? [data.inscripcionDesbloqueada]
          : []

      if (inscripciones.length > 0) {
        setTimeout(() => setColaInscripciones(inscripciones), 400)
      } else if (!diaPerfectoRecienLogrado) {
        mostrarToast({
          tipo: 'exito',
          icono: '◆',
          mensaje: esEdicion ? 'Cambios registrados por el Altis.' : 'El día ha sido sellado.',
        })
      }

      window.dispatchEvent(new CustomEvent('agon:prueba-completada'))
    } catch {
      mostrarToast({
        tipo: 'error',
        icono: '⚠️',
        mensaje: 'El Altis no pudo registrar. Intenta de nuevo.',
      })
    } finally {
      setConfirmando(false)
    }
  }, [esEdicion, estadoGuardado, metasUmbral, router])

  const getLlama = (habitoId: string) => llamas.find((l) => l.habitoId === habitoId)
  const getValor = (id: string): boolean | number => {
    const map: Record<string, boolean | number> = {
      agua: estado.soloAgua,
      comida: estado.sinComidaRapida,
      pasos: estado.pasos,
      sueno: estado.horasSueno,
      lectura: estado.paginasLeidas,
      gym: estado.sesionesGym,
      cardio: estado.sesionesCardio,
    }
    return map[id] ?? false
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-wide">Las Pruebas</h2>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            {completados}/7 completadas hoy
            {hayCambios && (
              <span className="ml-2" style={{ color: 'rgba(251,191,36,0.6)' }}>
                · cambios pendientes
              </span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-body">kleos del día</p>
          <p className="font-display text-xl font-bold text-amber">◆ {kleos}</p>
        </div>
      </div>

      {diaPerfecto && hayCambios && (
        <AgonCard variant="highlighted">
          <div className="text-center py-1">
            <p className="font-display text-sm font-bold text-amber tracking-wide">
              🏛️ Día perfecto alcanzado
            </p>
            <p className="text-xs text-muted-foreground font-body mt-1">
              Confírmalo para que el Altis lo inscriba.
            </p>
          </div>
        </AgonCard>
      )}

      {diaPerfecto && !hayCambios && (
        <AgonCard variant="highlighted">
          <div className="text-center py-1">
            <p className="font-display text-sm font-bold text-amber tracking-wide">🏛️ El agon es tuyo.</p>
            <p className="text-xs text-muted-foreground font-body mt-1">El Altis lo ha registrado.</p>
          </div>
        </AgonCard>
      )}

      <div className="space-y-2">
        {PRUEBAS_CONFIG_EFECTIVO.map((p) => (
          <PruebaCard
            key={p.id}
            prueba={p}
            valor={getValor(p.id)}
            llama={getLlama(p.id)}
            fotoUrl={p.id === 'gym' ? prueba.fotoGymUrl : p.id === 'cardio' ? prueba.fotoCardioUrl : null}
            onFotoSubida={() => router.refresh()}
            onChange={handleChange}
            disabled={confirmando}
            antagonistaCompletó={
              esDuelo && nombreAntagonista
                ? (pruebasAntagonista[p.id] ?? false)
                : false
            }
          />
        ))}
      </div>

      <CierreDramatico
        diaPerfecto={diaPerfecto && !hayCambios}
        pruebasCompletadas={completados}
        nombreAntagonista={nombreRival}
        pruebasAntagonista={Object.values(pruebasAntagonista).filter(Boolean).length}
        esDuelo={esDuelo}
        onCerrar={() => {}}
      />

      <BotonFlotanteDesktop
        visible={hayCambios}
        kleos={kleos}
        completados={completados}
        confirmando={confirmando}
        esEdicion={esEdicion}
        onVerResumen={() => setPanelAbierto(true)}
        onConfirmar={() => void handleConfirmar()}
      />

      <BotonFlotanteMobile
        visible={hayCambios}
        confirmando={confirmando}
        esEdicion={esEdicion}
        onConfirmar={() => void handleConfirmar()}
      />

      <PanelResumen
        visible={panelAbierto}
        estado={estado}
        estadoGuardado={estadoGuardado}
        kleos={kleos}
        diaPerfecto={diaPerfecto}
        confirmando={confirmando}
        esEdicion={esEdicion}
        metas={metasUmbral}
        onConfirmar={() => void handleConfirmar()}
        onCancelar={() => setPanelAbierto(false)}
      />

      <InscripcionOverlay
        inscripcionIds={colaInscripciones}
        onCerrar={() => setColaInscripciones([])}
      />
    </div>
  )
}
