import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notificaciones } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { getOrCreateAgonista } from '@/lib/db/queries'

// GET — lista de notificaciones del agonista autenticado
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)

  const lista = await db
    .select()
    .from(notificaciones)
    .where(eq(notificaciones.agonistId, agonista.id))
    .orderBy(desc(notificaciones.createdAt))
    .limit(50)

  return NextResponse.json({ notificaciones: lista })
}

// PATCH — marcar todas como leídas
export async function PATCH() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)

  await db
    .update(notificaciones)
    .set({ leida: true })
    .where(
      and(
        eq(notificaciones.agonistId, agonista.id),
        eq(notificaciones.leida, false)
      )
    )

  return NextResponse.json({ ok: true })
}
