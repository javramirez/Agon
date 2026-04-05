'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
} from '@/lib/kleos-client'
import { NIVEL_LABELS, type NivelKey } from '@/lib/db/constants'
import type { PruebaDiaria, Llama } from '@/lib/db/schema'

const PRUEBAS_CONFIG = [
  { id: 'agua', nombre: 'Solo agua', tipo: 'toggle' as const, kleos: 10, icono: '💧', unidad: 'sin bebidas azucaradas' },
  { id: 'comida', nombre: 'Sin comida rápida', tipo: 'toggle' as const, kleos: 10, icono: '🥗', unidad: 'disciplina alimentaria' },
  { id: 'pasos', nombre: 'Pasos', tipo: 'contador' as const, kleos: 20, icono: '🚶', unidad: 'pasos', meta: 10000 },
  { id: 'sueno', nombre: 'Horas de sueño', tipo: 'contador' as const, kleos: 15, icono: '😴', unidad: 'horas', meta: 7 },
  { id: 'lectura', nombre: 'Páginas leídas', tipo: 'contador' as const, kleos: 15, icono: '📖', unidad: 'páginas', meta: 10 },
  { id: 'gym', nombre: 'Gym', tipo: 'contador_semanal' as const, kleos: 30, icono: '🏋️', unidad: 'sesiones esta semana', meta: 4 },
  { id: 'cardio', nombre: 'Cardio', tipo: 'contador_semanal' as const, kleos: 25, icono: '🏃', unidad: 'sesiones esta semana', meta: 3 },
]

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

interface Props {
  prueba: PruebaDiaria
  llamas: Llama[]
  nivel: string
  nombreAntagonista?: string
  pruebasAntagonista?: number
}

export function PruebasDelDia({
  prueba,
  llamas,
  nivel,
  nombreAntagonista = 'El Antagonista',
  pruebasAntagonista = 0,
}: Props) {
  const router = useRouter()

  const [estado, setEstado] = useState<EstadoPruebas>(() => estadoDesdePrueba(prueba))
  const estadoRef = useRef(estado)
  estadoRef.current = estado

  const [inscripcionNueva, setInscripcionNueva] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const pendingRef = useRef<AbortController | null>(null)
  const seqRef = useRef(0)
  const inFlightRef = useRef(0)

  useEffect(() => {
    const next = estadoDesdePrueba(prueba)
    estadoRef.current = next
    setEstado(next)
  }, [prueba])

  const kleos = calcularKleosLocal(estado, 1, 1, nivel)
  const diaPerfecto = esDiaPerfectoLocal(estado)

  const pruebasCompletadas = [
    estado.soloAgua,
    estado.sinComidaRapida,
    estado.pasos >= 10000,
    estado.horasSueno >= 7,
    estado.paginasLeidas >= 10,
    estado.sesionesGym >= 4,
    estado.sesionesCardio >= 3,
  ].filter(Boolean).length

  const handleChange = useCallback(
    (campo: string, valor: boolean | number) => {
      const estadoAnterior = estadoRef.current
      const nuevoEstado = aplicarCambio(estadoAnterior, campo, valor)
      estadoRef.current = nuevoEstado
      setEstado(nuevoEstado)

      if (esDiaPerfectoLocal(nuevoEstado) && !esDiaPerfectoLocal(estadoAnterior)) {
        mostrarToast({
          tipo: 'exito',
          icono: '🏛️',
          mensaje: 'El agon es tuyo. El Altis lo registró.',
        })
      }

      if (pendingRef.current) {
        pendingRef.current.abort()
      }

      const controller = new AbortController()
      pendingRef.current = controller

      const mySeq = ++seqRef.current
      inFlightRef.current += 1
      setGuardando(true)

      fetch('/api/pruebas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campo, valor }),
        signal: controller.signal,
      })
        .then(async (res) => {
          if (mySeq !== seqRef.current) return
          if (!res.ok) throw new Error('Error del servidor')
          const data = (await res.json()) as {
            inscripcionDesbloqueada?: string | null
            nivelSubido: { nivelAnterior: string; nivelNuevo: string } | null
          }

          if (data.inscripcionDesbloqueada) {
            setInscripcionNueva(data.inscripcionDesbloqueada)
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
        })
        .catch((err: Error) => {
          if (err.name === 'AbortError') return
          if (mySeq !== seqRef.current) return

          estadoRef.current = estadoAnterior
          setEstado(estadoAnterior)
          mostrarToast({
            tipo: 'error',
            icono: '⚠️',
            mensaje: 'El Altis no pudo guardar. Intenta de nuevo.',
          })
        })
        .finally(() => {
          inFlightRef.current -= 1
          if (inFlightRef.current <= 0) {
            inFlightRef.current = 0
            setGuardando(false)
          }
          if (pendingRef.current === controller) {
            pendingRef.current = null
          }
        })
    },
    [router]
  )

  const getLlama = (habitoId: string) =>
    llamas.find((l) => l.habitoId === habitoId)

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
          <h2 className="font-display text-lg font-semibold tracking-wide">
            Las Pruebas
          </h2>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            {pruebasCompletadas}/7 completadas hoy
            {guardando && (
              <span className="ml-2 text-muted-foreground/50">· guardando...</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-body">kleos del día</p>
          <p className="font-display text-xl font-bold text-amber">
            ◆ {kleos}
          </p>
        </div>
      </div>

      {diaPerfecto && (
        <AgonCard variant="highlighted">
          <div className="text-center py-1">
            <p className="font-display text-sm font-bold text-amber tracking-wide">
              🏛️ El agon es tuyo.
            </p>
            <p className="text-xs text-muted-foreground font-body mt-1">
              Todas las pruebas completadas. El Altis lo ha registrado.
            </p>
          </div>
        </AgonCard>
      )}

      <div className="space-y-2">
        {PRUEBAS_CONFIG.map((p) => (
          <PruebaCard
            key={p.id}
            prueba={p}
            valor={getValor(p.id)}
            llama={getLlama(p.id)}
            fotoUrl={
              p.id === 'gym'
                ? prueba.fotoGymUrl
                : p.id === 'cardio'
                  ? prueba.fotoCardioUrl
                  : null
            }
            onFotoSubida={() => router.refresh()}
            onChange={handleChange}
          />
        ))}
      </div>

      <CierreDramatico
        diaPerfecto={diaPerfecto}
        pruebasCompletadas={pruebasCompletadas}
        nombreAntagonista={nombreAntagonista}
        pruebasAntagonista={pruebasAntagonista}
        onCerrar={() => {}}
      />

      <InscripcionOverlay
        inscripcionId={inscripcionNueva}
        onCerrar={() => setInscripcionNueva(null)}
      />
    </div>
  )
}
