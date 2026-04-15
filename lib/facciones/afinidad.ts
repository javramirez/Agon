import { db } from '@/lib/db'
import { disputasCampeon, faccionesAfinidad } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import {
  type FaccionId,
  type VentajaCampeon,
  PUNTOS_EVENTO,
  RACHA_MILESTONES,
  MAX_CAMPEON_FACCIONES,
  METAS_HABITO,
  VENTAJAS_CAMPEON,
  calcularRango,
} from './config'
import { detectarDisputaCampeon } from './disputa'

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export interface PruebaActualAfinidad {
  soloAgua: boolean
  sinComidaRapida: boolean
  pasos: number
  horasSueno: number
  paginasLeidas: number
  sesionesGym: number
  sesionesCardio: number
}

export interface PruebaAnteriorAfinidad {
  sesionesGym: number
  sesionesCardio: number
}

export interface ExtrasAfinidad {
  diaPerfecto: boolean
  rachaActual: number // racha en días tras marcar las pruebas de hoy
}

export type TipoEventoAfinidad =
  | 'nike_hegemonia'
  | 'eris_igualados'
  | 'eris_kleos'
  | 'eris_hegemonia_cambio'
  | 'eris_dia_perfecto_ambos'

// ─── Helper interno: upsert de una sola facción ───────────────────────────────

async function upsertFaccion(params: {
  agonistId: string
  faccionId: FaccionId
  puntosNuevos: number
  puntosActuales: number
  rangoActual: number
  campeonCount: number
  rachaMilestoneActual: number
  rachaMilestoneNuevo: number
  traicionCount?: number
}): Promise<{ subioACampeon: boolean }> {
  const {
    agonistId,
    faccionId,
    puntosNuevos,
    puntosActuales,
    rangoActual,
    campeonCount,
    rachaMilestoneActual,
    rachaMilestoneNuevo,
    traicionCount = 0,
  } = params

  const penalidad = Math.min(traicionCount, 2) * 0.15
  const puntosEfectivos = Math.round(puntosNuevos * (1 - penalidad))
  const puntosTotal = puntosActuales + puntosEfectivos
  let nuevoRango = calcularRango(puntosTotal)

  // Límite: máx 2 facciones en Campeón simultáneamente
  // Si esta facción no era Campeón y ya hay 2, se bloquea en Aliado
  if (
    nuevoRango === 5 &&
    rangoActual < 5 &&
    campeonCount >= MAX_CAMPEON_FACCIONES
  ) {
    nuevoRango = 4
  }

  const milestoneMax = Math.max(rachaMilestoneActual, rachaMilestoneNuevo)

  await db
    .insert(faccionesAfinidad)
    .values({
      agonistId,
      faccionId,
      puntosAfinidad: puntosTotal,
      rango: nuevoRango,
      rachaMilestoneMaximo: milestoneMax,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [faccionesAfinidad.agonistId, faccionesAfinidad.faccionId],
      set: {
        puntosAfinidad: puntosTotal,
        rango: nuevoRango,
        rachaMilestoneMaximo: milestoneMax,
        updatedAt: new Date(),
      },
    })

  return { subioACampeon: nuevoRango === 5 && rangoActual < 5 }
}

// ─── Función principal: llamada desde pruebas/route.ts ────────────────────────

