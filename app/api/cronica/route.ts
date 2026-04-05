import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cronicas } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { generarCronica } from '@/lib/cronica/generar'
import { getSemanaActual } from '@/lib/db/queries'

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

  if (userId !== process.env.CLERK_JAVIER_USER_ID) {
    return NextResponse.json(
      { error: 'Solo el administrador puede generar La Crónica.' },
      { status: 403 }
    )
  }

  try {
    const semana = getSemanaActual()
    const relato = await generarCronica(semana)
    return NextResponse.json({ ok: true, relato })
  } catch (error: unknown) {
    console.error('Error generando crónica:', error)
    const message = error instanceof Error ? error.message : 'Error al generar La Crónica.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
