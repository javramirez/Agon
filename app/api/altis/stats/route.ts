import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pruebasDiarias, kleosLog } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import {
  getAgonistaByClerkId,
  getAntagonistaPorReto,
  getStatsCompletos,
} from '@/lib/db/queries'
import { differenceInDays, parseISO } from 'date-fns'
import type { PruebaDiaria } from '@/lib/db/schema'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getAgonistaByClerkId(userId)
  if (!agonista) {
    return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })
  }
  const antagonista = agonista.retoId
    ? await getAntagonistaPorReto(agonista.retoId, agonista.id)
    : null

  const [pruebas1, pruebas2, kleos1, kleos2, statsPropio, statsAntagonista] =
    await Promise.all([
      db
        .select()
        .from(pruebasDiarias)
        .where(eq(pruebasDiarias.agonistId, agonista.id))
        .orderBy(asc(pruebasDiarias.fecha)),
      antagonista
        ? db
            .select()
            .from(pruebasDiarias)
            .where(eq(pruebasDiarias.agonistId, antagonista.id))
            .orderBy(asc(pruebasDiarias.fecha))
        : Promise.resolve([]),
      db
        .select()
        .from(kleosLog)
        .where(eq(kleosLog.agonistId, agonista.id))
        .orderBy(asc(kleosLog.fecha), asc(kleosLog.createdAt)),
      antagonista
        ? db
            .select()
            .from(kleosLog)
            .where(eq(kleosLog.agonistId, antagonista.id))
            .orderBy(asc(kleosLog.fecha), asc(kleosLog.createdAt))
        : Promise.resolve([]),
      getStatsCompletos(agonista.id),
      antagonista ? getStatsCompletos(antagonista.id) : Promise.resolve(null),
    ])

  const nombre1 = agonista.nombre
  const nombre2 = antagonista?.nombre ?? 'Antagonista'

  return NextResponse.json({
    heatmap: generarHeatmap(pruebas1, pruebas2, nombre1, nombre2),
    comparativaHabitos: generarComparativaHabitos(
      pruebas1,
      pruebas2,
      nombre1,
      nombre2
    ),
    evolucionKleos: generarEvolucionKleos(kleos1, kleos2, nombre1, nombre2),
    mejoresDias: generarMejoresDias(pruebas1, pruebas2, nombre1, nombre2),
    rachaMaxima: {
      propio: calcularMejorRachaPerfectos(pruebas1),
      antagonista: calcularMejorRachaPerfectos(pruebas2),
    },
    statsPropio,
    statsAntagonista,
  })
}

function generarHeatmap(
  p1: PruebaDiaria[],
  p2: PruebaDiaria[],
  nombre1: string,
  nombre2: string
) {
  const map1: Record<string, number> = {}
  const map2: Record<string, number> = {}

  p1.forEach((p) => {
    map1[p.fecha] = contarPruebasCompletadas(p)
  })

  p2.forEach((p) => {
    map2[p.fecha] = contarPruebasCompletadas(p)
  })

  const todasLasFechas = new Set([...Object.keys(map1), ...Object.keys(map2)])
  const fechasOrdenadas = Array.from(todasLasFechas).sort()

  return fechasOrdenadas.map((fecha) => ({
    fecha,
    [nombre1]: map1[fecha] ?? 0,
    [nombre2]: map2[fecha] ?? 0,
  }))
}

