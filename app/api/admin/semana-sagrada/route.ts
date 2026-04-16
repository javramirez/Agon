import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { semanaSagrada, calendarioAgan } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

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

  // TODO PROMPT-01: gate CLERK_JAVIER_USER_ID eliminado (PROMPT 03)
  void userId
  return NextResponse.json(
    { error: 'No autorizado.' },
    { status: 403 }
  )
}

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // TODO PROMPT-01: gate CLERK_JAVIER_USER_ID eliminado (PROMPT 03)
  void userId
  return NextResponse.json(
    { error: 'No autorizado.' },
    { status: 403 }
  )
}
