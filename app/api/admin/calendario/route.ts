import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { calendarioAgan } from '@/lib/db/schema'
import { generarCalendarioAgan } from '@/lib/pruebas-extraordinarias/calendario'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (userId !== process.env.CLERK_JAVIER_USER_ID) {
    return NextResponse.json({ error: 'Solo el administrador.' }, { status: 403 })
  }

  const rows = await db.select().from(calendarioAgan).limit(1)
  return NextResponse.json({ ok: true, existe: rows.length > 0 })
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (userId !== process.env.CLERK_JAVIER_USER_ID) {
    return NextResponse.json({ error: 'Solo el administrador.' }, { status: 403 })
  }

  try {
    await generarCalendarioAgan()
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
