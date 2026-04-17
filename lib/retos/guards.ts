import { getRetoPorId } from '@/lib/db/queries'

/**
 * Retorna el reto si existe (consulta por id).
 */
export async function getReto(retoId: string | null | undefined) {
  if (!retoId) return null
  return getRetoPorId(retoId)
}

/**
 * true si el reto es modo duelo y está activo.
 */
export async function esDuelo(
  retoId: string | null | undefined
): Promise<boolean> {
  const reto = await getReto(retoId)
  return reto?.modo === 'duelo' && reto?.estado === 'activo'
}

/**
 * true si el reto es modo solo.
 */
export async function esSolo(
  retoId: string | null | undefined
): Promise<boolean> {
  const reto = await getReto(retoId)
  return reto?.modo === 'solo'
}
