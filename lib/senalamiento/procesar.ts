import { db } from '@/lib/db'
import {
  senalamiento,
  pruebasDiarias,
  agonistas,
  kleosLog,
  agoraEventos,
} from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { KLEOS_POR_PRUEBA } from '@/lib/db/constants'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'

function calcularKleosDeducidos(
  prueba: {
    soloAgua: boolean
    sinComidaRapida: boolean
    pasos: number
    horasSueno: number
    paginasLeidas: number
    sesionesGym: number
    sesionesCardio: number
  } | null
): number {
  const k = KLEOS_POR_PRUEBA
  let deduccion = 0

  if (!prueba) {
    return (
      k.agua.base +
      k.comida.base +
      k.pasos.base +
      k.sueno.base +
      k.lectura.base +
      k.gym.base +
      k.cardio.base
    )
  }

  if (!prueba.soloAgua) deduccion += k.agua.base
  if (!prueba.sinComidaRapida) deduccion += k.comida.base
  if (prueba.pasos < 10000) deduccion += k.pasos.base
  if (prueba.horasSueno < 7) deduccion += k.sueno.base
  if (prueba.paginasLeidas < 10) deduccion += k.lectura.base
  if (prueba.sesionesGym < 4) deduccion += k.gym.base
  if (prueba.sesionesCardio < 3) deduccion += k.cardio.base

  return deduccion
}

export async function procesarSenalamientoPendiente(agonistId: string) {
  try {
    const rows = await db
      .select()
      .from(senalamiento)
      .where(
        and(
          eq(senalamiento.senaladorId2, agonistId),
          eq(senalamiento.kleosRestados, false)
        )
      )
      .limit(1)

    if (rows.length === 0) return

    const s = rows[0]

    const fechaSenalamiento = new Date(s.fechaSenalamiento)
    const diaAfectado = new Date(fechaSenalamiento)
    diaAfectado.setDate(fechaSenalamiento.getDate() + 1)
    const diaAfectadoStr = diaAfectado.toISOString().split('T')[0]!

    const hoy = new Date().toISOString().split('T')[0]!
    if (diaAfectadoStr > hoy) return

    const pruebaRows = await db
      .select()
      .from(pruebasDiarias)
      .where(
        and(
          eq(pruebasDiarias.agonistId, agonistId),
          eq(pruebasDiarias.fecha, diaAfectadoStr)
        )
      )
      .limit(1)

    const prueba = pruebaRows[0] ?? null
    const deduccion = calcularKleosDeducidos(prueba)

    await db
      .update(senalamiento)
      .set({ kleosRestados: true })
      .where(eq(senalamiento.id, s.id))

    if (deduccion > 0) {
      await db
        .update(agonistas)
        .set({
          kleosTotal: sql`GREATEST(0, kleos_total - ${deduccion})`,
          updatedAt: new Date(),
        })
        .where(eq(agonistas.id, agonistId))

      await db.insert(kleosLog).values({
        id: crypto.randomUUID(),
        agonistId,
        cantidad: -deduccion,
        motivo: 'senalamiento',
        fecha: diaAfectadoStr,
      })

      const agonistRows = await db
        .select()
        .from(agonistas)
        .where(eq(agonistas.id, agonistId))
        .limit(1)
      const agonista = agonistRows[0]

      const eventoId = crypto.randomUUID()
      await db.insert(agoraEventos).values({
        id: eventoId,
        agonistId,
        tipo: 'senalamiento',
        contenido: `El Señalamiento se hizo efectivo. ${agonista?.nombre ?? 'El agonista'} perdió ${deduccion} kleos por las pruebas que no completó bajo el peso del señalamiento.`,
        metadata: {
          deduccion,
          diaAfectado: diaAfectadoStr,
          tipo: 'senalamiento_efectivo',
        },
      })

      void triggerComentariosDioses(eventoId).catch(() => {})
    }
  } catch (err) {
    console.error('procesarSenalamientoPendiente', err)
  }
}
