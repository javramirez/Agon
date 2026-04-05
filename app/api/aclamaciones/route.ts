import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { aclamaciones } from '@/lib/db/schema'
import { eq, and, count } from 'drizzle-orm'
import { getOrCreateAgonista } from '@/lib/db/queries'
import { ACLAMACIONES_POR_DIA } from '@/lib/db/constants'

const TIPOS_ACLAMACION = [
  'fuego',
  'sin_piedad',
  'agonia',
  'digno_del_altis',
  'el_agon_te_juzga',
] as const

type TipoAclamacion = (typeof TIPOS_ACLAMACION)[number]

function esTipoAclamacion(t: unknown): t is TipoAclamacion {
  return typeof t === 'string' && TIPOS_ACLAMACION.includes(t as TipoAclamacion)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)
  const hoy = new Date().toISOString().split('T')[0]

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const eventoId =
    body && typeof body === 'object' && 'eventoId' in body
      ? (body as { eventoId?: unknown }).eventoId
      : undefined
  const tipo =
    body && typeof body === 'object' && 'tipo' in body
      ? (body as { tipo?: unknown }).tipo
      : undefined

  if (typeof eventoId !== 'string' || !eventoId) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  if (!esTipoAclamacion(tipo)) {
    return NextResponse.json({ error: 'Tipo de aclamación inválido' }, { status: 400 })
  }

  const usadas = await db
    .select({ count: count() })
    .from(aclamaciones)
    .where(
      and(
        eq(aclamaciones.agonistId, agonista.id),
        eq(aclamaciones.fecha, hoy)
      )
    )

  const n = Number(usadas[0]?.count ?? 0)
  if (n >= ACLAMACIONES_POR_DIA) {
    return NextResponse.json(
      { error: 'Has usado todas tus aclamaciones de hoy.' },
      { status: 429 }
    )
  }

  const yaAclamado = await db
    .select()
    .from(aclamaciones)
    .where(
      and(
        eq(aclamaciones.agonistId, agonista.id),
        eq(aclamaciones.eventoId, eventoId)
      )
    )
    .limit(1)

  if (yaAclamado.length > 0) {
    return NextResponse.json(
      { error: 'Ya aclamaste este evento.' },
      { status: 400 }
    )
  }

  await db.insert(aclamaciones).values({
    id: crypto.randomUUID(),
    agonistId: agonista.id,
    eventoId,
    tipo,
    fecha: hoy,
  })

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)
  const hoy = new Date().toISOString().split('T')[0]

  const usadas = await db
    .select({ count: count() })
    .from(aclamaciones)
    .where(
      and(
        eq(aclamaciones.agonistId, agonista.id),
        eq(aclamaciones.fecha, hoy)
      )
    )

  const n = Number(usadas[0]?.count ?? 0)
  return NextResponse.json({
    usadas: n,
    disponibles: ACLAMACIONES_POR_DIA - n,
  })
}
