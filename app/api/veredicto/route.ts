import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pruebasDiarias, inscripciones, hegemonias } from '@/lib/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { getCurrentAgonista } from '@/lib/auth'
import { getRetoPorId, getAmbosAgonistas } from '@/lib/db/queries'
import { NIVEL_LABELS } from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'
import type { PruebaDiaria } from '@/lib/db/schema'
import Anthropic from '@anthropic-ai/sdk'

function fechaInicioAString(
  fecha: string | Date | null | undefined
): string {
  if (fecha == null) return '2000-01-01'
  if (typeof fecha === 'string') return fecha
  return fecha.toISOString().slice(0, 10)
}

function nivelLabel(nivel: string): string {
  const k = nivel in NIVEL_LABELS ? (nivel as NivelKey) : 'aspirante'
  return NIVEL_LABELS[k]
}

// ─── Frase veredicto ──────────────────────────────────────────────────────────

async function generarFraseVeredicto(
  _ganadorNombre: string | null,
  empate: boolean,
  stats1: { nombre: string; kleosTotal: number; diasPerfectos: number },
  stats2?: { nombre: string; kleosTotal: number; diasPerfectos: number }
): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return 'El Altis inscribe en silencio lo que las palabras no pueden contener.'

  const anthropic = new Anthropic({ apiKey: key })

  let prompt: string

  if (!stats2) {
    prompt = `${stats1.nombre} completó el Gran Agon en solitario. Acumuló ${stats1.kleosTotal} kleos y ${stats1.diasPerfectos} días perfectos. Escribe UNA sola frase épica y ceremoniosa que el Altis inscribiría en piedra sobre esta hazaña personal. Menciona al agonista. Máximo 20 palabras. Sin guion largo. Sin comillas.`
  } else if (empate) {
    prompt = `Dos agonistas completaron el Gran Agon empatados en kleos. ${stats1.nombre} acumuló ${stats1.kleosTotal} kleos y ${stats1.diasPerfectos} días perfectos. ${stats2.nombre} acumuló ${stats2.kleosTotal} kleos y ${stats2.diasPerfectos} días perfectos. Escribe UNA sola frase épica y ceremoniosa que el Altis inscribiría en piedra sobre este empate. Máximo 20 palabras. Sin guion largo. Sin comillas.`
  } else {
    prompt = `${_ganadorNombre} ganó el Gran Agon. Los datos: ${stats1.nombre} acumuló ${stats1.kleosTotal} kleos y ${stats1.diasPerfectos} días perfectos. ${stats2.nombre} acumuló ${stats2.kleosTotal} kleos y ${stats2.diasPerfectos} días perfectos. Escribe UNA sola frase épica y ceremoniosa que el Altis inscribiría en piedra sobre la victoria. Menciona al ganador. Máximo 20 palabras. Sin guion largo. Sin comillas.`
  }

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

function cumplioContrato(pruebas: PruebaDiaria[]): boolean {
  if (pruebas.length < 20) return false
  const cumplimiento = pruebas.filter(
    (p) =>
      p.soloAgua &&
      p.sinComidaRapida &&
      p.pasos >= 10000 &&
      p.horasSueno >= 7 &&
      p.paginasLeidas >= 10
  ).length
  return cumplimiento / pruebas.length >= 0.8
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getCurrentAgonista()
  if (!agonista?.retoId) {
    return NextResponse.json({ error: 'Sin reto' }, { status: 400 })
  }

  const reto = await getRetoPorId(agonista.retoId)
  if (!reto) {
    return NextResponse.json({ error: 'Reto no encontrado' }, { status: 404 })
  }

  const fechaInicio = fechaInicioAString(reto.fechaInicio)

  // ── MODO SOLO ──────────────────────────────────────────────────────────────
  if (reto.modo === 'solo') {
    const [pruebasSolo, inscripcionesSolo] = await Promise.all([
      db
        .select()
        .from(pruebasDiarias)
        .where(
          and(
            eq(pruebasDiarias.agonistId, agonista.id),
            gte(pruebasDiarias.fecha, fechaInicio)
          )
        ),
      db
        .select()
        .from(inscripciones)
        .where(eq(inscripciones.agonistId, agonista.id)),
    ])

    const statsSolo = {
      nombre: agonista.nombre,
      nivel: nivelLabel(agonista.nivel),
      kleosTotal: agonista.kleosTotal,
      diasPerfectos: pruebasSolo.filter((p) => p.diaPerfecto).length,
      totalDias: pruebasSolo.length,
      inscripciones: inscripcionesSolo.length,
      cumplioContrato: cumplioContrato(pruebasSolo),
      oraculo: agonista.oraculoMensaje,
    }

    const fraseVeredicto = await generarFraseVeredicto(
      agonista.nombre,
      false,
      {
        nombre: agonista.nombre,
        kleosTotal: agonista.kleosTotal,
        diasPerfectos: statsSolo.diasPerfectos,
      }
    )

    return NextResponse.json({
      modo: 'solo',
      agonista: statsSolo,
      fraseVeredicto,
    })
  }

  // ── MODO DUELO ─────────────────────────────────────────────────────────────
  const ambos = await getAmbosAgonistas(reto.id)
  if (ambos.length < 2) {
    return NextResponse.json({ error: 'Faltan agonistas' }, { status: 400 })
  }

  const [a1, a2] = ambos as [(typeof ambos)[0], (typeof ambos)[0]]

  const [pruebas1, pruebas2, inscripciones1, inscripciones2, todasHegemonias] =
    await Promise.all([
      db
        .select()
        .from(pruebasDiarias)
        .where(
          and(
            eq(pruebasDiarias.agonistId, a1.id),
            gte(pruebasDiarias.fecha, fechaInicio)
          )
        ),
      db
        .select()
        .from(pruebasDiarias)
        .where(
          and(
            eq(pruebasDiarias.agonistId, a2.id),
            gte(pruebasDiarias.fecha, fechaInicio)
          )
        ),
      db.select().from(inscripciones).where(eq(inscripciones.agonistId, a1.id)),
      db.select().from(inscripciones).where(eq(inscripciones.agonistId, a2.id)),
      db.select().from(hegemonias).where(eq(hegemonias.retoId, reto.id)),
    ])

  const calcularStats = (
    ag: (typeof ambos)[0],
    pruebas: typeof pruebas1,
    insc: typeof inscripciones1
  ) => ({
    nombre: ag.nombre,
    nivel: nivelLabel(ag.nivel),
    kleosTotal: ag.kleosTotal,
    diasPerfectos: pruebas.filter((p) => p.diaPerfecto).length,
    totalDias: pruebas.length,
    inscripciones: insc.length,
    hegemonias: todasHegemonias.filter(
      (h) => !h.empate && h.ganadorId === ag.id
    ).length,
    cumplioContrato: cumplioContrato(pruebas),
    oraculo: ag.oraculoMensaje,
  })

  const stats1 = calcularStats(a1, pruebas1, inscripciones1)
  const stats2 = calcularStats(a2, pruebas2, inscripciones2)

  const ganadorNombre =
    a1.kleosTotal > a2.kleosTotal
      ? a1.nombre
      : a2.kleosTotal > a1.kleosTotal
        ? a2.nombre
        : null
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
    modo: 'duelo',
    agonista1: stats1,
    agonista2: stats2,
    ganador: ganadorNombre,
    empate: esEmpate,
    totalHegemonias: todasHegemonias.length,
    fraseVeredicto,
  })
}
