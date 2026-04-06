import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comentariosAgora } from '@/lib/db/schema'
import { and, eq, inArray, count } from 'drizzle-orm'

const MAX_IDS = 100

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const eventoIds =
    body &&
    typeof body === 'object' &&
    body !== null &&
    'eventoIds' in body &&
    Array.isArray((body as { eventoIds: unknown }).eventoIds)
      ? (body as { eventoIds: unknown[] }).eventoIds
      : null

  if (!eventoIds || eventoIds.length === 0) {
    return NextResponse.json({ counts: {} as Record<string, number> })
  }

  const ids = eventoIds
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
    .slice(0, MAX_IDS)

  if (ids.length === 0) {
    return NextResponse.json({ counts: {} as Record<string, number> })
  }

  const results = await db
    .select({
      eventoId: comentariosAgora.eventoId,
      total: count(),
    })
    .from(comentariosAgora)
    .where(
      and(
        inArray(comentariosAgora.eventoId, ids),
        eq(comentariosAgora.procesado, true)
      )
    )
    .groupBy(comentariosAgora.eventoId)

  const counts: Record<string, number> = {}
  for (const r of results) {
    counts[r.eventoId] = Number(r.total ?? 0)
  }

  return NextResponse.json({ counts })
}
