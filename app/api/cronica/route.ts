import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cronicas } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const todas = await db
    .select()
    .from(cronicas)
    .orderBy(desc(cronicas.semana))
    .limit(10)

  return NextResponse.json({ cronicas: todas })
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
