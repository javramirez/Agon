import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ekecheiria, agoraEventos, inscripciones } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getOrCreateAgonista } from '@/lib/db/queries'
import { INSCRIPCIONES } from '@/lib/db/constants'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)

  const rows = await db
    .select()
    .from(ekecheiria)
    .where(eq(ekecheiria.agonistId, agonista.id))
    .orderBy(desc(ekecheiria.createdAt))
    .limit(1)

  const row = rows[0]
  return NextResponse.json({
    activa: row ? row.activa : false,
    ekecheiria: row ?? null,
  })
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

  const motivo =
    body && typeof body === 'object' && 'motivo' in body
      ? (body as { motivo?: unknown }).motivo
      : undefined

  if (typeof motivo !== 'string' || motivo.trim().length < 10) {
    return NextResponse.json(
      { error: 'Debes explicar el motivo de La Ekecheiria.' },
      { status: 400 }
    )
  }

  const activaPrev = await db
    .select()
    .from(ekecheiria)
    .where(
      and(eq(ekecheiria.agonistId, agonista.id), eq(ekecheiria.activa, true))
    )
    .limit(1)

  if (activaPrev.length > 0) {
    return NextResponse.json(
      { error: 'La Ekecheiria ya está activa.' },
      { status: 400 }
    )
  }

  const hoy = new Date().toISOString().split('T')[0]
  const motivoTrim = motivo.trim()

  await db.insert(ekecheiria).values({
    id: crypto.randomUUID(),
    agonistId: agonista.id,
    motivo: motivoTrim,
    fechaInicio: hoy,
    activa: true,
  })

  const eventoEkecheiriaId = crypto.randomUUID()
  await db.insert(agoraEventos).values({
    id: eventoEkecheiriaId,
    agonistId: agonista.id,
    tipo: 'senalamiento',
    contenido: `${agonista.nombre} invocó La Ekecheiria. La tregua sagrada del agon fue declarada. El motivo: "${motivoTrim}"`,
    metadata: { motivo: motivoTrim, tipo: 'ekecheiria' },
  })

  void triggerComentariosDioses(eventoEkecheiriaId).catch((err) =>
    console.error('triggerComentariosDioses ekecheiria', err)
  )

  const config = INSCRIPCIONES.find((i) => i.id === 'la_ekecheiria')
  if (config) {
    const ya = await db
      .select()
      .from(inscripciones)
      .where(
        and(
          eq(inscripciones.agonistId, agonista.id),
          eq(inscripciones.inscripcionId, 'la_ekecheiria')
        )
      )
      .limit(1)

    if (ya.length === 0) {
      await db.insert(inscripciones).values({
        id: crypto.randomUUID(),
        agonistId: agonista.id,
        inscripcionId: 'la_ekecheiria',
        secreto: true,
      })

      const eventoInscripcionId = crypto.randomUUID()
      await db.insert(agoraEventos).values({
        id: eventoInscripcionId,
        agonistId: agonista.id,
        tipo: 'inscripcion_desbloqueada',
        contenido: `${agonista.nombre} desbloqueó: ${config.nombre}.`,
        metadata: { inscripcionId: 'la_ekecheiria' },
      })

      void triggerComentariosDioses(eventoInscripcionId).catch((err) =>
        console.error('triggerComentariosDioses inscripcion ekecheiria', err)
      )
    }
  }

  return NextResponse.json({ ok: true })
}
