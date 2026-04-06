import { db } from '@/lib/db'
import { agoraEventos, comentariosAgora } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { DIOSES, getDiosesParaEvento, getDelayDios } from './config'

/**
 * Encola comentarios de dioses en `comentarios_agora` (procesado=false).
 * `tipoOverride` p. ej. `prueba_extraordinaria_expirada` cuando el tipo del evento en DB es otro.
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
    const dios = DIOSES[diosNombre]

    await db.insert(comentariosAgora).values({
      id: crypto.randomUUID(),
      eventoId,
      autorTipo: 'dios',
      autorId: diosNombre,
      autorNombre: dios?.nombre ?? diosNombre,
      contenido: '',
      procesado: false,
      procesarDespuesDe,
      tipoGeneracion: tipoEvento,
      visto: false,
    })

    diosesNotificados.push(diosNombre)
  }

  return { ok: true, diosesNotificados }
}
