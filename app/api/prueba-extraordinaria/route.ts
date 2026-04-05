import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  pruebaExtraordinaria,
  agonistas,
  kleosLog,
  agoraEventos,
  semanaSagrada,
} from '@/lib/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { getOrCreateAgonista, getSemanaActual } from '@/lib/db/queries'

const MAX_TRIPTICO_SEMANA = 2
const MAX_DESTINO_SEMANA = 3

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const ahora = new Date()
  const semana = getSemanaActual()

  const activas = await db
    .select()
    .from(pruebaExtraordinaria)
    .where(
      and(
        eq(pruebaExtraordinaria.activa, true),
        gte(pruebaExtraordinaria.fechaExpira, ahora)
      )
    )

  const esJavier = userId === process.env.CLERK_JAVIER_USER_ID

  const completadaPorMi = (p: (typeof activas)[0]) =>
    esJavier ? p.completadaPorJavier : p.completadaPorMatias

  const tripticoCompletadasEstaSemana = activas.filter(
    (p) =>
      p.tipo === 'triptico' &&
      p.semana === semana &&
      completadaPorMi(p)
  ).length

  const tripticosDisponibles = activas.filter(
    (p) =>
      p.tipo === 'triptico' &&
      p.semana === semana &&
      !completadaPorMi(p)
  )

  const destinosDisponibles = activas.filter(
    (p) => p.tipo === 'destino' && !completadaPorMi(p)
  )

  return NextResponse.json({
    triptico: {
      disponibles: tripticosDisponibles,
      completadasEstaSemana: tripticoCompletadasEstaSemana,
      maxSemana: MAX_TRIPTICO_SEMANA,
    },
    destino: {
      disponibles: destinosDisponibles,
    },
  })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)
  const { pruebaId: filaId } = (await req.json()) as { pruebaId: string }
  const hoy = new Date().toISOString().split('T')[0]
  const semana = getSemanaActual()
  const esJavier = userId === process.env.CLERK_JAVIER_USER_ID

  if (!filaId) {
    return NextResponse.json({ error: 'Falta pruebaId.' }, { status: 400 })
  }

  const pruebaRows = await db
    .select()
    .from(pruebaExtraordinaria)
    .where(eq(pruebaExtraordinaria.id, filaId))
    .limit(1)

  if (pruebaRows.length === 0) {
    return NextResponse.json({ error: 'Prueba no encontrada.' }, { status: 404 })
  }

  const p = pruebaRows[0]

  if (new Date(p.fechaExpira) < new Date()) {
    return NextResponse.json({ error: 'Esta prueba ya expiró.' }, { status: 400 })
  }

  if (esJavier ? p.completadaPorJavier : p.completadaPorMatias) {
    return NextResponse.json({ error: 'Ya completaste esta prueba.' }, { status: 400 })
  }

  if (p.tipo === 'triptico') {
    const completadasEstaSemana = await db
      .select()
      .from(pruebaExtraordinaria)
      .where(
        and(
          eq(pruebaExtraordinaria.tipo, 'triptico'),
          eq(pruebaExtraordinaria.semana, semana),
          esJavier
            ? eq(pruebaExtraordinaria.completadaPorJavier, true)
            : eq(pruebaExtraordinaria.completadaPorMatias, true)
        )
      )

    if (completadasEstaSemana.length >= MAX_TRIPTICO_SEMANA) {
      return NextResponse.json(
        {
          error:
            'Ya completaste el máximo de 2 pruebas del Tríptico esta semana.',
        },
        { status: 400 }
      )
    }
  }

  if (p.tipo === 'destino') {
    const completadasEstaSemana = await db
      .select()
      .from(pruebaExtraordinaria)
      .where(
        and(
          eq(pruebaExtraordinaria.tipo, 'destino'),
          eq(pruebaExtraordinaria.semana, semana),
          esJavier
            ? eq(pruebaExtraordinaria.completadaPorJavier, true)
            : eq(pruebaExtraordinaria.completadaPorMatias, true)
        )
      )

    if (completadasEstaSemana.length >= MAX_DESTINO_SEMANA) {
      return NextResponse.json(
        {
          error:
            'Ya completaste el máximo de 3 Eventos del Destino esta semana.',
        },
        { status: 400 }
      )
    }
  }

  const sagradaActiva = await db
    .select()
    .from(semanaSagrada)
    .where(eq(semanaSagrada.activa, true))
    .limit(1)

  const multiplicador = sagradaActiva.length > 0 ? 2 : 1
  const kleosFinales = p.kleosBonus * multiplicador

  await db
    .update(pruebaExtraordinaria)
    .set(
      esJavier
        ? { completadaPorJavier: true }
        : { completadaPorMatias: true }
    )
    .where(eq(pruebaExtraordinaria.id, filaId))

  await db
    .update(agonistas)
    .set({
      kleosTotal: agonista.kleosTotal + kleosFinales,
      updatedAt: new Date(),
    })
    .where(eq(agonistas.id, agonista.id))

  await db.insert(kleosLog).values({
    id: crypto.randomUUID(),
    agonistId: agonista.id,
    cantidad: kleosFinales,
    motivo: `prueba_${p.tipo}`,
    fecha: hoy,
  })

  const tipoLabel = p.tipo === 'triptico' ? 'del Tríptico' : 'del Destino'
  await db.insert(agoraEventos).values({
    id: crypto.randomUUID(),
    agonistId: agonista.id,
    tipo: 'prueba_extraordinaria',
    contenido: `${agonista.nombre} completó la Prueba Extraordinaria ${tipoLabel}: "${p.descripcion}" +${kleosFinales} kleos${multiplicador === 2 ? ' (⚡ Semana Sagrada)' : ''}.`,
    metadata: { pruebaId: p.pruebaId, tipo: p.tipo, kleos: kleosFinales },
  })

  return NextResponse.json({ ok: true, kleos: kleosFinales, multiplicador })
}
