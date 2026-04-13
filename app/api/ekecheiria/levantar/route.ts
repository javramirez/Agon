import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ekecheiria, agoraEventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getOrCreateAgonista } from '@/lib/db/queries'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'

export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const agonista = await getOrCreateAgonista(userId)

  const rows = await db
    .select()
    .from(ekecheiria)
    .where(eq(ekecheiria.activa, true))
    .limit(1)

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No hay tregua activa.' }, { status: 400 })
  }

  const tregua = rows[0]

  if (
    tregua.confirmacion_levantar_1 === agonista.id ||
    tregua.confirmacion_levantar_2 === agonista.id
  ) {
    return NextResponse.json(
      { error: 'Ya confirmaste el levantamiento.' },
      { status: 400 }
    )
  }

  const esSlot1 = !tregua.confirmacion_levantar_1
  await db
    .update(ekecheiria)
    .set(
      esSlot1
        ? { confirmacion_levantar_1: agonista.id }
        : { confirmacion_levantar_2: agonista.id }
    )
    .where(eq(ekecheiria.id, tregua.id))

  const confirmacion1 = esSlot1 ? agonista.id : tregua.confirmacion_levantar_1
  const confirmacion2 = esSlot1 ? tregua.confirmacion_levantar_2 : agonista.id
  const ambosConfirmaron = Boolean(confirmacion1 && confirmacion2)

  if (ambosConfirmaron) {
    const hoy = new Date().toISOString().split('T')[0]!

    await db
      .update(ekecheiria)
      .set({ activa: false, fechaFin: hoy })
      .where(eq(ekecheiria.id, tregua.id))

    const eventoId = crypto.randomUUID()
    await db.insert(agoraEventos).values({
      id: eventoId,
      agonistId: agonista.id,
      tipo: 'senalamiento',
      contenido:
        'La Ekecheiria fue levantada. Ambos agonistas acordaron reanudar el Gran Agon. Que los dioses sean testigos.',
      metadata: { tipo: 'ekecheiria_levantada' },
    })

    void triggerComentariosDioses(eventoId).catch(() => {})

    return NextResponse.json({ ok: true, levantada: true })
  }

  return NextResponse.json({ ok: true, levantada: false })
}
