import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { senalamiento, agoraEventos, agonistas } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getOrCreateAgonista, getAgonistaByClerkId } from '@/lib/db/queries'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'
import { AGONISTAS } from '@/lib/auth/agonistas'

const NIVELES_SENALAMIENTO = [
  'campeon',
  'heroe',
  'semidios',
  'olimpico',
  'leyenda_del_agon',
  'inmortal',
] as const

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)

  const comoSenalador = await db
    .select()
    .from(senalamiento)
    .where(eq(senalamiento.senaladorId, agonista.id))
    .limit(1)

  const comoSenalado = await db
    .select()
    .from(senalamiento)
    .where(eq(senalamiento.senaladorId2, agonista.id))
    .limit(1)

  return NextResponse.json({
    usado: comoSenalador.length > 0,
    recibido: comoSenalado.length > 0,
    senalamiento: comoSenalador[0] ?? null,
    senalamientoRecibido: comoSenalado[0] ?? null,
  })
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)

  if (
    !NIVELES_SENALAMIENTO.includes(
      agonista.nivel as (typeof NIVELES_SENALAMIENTO)[number]
    )
  ) {
    return NextResponse.json(
      { error: 'El Señalamiento requiere alcanzar el nivel Campeón.' },
      { status: 403 }
    )
  }

  const yaUsado = await db
    .select()
    .from(senalamiento)
    .where(eq(senalamiento.senaladorId, agonista.id))
    .limit(1)

  if (yaUsado.length > 0) {
    return NextResponse.json(
      { error: 'Ya usaste El Señalamiento en este Gran Agon.' },
      { status: 400 }
    )
  }

  const antagonistaConfig = Object.values(AGONISTAS).find(
    (a) => a.clerkId !== agonista.clerkId
  )
  const antagonista = antagonistaConfig
    ? await getAgonistaByClerkId(antagonistaConfig.clerkId)
    : null

  if (!antagonista) {
    return NextResponse.json(
      { error: 'El antagonista no existe aún.' },
      { status: 400 }
    )
  }

  await db.insert(senalamiento).values({
    id: crypto.randomUUID(),
    senaladorId: agonista.id,
    senaladorId2: antagonista.id,
  })

  await db
    .update(agonistas)
    .set({ senalamiento_usado: true, updatedAt: new Date() })
    .where(eq(agonistas.id, agonista.id))

  await db
    .update(agonistas)
    .set({ senalamiento_recibido: true, updatedAt: new Date() })
    .where(eq(agonistas.id, antagonista.id))

  const eventoId = crypto.randomUUID()
  await db.insert(agoraEventos).values({
    id: eventoId,
    agonistId: agonista.id,
    tipo: 'senalamiento',
    contenido: `${agonista.nombre} ha señalado a ${antagonista.nombre} e injuriado sus capacidades. El Ágora lo presenció. El agon espera su respuesta.`,
    metadata: {
      senaladorId: agonista.id,
      senaladoId: antagonista.id,
    },
  })

  void triggerComentariosDioses(eventoId).catch((err) =>
    console.error('triggerComentariosDioses senalamiento', err)
  )

  return NextResponse.json({ ok: true })
}