export async function actualizarAfinidadHabitos(
  agonistId: string,
  pruebaActual: PruebaActualAfinidad,
  pruebaAnterior: PruebaAnteriorAfinidad | null,
  extras: ExtrasAfinidad
): Promise<void> {
  const afinidades = await db
    .select()
    .from(faccionesAfinidad)
    .where(eq(faccionesAfinidad.agonistId, agonistId))

  const ventajasActivas = getVentajasActivas(afinidades)
  const metasEfectivas = getMetasEfectivas(ventajasActivas)
  const puntosEfectivos = getPuntosEfectivos(ventajasActivas)
  const campeonCount = afinidades.filter((a) => a.rango === 5).length
  const afinidadMap = new Map(afinidades.map((a) => [a.faccionId as FaccionId, a]))

  const updates: Array<{ faccionId: FaccionId; puntos: number }> = []

  if (pruebaActual.soloAgua && pruebaActual.sinComidaRapida) {
    updates.push({
      faccionId: 'gremio_tierra',
      puntos: puntosEfectivos.demeter_paquete,
    })
  }

  if (pruebaActual.horasSueno >= metasEfectivas.horasSueno) {
    updates.push({
      faccionId: 'concilio_sombras',
      puntos: PUNTOS_EVENTO.morfeo_sueno,
    })
  }

  if (pruebaActual.paginasLeidas >= metasEfectivas.paginasLeidas) {
    updates.push({
      faccionId: 'escuela_logos',
      puntos: PUNTOS_EVENTO.apolo_lectura,
    })
  }

  if (pruebaActual.pasos >= metasEfectivas.pasos) {
    updates.push({
      faccionId: 'corredores_alba',
      puntos: PUNTOS_EVENTO.hermes_pasos,
    })
  }

  const gymAnterior = pruebaAnterior?.sesionesGym ?? 0
  const cardioAnterior = pruebaAnterior?.sesionesCardio ?? 0
  if (pruebaActual.sesionesGym > gymAnterior) {
    updates.push({
      faccionId: 'guardia_hierro',
      puntos: puntosEfectivos.ares_gym,
    })
  }
  if (pruebaActual.sesionesCardio > cardioAnterior) {
    updates.push({
      faccionId: 'guardia_hierro',
      puntos: puntosEfectivos.ares_cardio,
    })
  }

  if (extras.diaPerfecto) {
    updates.push({
      faccionId: 'tribunal_kleos',
      puntos: PUNTOS_EVENTO.nike_dia_perfecto,
    })
  }

  const nikeActual = afinidadMap.get('tribunal_kleos')
  const rachaMilestoneMax = nikeActual?.rachaMilestoneMaximo ?? 0
  let nuevoMilestoneMax = rachaMilestoneMax

  for (const milestone of RACHA_MILESTONES) {
    if (extras.rachaActual >= milestone && rachaMilestoneMax < milestone) {
      updates.push({
        faccionId: 'tribunal_kleos',
        puntos: PUNTOS_EVENTO.nike_racha_milestone,
      })
      nuevoMilestoneMax = milestone
      break
    }
  }

  if (updates.length === 0) return

  const updatesPorFaccion = new Map<FaccionId, number>()
  for (const { faccionId, puntos } of updates) {
    updatesPorFaccion.set(
      faccionId,
      (updatesPorFaccion.get(faccionId) ?? 0) + puntos
    )
  }

  for (const [faccionId, puntosNuevos] of updatesPorFaccion) {
    const actual = afinidadMap.get(faccionId)
    const { subioACampeon } = await upsertFaccion({
      agonistId,
      faccionId,
      puntosNuevos,
      puntosActuales: actual?.puntosAfinidad ?? 0,
      rangoActual: actual?.rango ?? 1,
      campeonCount,
      rachaMilestoneActual: actual?.rachaMilestoneMaximo ?? 0,
      rachaMilestoneNuevo:
        faccionId === 'tribunal_kleos'
          ? nuevoMilestoneMax
          : (actual?.rachaMilestoneMaximo ?? 0),
      traicionCount: actual?.traicionCount ?? 0,
    })
    if (subioACampeon) {
      void detectarDisputaCampeon(agonistId, faccionId)
    }
  }
}

// ─── Función para eventos especiales (hegemonía, rivalidad Eris) ─────────────
// Se llama desde el sistema de hegemonía y desde lib/dioses/rivalidad.ts

export async function actualizarAfinidadEvento(
  agonistId: string,
  tipo: TipoEventoAfinidad
): Promise<void> {
  const mapeo: Record<
    TipoEventoAfinidad,
    { faccionId: FaccionId; puntos: number }
  > = {
    nike_hegemonia: {
      faccionId: 'tribunal_kleos',
      puntos: PUNTOS_EVENTO.nike_hegemonia,
    },
    eris_igualados: {
      faccionId: 'hermandad_caos',
      puntos: PUNTOS_EVENTO.eris_igualados,
    },
    eris_kleos: {
      faccionId: 'hermandad_caos',
      puntos: PUNTOS_EVENTO.eris_kleos,
    },
    eris_hegemonia_cambio: {
      faccionId: 'hermandad_caos',
      puntos: PUNTOS_EVENTO.eris_hegemonia_cambio,
    },
    eris_dia_perfecto_ambos: {
      faccionId: 'hermandad_caos',
      puntos: PUNTOS_EVENTO.eris_dia_perfecto_ambos,
    },
  }

  const { faccionId, puntos } = mapeo[tipo]

  const [afinidades, disputasGanadas] = await Promise.all([
    db.select().from(faccionesAfinidad).where(eq(faccionesAfinidad.agonistId, agonistId)),
    db
      .select({ faccionId: disputasCampeon.faccionId })
      .from(disputasCampeon)
      .where(
        and(
          eq(disputasCampeon.ganadorId, agonistId),
          eq(disputasCampeon.resuelta, true)
        )
      ),
  ])

  const campeonCount = afinidades.filter((a) => a.rango === 5).length
  const actual = afinidades.find((a) => a.faccionId === faccionId)

  const esEris = faccionId === 'hermandad_caos'
  const erisIndiscutida =
    esEris &&
    disputasGanadas.some((d) => d.faccionId === 'hermandad_caos') &&
    (actual?.rango ?? 0) === 5

  const puntosFinales = erisIndiscutida ? puntos * 2 : puntos

  const { subioACampeon } = await upsertFaccion({
    agonistId,
    faccionId,
    puntosNuevos: puntosFinales,
    puntosActuales: actual?.puntosAfinidad ?? 0,
    rangoActual: actual?.rango ?? 1,
    campeonCount,
    rachaMilestoneActual: actual?.rachaMilestoneMaximo ?? 0,
    rachaMilestoneNuevo: actual?.rachaMilestoneMaximo ?? 0,
    traicionCount: actual?.traicionCount ?? 0,
  })
  if (subioACampeon) {
    void detectarDisputaCampeon(agonistId, faccionId)
  }
}

