// TODO PROMPT-01: completada_por_javier / completada_por_matias y CLERK_JAVIER_USER_ID eliminados; filtro por kleos_log hasta PROMPT 14
import { db } from '@/lib/db'
import { pruebaExtraordinaria, agoraEventos, kleosLog } from '@/lib/db/schema'
import { and, eq, lte } from 'drizzle-orm'
import { getAgonistaByClerkId } from '@/lib/db/queries'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'

function motivoCompletacionFila(filaId: string) {
  return `prueba_extraordinaria_row:${filaId}`
}

/**
 * Desactiva pruebas extraordinarias vencidas no completadas por el agonista actual
 * y publica en El Ágora + dispara comentarios (Eris, etc.).
 */
export async function procesarPruebasExpiradas(clerkUserId: string): Promise<{
  expiradas: number
}> {
  const ahora = new Date()
  const agonista = await getAgonistaByClerkId(clerkUserId)
  if (!agonista) {
    return { expiradas: 0 }
  }

  const candidatas = await db
    .select()
    .from(pruebaExtraordinaria)
    .where(
      and(
        eq(pruebaExtraordinaria.activa, true),
        lte(pruebaExtraordinaria.fechaExpira, ahora)
      )
    )

  const expiradas = []
  for (const p of candidatas) {
    const hecha = await db
      .select({ id: kleosLog.id })
      .from(kleosLog)
      .where(
        and(
          eq(kleosLog.agonistId, agonista.id),
          eq(kleosLog.motivo, motivoCompletacionFila(p.id))
        )
      )
      .limit(1)
    if (hecha.length === 0) expiradas.push(p)
  }

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
