import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getCurrentAgonista } from '@/lib/auth'
import { getCrisisActiva } from '@/lib/crisis/calendario'
import { sortearPreguntasTrivia, getPreguntasTrivia } from '@/lib/crisis/trivia'
import { db } from '@/lib/db'
import { crisisCiudad } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId)
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getCurrentAgonista()
  if (!agonista)
    return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const crisisId = searchParams.get('crisisId')
  if (!crisisId)
    return NextResponse.json({ error: 'crisisId requerido' }, { status: 400 })

  const activa = await getCrisisActiva(agonista.retoId)
  if (!activa)
    return NextResponse.json({ error: 'No hay crisis activa' }, { status: 404 })

  const { fila, config } = activa

  if (fila.crisisId !== crisisId) {
    return NextResponse.json({ error: 'Crisis no coincide' }, { status: 400 })
  }

  if (fila.triviaPreguntas && (fila.triviaPreguntas as string[]).length > 0) {
    const preguntas = getPreguntasTrivia(fila.triviaPreguntas as string[])
    return NextResponse.json({ preguntas })
  }

  const categorias = config.categoriasTrivia ?? [
    'mitologia',
    'filosofia',
    'historia_griega',
    'disciplina',
    'deuses',
    'heroes',
    'olimpia',
  ]
  const preguntas = sortearPreguntasTrivia(categorias)
  const ids = preguntas.map((p) => p.id)

  await db
    .update(crisisCiudad)
    .set({ triviaPreguntas: ids })
    .where(eq(crisisCiudad.id, fila.id))

  return NextResponse.json({ preguntas })
}
