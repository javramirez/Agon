import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getOrCreateAgonista, getAgonistaByClerkId } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { pruebasDiarias } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { AGONISTAS } from '@/lib/auth'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)
  const hoy = new Date().toISOString().split('T')[0]

  const antagonistaConfig = Object.values(AGONISTAS).find(
    (a) => a.clerkId !== agonista.clerkId
  )
  const antagonista = antagonistaConfig
    ? await getAgonistaByClerkId(antagonistaConfig.clerkId)
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
