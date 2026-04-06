import { db } from '@/lib/db'
import { agoraEventos, comentariosPendientes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getDiosesParaEvento, getDelayDios } from './config'

/**
 * Encola comentarios de dioses para un evento del Ágora (procesados en
 * `/api/eventos/verificar` — compatible con serverless sin setTimeout).
 * `tipoOverride` permite p. ej. `prueba_extraordinaria_expirada` cuando el `tipo` en DB es otro.
 */
export async function triggerComentariosDioses(
  eventoId: string,
  tipoOverride?: string
): Promise<{
  ok: boolean
  diosesNotificados: string[]
}> {
  const evento = await db
    .select()
    .from(agoraEventos)
    .where(eq(agoraEventos.id, eventoId))
    .limit(1)

  if (evento.length === 0) {
    return { ok: false, diosesNotificados: [] }
  }

  const e = evento[0]
  const tipoEvento = tipoOverride ?? String(e.tipo)
  const dioses = getDiosesParaEvento(tipoEvento)
  const diosesNotificados: string[] = []

  for (const diosNombre of dioses) {
    const delay = getDelayDios(tipoEvento)
    const procesarDespuesDe = new Date(Date.now() + delay)

    await db.insert(comentariosPendientes).values({
      id: crypto.randomUUID(),
      eventoId,
      diosNombre,
      tipoEvento,
      procesarDespuesDe,
      procesado: false,
    })

    diosesNotificados.push(diosNombre)
  }

  return { ok: true, diosesNotificados }
}