// ─── Ventajas de Campeón (lectura / metas y puntos efectivos) ─────────────────

export function getVentajasActivas(
  afinidades: { faccionId: string; rango: number }[]
): VentajaCampeon[] {
  return afinidades
    .filter((a) => a.rango === 5)
    .flatMap((a) => {
      const ventaja = VENTAJAS_CAMPEON[a.faccionId as FaccionId]
      return ventaja ? [ventaja] : []
    })
}

export function getMetasEfectivas(ventajasActivas: VentajaCampeon[]) {
  const ids = ventajasActivas.map((v) => v.faccionId)
  return {
    pasos: ids.includes('corredores_alba') ? 9000 : METAS_HABITO.pasos,
    horasSueno: ids.includes('concilio_sombras') ? 6 : METAS_HABITO.horasSueno,
    paginasLeidas: ids.includes('escuela_logos') ? 5 : METAS_HABITO.paginasLeidas,
    sesionesGym: ids.includes('guardia_hierro') ? 3 : METAS_HABITO.sesionesGym,
    sesionesCardio: ids.includes('guardia_hierro') ? 2 : METAS_HABITO.sesionesCardio,
  }
}

export type MetasEfectivas = ReturnType<typeof getMetasEfectivas>

export function getPuntosEfectivos(ventajasActivas: VentajaCampeon[]) {
  const ids = ventajasActivas.map((v) => v.faccionId)
  return {
    demeter_paquete: ids.includes('gremio_tierra')
      ? 15
      : PUNTOS_EVENTO.demeter_paquete,
    ares_gym: ids.includes('guardia_hierro') ? 9 : PUNTOS_EVENTO.ares_gym,
    ares_cardio: ids.includes('guardia_hierro') ? 8 : PUNTOS_EVENTO.ares_cardio,
  }
}

// ─── Ventajas Fase B — requieren haber ganado una Disputa ─────────────────────

export interface VentajasFaseB {
  /** Ganó disputa en tribunal_kleos y es Campeón → +20% kleos día perfecto */
  nikeIndiscutido: boolean
  /** Ganó disputa en hermandad_caos y es Campeón → doble pts afinidad rivalidad */
  erisIndiscutido: boolean
  /** Campeón de guardia_hierro (sin requerir disputa) → metas reducidas */
  aresCampeon: boolean
}

export async function getVentajasFaseB(agonistId: string): Promise<VentajasFaseB> {
  const [afinidades, disputasGanadas] = await Promise.all([
    db
      .select({ faccionId: faccionesAfinidad.faccionId, rango: faccionesAfinidad.rango })
      .from(faccionesAfinidad)
      .where(eq(faccionesAfinidad.agonistId, agonistId)),
    db
      .select({ faccionId: disputasCampeon.faccionId })
      .from(disputasCampeon)
      .where(
        and(
          eq(disputasCampeon.ganadorId, agonistId),
          eq(disputasCampeon.resuelta, true)
        )
      ),
  ])

  const faccionesGanadas = new Set(disputasGanadas.map((d) => d.faccionId))

  return {
    nikeIndiscutido:
      faccionesGanadas.has('tribunal_kleos') &&
      (afinidades.find((a) => a.faccionId === 'tribunal_kleos')?.rango ?? 0) === 5,
    erisIndiscutido:
      faccionesGanadas.has('hermandad_caos') &&
      (afinidades.find((a) => a.faccionId === 'hermandad_caos')?.rango ?? 0) === 5,
    aresCampeon:
      (afinidades.find((a) => a.faccionId === 'guardia_hierro')?.rango ?? 0) === 5,
  }
}
