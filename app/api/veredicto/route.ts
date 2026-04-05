import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pruebasDiarias, inscripciones, hegemonias } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAmbosAgonistas } from '@/lib/db/queries'
import { NIVEL_LABELS } from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'
import type { PruebaDiaria } from '@/lib/db/schema'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const ambos = await getAmbosAgonistas()
  if (ambos.length < 2) {
    return NextResponse.json({ error: 'Faltan agonistas' }, { status: 400 })
  }

  const [a1, a2] = ambos

  const [pruebas1, pruebas2, inscripciones1, inscripciones2, todasHegemonias] =
    await Promise.all([
      db.select().from(pruebasDiarias).where(eq(pruebasDiarias.agonistId, a1.id)),
      db.select().from(pruebasDiarias).where(eq(pruebasDiarias.agonistId, a2.id)),
      db.select().from(inscripciones).where(eq(inscripciones.agonistId, a1.id)),
      db.select().from(inscripciones).where(eq(inscripciones.agonistId, a2.id)),
      db.select().from(hegemonias),
    ])

  const calcularStats = (
    agonista: (typeof ambos)[0],
    pruebas: typeof pruebas1,
    insc: typeof inscripciones1
  ) => ({
    nombre: agonista.nombre,
    nivel: NIVEL_LABELS[agonista.nivel as NivelKey],
    kleosTotal: agonista.kleosTotal,
    diasPerfectos: pruebas.filter((p) => p.diaPerfecto).length,
    totalDias: pruebas.length,
    inscripciones: insc.length,
    hegemonias: todasHegemonias.filter(
      (h) => !h.empate && h.ganadorId === agonista.id
    ).length,
    cumplioContrato: cumplioContrato(pruebas),
    oraculo: agonista.oraculoMensaje,
  })

  return NextResponse.json({
    agonista1: calcularStats(a1, pruebas1, inscripciones1),
    agonista2: calcularStats(a2, pruebas2, inscripciones2),
    ganador:
      a1.kleosTotal > a2.kleosTotal
        ? a1.nombre
        : a2.kleosTotal > a1.kleosTotal
          ? a2.nombre
          : null,
    empate: a1.kleosTotal === a2.kleosTotal,
    totalHegemonias: todasHegemonias.length,
  })
}

function cumplioContrato(pruebas: PruebaDiaria[]): boolean {
  if (pruebas.length < 20) return false
  const cumplimiento = pruebas.filter((p) => {
    return (
      p.soloAgua &&
      p.sinComidaRapida &&
      p.pasos >= 10000 &&
      p.horasSueno >= 7 &&
      p.paginasLeidas >= 10
    )
  }).length
  return cumplimiento / pruebas.length >= 0.8
}
