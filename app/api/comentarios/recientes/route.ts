import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comentariosAgora } from '@/lib/db/schema'
import { and, desc, eq, inArray } from 'drizzle-orm'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const noVistos = await db
    .select()
    .from(comentariosAgora)
    .where(
      and(
        eq(comentariosAgora.autorTipo, 'dios'),
        eq(comentariosAgora.procesado, true),
        eq(comentariosAgora.visto, false)
      )
    )
    .orderBy(desc(comentariosAgora.createdAt))
    .limit(10)

  return NextResponse.json({ comentariosDioses: noVistos })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const ids =
    body && typeof body === 'object' && 'ids' in body
      ? (body as { ids?: unknown }).ids
      : undefined

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ ok: true })
  }

  const validIds = ids.filter((id): id is string => typeof id === 'string')
  if (validIds.length === 0) {
    return NextResponse.json({ ok: true })
  }

  await db
    .update(comentariosAgora)
    .set({ visto: true })
    .where(
      and(
        inArray(comentariosAgora.id, validIds),
        eq(comentariosAgora.autorTipo, 'dios')
      )
    )

  return NextResponse.json({ ok: true })
}
