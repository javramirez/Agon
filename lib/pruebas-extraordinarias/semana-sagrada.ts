import { db } from '@/lib/db'
import { semanaSagrada, agoraEventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAmbosAgonistas, getSemanaActual, getSemanaRango } from '@/lib/db/queries'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'
import { format } from 'date-fns'
import { getCalendario } from '@/lib/pruebas-extraordinarias/calendario'

export async function verificarYActivarSemanaSagrada(
  retoId: string,
  fechaInicio: string
): Promise<boolean> {
  const calendarioRow = await getCalendario(retoId)

  if (!calendarioRow) return false

  if (!fechaInicio) return false

  const semanaSorteada = calendarioRow.semanaSagradaSemana
  const semanaActual = getSemanaActual(fechaInicio)

  if (semanaActual !== semanaSorteada) return false

  const yaActiva = await db
    .select()
    .from(semanaSagrada)
    .where(eq(semanaSagrada.activa, true))
    .limit(1)

  if (yaActiva.length > 0) return false

  const hoy = new Date()
  const { finSemana } = getSemanaRango(semanaActual, fechaInicio)

  await db.insert(semanaSagrada).values({
    id: crypto.randomUUID(),
    activa: true,
    fechaInicio: format(hoy, 'yyyy-MM-dd'),
    fechaFin: finSemana,
    activadaEn: hoy,
  })

  const ambos = await getAmbosAgonistas(retoId)
  if (ambos.length > 0) {
    const eventoId = crypto.randomUUID()
    await db.insert(agoraEventos).values({
      id: eventoId,
      agonistId: ambos[0].id,
      tipo: 'semana_sagrada',
      contenido: `⚡ El Altis proclama La Semana Sagrada. Todo el kleos ganado esta semana vale el doble. El Gran Agon entra en su momento más épico. Que el mejor agonista prevalezca.`,
      metadata: { semana: semanaActual },
    })

    void triggerComentariosDioses(eventoId).catch((err) =>
      console.error('triggerComentariosDioses semana_sagrada', err)
    )
  }

  return true
}

function fechaAString(f: Date | string | null | undefined): string | null {
  if (f == null) return null
  if (typeof f === 'string') return f.split('T')[0]
  return format(f, 'yyyy-MM-dd')
}

export async function desactivarSemanaSagradaSiTermino(): Promise<void> {
  const activa = await db
    .select()
    .from(semanaSagrada)
    .where(eq(semanaSagrada.activa, true))
    .limit(1)

  if (activa.length === 0) return

  const finStr = fechaAString(activa[0].fechaFin ?? null)
  if (!finStr) return

  const hoyStr = format(new Date(), 'yyyy-MM-dd')

  if (hoyStr > finStr) {
    await db
      .update(semanaSagrada)
      .set({ activa: false })
      .where(eq(semanaSagrada.activa, true))
  }
}
