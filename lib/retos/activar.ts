import { db } from '@/lib/db'
import { retos } from '@/lib/db/schema'
import { eq, and, lte, isNotNull } from 'drizzle-orm'

/**
 * Activa los retos programados cuya fecha de inicio ya llegó (inclusive).
 * Llamar antes de leer el reto del usuario para que el mismo request vea estado actualizado.
 */
export async function activarRetosListos(): Promise<void> {
  const hoy = new Date().toISOString().split('T')[0]!

  await db
    .update(retos)
    .set({ estado: 'activo', updatedAt: new Date() })
    .where(
      and(
        eq(retos.estado, 'programado'),
        isNotNull(retos.fechaInicio),
        lte(retos.fechaInicio, hoy)
      )
    )
}
