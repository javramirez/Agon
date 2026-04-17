import { db } from '@/lib/db'
import { calendarioCrisis, crisisCiudad } from '@/lib/db/schema'
import { CRISIS_POOL, getCrisis, type CrisisConfig } from './config'
import { and, eq } from 'drizzle-orm'
import { getDiaDelAgan, isGranAgonActivo } from '@/lib/utils'
import { getAmbosAgonistas, getRetoPorId } from '@/lib/db/queries'

// ─── SORTEO DEL CALENDARIO ───────────────────────────────────────────────────

export async function generarCalendarioCrisis(retoId: string): Promise<void> {
  const existente = await db
    .select()
    .from(calendarioCrisis)
    .where(eq(calendarioCrisis.retoId, retoId))
    .limit(1)
  if (existente.length > 0) return

  // Separar crisis con líder y sin líder para garantizar variedad
  const conLider = CRISIS_POOL.filter((c) => c.lider !== undefined)
  const sinLider = CRISIS_POOL.filter((c) => c.lider === undefined)

  // Sortear 2 con líder y 2 sin líder — variedad garantizada
  const seleccionConLider = conLider
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .map((c) => c.id)

  const seleccionSinLider = sinLider
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .map((c) => c.id)

  // Mezclar las 4 seleccionadas y asignar una por semana (1-4)
  const crisisSeleccionadas = [...seleccionConLider, ...seleccionSinLider].sort(
    () => Math.random() - 0.5
  )

  await db.insert(calendarioCrisis).values({
    retoId,
    crisisSeleccionadas,
  })
}

// ─── LECTURA DEL CALENDARIO ───────────────────────────────────────────────────

export async function getCalendarioCrisis(retoId: string) {
  const result = await db
    .select()
    .from(calendarioCrisis)
    .where(eq(calendarioCrisis.retoId, retoId))
    .limit(1)
  return result[0] ?? null
}

// ─── VERIFICAR Y ACTIVAR CRISIS ───────────────────────────────────────────────
// Llamado en login — fire-and-forget
// Activa la crisis de la semana actual si no existe aún

export async function verificarYActivarCrisis(
  retoId: string,
  fechaInicio: string,
  modo: 'solo' | 'duelo'
): Promise<void> {
  try {
    const reto = await getRetoPorId(retoId)
    const fechaFin = reto?.fechaFin ?? ''
    if (!fechaInicio || !fechaFin) return
    if (!isGranAgonActivo(fechaInicio, fechaFin)) return

    const hoy = new Date()

    await generarCalendarioCrisis(retoId)

    const calendario = await getCalendarioCrisis(retoId)
    if (!calendario) return

    const diaActual = getDiaDelAgan(fechaInicio)
    const semanaActual = Math.ceil(diaActual / 7)
    if (diaActual <= 0 || semanaActual <= 0) return

    const diaActivacion = semanaActual * 7
    if (diaActual !== diaActivacion) return

    const crisisExistente = await db
      .select({ id: crisisCiudad.id })
      .from(crisisCiudad)
      .where(
        and(
          eq(crisisCiudad.semana, semanaActual),
          eq(crisisCiudad.retoId, retoId)
        )
      )
      .limit(1)

    if (crisisExistente.length > 0) return

    const crisisIds = calendario.crisisSeleccionadas as string[]
    const crisisId = crisisIds[semanaActual - 1]
    if (!crisisId) return

    const config = getCrisis(crisisId)
    if (!config) return

    if (modo === 'solo') {
      const mecanicasPvP = ['D', 'H', 'F']
      const tienePvP = config.mecanicas.some((m) => mecanicasPvP.includes(m))
      if (tienePvP) return
    }

    const esH = config.mecanicas.includes('H')
    const horasExpiracion = esH ? 24 : 48
    const fechaExpiracion = new Date(
      hoy.getTime() + horasExpiracion * 60 * 60 * 1000
    )

    await db.insert(crisisCiudad).values({
      crisisId,
      semana: semanaActual,
      retoId,
      fechaExpiracion,
      resuelta: false,
      consecuenciaDiferidaAplicada: false,
    })
  } catch (_error) {
    console.error('[verificarYActivarCrisis] Error:', _error)
  }
}

// ─── OBTENER CRISIS ACTIVA ────────────────────────────────────────────────────

