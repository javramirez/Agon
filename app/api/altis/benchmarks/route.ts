import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getAgonistaByClerkId, getRetoPorId } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { pactoInicial, pruebasDiarias } from '@/lib/db/schema'
import { eq, and, gte, asc } from 'drizzle-orm'

function fechaRetoToStr(
  fecha: string | Date | null | undefined
): string | null {
  if (!fecha) return null
  if (typeof fecha === 'string') return fecha
  return fecha.toISOString().slice(0, 10)
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getAgonistaByClerkId(userId)
  if (!agonista?.retoId) {
    return NextResponse.json({ error: 'Sin reto' }, { status: 400 })
  }

  const reto = await getRetoPorId(agonista.retoId)
  if (!reto || reto.modo !== 'solo') {
    return NextResponse.json({ error: 'Solo disponible en modo solo' }, { status: 400 })
  }

  const pactos = await db
    .select()
    .from(pactoInicial)
    .where(and(eq(pactoInicial.agonistId, agonista.id), eq(pactoInicial.acto, 1)))
    .limit(1)

  const pacto = pactos[0] ?? null

  const inicioStr = fechaRetoToStr(reto.fechaInicio)

  const pruebas = inicioStr
    ? await db
        .select()
        .from(pruebasDiarias)
        .where(
          and(eq(pruebasDiarias.agonistId, agonista.id), gte(pruebasDiarias.fecha, inicioStr))
        )
        .orderBy(asc(pruebasDiarias.fecha))
    : []

  const diasRegistrados = pruebas.length
  const totalDias = diasRegistrados || 1

  const promedioGym =
    (pruebas.reduce((s, p) => s + p.sesionesGym, 0) / totalDias) * 7
  const promedioCardio =
    (pruebas.reduce((s, p) => s + p.sesionesCardio, 0) / totalDias) * 7
  const promedioPaginas =
    pruebas.reduce((s, p) => s + p.paginasLeidas, 0) / totalDias
  const promedioPasos = pruebas.reduce((s, p) => s + p.pasos, 0) / totalDias
  const promedioSueno =
    pruebas.reduce((s, p) => s + p.horasSueno, 0) / totalDias
  const pctAgua =
    (pruebas.filter((p) => p.soloAgua).length / totalDias) * 100
  const pctComida =
    (pruebas.filter((p) => p.sinComidaRapida).length / totalDias) * 100

  const heatmap = pruebas.map((p) => {
    let completadas = 0
    if (p.soloAgua) completadas++
    if (p.sinComidaRapida) completadas++
    if (p.pasos >= 10000) completadas++
    if (p.horasSueno >= 7) completadas++
    if (p.paginasLeidas >= 10) completadas++
    if (p.sesionesGym >= 4) completadas++
    if (p.sesionesCardio >= 3) completadas++
    return { fecha: p.fecha, valor: completadas }
  })

  return NextResponse.json({
    lineaBase: {
      gym: pacto?.lineaBaseGym ?? 0,
      cardio: pacto?.lineaBaseCardio ?? 0,
      paginas: pacto?.lineaBasePaginas ?? 0,
    },
    promedioActual: {
      gym: Math.round(promedioGym * 10) / 10,
      cardio: Math.round(promedioCardio * 10) / 10,
      paginas: Math.round(promedioPaginas * 10) / 10,
      pasos: Math.round(promedioPasos),
      sueno: Math.round(promedioSueno * 10) / 10,
      agua: Math.round(pctAgua),
      comida: Math.round(pctComida),
    },
    heatmap,
    diasRegistrados,
  })
}
