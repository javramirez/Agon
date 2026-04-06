import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { semanaSagrada, agoraEventos, calendarioAgan } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSemanaActual, getOrCreateAgonista } from '@/lib/db/queries'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const activa = await db
    .select()
    .from(semanaSagrada)
    .where(eq(semanaSagrada.activa, true))
    .limit(1)

  const calendario = await db.select().from(calendarioAgan).limit(1)
  const semanaSorteada = calendario[0]?.semanaSagradaSemana ?? null

  return NextResponse.json({
    activa: activa.length > 0,
    semanaSagrada: activa[0] ?? null,
    semanaSorteada,
  })
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (userId !== process.env.CLERK_JAVIER_USER_ID) {
    return NextResponse.json(
      { error: 'Solo el administrador puede activar esto.' },
      { status: 403 }
    )
  }

  const existing = await db
    .select()
    .from(semanaSagrada)
    .where(eq(semanaSagrada.activa, true))
    .limit(1)

  if (existing.length > 0) {
    return NextResponse.json(
      { error: 'Ya hay una Semana Sagrada activa.' },
      { status: 400 }
    )
  }

  const semana = getSemanaActual()
  const hoy = new Date().toISOString().split('T')[0]
  const finSemana = new Date()
  finSemana.setDate(finSemana.getDate() + (7 - finSemana.getDay()))
  const finStr = finSemana.toISOString().split('T')[0]

  await db.insert(semanaSagrada).values({
    id: crypto.randomUUID(),
    activa: true,
    fechaInicio: hoy,
    fechaFin: finStr,
    activadaEn: new Date(),
  })

  const javier = await getOrCreateAgonista(userId)

  const eventoId = crypto.randomUUID()
  await db.insert(agoraEventos).values({
    id: eventoId,
    agonistId: javier.id,
    tipo: 'semana_sagrada',
    contenido: `⚡ El Altis proclama La Semana Sagrada. Todo el kleos ganado esta semana vale el doble. El Gran Agon entra en su momento más épico.`,
    metadata: { semana, fechaInicio: hoy, fechaFin: finStr },
  })

  void triggerComentariosDioses(eventoId).catch((err) =>
    console.error('triggerComentariosDioses admin semana_sagrada', err)
  )

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (userId !== process.env.CLERK_JAVIER_USER_ID) {
    return NextResponse.json(
      { error: 'Solo el administrador puede hacer esto.' },
      { status: 403 }
    )
  }

  await db
    .update(semanaSagrada)
    .set({ activa: false })
    .where(eq(semanaSagrada.activa, true))

  return NextResponse.json({ ok: true })
}
