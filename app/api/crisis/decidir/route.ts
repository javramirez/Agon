import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getCurrentAgonista } from '@/lib/auth'
import {
  getCrisisActiva,
  guardarDecisionCrisis,
  guardarPuntajeTrivia,
} from '@/lib/crisis/calendario'
import { resolverCrisisVencidas } from '@/lib/crisis/resolver'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId)
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getCurrentAgonista()
  if (!agonista)
    return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const decision = b.decision as string
  const respuestaTexto = b.respuestaTexto as string | undefined
  const puntaje = b.puntaje as number | undefined

  if (decision !== 'A' && decision !== 'B') {
    return NextResponse.json({ error: 'Decisión inválida' }, { status: 400 })
  }

  const activa = await getCrisisActiva()
  if (!activa)
    return NextResponse.json({ error: 'No hay crisis activa' }, { status: 404 })

  const { fila, agonista1Id } = activa

  await guardarDecisionCrisis(
    fila.id,
    agonista.id,
    agonista1Id,
    decision as 'A' | 'B',
    respuestaTexto
  )

  if (puntaje !== undefined) {
    await guardarPuntajeTrivia(fila.id, agonista.id, agonista1Id, puntaje)
  }

  void resolverCrisisVencidas().catch(() => {})

  return NextResponse.json({ ok: true })
}
