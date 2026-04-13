import { db } from '@/lib/db'
import { ekecheiria, agoraEventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'

function fechaInicioToStr(fecha: string | Date): string {
  if (typeof fecha === 'string') return fecha
  return fecha.toISOString().split('T')[0]!
}

export async function procesarExpiracionEkecheiria(): Promise<{
  expirada: boolean
  diasTranscurridos: number
}> {
  try {
    const rows = await db
      .select()
      .from(ekecheiria)
      .where(eq(ekecheiria.activa, true))
      .limit(1)

    if (rows.length === 0) return { expirada: false, diasTranscurridos: 0 }

    const tregua = rows[0]
    const fechaInicioStr = fechaInicioToStr(tregua.fechaInicio)
    const fechaInicio = new Date(`${fechaInicioStr}T00:00:00`)
    const hoy = new Date()
    const diasTranscurridos = Math.floor(
      (hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diasTranscurridos < 7) return { expirada: false, diasTranscurridos }

    const fechaFin = new Date().toISOString().split('T')[0]!
    await db
      .update(ekecheiria)
      .set({ activa: false, fechaFin })
      .where(eq(ekecheiria.id, tregua.id))

    const eventoId = crypto.randomUUID()
    await db.insert(agoraEventos).values({
      id: eventoId,
      agonistId: tregua.agonistId,
      tipo: 'senalamiento',
      contenido:
        'La Ekecheiria expiró tras 7 días. El Gran Agon se reanuda por mandato del Altis. Los dioses no esperan.',
      metadata: { tipo: 'ekecheiria_expirada', diasTranscurridos },
    })

    void triggerComentariosDioses(eventoId).catch(() => {})

    return { expirada: true, diasTranscurridos }
  } catch (err) {
    console.error('procesarExpiracionEkecheiria', err)
    return { expirada: false, diasTranscurridos: 0 }
  }
}