function generarComparativaHabitos(
  p1: PruebaDiaria[],
  p2: PruebaDiaria[],
  nombre1: string,
  nombre2: string
) {
  const habitos = [
    { id: 'agua', nombre: 'Solo agua', fn: (p: PruebaDiaria) => p.soloAgua },
    {
      id: 'comida',
      nombre: 'Sin comida rápida',
      fn: (p: PruebaDiaria) => p.sinComidaRapida,
    },
    {
      id: 'pasos',
      nombre: 'Pasos',
      fn: (p: PruebaDiaria) => p.pasos >= 10000,
    },
    {
      id: 'sueno',
      nombre: 'Sueño',
      fn: (p: PruebaDiaria) => p.horasSueno >= 7,
    },
    {
      id: 'lectura',
      nombre: 'Lectura',
      fn: (p: PruebaDiaria) => p.paginasLeidas >= 10,
    },
    {
      id: 'gym',
      nombre: 'Gym',
      fn: (p: PruebaDiaria) => p.sesionesGym >= 4,
    },
    {
      id: 'cardio',
      nombre: 'Cardio',
      fn: (p: PruebaDiaria) => p.sesionesCardio >= 3,
    },
  ] as const

  return habitos.map((h) => {
    const cumplidos1 = p1.filter((p) => h.fn(p)).length
    const cumplidos2 = p2.filter((p) => h.fn(p)).length
    const total1 = p1.length || 1
    const total2 = p2.length || 1

    return {
      habito: h.nombre,
      [nombre1]: Math.round((cumplidos1 / total1) * 100),
      [nombre2]: Math.round((cumplidos2 / total2) * 100),
      raw1: cumplidos1,
      raw2: cumplidos2,
    }
  })
}

function generarEvolucionKleos(
  k1: { fecha: string; cantidad: number }[],
  k2: { fecha: string; cantidad: number }[],
  nombre1: string,
  nombre2: string
) {
  const acumulado1: Record<string, number> = {}
  const acumulado2: Record<string, number> = {}

  let suma1 = 0
  k1.forEach((k) => {
    suma1 += k.cantidad
    acumulado1[k.fecha] = suma1
  })

  let suma2 = 0
  k2.forEach((k) => {
    suma2 += k.cantidad
    acumulado2[k.fecha] = suma2
  })

  const todasFechas = new Set([
    ...Object.keys(acumulado1),
    ...Object.keys(acumulado2),
  ])
  const fechasOrdenadas = Array.from(todasFechas).sort()

  let ultimo1 = 0
  let ultimo2 = 0

  return fechasOrdenadas.map((fecha) => {
    if (acumulado1[fecha] !== undefined) ultimo1 = acumulado1[fecha]
    if (acumulado2[fecha] !== undefined) ultimo2 = acumulado2[fecha]

    return {
      fecha,
      [nombre1]: ultimo1,
      [nombre2]: ultimo2,
    }
  })
}

function generarMejoresDias(
  p1: PruebaDiaria[],
  p2: PruebaDiaria[],
  nombre1: string,
  nombre2: string
) {
  const perfectos1 = p1.filter((p) => p.diaPerfecto)
  const perfectos2 = p2.filter((p) => p.diaPerfecto)

  const mejores = [
    ...perfectos1.map((p) => ({
      fecha: p.fecha,
      agonista: nombre1,
      kleos: p.kleosGanado,
    })),
    ...perfectos2.map((p) => ({
      fecha: p.fecha,
      agonista: nombre2,
      kleos: p.kleosGanado,
    })),
  ]
    .sort((a, b) => b.kleos - a.kleos)
    .slice(0, 10)

  return mejores
}

function contarPruebasCompletadas(p: {
  soloAgua: boolean
  sinComidaRapida: boolean
  pasos: number
  horasSueno: number
  paginasLeidas: number
  sesionesGym: number
  sesionesCardio: number
}): number {
  let count = 0
  if (p.soloAgua) count++
  if (p.sinComidaRapida) count++
  if (p.pasos >= 10000) count++
  if (p.horasSueno >= 7) count++
  if (p.paginasLeidas >= 10) count++
  if (p.sesionesGym >= 4) count++
  if (p.sesionesCardio >= 3) count++
  return count
}

function calcularMejorRachaPerfectos(pruebas: PruebaDiaria[]): number {
  const perfectos = pruebas
    .filter((p) => p.diaPerfecto)
    .map((p) => p.fecha)
    .sort()

  if (perfectos.length === 0) return 0

  let maxRacha = 1
  let rachaActual = 1

  for (let i = 1; i < perfectos.length; i++) {
    const diff = differenceInDays(
      parseISO(perfectos[i]),
      parseISO(perfectos[i - 1])
    )

    if (diff === 1) {
      rachaActual++
      maxRacha = Math.max(maxRacha, rachaActual)
    } else {
      rachaActual = 1
    }
  }

  return maxRacha
}
