import {
  FACCIONES,
  calcularRango,
  getPoblacionVisible,
  type FaccionId,
} from './config'

/** Tipos de post del Ágora que generan likes de adeptos */
export type TipoPostAgora =
  | 'semana_sagrada'
  | 'dia_perfecto'
  | 'hegemonia_ganada'
  | 'nivel_subido'
  | 'inscripcion_epica'
  | 'prueba_extraordinaria'
  | 'prueba_completada'

/** Rango de engagement [min, max] por tipo de post */
const ENGAGEMENT_RANGE: Record<TipoPostAgora, [number, number]> = {
  semana_sagrada: [0.9, 1.0],
  dia_perfecto: [0.82, 0.95],
  hegemonia_ganada: [0.78, 0.9],
  nivel_subido: [0.75, 0.87],
  inscripcion_epica: [0.72, 0.85],
  prueba_extraordinaria: [0.7, 0.82],
  prueba_completada: [0.7, 0.8],
}

/** Milestones de animación */
export const LIKE_MILESTONES = [
  { min: 0, max: 299, tier: 1, label: '' },
  { min: 300, max: 2499, tier: 2, label: 'tu facción te nota' },
  { min: 2500, max: 8999, tier: 3, label: 'el distrito habla' },
  { min: 9000, max: 23999, tier: 4, label: 'Olimpia te conoce' },
  { min: 24000, max: Number.POSITIVE_INFINITY, tier: 5, label: 'leyenda de Olimpia' },
] as const

export function getTierFromLikes(total: number): number {
  return LIKE_MILESTONES.find((m) => total >= m.min && total <= m.max)?.tier ?? 1
}

function getEngagement(tipo: TipoPostAgora): number {
  const [min, max] = ENGAGEMENT_RANGE[tipo]
  return min + Math.random() * (max - min)
}

export interface PuntosFaccion {
  faccionId: FaccionId
  puntos: number
}

/**
 * Calcula los likes de adeptos para un post dado.
 * Se llama con los puntos ya obtenidos de DB para evitar queries adicionales.
 *
 * @param puntosPorFaccion - Array de { faccionId, puntos } del agonista autor del post
 * @param tipoPost - Tipo de evento del Ágora
 * @param esSolo - En modo solo, Eris no aporta (no hay rivalidad)
 */
export function calcularLikesAdeptos(
  puntosPorFaccion: PuntosFaccion[],
  tipoPost: TipoPostAgora,
  esSolo = false
): number {
  const engagement = getEngagement(tipoPost)
  let total = 0

  for (const { faccionId, puntos } of puntosPorFaccion) {
    if (esSolo && faccionId === 'hermandad_caos') continue

    const rango = calcularRango(puntos)
    if (rango <= 1) continue

    const faccion = FACCIONES[faccionId]
    const poblacionVisible = getPoblacionVisible(faccion, rango)
    total += Math.floor(poblacionVisible * engagement)
  }

  return total
}

/**
 * En modo Duelo: likes combinados del post (autor + contribución rival).
 * Los adeptos del rival aportan 1–3% adicional (traidores curiosos).
 */
export function calcularLikesAdeptosDuelo(
  puntosPorFaccionAutor: PuntosFaccion[],
  puntosPorFaccionRival: PuntosFaccion[],
  tipoPost: TipoPostAgora
): number {
  const likesAutor = calcularLikesAdeptos(puntosPorFaccionAutor, tipoPost, false)

  const engagement = getEngagement(tipoPost)
  let likesTraidores = 0
  const tasaTraicion = 0.01 + Math.random() * 0.02

  for (const { faccionId, puntos } of puntosPorFaccionRival) {
    if (faccionId === 'hermandad_caos') continue

    const rango = calcularRango(puntos)
    if (rango <= 1) continue

    const faccion = FACCIONES[faccionId]
    const poblacionVisible = getPoblacionVisible(faccion, rango)
    likesTraidores += Math.floor(poblacionVisible * engagement * tasaTraicion)
  }

  return likesAutor + likesTraidores
}
