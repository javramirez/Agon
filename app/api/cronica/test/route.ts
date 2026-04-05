import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pruebasDiarias } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAmbosAgonistas } from '@/lib/db/queries'
import { generarCronica } from '@/lib/cronica/generar'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (userId !== process.env.CLERK_JAVIER_USER_ID) {
    return NextResponse.json({ error: 'Solo el administrador.' }, { status: 403 })
  }

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
      {
        error:
          'No hay registros en pruebas_diarias. Marca algunas pruebas primero.',
      },
      { status: 400 }
    )
  }

  const fechaMinima = todasLasFechas[0]
  const fechaMaxima = todasLasFechas[todasLasFechas.length - 1]

  const diagnostico = {
    agonista1: {
      nombre: a1.nombre,
      registros: pruebas1.length,
      diasPerfectos: pruebas1.filter((p) => p.diaPerfecto).length,
      diasPerfectosPorLogica: pruebas1.filter(
        (p) =>
          p.soloAgua &&
          p.sinComidaRapida &&
          p.pasos >= 10000 &&
          p.horasSueno >= 7 &&
          p.paginasLeidas >= 10 &&
          p.sesionesGym >= 4 &&
          p.sesionesCardio >= 3
      ).length,
      kleosTotal: a1.kleosTotal,
      kleosDesdePruebas: pruebas1.reduce((s, p) => s + p.kleosGanado, 0),
      fechas: pruebas1.map((p) => String(p.fecha)),
    },
    agonista2: {
      nombre: a2.nombre,
      registros: pruebas2.length,
      diasPerfectos: pruebas2.filter((p) => p.diaPerfecto).length,
      diasPerfectosPorLogica: pruebas2.filter(
        (p) =>
          p.soloAgua &&
          p.sinComidaRapida &&
          p.pasos >= 10000 &&
          p.horasSueno >= 7 &&
          p.paginasLeidas >= 10 &&
          p.sesionesGym >= 4 &&
          p.sesionesCardio >= 3
      ).length,
      kleosTotal: a2.kleosTotal,
      kleosDesdePruebas: pruebas2.reduce((s, p) => s + p.kleosGanado, 0),
      fechas: pruebas2.map((p) => String(p.fecha)),
    },
    rangoDetectado: { fechaMinima, fechaMaxima },
    totalRegistros: todasLasFechas.length,
  }

  return NextResponse.json({ diagnostico })
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (userId !== process.env.CLERK_JAVIER_USER_ID) {
    return NextResponse.json({ error: 'Solo el administrador.' }, { status: 403 })
  }

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

  const prevStart = process.env.NEXT_PUBLIC_AGON_START_DATE
  try {
    process.env.NEXT_PUBLIC_AGON_START_DATE = todasLasFechas[0]
    const relato = await generarCronica(1)
    return NextResponse.json({ ok: true, relato })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al generar la crónica'
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    if (prevStart === undefined) {
      delete process.env.NEXT_PUBLIC_AGON_START_DATE
    } else {
      process.env.NEXT_PUBLIC_AGON_START_DATE = prevStart
    }
  }
}
