import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import {
  verificarYActivarPruebas,
  activarEventoDestino,
} from '@/lib/pruebas-extraordinarias/calendario'
import {
  verificarYActivarSemanaSagrada,
  desactivarSemanaSagradaSiTermino,
} from '@/lib/pruebas-extraordinarias/semana-sagrada'
import { getDiaDelAgan, isGranAgonActivo } from '@/lib/utils'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (!isGranAgonActivo()) {
    return NextResponse.json({
      tripticoActivado: false,
      destinoLatente: null,
      semanaSagradaActivada: false,
    })
  }

  const diaActual = getDiaDelAgan()
  const resultado = await verificarYActivarPruebas(diaActual)

  const semanaSagradaActivada = await verificarYActivarSemanaSagrada()

  await desactivarSemanaSagradaSiTermino()

  return NextResponse.json({
    ...resultado,
    semanaSagradaActivada,
  })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (!isGranAgonActivo()) {
    return NextResponse.json({ activado: false })
  }

  const { pruebaId } = (await req.json()) as { pruebaId?: string }
  if (!pruebaId) {
    return NextResponse.json({ error: 'Falta pruebaId' }, { status: 400 })
  }

  const diaActual = getDiaDelAgan()
  const activado = await activarEventoDestino(pruebaId, diaActual)

  return NextResponse.json({ activado })
}
