import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  pruebaExtraordinaria,
  agonistas,
  kleosLog,
  agoraEventos,
  pruebasDiarias,
  semanaSagrada,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getOrCreateAgonista, getSemanaActual } from '@/lib/db/queries'

// GET — obtener la prueba extraordinaria activa
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const semana = getSemanaActual()
  const hoy = new Date().toISOString().split('T')[0]
  const agonista = await getOrCreateAgonista(userId)

  const activa = await db
    .select()
    .from(pruebaExtraordinaria)
    .where(
      and(
        eq(pruebaExtraordinaria.semana, semana),
        eq(pruebaExtraordinaria.activa, true)
      )
    )
    .limit(1)

  if (activa.length === 0) {
    return NextResponse.json({ prueba: null, expirada: false, completada: false })
  }

  const prueba = activa[0]
  const ahora = new Date()
  const expirada = new Date(prueba.fechaExpira) < ahora

  const filaHoy = await db
    .select()
    .from(pruebasDiarias)
    .where(
      and(
        eq(pruebasDiarias.agonistId, agonista.id),
        eq(pruebasDiarias.fecha, hoy)
      )
    )
    .limit(1)

  const completada = filaHoy[0]?.pruebaExtraordinariaCompletada ?? false

  if (expirada) {
    return NextResponse.json({
      prueba: null,
      expirada: true,
      completada,
    })
  }

  return NextResponse.json({
    prueba,
    expirada: false,
    completada,
  })
}

// POST — completar la prueba extraordinaria
export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)
  const semana = getSemanaActual()
  const hoy = new Date().toISOString().split('T')[0]

  const activa = await db
    .select()
    .from(pruebaExtraordinaria)
    .where(
      and(
        eq(pruebaExtraordinaria.semana, semana),
        eq(pruebaExtraordinaria.activa, true)
      )
    )
    .limit(1)

  if (activa.length === 0) {
    return NextResponse.json(
      { error: 'No hay prueba extraordinaria activa.' },
      { status: 400 }
    )
  }

  const prueba = activa[0]

  if (new Date(prueba.fechaExpira) < new Date()) {
    return NextResponse.json(
      { error: 'La prueba extraordinaria expiró.' },
      { status: 400 }
    )
  }

  const filaHoy = await db
    .select()
    .from(pruebasDiarias)
    .where(
      and(
        eq(pruebasDiarias.agonistId, agonista.id),
        eq(pruebasDiarias.fecha, hoy)
      )
    )
    .limit(1)

  if (filaHoy[0]?.pruebaExtraordinariaCompletada) {
    return NextResponse.json(
      { error: 'Ya completaste la Prueba Extraordinaria de hoy.' },
      { status: 400 }
    )
  }

  let pruebaDiariaId = filaHoy[0]?.id
  if (!pruebaDiariaId) {
    const nueva = await db
      .insert(pruebasDiarias)
      .values({
        id: crypto.randomUUID(),
        agonistId: agonista.id,
        fecha: hoy,
      })
      .returning()
    pruebaDiariaId = nueva[0]!.id
  }

  const sagradaActiva = await db
    .select()
    .from(semanaSagrada)
    .where(eq(semanaSagrada.activa, true))
    .limit(1)

  const multiplicador = sagradaActiva.length > 0 ? 2 : 1
  const kleosFinales = prueba.kleosBonus * multiplicador

  await db
    .update(agonistas)
    .set({ kleosTotal: agonista.kleosTotal + kleosFinales })
    .where(eq(agonistas.id, agonista.id))

  await db.insert(kleosLog).values({
    id: crypto.randomUUID(),
    agonistId: agonista.id,
    cantidad: kleosFinales,
    motivo: 'prueba_extraordinaria',
    fecha: hoy,
  })

  await db
    .update(pruebasDiarias)
    .set({ pruebaExtraordinariaCompletada: true, updatedAt: new Date() })
    .where(eq(pruebasDiarias.id, pruebaDiariaId))

  await db.insert(agoraEventos).values({
    id: crypto.randomUUID(),
    agonistId: agonista.id,
    tipo: 'prueba_extraordinaria',
    contenido: `${agonista.nombre} completó La Prueba Extraordinaria de la semana ${semana} y ganó ${kleosFinales} kleos${multiplicador === 2 ? ' (⚡ Semana Sagrada — doble kleos)' : ''}.`,
    metadata: { semana, kleos: kleosFinales, multiplicador },
  })

  return NextResponse.json({ ok: true, kleos: kleosFinales, multiplicador })
}
