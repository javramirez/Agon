import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cronicas, pruebasDiarias } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { generarCronica, generarCronicaConFecha } from '@/lib/cronica/generar'
import { getSemanaActual, getAmbosAgonistas } from '@/lib/db/queries'

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
    const hoy = new Date()
    const startStr = process.env.NEXT_PUBLIC_AGON_START_DATE
    const inicioGranAgon = startStr ? new Date(startStr) : null

    // Antes del inicio oficial del desafío: usar fechas reales en pruebas_diarias
    if (inicioGranAgon && !Number.isNaN(inicioGranAgon.getTime()) && hoy < inicioGranAgon) {
      const ambos = await getAmbosAgonistas()
      if (ambos.length < 2) {
        return NextResponse.json(
          { error: 'Faltan agonistas en DB.' },
          { status: 400 }
        )
      }

      const [a1, a2] = ambos
      const [pruebas1, pruebas2] = await Promise.all([
        db.select().from(pruebasDiarias).where(eq(pruebasDiarias.agonistId, a1.id)),
        db.select().from(pruebasDiarias).where(eq(pruebasDiarias.agonistId, a2.id)),
      ])

      const todasLasFechas = [
        ...pruebas1.map((p) => String(p.fecha)),
        ...pruebas2.map((p) => String(p.fecha)),
      ].sort()

      if (todasLasFechas.length === 0) {
        return NextResponse.json(
          { error: 'No hay registros en pruebas_diarias.' },
          { status: 400 }
        )
      }

      const relato = await generarCronicaConFecha(1, todasLasFechas[0])
      return NextResponse.json({ ok: true, relato })
    }

    const semana = getSemanaActual()
    const relato = await generarCronica(semana)
    return NextResponse.json({ ok: true, relato })
  } catch (error: unknown) {
    console.error('Error generando crónica:', error)
    const message =
      error instanceof Error
        ? error.message
        : 'Error al generar La Crónica.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
