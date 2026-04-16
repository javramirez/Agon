import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pruebasDiarias, inscripciones, hegemonias } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAmbosAgonistas } from '@/lib/db/queries'
import { NIVEL_LABELS } from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'
import type { PruebaDiaria } from '@/lib/db/schema'
import Anthropic from '@anthropic-ai/sdk'

async function generarFraseVeredicto(
  ganadorNombre: string | null,
  empate: boolean,
  stats1: { nombre: string; kleosTotal: number; diasPerfectos: number },
  stats2: { nombre: string; kleosTotal: number; diasPerfectos: number }
): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return 'El Altis inscribe en silencio lo que las palabras no pueden contener.'

  const anthropic = new Anthropic({ apiKey: key })

  const prompt = empate
    ? `Dos agonistas completaron el Gran Agon empatados en kleos. ${stats1.nombre} acumuló ${stats1.kleosTotal} kleos y ${stats1.diasPerfectos} días perfectos. ${stats2.nombre} acumuló ${stats2.kleosTotal} kleos y ${stats2.diasPerfectos} días perfectos. Escribe UNA sola frase épica y ceremoniosa que el Altis inscribiría en piedra sobre este empate. Máximo 20 palabras. Sin guion largo. Sin comillas.`
    : `${ganadorNombre} ganó el Gran Agon. Los datos: ${stats1.nombre} acumuló ${stats1.kleosTotal} kleos y ${stats1.diasPerfectos} días perfectos. ${stats2.nombre} acumuló ${stats2.kleosTotal} kleos y ${stats2.diasPerfectos} días perfectos. Escribe UNA sola frase épica y ceremoniosa que el Altis inscribiría en piedra sobre la victoria. Menciona al ganador. Máximo 20 palabras. Sin guion largo. Sin comillas.`

  try {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
    })
    return res.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { text: string }).text)
      .join('')
      .trim()
  } catch {
    return 'El Altis inscribe en silencio lo que las palabras no pueden contener.'
  }
}

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

  const stats1 = calcularStats(a1, pruebas1, inscripciones1)
  const stats2 = calcularStats(a2, pruebas2, inscripciones2)

  const ganadorNombre =
    a1.kleosTotal > a2.kleosTotal ? a1.nombre : a2.kleosTotal > a1.kleosTotal ? a2.nombre : null
  const esEmpate = a1.kleosTotal === a2.kleosTotal

  const fraseVeredicto = await generarFraseVeredicto(
    ganadorNombre,
    esEmpate,
    {
      nombre: a1.nombre,
      kleosTotal: a1.kleosTotal,
      diasPerfectos: pruebas1.filter((p) => p.diaPerfecto).length,
    },
    {
      nombre: a2.nombre,
      kleosTotal: a2.kleosTotal,
      diasPerfectos: pruebas2.filter((p) => p.diaPerfecto).length,
    }
  )

  return NextResponse.json({
    agonista1: stats1,
    agonista2: stats2,
    ganador: ganadorNombre,
    empate: esEmpate,
    totalHegemonias: todasHegemonias.length,
    fraseVeredicto,
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
