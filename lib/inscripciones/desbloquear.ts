import { db } from '@/lib/db'
import { agonistas, inscripciones, agoraEventos } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { INSCRIPCIONES } from '@/lib/db/constants'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'
import { notificarInscripcion } from '@/lib/notificaciones/crear'

// ─── HELPER: verificar si ya tiene la inscripción ─────────────────────────────

export async function yaDesbloqueada(
  agonistId: string,
  inscripcionId: string
): Promise<boolean> {
  const rows = await db
    .select()
    .from(inscripciones)
    .where(
      and(
        eq(inscripciones.agonistId, agonistId),
        eq(inscripciones.inscripcionId, inscripcionId)
      )
    )
    .limit(1)
  return rows.length > 0
}

// ─── PIPELINE COMPLETO DE DESBLOQUEO ─────────────────────────────────────────
// 1. Inserta en DB
// 2. Publica evento en el Ágora
// 3. Dispara comentarios de dioses
// 4. Crea notificación

export async function desbloquearInscripcion(
  agonistId: string,
  agonistaNombre: string,
  inscripcionId: string,
  kleosAlDesbloquear?: number
): Promise<boolean> {
  // Evitar duplicados
  if (await yaDesbloqueada(agonistId, inscripcionId)) return false

  const config = INSCRIPCIONES.find((i) => i.id === inscripcionId)
  if (!config) return false

  let kleos = kleosAlDesbloquear
  if (kleos === undefined) {
    const k = await db
      .select({ kleosTotal: agonistas.kleosTotal })
      .from(agonistas)
      .where(eq(agonistas.id, agonistId))
      .limit(1)
    kleos = k[0]?.kleosTotal ?? 0
  }

  try {
    // 1. Insertar en DB
    await db.insert(inscripciones).values({
      id: crypto.randomUUID(),
      agonistId,
      inscripcionId,
      secreto: config.secreto,
      tipo: config.tipo,
    })

    // 2. Publicar en el Ágora
    const eventoId = crypto.randomUUID()
    await db.insert(agoraEventos).values({
      id: eventoId,
      agonistId,
      tipo: 'inscripcion_desbloqueada',
      contenido: `${agonistaNombre} desbloqueó: ${config.nombre}. ${config.descripcion}`,
      metadata: {
        inscripcionId,
        kleosAlDesbloquear: kleos ?? kleosAlDesbloquear ?? 0,
      },
    })

    // 3. Disparar comentarios de dioses (async, no bloquea)
    void triggerComentariosDioses(eventoId).catch((err) =>
      console.error('triggerComentariosDioses inscripcion', err)
    )

    // 4. Notificar al agonista (async, no bloquea)
    void notificarInscripcion(agonistId, config.nombre, inscripcionId).catch(() => {})

    return true
  } catch (err) {
    console.error('desbloquearInscripcion error:', err)
    return false
  }
}
