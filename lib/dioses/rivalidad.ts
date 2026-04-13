import { db } from '@/lib/db'
import {
  agonistas,
  agoraEventos,
  comentariosAgora,
  pruebasDiarias,
  hegemonias,
} from '@/lib/db/schema'
import { and, desc, eq, gte, like } from 'drizzle-orm'
import { DIOSES, getDiosesParaEvento, getDelayDios } from './config'

type TipoRivalidad =
  | 'rivalidad_kleos'
  | 'rivalidad_igualados'
  | 'rivalidad_dia_perfecto_ambos'
  | 'rivalidad_hegemonia_cambio'

function buildContextoRivalidad(
  tipo: TipoRivalidad,
  yo: { nombre: string; kleosTotal: number },
  rival: { nombre: string; kleosTotal: number }
): string {
  const diff = yo.kleosTotal - rival.kleosTotal
  switch (tipo) {
    case 'rivalidad_kleos':
      return diff > 0
        ? `${yo.nombre} lidera el Gran Agon con ${yo.kleosTotal} kleos frente a ${rival.nombre} con ${rival.kleosTotal} kleos. La diferencia es de ${diff} kleos.`
        : `${rival.nombre} lidera el Gran Agon con ${rival.kleosTotal} kleos frente a ${yo.nombre} con ${yo.kleosTotal} kleos. La diferencia es de ${Math.abs(diff)} kleos.`
    case 'rivalidad_igualados':
      return `${yo.nombre} y ${rival.nombre} están igualados en el Gran Agon. ${yo.nombre} tiene ${yo.kleosTotal} kleos, ${rival.nombre} tiene ${rival.kleosTotal} kleos. El Altis no distingue ganador.`
    case 'rivalidad_dia_perfecto_ambos':
      return `${yo.nombre} y ${rival.nombre} han completado ambos un día perfecto hoy. Los dos agonistas cumplieron cada prueba sin excepción en el mismo día.`
    case 'rivalidad_hegemonia_cambio':
      return `La hegemonía semanal acaba de cambiar de manos. El dominio del Altis no pertenece al mismo agonista dos semanas seguidas en la batalla entre ${yo.nombre} y ${rival.nombre}.`
  }
}

export async function detectarEventosRivalidad(agonistaId: string): Promise<void> {
  try {
    const ambos = await db.select().from(agonistas).limit(2)
    if (ambos.length < 2) return

    const yo = ambos.find((a) => a.id === agonistaId)
    const rival = ambos.find((a) => a.id !== agonistaId)
    if (!yo || !rival) return

    const hoy = new Date().toISOString().split('T')[0]
    const inicioDia = new Date(`${hoy}T00:00:00.000Z`)

    const yaEncoladosHoy = await db
      .select({ tipoGeneracion: comentariosAgora.tipoGeneracion })
      .from(comentariosAgora)
      .where(
        and(
          gte(comentariosAgora.createdAt, inicioDia),
          like(comentariosAgora.tipoGeneracion, 'rivalidad_%')
        )
      )

    const tiposYa = new Set(
      yaEncoladosHoy.map((r) => r.tipoGeneracion).filter(Boolean)
    )

    const diff = yo.kleosTotal - rival.kleosTotal
    const eventosDetectados: TipoRivalidad[] = []

    if (Math.abs(diff) > 200 && !tiposYa.has('rivalidad_kleos')) {
      eventosDetectados.push('rivalidad_kleos')
    }

    if (Math.abs(diff) < 100 && !tiposYa.has('rivalidad_igualados')) {
      eventosDetectados.push('rivalidad_igualados')
    }

    if (!tiposYa.has('rivalidad_dia_perfecto_ambos')) {
      const pruebasHoy = await db
        .select()
        .from(pruebasDiarias)
        .where(eq(pruebasDiarias.fecha, hoy))

      const yoPerfecto = pruebasHoy.find((p) => p.agonistId === yo.id)?.diaPerfecto
      const rivalPerfecto = pruebasHoy.find((p) => p.agonistId === rival.id)?.diaPerfecto

      if (yoPerfecto && rivalPerfecto) {
        eventosDetectados.push('rivalidad_dia_perfecto_ambos')
      }
    }

    if (!tiposYa.has('rivalidad_hegemonia_cambio')) {
      const ultimas = await db
        .select()
        .from(hegemonias)
        .orderBy(desc(hegemonias.semana))
        .limit(2)

      if (
        ultimas.length === 2 &&
        ultimas[0].ganadorId &&
        ultimas[1].ganadorId &&
        ultimas[0].ganadorId !== ultimas[1].ganadorId
      ) {
        eventosDetectados.push('rivalidad_hegemonia_cambio')
      }
    }

    if (eventosDetectados.length === 0) return

    const eventoReciente = await db
      .select()
      .from(agoraEventos)
      .where(gte(agoraEventos.createdAt, inicioDia))
      .orderBy(desc(agoraEventos.createdAt))
      .limit(1)

    if (eventoReciente.length === 0) return

    const eventoId = eventoReciente[0].id

    for (const tipo of eventosDetectados) {
      const contexto = buildContextoRivalidad(tipo, yo, rival)
      const dioses = getDiosesParaEvento(tipo)

      for (const diosNombre of dioses) {
        const delay = getDelayDios(tipo)
        const procesarDespuesDe = new Date(Date.now() + delay)
        const dios = DIOSES[diosNombre]

        await db.insert(comentariosAgora).values({
          id: crypto.randomUUID(),
          eventoId,
          autorTipo: 'dios',
          autorId: diosNombre,
          autorNombre: dios?.nombre ?? diosNombre,
          contenido: JSON.stringify({ contexto }),
          procesado: false,
          procesarDespuesDe,
          tipoGeneracion: tipo,
          visto: false,
        })
      }
    }
  } catch (err) {
    console.error('Error detectando eventos de rivalidad:', err)
  }
}