export interface CrisisActivaConConfig {
  fila: typeof crisisCiudad.$inferSelect
  config: CrisisConfig
  agonista1Id: string
  agonista2Id: string
}

export async function getCrisisActiva(
  retoId: string | null | undefined
): Promise<CrisisActivaConConfig | null> {
  if (!retoId) return null

  const filas = await db
    .select()
    .from(crisisCiudad)
    .where(
      and(
        eq(crisisCiudad.resuelta, false),
        eq(crisisCiudad.retoId, retoId)
      )
    )
    .limit(1)

  const fila = filas[0]
  if (!fila) return null

  const config = getCrisis(fila.crisisId)
  if (!config) return null

  const ambos = await getAmbosAgonistas(retoId)
  if (ambos.length < 1) return null

  return {
    fila,
    config,
    agonista1Id: ambos[0]!.id,
    agonista2Id: ambos[1]?.id ?? ambos[0]!.id,
  }
}

// ─── OBTENER DECISIÓN DEL AGONISTA ───────────────────────────────────────────

export function getDecisionAgonista(
  fila: typeof crisisCiudad.$inferSelect,
  agonistId: string,
  agonista1Id: string
): string | null {
  const esAgonista1 = agonistId === agonista1Id
  return esAgonista1 ? fila.decisionAgonista1 : fila.decisionAgonista2
}

export function getDecisionRival(
  fila: typeof crisisCiudad.$inferSelect,
  agonistId: string,
  agonista1Id: string
): string | null {
  const esAgonista1 = agonistId === agonista1Id
  return esAgonista1 ? fila.decisionAgonista2 : fila.decisionAgonista1
}

// ─── GUARDAR DECISIÓN ─────────────────────────────────────────────────────────

export async function guardarDecisionCrisis(
  crisisFilaId: string,
  agonistId: string,
  agonista1Id: string,
  decision: 'A' | 'B',
  respuestaTexto?: string
): Promise<void> {
  const esAgonista1 = agonistId === agonista1Id

  await db
    .update(crisisCiudad)
    .set(
      esAgonista1
        ? {
            decisionAgonista1: decision,
            respuestaTextoAgonista1: respuestaTexto ?? null,
          }
        : {
            decisionAgonista2: decision,
            respuestaTextoAgonista2: respuestaTexto ?? null,
          }
    )
    .where(eq(crisisCiudad.id, crisisFilaId))
}

// ─── GUARDAR PUNTAJE TRIVIA ───────────────────────────────────────────────────

export async function guardarPuntajeTrivia(
  crisisFilaId: string,
  agonistId: string,
  agonista1Id: string,
  puntaje: number
): Promise<void> {
  const esAgonista1 = agonistId === agonista1Id

  await db
    .update(crisisCiudad)
    .set(
      esAgonista1
        ? { puntajeAgonista1: puntaje }
        : { puntajeAgonista2: puntaje }
    )
    .where(eq(crisisCiudad.id, crisisFilaId))
}

// ─── VERIFICAR SI CRISIS EXPIRÓ SIN DECISIÓN ─────────────────────────────────

export function crisisExpirada(fila: typeof crisisCiudad.$inferSelect): boolean {
  return new Date() > new Date(fila.fechaExpiracion)
}

// ─── DETERMINAR ESCENARIO ─────────────────────────────────────────────────────

export type EscenarioCrisis = '1' | '2' | '3' | '4' | 'expiracion'

export function determinarEscenario(
  fila: typeof crisisCiudad.$inferSelect,
  agonistId: string,
  agonista1Id: string
): EscenarioCrisis | null {
  const d1 = fila.decisionAgonista1
  const d2 = fila.decisionAgonista2

  // Si ninguno decidió y expiró → escenario de expiración (equivale a ambos B)
  if (!d1 && !d2 && crisisExpirada(fila)) return 'expiracion'

  // Si falta alguna decisión y no expiró → aún pendiente
  if (!d1 || !d2) return null

  if (d1 === 'A' && d2 === 'A') return '1' // ambos A
  if (d1 === 'B' && d2 === 'B') return '2' // ambos B

  const esAgonista1 = agonistId === agonista1Id
  if (esAgonista1) {
    return d1 === 'A' ? '3' : '4' // yo A rival B → 3 / yo B rival A → 4
  } else {
    return d2 === 'A' ? '3' : '4'
  }
}
