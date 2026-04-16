import { db } from './index'
import {
  agonistas,
  retos,
  pruebasDiarias,
  llamas,
  kleosLog,
  agoraEventos,
  aclamaciones,
  hegemonias,
  inscripciones,
} from './schema'
import { eq, and, gte, lte, desc, count, not } from 'drizzle-orm'
import {
  NIVEL_THRESHOLDS,
  NIVEL_LABELS,
} from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'
import { actualizarPuntosDisputaEvento } from '@/lib/facciones/disputa'

// ─── AGONISTAS / RETOS ─────────────────────────────────

/**
 * Busca un agonista por su clerkId.
 * No crea — la creación ocurre en el flujo de onboarding.
 */
export async function getAgonistaByClerkId(clerkId: string) {
  const result = await db
    .select()
    .from(agonistas)
    .where(eq(agonistas.clerkId, clerkId))
    .limit(1)

  return result[0] ?? null
}

export async function getAmbosAgonistas() {
  return db.select().from(agonistas)
}

/**
 * Retorna el otro agonista dentro del mismo reto.
 * Retorna null si el reto es solo o el rival no se unió aún.
 */
export async function getAntagonistaPorReto(
  retoId: string,
  agonistIdActual: string
) {
  const result = await db
    .select()
    .from(agonistas)
    .where(
      and(
        eq(agonistas.retoId, retoId),
        not(eq(agonistas.id, agonistIdActual))
      )
    )
    .limit(1)

  return result[0] ?? null
}

/**
 * Retorna un reto por su ID.
 */
export async function getRetoPorId(retoId: string) {
  const result = await db
    .select()
    .from(retos)
    .where(eq(retos.id, retoId))
    .limit(1)

  return result[0] ?? null
}

/**
 * Retorna el reto activo del agonista autenticado.
 * Incluye el agonista y el reto en una sola consulta.
 */
export async function getRetoActivo(clerkId: string) {
  const agonista = await getAgonistaByClerkId(clerkId)
  if (!agonista?.retoId) return null

  const reto = await getRetoPorId(agonista.retoId)
  if (!reto) return null

  return { agonista, reto }
}

export async function sellarOraculo(clerkId: string, mensaje: string) {
  const agonista = await getAgonistaByClerkId(clerkId)
  if (!agonista) throw new Error('Agonista no encontrado')
  if (agonista.oraculoSellado) throw new Error('El Oráculo ya fue consultado')

  await db
    .update(agonistas)
    .set({ oraculoMensaje: mensaje, oraculoSellado: true })
    .where(eq(agonistas.clerkId, clerkId))
}

// ─── PRUEBAS DIARIAS ──────────────────────────────────

export async function getPruebaDiariaHoy(agonistId: string) {
  const hoy = new Date().toISOString().split('T')[0]
  const result = await db
    .select()
    .from(pruebasDiarias)
    .where(
      and(
        eq(pruebasDiarias.agonistId, agonistId),
        eq(pruebasDiarias.fecha, hoy)
      )
    )
    .limit(1)
  return result[0] ?? null
}

export async function getOrCreatePruebaDiariaHoy(agonistId: string) {
  const hoy = new Date().toISOString().split('T')[0]

  const existing = await db
    .select()
    .from(pruebasDiarias)
    .where(
      and(
        eq(pruebasDiarias.agonistId, agonistId),
        eq(pruebasDiarias.fecha, hoy)
      )
    )
    .limit(1)

  if (existing.length > 0) return existing[0]

  const nueva = await db
    .insert(pruebasDiarias)
    .values({
      id: crypto.randomUUID(),
      agonistId,
      fecha: hoy,
    })
    .returning()

  return nueva[0]
}

export async function getPruebaDiariaAntagonista(antagonistId: string) {
  const hoy = new Date().toISOString().split('T')[0]
  const result = await db
    .select()
    .from(pruebasDiarias)
    .where(
      and(
        eq(pruebasDiarias.agonistId, antagonistId),
        eq(pruebasDiarias.fecha, hoy)
      )
    )
    .limit(1)
  return result[0] ?? null
}

export async function getKleosSemanaActual(agonistId: string) {
  const hoy = new Date()
  const inicioSemana = new Date(hoy)
  inicioSemana.setDate(hoy.getDate() - hoy.getDay())
  const inicioStr = inicioSemana.toISOString().split('T')[0]

  const result = await db
    .select()
    .from(kleosLog)
    .where(
      and(
        eq(kleosLog.agonistId, agonistId),
        gte(kleosLog.fecha, inicioStr)
      )
    )

  return result.reduce((sum, r) => sum + r.cantidad, 0)
}

