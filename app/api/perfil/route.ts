import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  pruebasDiarias,
  llamas,
  inscripciones,
  kleosLog as kleosLogTable,
  hegemonias,
} from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getAgonistaByClerkId, getRetoPorId } from '@/lib/db/queries'
import { NIVEL_THRESHOLDS } from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'
import type { PruebaDiaria } from '@/lib/db/schema'
type KleosLogRow = typeof kleosLogTable.$inferSelect

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getAgonistaByClerkId(userId)
  if (!agonista) {
    return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })
  }

  const reto =
    agonista.retoId != null ? await getRetoPorId(agonista.retoId) : null
  const fechaInicioReto = reto?.fechaInicio ?? null

  const [todasLasPruebas, todasLasLlamas, todasLasInscripciones, kleosHistorial] =
    await Promise.all([
      db
        .select()
        .from(pruebasDiarias)
        .where(eq(pruebasDiarias.agonistId, agonista.id)),
      db.select().from(llamas).where(eq(llamas.agonistId, agonista.id)),
      db
        .select()
        .from(inscripciones)
        .where(eq(inscripciones.agonistId, agonista.id)),
      db
        .select()
        .from(kleosLogTable)
        .where(eq(kleosLogTable.agonistId, agonista.id))
        .orderBy(desc(kleosLogTable.fecha))
        .limit(100),
    ])

  const todasHegemonias = agonista.retoId
    ? await db
        .select()
        .from(hegemonias)
        .where(eq(hegemonias.retoId, agonista.retoId))
    : []

  const kleosPorSemana = calcularKleosPorSemana(
    kleosHistorial,
    fechaInicioReto
  )
  const habitoMasCumplido = calcularHabitoMasCumplido(todasLasPruebas)
  const habitoMasFallado = calcularHabitoMasFallado(todasLasPruebas)
  const mejorRacha = Math.max(0, ...todasLasLlamas.map((l) => l.rachMaxima))

  const hegGanadas = todasHegemonias.filter(
    (h) => !h.empate && h.ganadorId === agonista.id
  ).length

  const niveles = Object.keys(NIVEL_THRESHOLDS) as NivelKey[]
  const indiceActual = niveles.indexOf(agonista.nivel as NivelKey)
  const siguienteNivel =
    indiceActual >= 0 && indiceActual < niveles.length - 1
      ? niveles[indiceActual + 1]!
      : null

  const kleosParaSiguienteNivel = siguienteNivel
    ? Math.max(0, NIVEL_THRESHOLDS[siguienteNivel] - agonista.kleosTotal)
    : 0

  return NextResponse.json({
    agonista,
    stats: {
      diasPerfectos: todasLasPruebas.filter((p) => p.diaPerfecto).length,
      totalDias: todasLasPruebas.length,
      mejorRacha,
      inscripciones: todasLasInscripciones.length,
      hegemonias: hegGanadas,
      habitoMasCumplido,
      habitoMasFallado,
    },
    llamas: todasLasLlamas,
    kleosPorSemana,
    siguienteNivel,
    kleosParaSiguienteNivel,
  })
}

function calcularKleosPorSemana(log: KleosLogRow[], fechaInicioReto: string | null) {
  if (!fechaInicioReto) return []
  const inicioStr = fechaInicioReto
  const inicio = new Date(inicioStr + 'T12:00:00.000Z')
  const porSemana: Record<string, number> = {}

  log.forEach((entry) => {
    const fechaStr =
      typeof entry.fecha === 'string'
        ? entry.fecha
        : String(entry.fecha)
    const fecha = new Date(fechaStr + 'T12:00:00.000Z')
    const diffMs = fecha.getTime() - inicio.getTime()
    const semana = Math.max(
      1,
      Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1
    )
    const key = `S${semana}`
    porSemana[key] = (porSemana[key] ?? 0) + entry.cantidad
  })

  return Object.entries(porSemana)
    .map(([semana, kleos]) => ({ semana, kleos }))
    .sort((a, b) => {
      const numA = parseInt(a.semana.replace('S', ''), 10)
      const numB = parseInt(b.semana.replace('S', ''), 10)
      return numA - numB
    })
}

function calcularHabitoMasCumplido(pruebas: PruebaDiaria[]): string {
  if (pruebas.length === 0) return '—'

  const conteos: Record<string, number> = {
    'Solo agua': pruebas.filter((p) => p.soloAgua).length,
    'Sin comida rápida': pruebas.filter((p) => p.sinComidaRapida).length,
    Pasos: pruebas.filter((p) => p.pasos >= 10000).length,
    Sueño: pruebas.filter((p) => p.horasSueno >= 7).length,
    Lectura: pruebas.filter((p) => p.paginasLeidas >= 10).length,
    Gym: pruebas.filter((p) => p.sesionesGym >= 4).length,
    Cardio: pruebas.filter((p) => p.sesionesCardio >= 3).length,
  }

  return (
    Object.entries(conteos).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '—'
  )
}

function calcularHabitoMasFallado(pruebas: PruebaDiaria[]): string {
  if (pruebas.length === 0) return '—'

  const conteos: Record<string, number> = {
    'Solo agua': pruebas.filter((p) => !p.soloAgua).length,
    'Sin comida rápida': pruebas.filter((p) => !p.sinComidaRapida).length,
    Pasos: pruebas.filter((p) => p.pasos < 10000).length,
    Sueño: pruebas.filter((p) => p.horasSueno < 7).length,
    Lectura: pruebas.filter((p) => p.paginasLeidas < 10).length,
    Gym: pruebas.filter((p) => p.sesionesGym < 4).length,
    Cardio: pruebas.filter((p) => p.sesionesCardio < 3).length,
  }

  return (
    Object.entries(conteos).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '—'
  )
}
