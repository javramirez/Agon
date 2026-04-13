import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notificaciones } from '@/lib/db/schema'
import { eq, and, count } from 'drizzle-orm'
import { getOrCreateAgonista } from '@/lib/db/queries'

// GET — solo el conteo de no leídas (endpoint liviano para el badge)
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)

  const resultado = await db
    .select({ total: count() })
    .from(notificaciones)
    .where(
      and(
        eq(notificaciones.agonistId, agonista.id),
        eq(notificaciones.leida, false)
      )
    )

  const total = Number(resultado[0]?.total ?? 0)

  return NextResponse.json({ count: total })
}
