import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getCurrentAgonista } from '@/lib/auth'
import {
  getCrisisActiva,
  getDecisionAgonista,
  getDecisionRival,
} from '@/lib/crisis/calendario'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ crisis: null })

  const agonista = await getCurrentAgonista()
  if (!agonista) return NextResponse.json({ crisis: null })

  const activa = await getCrisisActiva()
  if (!activa) return NextResponse.json({ crisis: null })

  const { fila, config, agonista1Id } = activa

  const miDecision = getDecisionAgonista(fila, agonista.id, agonista1Id)
  const decisionRival = getDecisionRival(fila, agonista.id, agonista1Id)
  const miTexto =
    agonista.id === agonista1Id
      ? fila.respuestaTextoAgonista1
      : fila.respuestaTextoAgonista2
  const textoRival =
    agonista.id === agonista1Id
      ? fila.respuestaTextoAgonista2
      : fila.respuestaTextoAgonista1
  const miPuntaje =
    agonista.id === agonista1Id
      ? fila.puntajeAgonista1
      : fila.puntajeAgonista2

  return NextResponse.json({
    crisis: {
      id: fila.id,
      crisisId: fila.crisisId,
      semana: fila.semana,
      fechaExpiracion: fila.fechaExpiracion,
      resuelta: fila.resuelta,
      config: {
        titulo: config.titulo,
        lider: config.lider,
        mecanicas: config.mecanicas,
        descripcionNarrativa: config.descripcionNarrativa,
        opcionA: config.opcionA,
        opcionB: config.opcionB,
        estrivia: config.estrivia ?? false,
        categoriasTrivia: config.categoriasTrivia ?? [],
        habitoApuesta: config.habitoApuesta,
        kleosApuesta: config.kleosApuesta,
        kleosSacrificio: config.kleosSacrificio,
      },
      miDecision,
      decisionRival,
      miTexto,
      textoRival,
      miPuntaje,
      triviaPreguntas: fila.triviaPreguntas,
      liderModificado: fila.liderModificado,
    },
  })
}
