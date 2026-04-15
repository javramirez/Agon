import { db } from '@/lib/db'
import { calendarioCrisis, crisisCiudad, agonistas } from '@/lib/db/schema'
import { CRISIS_POOL, getCrisis, type CrisisConfig } from './config'
import { eq } from 'drizzle-orm'

// ─── SORTEO DEL CALENDARIO ───────────────────────────────────────────────────

export async function generarCalendarioCrisis(): Promise<void> {
  const existente = await db.select().from(calendarioCrisis).limit(1)
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
    crisisSeleccionadas,
  })
}

// ─── LECTURA DEL CALENDARIO ───────────────────────────────────────────────────

export async function getCalendarioCrisis() {
  const result = await db.select().from(calendarioCrisis).limit(1)
  return result[0] ?? null
}

// ─── CÁLCULO DE DÍA Y SEMANA ACTUAL ──────────────────────────────────────────

export function getDiaActualReto(): number {
  const startDate = process.env.NEXT_PUBLIC_AGON_START_DATE
  if (!startDate) return 0

  const inicio = new Date(startDate)
  inicio.setHours(0, 0, 0, 0)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const diff = Math.floor(
    (hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
  )
  return diff + 1 // día 1 = primer día del reto
}

export function getSemanaActualReto(): number {
  const dia = getDiaActualReto()
  return Math.ceil(dia / 7)
}

// ─── VERIFICAR Y ACTIVAR CRISIS ───────────────────────────────────────────────
// Llamado en login — fire-and-forget
// Activa la crisis de la semana actual si no existe aún

export async function verificarYActivarCrisis(): Promise<void> {
  try {
    const startDate = process.env.NEXT_PUBLIC_AGON_START_DATE
    const endDate = process.env.NEXT_PUBLIC_AGON_END_DATE
    if (!startDate || !endDate) return

    // Verificar que el reto está activo
    const hoy = new Date()
    const inicio = new Date(startDate)
    const fin = new Date(endDate)
    inicio.setHours(0, 0, 0, 0)
    fin.setHours(23, 59, 59, 999)
    if (hoy < inicio || hoy > fin) return

    // Generar calendario si no existe
    await generarCalendarioCrisis()

    const calendario = await getCalendarioCrisis()
    if (!calendario) return

    const semanaActual = getSemanaActualReto()
    const diaActual = getDiaActualReto()

    // La crisis se activa el día 7 de cada semana (último día)
    // Semana 1 → día 7, Semana 2 → día 14, etc.
    const diaActivacion = semanaActual * 7
    if (diaActual !== diaActivacion) return

    // Verificar que no existe ya una crisis para esta semana
    const crisisExistente = await db
      .select({ id: crisisCiudad.id })
      .from(crisisCiudad)
      .where(eq(crisisCiudad.semana, semanaActual))
      .limit(1)

    if (crisisExistente.length > 0) return

    // Obtener la crisis de esta semana del calendario
    const crisisIds = calendario.crisisSeleccionadas as string[]
    const crisisId = crisisIds[semanaActual - 1]
    if (!crisisId) return

    const config = getCrisis(crisisId)
    if (!config) return

    // Determinar duración — Tipo H tiene 24h, resto 48h
    const esH = config.mecanicas.includes('H')
    const horasExpiracion = esH ? 24 : 48
    const fechaExpiracion = new Date(
      hoy.getTime() + horasExpiracion * 60 * 60 * 1000
    )

    await db.insert(crisisCiudad).values({
      crisisId,
      semana: semanaActual,
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

export async function getCrisisActiva(): Promise<CrisisActivaConConfig | null> {
  // Buscar crisis no resuelta
  const filas = await db
    .select()
    .from(crisisCiudad)
    .where(eq(crisisCiudad.resuelta, false))
    .limit(1)

  const fila = filas[0]
  if (!fila) return null

  const config = getCrisis(fila.crisisId)
  if (!config) return null

  // Obtener IDs de los dos agonistas en orden consistente
  const ambos = await db.select({ id: agonistas.id }).from(agonistas).limit(2)

  if (ambos.length < 2) return null

  return {
    fila,
    config,
    agonista1Id: ambos[0].id,
    agonista2Id: ambos[1].id,
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
