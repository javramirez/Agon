import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getAgonistaByClerkId, getAntagonistaPorReto } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { pruebasDiarias } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getAgonistaByClerkId(userId)
  if (!agonista) {
    return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })
  }
  const hoy = new Date().toISOString().split('T')[0]

  const antagonista = agonista.retoId
    ? await getAntagonistaPorReto(agonista.retoId, agonista.id)
    : null

  const [pruebaPropia, pruebaAntagonista] = await Promise.all([
    db
      .select()
      .from(pruebasDiarias)
      .where(
        and(
          eq(pruebasDiarias.agonistId, agonista.id),
          eq(pruebasDiarias.fecha, hoy)
        )
      )
      .limit(1),
    antagonista
      ? db
          .select()
          .from(pruebasDiarias)
          .where(
            and(
              eq(pruebasDiarias.agonistId, antagonista.id),
              eq(pruebasDiarias.fecha, hoy)
            )
          )
          .limit(1)
      : Promise.resolve([]),
  ])

  return NextResponse.json({
    agonista: {
      ...agonista,
      pruebas: pruebaPropia[0] ?? null,
    },
    antagonista: antagonista
      ? {
          ...antagonista,
          pruebas: pruebaAntagonista[0] ?? null,
        }
      : null,
  })
}
