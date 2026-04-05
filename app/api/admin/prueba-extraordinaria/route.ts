import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pruebaExtraordinaria, agoraEventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSemanaActual, getOrCreateAgonista } from '@/lib/db/queries'
import { PRUEBAS_EXTRAORDINARIAS } from '@/lib/db/constants'

// Solo Javier puede activar pruebas extraordinarias
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (userId !== process.env.CLERK_JAVIER_USER_ID) {
    return NextResponse.json(
      { error: 'Solo el administrador puede activar esto.' },
      { status: 403 }
    )
  }

  const { pruebaId } = await req.json()

  const config = PRUEBAS_EXTRAORDINARIAS.find((p) => p.id === pruebaId)
  if (!config) {
    return NextResponse.json({ error: 'Prueba no válida.' }, { status: 400 })
  }

  const semana = getSemanaActual()

  await db
    .update(pruebaExtraordinaria)
    .set({ activa: false })
    .where(eq(pruebaExtraordinaria.semana, semana))

  const expira = new Date()
  expira.setHours(23, 59, 59, 999)

  const nueva = await db
    .insert(pruebaExtraordinaria)
    .values({
      id: crypto.randomUUID(),
      semana,
      descripcion: config.descripcion,
      kleosBonus: config.kleos,
      activa: true,
      fechaExpira: expira,
    })
    .returning()

  const javier = await getOrCreateAgonista(userId)

  await db.insert(agoraEventos).values({
    id: crypto.randomUUID(),
    agonistId: javier.id,
    tipo: 'prueba_extraordinaria',
    contenido: `El Altis lanzó La Prueba Extraordinaria de la semana ${semana}: "${config.descripcion}" Vale ${config.kleos} kleos.`,
    metadata: { semana, pruebaId, kleos: config.kleos },
  })

  return NextResponse.json({ prueba: nueva[0] })
}
