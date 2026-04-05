'use client'

import { useState, useCallback, useEffect } from 'react'
import { PruebaCard } from './prueba-card'
import { AgonCard } from './agon-card'
import { CierreDramatico } from './cierre-dramatico'
import { InscripcionOverlay } from './inscripcion-overlay'
import { useRouter } from 'next/navigation'
import { usePulso } from '@/hooks/use-pulso'
import type { PruebaDiaria, Llama } from '@/lib/db/schema'
import { mostrarToast } from './toast-agon'
import { NivelSubida } from './nivel-subida'

const PRUEBAS_CONFIG = [
  { id: 'agua', nombre: 'Solo agua', tipo: 'toggle' as const, kleos: 10, icono: '💧', unidad: 'sin bebidas azucaradas' },
  { id: 'comida', nombre: 'Sin comida rápida', tipo: 'toggle' as const, kleos: 10, icono: '🥗', unidad: 'disciplina alimentaria' },
  { id: 'pasos', nombre: 'Pasos', tipo: 'contador' as const, kleos: 20, icono: '🚶', unidad: 'pasos', meta: 10000 },
  { id: 'sueno', nombre: 'Horas de sueño', tipo: 'contador' as const, kleos: 15, icono: '😴', unidad: 'horas', meta: 7 },
  { id: 'lectura', nombre: 'Páginas leídas', tipo: 'contador' as const, kleos: 15, icono: '📖', unidad: 'páginas', meta: 10 },
  { id: 'gym', nombre: 'Gym', tipo: 'contador_semanal' as const, kleos: 30, icono: '🏋️', unidad: 'sesiones esta semana', meta: 4 },
  { id: 'cardio', nombre: 'Cardio', tipo: 'contador_semanal' as const, kleos: 25, icono: '🏃', unidad: 'sesiones esta semana', meta: 3 },
]

function contarPruebasCompletadas(
  p: {
    soloAgua: boolean
    sinComidaRapida: boolean
    pasos: number
    horasSueno: number
    paginasLeidas: number
    sesionesGym: number
    sesionesCardio: number
  } | null
): number {
  if (!p) return 0
  let count = 0
  if (p.soloAgua) count++
  if (p.sinComidaRapida) count++
  if (p.pasos >= 10000) count++
  if (p.horasSueno >= 7) count++
  if (p.paginasLeidas >= 10) count++
  if (p.sesionesGym >= 4) count++
  if (p.sesionesCardio >= 3) count++
  return count
}

interface Props {
  prueba: PruebaDiaria
  llamas: Llama[]
}

export function PruebasDelDia({ prueba, llamas }: Props) {
  const router = useRouter()
  const { data: pulsoData } = usePulso(15000)
  const [diaPerfecto, setDiaPerfecto] = useState(prueba.diaPerfecto)
  const [kleos, setKleos] = useState(prueba.kleosGanado)
  const [inscripcionNueva, setInscripcionNueva] = useState<string | null>(null)
  const [, setMostrarDashboard] = useState(true)
  const [nivelSubida, setNivelSubida] = useState<{
    nivelAnterior: string
    nivelNuevo: string
  } | null>(null)

  const nombreAntagonista =
    pulsoData?.antagonista?.nombre ?? 'El Antagonista'
  const pruebasAntagonista = contarPruebasCompletadas(
    pulsoData?.antagonista?.pruebas ?? null
  )

  useEffect(() => {
    setKleos(prueba.kleosGanado)
    setDiaPerfecto(prueba.diaPerfecto)
  }, [prueba.kleosGanado, prueba.diaPerfecto])

  const handleChange = useCallback(
    async (campo: string, valor: boolean | number) => {
      try {
        const res = await fetch('/api/pruebas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campo, valor }),
        })

        if (!res.ok) {
          throw new Error('Error al guardar')
        }

        const data = (await res.json()) as {
          kleos: number
          diaPerfecto: boolean
          inscripcionDesbloqueada?: string | null
          nivelSubido: { nivelAnterior: string; nivelNuevo: string } | null
        }
        setKleos(data.kleos)

        if (data.diaPerfecto && !diaPerfecto) {
          setDiaPerfecto(true)
          mostrarToast({
            tipo: 'exito',
            icono: '🏛️',
            mensaje: 'El agon es tuyo. El Altis lo registró.',
          })
        }

        if (data.inscripcionDesbloqueada) {
          setInscripcionNueva(data.inscripcionDesbloqueada)
        }

        if (data.nivelSubido) {
          setNivelSubida({
            nivelAnterior: data.nivelSubido.nivelAnterior,
            nivelNuevo: data.nivelSubido.nivelNuevo,
          })
          mostrarToast({
            tipo: 'info',
            icono: '⬆️',
            mensaje: 'El Altis te reconoce. Nuevo nivel en el Gran Agon.',
          })
        }

        router.refresh()
      } catch {
        mostrarToast({
          tipo: 'error',
          icono: '⚠️',
          mensaje: 'El Altis no pudo guardar. Intenta de nuevo.',
        })
      }
    },
    [diaPerfecto, router]
  )

  const getLlama = (habitoId: string) =>
    llamas.find((l) => l.habitoId === habitoId)

  const getValor = (id: string): boolean | number => {
    const map: Record<string, boolean | number> = {
      agua: prueba.soloAgua,
      comida: prueba.sinComidaRapida,
      pasos: prueba.pasos,
      sueno: prueba.horasSueno,
      lectura: prueba.paginasLeidas,
      gym: prueba.sesionesGym,
      cardio: prueba.sesionesCardio,
    }
    return map[id] ?? false
  }

  const pruebasCompletadas = PRUEBAS_CONFIG.filter((p) => {
    const v = getValor(p.id)
    return p.tipo === 'toggle' ? v === true : typeof v === 'number' && p.meta ? v >= p.meta : false
  }).length

  return (
    <div className="space-y-4">
      {nivelSubida && (
        <NivelSubida
          key={nivelSubida.nivelNuevo}
          nivelAnterior={nivelSubida.nivelAnterior}
          nivelActual={nivelSubida.nivelNuevo}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-wide">
            Las Pruebas
          </h2>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            {pruebasCompletadas}/7 completadas hoy
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-body">kleos del día</p>
          <p className="font-display text-lg font-bold text-amber">
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
        onCerrar={() => {
          setMostrarDashboard(true)
          router.refresh()
        }}
      />

      <InscripcionOverlay
        inscripcionId={inscripcionNueva}
        onCerrar={() => setInscripcionNueva(null)}
      />
    </div>
  )
}
