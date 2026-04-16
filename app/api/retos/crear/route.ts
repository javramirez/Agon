import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { agonistas, retos } from '@/lib/db/schema'
import { getAgonistaByClerkId } from '@/lib/db/queries'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { modo } = body as { modo: string }
  if (modo !== 'solo' && modo !== 'duelo') {
    return NextResponse.json({ error: 'Modo inválido' }, { status: 400 })
  }

  // Verificar que no tenga ya un reto activo
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
    // Crear reto
    const retoId = crypto.randomUUID()
    const codigoInvitacion =
      modo === 'duelo'
        ? Math.random().toString(36).substring(2, 8).toUpperCase()
        : null

    await db.insert(retos).values({
      id: retoId,
      modo,
      estado: 'configurando',
      creadorClerkId: userId,
      codigoInvitacion,
    })

    // Crear o actualizar agonista
    if (agonista) {
      // Ya existe — solo asignar reto
      await db
        .update(agonistas)
        .set({ retoId, rol: 'creador', updatedAt: new Date() })
        .where(eq(agonistas.clerkId, userId))
    } else {
      // Crear nuevo agonista
      await db.insert(agonistas).values({
        id: crypto.randomUUID(),
        clerkId: userId,
        nombre,
        retoId,
        rol: 'creador',
      })
    }

    return NextResponse.json({ ok: true, retoId, modo, codigoInvitacion })
  } catch (error) {
    console.error('Error creando reto:', error)
    return NextResponse.json({ error: 'Error al crear el reto' }, { status: 500 })
  }
}

