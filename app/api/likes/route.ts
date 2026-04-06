import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { likesAgora } from '@/lib/db/schema'
import { eq, and, count } from 'drizzle-orm'
import { getOrCreateAgonista } from '@/lib/db/queries'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)

  let body: { eventoId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { eventoId } = body
  if (typeof eventoId !== 'string' || !eventoId) {
    return NextResponse.json({ error: 'Falta eventoId' }, { status: 400 })
  }

  const existing = await db
    .select()
    .from(likesAgora)
    .where(
      and(
        eq(likesAgora.eventoId, eventoId),
        eq(likesAgora.autorId, agonista.clerkId)
      )
    )
    .limit(1)

  if (existing.length > 0) {
    await db.delete(likesAgora).where(eq(likesAgora.id, existing[0].id))
    return NextResponse.json({ liked: false })
  }

  await db.insert(likesAgora).values({
    id: crypto.randomUUID(),
    eventoId,
    autorTipo: 'agonista',
    autorId: agonista.clerkId,
  })

  return NextResponse.json({ liked: true })
}

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)
  const { searchParams } = new URL(req.url)
  const eventoId = searchParams.get('eventoId')
  if (!eventoId) return NextResponse.json({ error: 'Falta eventoId' }, { status: 400 })

  const [total, miLike] = await Promise.all([
    db
      .select({ count: count() })
      .from(likesAgora)
      .where(eq(likesAgora.eventoId, eventoId)),
    db
      .select()
      .from(likesAgora)
      .where(
        and(
          eq(likesAgora.eventoId, eventoId),
          eq(likesAgora.autorId, agonista.clerkId)
        )
      )
      .limit(1),
  ])

  return NextResponse.json({
    total: Number(total[0]?.count ?? 0),
    miLike: miLike.length > 0,
  })
}