// ─── LLAMAS ───────────────────────────────────────────

export async function getLlamasAgonista(agonistId: string) {
  return db
    .select()
    .from(llamas)
    .where(eq(llamas.agonistId, agonistId))
}

// ─── ÁGORA ────────────────────────────────────────────

export async function getAgoraEventos(limit = 30) {
  const eventos = await db
    .select()
    .from(agoraEventos)
    .orderBy(desc(agoraEventos.createdAt))
    .limit(limit)

  return eventos
}

export async function getAclamacionesPorEvento(eventoId: string) {
  return db
    .select()
    .from(aclamaciones)
    .where(eq(aclamaciones.eventoId, eventoId))
}

export async function getAclamacionesHoy(agonistId: string) {
  const hoy = new Date().toISOString().split('T')[0]
  const result = await db
    .select({ count: count() })
    .from(aclamaciones)
    .where(
      and(
        eq(aclamaciones.agonistId, agonistId),
        eq(aclamaciones.fecha, hoy)
      )
    )
  return Number(result[0]?.count ?? 0)
}

export async function getTiposAclamacionHoyPorEvento(agonistId: string) {
  const hoy = new Date().toISOString().split('T')[0]
  const rows = await db
    .select({
      eventoId: aclamaciones.eventoId,
      tipo: aclamaciones.tipo,
    })
    .from(aclamaciones)
    .where(
      and(
        eq(aclamaciones.agonistId, agonistId),
        eq(aclamaciones.fecha, hoy)
      )
    )
  const map: Record<string, string> = {}
  for (const r of rows) {
    map[r.eventoId] = r.tipo
  }
  return map
}

// ─── ALTIS ────────────────────────────────────────────

export async function getStatsCompletos(agonistId: string) {
  const [todasLasPruebas, todasLasLlamas, todasLasInscripciones] =
    await Promise.all([
      db
        .select()
        .from(pruebasDiarias)
        .where(eq(pruebasDiarias.agonistId, agonistId)),
      db.select().from(llamas).where(eq(llamas.agonistId, agonistId)),
      db
        .select()
        .from(inscripciones)
        .where(eq(inscripciones.agonistId, agonistId)),
    ])

  const diasPerfectos = todasLasPruebas.filter((p) => p.diaPerfecto).length
  const mejorRacha = Math.max(0, ...todasLasLlamas.map((l) => l.rachMaxima))
  const rachaActual = Math.max(0, ...todasLasLlamas.map((l) => l.rachaActual))

  return {
    diasPerfectos,
    mejorRacha,
    rachaActual,
    inscripciones: todasLasInscripciones.length,
    totalPruebas: todasLasPruebas.length,
  }
}

// ─── HEGEMONÍA ────────────────────────────────────────

export async function getHegemonias() {
  return db
    .select()
    .from(hegemonias)
    .orderBy(desc(hegemonias.semana))
}

export async function getKleosPorSemana(agonistId: string, semana: number) {
  const { inicioSemana, finSemana } = getSemanaRango(semana)

  const result = await db
    .select()
    .from(kleosLog)
    .where(
      and(
        eq(kleosLog.agonistId, agonistId),
        gte(kleosLog.fecha, inicioSemana),
        lte(kleosLog.fecha, finSemana)
      )
    )

  return result.reduce((sum, r) => sum + r.cantidad, 0)
}

