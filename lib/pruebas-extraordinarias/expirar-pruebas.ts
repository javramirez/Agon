import { db } from '@/lib/db'
import { pruebaExtraordinaria, agoraEventos } from '@/lib/db/schema'
import { and, eq, lte } from 'drizzle-orm'
import { getOrCreateAgonista } from '@/lib/db/queries'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'

/**
 * Desactiva pruebas extraordinarias vencidas no completadas por el agonista actual
 * y publica en El Ágora + dispara comentarios (Eris, etc.).
 */
export async function procesarPruebasExpiradas(clerkUserId: string): Promise<{
  expiradas: number
}> {
  const ahora = new Date()
  const esJavier = clerkUserId === process.env.CLERK_JAVIER_USER_ID

  const expiradas = await db
    .select()
    .from(pruebaExtraordinaria)
    .where(
      and(
        eq(pruebaExtraordinaria.activa, true),
        lte(pruebaExtraordinaria.fechaExpira, ahora),
        esJavier
          ? eq(pruebaExtraordinaria.completadaPorJavier, false)
          : eq(pruebaExtraordinaria.completadaPorMatias, false)
      )
    )

  const agonista = await getOrCreateAgonista(clerkUserId)

  for (const p of expiradas) {
    await db
      .update(pruebaExtraordinaria)
      .set({ activa: false })
      .where(eq(pruebaExtraordinaria.id, p.id))

    const tipoLabel =
      p.tipo === 'triptico' ? 'del Tríptico' : 'del Destino'
    const eventoId = crypto.randomUUID()

    await db.insert(agoraEventos).values({
      id: eventoId,
      agonistId: agonista.id,
      tipo: 'prueba_completada',
      contenido: `La Prueba Extraordinaria ${tipoLabel} expiró sin ser completada: "${p.descripcion}" El Altis lo registró.`,
      metadata: {
        pruebaExpirada: true,
        pruebaId: p.pruebaId,
        tipo: p.tipo,
      },
    })

    void triggerComentariosDioses(
      eventoId,
      'prueba_extraordinaria_expirada'
    ).catch((err) =>
      console.error('triggerComentariosDioses prueba expirada', err)
    )
  }

  return { expiradas: expiradas.length }
}
