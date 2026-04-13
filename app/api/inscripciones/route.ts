import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { inscripciones, agoraEventos } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getOrCreateAgonista } from '@/lib/db/queries'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'
import { INSCRIPCIONES } from '@/lib/db/constants'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)

  const desbloqueadas = await db
    .select()
    .from(inscripciones)
    .where(eq(inscripciones.agonistId, agonista.id))

  return NextResponse.json({ inscripciones: desbloqueadas })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const inscripcionId =
    body && typeof body === 'object' && 'inscripcionId' in body
      ? (body as { inscripcionId?: unknown }).inscripcionId
      : undefined

  if (typeof inscripcionId !== 'string' || !inscripcionId) {
    return NextResponse.json({ error: 'Falta inscripcionId' }, { status: 400 })
  }

  const config = INSCRIPCIONES.find((i) => i.id === inscripcionId)
  if (!config) {
    return NextResponse.json({ error: 'Inscripción no válida' }, { status: 400 })
  }

  const existing = await db
    .select()
    .from(inscripciones)
    .where(
      and(
        eq(inscripciones.agonistId, agonista.id),
        eq(inscripciones.inscripcionId, inscripcionId)
      )
    )
    .limit(1)

  if (existing.length > 0) {
    return NextResponse.json({ yaDesbloqueada: true })
  }

  await db.insert(inscripciones).values({
    id: crypto.randomUUID(),
    agonistId: agonista.id,
    inscripcionId,
    secreto: config.secreto,
    tipo: config.tipo,
  })

  const eventoId = crypto.randomUUID()
  await db.insert(agoraEventos).values({
    id: eventoId,
    agonistId: agonista.id,
    tipo: 'inscripcion_desbloqueada',
    contenido: `${agonista.nombre} desbloqueó una inscripción: ${config.nombre}. ${config.descripcion}`,
    metadata: { inscripcionId, secreto: config.secreto },
  })

  void triggerComentariosDioses(eventoId).catch((err) =>
    console.error('triggerComentariosDioses inscripcion_desbloqueada', err)
  )

  return NextResponse.json({ desbloqueada: true, config })
}