export async function calcularYGuardarHegemonia(semana: number) {
  const { inicioSemana, finSemana } = getSemanaRango(semana)

  const ambos = await getAmbosAgonistas()
  if (ambos.length < 2) return null

  const [a1, a2] = ambos

  const [kleos1, kleos2] = await Promise.all([
    getKleosPorSemana(a1.id, semana),
    getKleosPorSemana(a2.id, semana),
  ])

  const empate = kleos1 === kleos2
  const ganadorId = empate ? null : kleos1 > kleos2 ? a1.id : a2.id

  const existing = await db
    .select()
    .from(hegemonias)
    .where(eq(hegemonias.semana, semana))
    .limit(1)

  if (existing.length > 0) {
    const updated = await db
      .update(hegemonias)
      .set({
        ganadorId,
        kleosGanador: Math.max(kleos1, kleos2),
        kleosRival: Math.min(kleos1, kleos2),
        empate,
      })
      .where(eq(hegemonias.semana, semana))
      .returning()
    if (!empate && ganadorId) {
      void actualizarPuntosDisputaEvento(ganadorId, 'nike_hegemonia').catch(() => {})
    }
    return updated[0]
  }

  const nueva = await db
    .insert(hegemonias)
    .values({
      id: crypto.randomUUID(),
      semana,
      fechaInicio: inicioSemana,
      fechaFin: finSemana,
      ganadorId,
      kleosGanador: Math.max(kleos1, kleos2),
      kleosRival: Math.min(kleos1, kleos2),
      empate,
    })
    .returning()

  if (!empate && ganadorId) {
    void actualizarPuntosDisputaEvento(ganadorId, 'nike_hegemonia').catch(() => {})
    const ganador = ambos.find((a) => a.id === ganadorId)
    if (ganador) {
      const eventoId = crypto.randomUUID()
      await db.insert(agoraEventos).values({
        id: eventoId,
        agonistId: ganadorId,
        tipo: 'hegemonia_ganada',
        contenido: `${ganador.nombre} conquistó La Hegemonía de la semana ${semana}. El Altis lo registra.`,
        metadata: { semana, kleos: Math.max(kleos1, kleos2) },
      })
      void triggerComentariosDioses(eventoId).catch((err) =>
        console.error('triggerComentariosDioses hegemonia_ganada', err)
      )
    }
  }

  return nueva[0]
}

export function getSemanaRango(semana: number) {
  const start = process.env.NEXT_PUBLIC_AGON_START_DATE
  if (!start) throw new Error('NEXT_PUBLIC_AGON_START_DATE no está definida')

  const inicio = new Date(start)
  const inicioSemana = new Date(inicio)
  inicioSemana.setDate(inicio.getDate() + (semana - 1) * 7)
  const finSemana = new Date(inicioSemana)
  finSemana.setDate(inicioSemana.getDate() + 6)

  return {
    inicioSemana: inicioSemana.toISOString().split('T')[0],
    finSemana: finSemana.toISOString().split('T')[0],
  }
}

export function getSemanaActual(): number {
  const start = process.env.NEXT_PUBLIC_AGON_START_DATE
  if (!start) return 1

  const inicio = new Date(start)
  const hoy = new Date()
  const diff = Math.floor(
    (hoy.getTime() - inicio.getTime()) / (7 * 24 * 60 * 60 * 1000)
  )
  return Math.max(1, diff + 1)
}

// ─── NIVEL ────────────────────────────────────────────

export async function actualizarNivel(
  agonistId: string,
  kleosTotal: number
): Promise<{ nivelAnterior: string; nivelNuevo: string } | null> {
  const ordenados = (
    Object.entries(NIVEL_THRESHOLDS) as [NivelKey, number][]
  ).sort((a, b) => a[1] - b[1])

  let nivelNuevo: NivelKey = 'aspirante'
  for (const [key, threshold] of ordenados) {
    if (kleosTotal >= threshold) nivelNuevo = key
  }

  const agonista = await db
    .select()
    .from(agonistas)
    .where(eq(agonistas.id, agonistId))
    .limit(1)

  if (!agonista[0]) return null

  const nivelAnterior = agonista[0].nivel

  if (nivelNuevo !== nivelAnterior) {
    await db
      .update(agonistas)
      .set({ nivel: nivelNuevo, updatedAt: new Date() })
      .where(eq(agonistas.id, agonistId))

    const eventoId = crypto.randomUUID()
    await db.insert(agoraEventos).values({
      id: eventoId,
      agonistId,
      tipo: 'nivel_subido',
      contenido: `${agonista[0].nombre} alcanzó el nivel ${NIVEL_LABELS[nivelNuevo]}. El Altis lo reconoce.`,
      metadata: {
        nivelAnterior,
        nivelNuevo,
        kleosAlSubir: agonista[0].kleosTotal,
        diasPerfectosAlSubir: agonista[0].diasPerfectos,
      },
    })

    void triggerComentariosDioses(eventoId).catch((err) =>
      console.error('triggerComentariosDioses nivel_subido', err)
    )

    return { nivelAnterior, nivelNuevo }
  }

  return null
}
