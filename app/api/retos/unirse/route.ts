import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { agonistas, retos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAgonistaByClerkId } from '@/lib/db/queries'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { retoId } = body as { retoId: string }
  if (!retoId) {
    return NextResponse.json({ error: 'retoId requerido' }, { status: 400 })
  }

  const result = await db
    .select()
    .from(retos)
    .where(eq(retos.id, retoId))
    .limit(1)

  const reto = result[0] ?? null
  if (!reto) {
    return NextResponse.json({ error: 'Reto no encontrado' }, { status: 404 })
  }
  if (reto.modo !== 'duelo') {
    return NextResponse.json({ error: 'Modo inválido' }, { status: 400 })
  }
  if (reto.invitadoClerkId) {
    return NextResponse.json({ error: 'El reto ya tiene dos agonistas' }, { status: 400 })
  }
  if (reto.creadorClerkId === userId) {
    return NextResponse.json({ error: 'No puedes unirte a tu propio reto' }, { status: 400 })
  }

  const agonista = await getAgonistaByClerkId(userId)
  if (agonista?.retoId) {
    return NextResponse.json({ error: 'Ya tienes un reto activo' }, { status: 400 })
  }

  const clerkUser = await currentUser()
  const nombre =
    clerkUser?.firstName ??
    clerkUser?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ??
    'Agonista'

  try {
    await db
      .update(retos)
      .set({ invitadoClerkId: userId, updatedAt: new Date() })
      .where(eq(retos.id, retoId))

    if (agonista) {
      await db
        .update(agonistas)
        .set({ retoId, rol: 'invitado', updatedAt: new Date() })
        .where(eq(agonistas.clerkId, userId))
    } else {
      await db.insert(agonistas).values({
        id: crypto.randomUUID(),
        clerkId: userId,
        nombre,
        retoId,
        rol: 'invitado',
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error uniéndose al reto:', error)
    return NextResponse.json({ error: 'Error al unirse al reto' }, { status: 500 })
  }
}
