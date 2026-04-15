import { db } from '@/lib/db'
import {
  agonistas,
  disputasCampeon,
  faccionesAfinidad,
  notificaciones,
  postsDioses,
} from '@/lib/db/schema'
import { and, eq, lte, or, sql } from 'drizzle-orm'
import { FACCIONES, type FaccionId } from './config'

// ─── Mensajes de inicio del duelo — voz del dios de la facción ──────────────

const MENSAJES_INICIO_DUELO: Record<string, string> = {
  Ares: '¡SANGRE Y HIERRO! Dos guerreros reclaman el dominio de la Guardia de Hierro. El acero no miente — solo uno merece el título de Campeón. EL DUELO HA COMENZADO. Tres días para demostrarlo.',
  Apolo:
    'El conocimiento no admite dos custodios. Dos discípulos disputan la cátedra del Logos. En tres días, el que más páginas devore con devoción mantendrá mi sello dorado.',
  Deméter:
    'La tierra fértil no nutre a dos señores. Dos cosechadores compiten por mi favor eterno. Tres días de disciplina pura decidirán quién cultiva con mi bendición.',
  Eris:
    '¡POR FIN! El caos necesita un líder que lo encarné del todo. Dos agentes del conflicto se enfrentan cara a cara. Que la rivalidad más intensa decida quién gobierna la Hermandad.',
  Hermes:
    'Mis corredores no pueden tener dos capitanes. Solo uno llevará mi estandarte alado. El que más pasos acumule en tres días mantendrá el dominio de los Corredores del Alba.',
  Morfeo:
    'El sueño sagrado no puede servir a dos señores. El Concilio de las Sombras observará en silencio. Quien honre mejor el descanso en los próximos tres días conservará mi protección.',
  Nike:
    'La victoria no se comparte — nunca lo ha hecho. Dos aspirantes disputan el Tribunal del Kleos. Solo la excelencia sin concesiones decidirá quién merece el título de Campeón.',
}

// ─── Función principal de detección ─────────────────────────────────────────

export async function detectarDisputaCampeon(
  agonistId: string,
  faccionId: FaccionId
): Promise<void> {
  try {
    const disputaActiva = await db
      .select({ id: disputasCampeon.id })
      .from(disputasCampeon)
      .where(and(eq(disputasCampeon.faccionId, faccionId), eq(disputasCampeon.resuelta, false)))
      .limit(1)

    if (disputaActiva.length > 0) return

    const campeonesEnFaccion = await db
      .select({ agonistId: faccionesAfinidad.agonistId })
      .from(faccionesAfinidad)
      .where(and(eq(faccionesAfinidad.faccionId, faccionId), eq(faccionesAfinidad.rango, 5)))

    const rivalEntry = campeonesEnFaccion.find((a) => a.agonistId !== agonistId)
    if (!rivalEntry) return

    const rivalId = rivalEntry.agonistId

    const ahora = new Date()
    const fechaFin = new Date(ahora.getTime() + 3 * 24 * 60 * 60 * 1000)

    const insertados = await db
      .insert(disputasCampeon)
      .values({
        faccionId,
        agonistIdRetador: agonistId,
        agonistIdDefensor: rivalId,
        fechaInicio: ahora,
        fechaFin,
        puntosRetador: 0,
        puntosDefensor: 0,
        resuelta: false,
      })
      .returning()

    const disputa = insertados[0]
    if (!disputa) return

    const faccion = FACCIONES[faccionId]

    const contenido =
      MENSAJES_INICIO_DUELO[faccion.dios] ??
      `Un Duelo de Facción ha comenzado en ${faccion.nombre}. Tres días decidirán quién es el verdadero Campeón.`

    await db.insert(postsDioses).values({
      id: crypto.randomUUID(),
      diosNombre: faccion.dios,
      tipo: 'duelo_campeon_inicio',
      contenido,
      metadata: { disputaId: disputa.id, faccionId },
      cerrado: false,
    })

    const tituloNotif = `⚔️ Duelo de Facción — ${faccion.nombre}`
    const descNotif = `Dos Campeones disputan el dominio. El duelo dura 3 días. Acumula puntos en ${faccion.nombre} para mantener tu rango.`

    await db.insert(notificaciones).values({
      id: crypto.randomUUID(),
      agonistId,
      tipo: 'duelo_campeon',
      titulo: tituloNotif,
      descripcion: descNotif,
      metadata: { disputaId: disputa.id, faccionId, link: '/olimpia' },
      leida: false,
    })

    await db.insert(notificaciones).values({
      id: crypto.randomUUID(),
      agonistId: rivalId,
      tipo: 'duelo_campeon',
      titulo: tituloNotif,
      descripcion: descNotif,
      metadata: { disputaId: disputa.id, faccionId, link: '/olimpia' },
      leida: false,
    })
  } catch (error) {
    console.error('[detectarDisputaCampeon] Error:', error)
  }
}

// ─── Mensajes de resolución del duelo ────────────────────────────────────────

const MENSAJES_VICTORIA_DUELO: Record<string, (ganador: string, perdedor: string) => string> = {
  Ares: (g, p) =>
    `¡EL HIERRO HA DECIDIDO! ${g} aplastó a ${p} en el duelo de la Guardia. El débil baja a las filas de los Reconocidos. La Guardia de Hierro tiene un solo Campeón.`,
  Apolo: (g, p) =>
    `El Logos ha pronunciado su veredicto. ${g} demostró mayor devoción al conocimiento. ${p} retrocede a las aulas del Reconocido. Solo un custodio del saber.`,
  Deméter: (g, p) =>
    `La tierra ha elegido. ${g} honró el cuerpo con más constancia. ${p} pierde el favor de la Tierra y regresa entre los Reconocidos.`,
  Eris: (g, p) =>
    `¡EL CAOS TIENE DUEÑO! ${g} encarnó la rivalidad con más fervor. ${p} baja al rango de Reconocido. La Hermandad no tiene lugar para dos líderes.`,
  Hermes: (g, p) =>
    `Los pasos no mienten. ${g} corrió más lejos y más rápido. ${p} cede el estandarte alado y regresa entre los Reconocidos.`,
  Morfeo: (g, p) =>
    `El sueño sagrado ha hablado en silencio. ${g} honró el descanso con más disciplina. ${p} pierde el manto de las sombras y baja a Reconocido.`,
  Nike: (g, p) =>
    `El Tribunal ha deliberado. ${g} demostró mayor excelencia. ${p} no alcanzó el umbral de la victoria y retrocede al rango de Reconocido.`,
}

const MENSAJES_EMPATE_DUELO: Record<string, (defensor: string, retador: string) => string> = {
  Ares: (d, r) =>
    `Silencio en la arena. Ningún guerrero sangró por la Guardia. ${d} conserva el título por derecho de antigüedad. ${r} regresa entre los Reconocidos.`,
  Apolo: (d, r) =>
    `Ningún discípulo abrió un libro por la Escuela. ${d} mantiene el sello del Logos por haber llegado antes. ${r} desciende a Reconocido.`,
  Deméter: (d, r) =>
    `Ninguno honró la tierra durante el duelo. ${d} conserva el favor de Deméter por antigüedad. ${r} regresa a Reconocido.`,
  Eris: (d, r) =>
    `Qué decepción. Ninguno alimentó el caos. ${d} se queda como líder por llegar primero. ${r} baja a Reconocido. La Hermandad los juzga.`,
  Hermes: (d, r) =>
    `Nadie corrió por los Corredores. ${d} conserva el estandarte por derecho de antigüedad. ${r} desciende a Reconocido.`,
  Morfeo: (d, r) =>
    `El Concilio observó en silencio. Ninguno honró el descanso. ${d} mantiene su trono por llegar primero. ${r} regresa a Reconocido.`,
  Nike: (d, r) =>
    `El Tribunal no encontró excelencia en ninguno. ${d} conserva el título por antigüedad. ${r} desciende al rango de Reconocido.`,
}

// ─── Puntuación desde pruebas diarias ────────────────────────────────────────

interface PruebaDisputaDelta {
  soloAgua: boolean
  sinComidaRapida: boolean
  pasos: number
  horasSueno: number
  paginasLeidas: number
  sesionesGym: number
  sesionesCardio: number
  diaPerfecto: boolean
}

function calcularPuntosDisputaHabitos(
  actual: PruebaDisputaDelta,
  anterior: PruebaDisputaDelta,
  faccionId: FaccionId
): number {
  switch (faccionId) {
    case 'guardia_hierro': {
      const deltaGym = Math.max(0, actual.sesionesGym - anterior.sesionesGym)
      const deltaCardio = Math.max(0, actual.sesionesCardio - anterior.sesionesCardio)
      return deltaGym + deltaCardio
    }
    case 'escuela_logos': {
      const deltaPaginas = Math.max(0, actual.paginasLeidas - anterior.paginasLeidas)
      return deltaPaginas
    }
    case 'gremio_tierra': {
      const paqueteAnterior = anterior.soloAgua && anterior.sinComidaRapida
      const paqueteActual = actual.soloAgua && actual.sinComidaRapida
      return !paqueteAnterior && paqueteActual ? 10 : 0
    }
    case 'corredores_alba': {
      const milesAnterior = Math.floor(anterior.pasos / 1000)
      const milesActual = Math.floor(actual.pasos / 1000)
      return Math.max(0, milesActual - milesAnterior)
    }
    case 'concilio_sombras': {
      const deltaHoras = Math.max(0, actual.horasSueno - anterior.horasSueno)
      return actual.horasSueno >= 7 ? deltaHoras * 10 : 0
    }
    case 'tribunal_kleos': {
      return !anterior.diaPerfecto && actual.diaPerfecto ? 30 : 0
    }
    case 'hermandad_caos':
      return 0
    default:
      return 0
  }
}

export async function actualizarPuntosDisputaHabitos(
  agonistId: string,
  actual: PruebaDisputaDelta,
  anterior: PruebaDisputaDelta
): Promise<void> {
  try {
    const misDisputas = await db
      .select()
      .from(disputasCampeon)
      .where(
        and(
          eq(disputasCampeon.resuelta, false),
          or(
            eq(disputasCampeon.agonistIdRetador, agonistId),
            eq(disputasCampeon.agonistIdDefensor, agonistId)
          )
        )
      )

    if (misDisputas.length === 0) return

    for (const disputa of misDisputas) {
      const puntos = calcularPuntosDisputaHabitos(
        actual,
        anterior,
        disputa.faccionId as FaccionId
      )
      if (puntos === 0) continue

      const esRetador = disputa.agonistIdRetador === agonistId

      await db
        .update(disputasCampeon)
        .set(
          esRetador
            ? { puntosRetador: sql`${disputasCampeon.puntosRetador} + ${puntos}` }
            : { puntosDefensor: sql`${disputasCampeon.puntosDefensor} + ${puntos}` }
        )
        .where(eq(disputasCampeon.id, disputa.id))
    }
  } catch (error) {
    console.error('[actualizarPuntosDisputaHabitos] Error:', error)
  }
}

// ─── Puntuación desde eventos (rivalidad Eris, hegemonía Nike) ───────────────

type TipoEventoDisputa = 'eris_rivalidad' | 'nike_hegemonia'

const PUNTOS_EVENTO_DISPUTA: Record<TipoEventoDisputa, Partial<Record<FaccionId, number>>> = {
  eris_rivalidad: { hermandad_caos: 15 },
  nike_hegemonia: { tribunal_kleos: 25 },
}

export async function actualizarPuntosDisputaEvento(
  agonistId: string,
  tipo: TipoEventoDisputa
): Promise<void> {
  try {
    const puntosPorFaccion = PUNTOS_EVENTO_DISPUTA[tipo]

    const misDisputas = await db
      .select()
      .from(disputasCampeon)
      .where(
        and(
          eq(disputasCampeon.resuelta, false),
          or(
            eq(disputasCampeon.agonistIdRetador, agonistId),
            eq(disputasCampeon.agonistIdDefensor, agonistId)
          )
        )
      )

    for (const disputa of misDisputas) {
      const puntos = puntosPorFaccion[disputa.faccionId as FaccionId]
      if (!puntos) continue

      const esRetador = disputa.agonistIdRetador === agonistId

      await db
        .update(disputasCampeon)
        .set(
          esRetador
            ? { puntosRetador: sql`${disputasCampeon.puntosRetador} + ${puntos}` }
            : { puntosDefensor: sql`${disputasCampeon.puntosDefensor} + ${puntos}` }
        )
        .where(eq(disputasCampeon.id, disputa.id))
    }
  } catch (error) {
    console.error('[actualizarPuntosDisputaEvento] Error:', error)
  }
}

// ─── Resolución automática de disputas vencidas ──────────────────────────────

export async function resolverDisputasVencidas(): Promise<void> {
  try {
    const ahora = new Date()

    const vencidas = await db
      .select()
      .from(disputasCampeon)
      .where(and(eq(disputasCampeon.resuelta, false), lte(disputasCampeon.fechaFin, ahora)))

    if (vencidas.length === 0) return

    for (const disputa of vencidas) {
      const faccion = FACCIONES[disputa.faccionId as FaccionId]
      const retadorId = disputa.agonistIdRetador
      const defensorId = disputa.agonistIdDefensor
      const pR = disputa.puntosRetador
      const pD = disputa.puntosDefensor

      let ganadorId: string
      let perdedorId: string

      if (pR === 0 && pD === 0) {
        ganadorId = defensorId
        perdedorId = retadorId
      } else if (pR > pD) {
        ganadorId = retadorId
        perdedorId = defensorId
      } else if (pD > pR) {
        ganadorId = defensorId
        perdedorId = retadorId
      } else {
        ganadorId = retadorId
        perdedorId = defensorId
      }

      await db
        .update(disputasCampeon)
        .set({ resuelta: true, ganadorId })
        .where(eq(disputasCampeon.id, disputa.id))

      await db
        .update(faccionesAfinidad)
        .set({ rango: 3, puntosAfinidad: 55, updatedAt: new Date() })
        .where(
          and(
            eq(faccionesAfinidad.agonistId, perdedorId),
            eq(faccionesAfinidad.faccionId, disputa.faccionId)
          )
        )

      const [ganadorRow, perdedorRow, defensorNombreRow, retadorNombreRow] = await Promise.all([
        db.select({ nombre: agonistas.nombre }).from(agonistas).where(eq(agonistas.id, ganadorId)).limit(1),
        db.select({ nombre: agonistas.nombre }).from(agonistas).where(eq(agonistas.id, perdedorId)).limit(1),
        db.select({ nombre: agonistas.nombre }).from(agonistas).where(eq(agonistas.id, defensorId)).limit(1),
        db.select({ nombre: agonistas.nombre }).from(agonistas).where(eq(agonistas.id, retadorId)).limit(1),
      ])

      const ganadorNombre = ganadorRow[0]?.nombre ?? 'El Campeón'
      const perdedorNombre = perdedorRow[0]?.nombre ?? 'El retador'
      const defensorNombre = defensorNombreRow[0]?.nombre ?? 'El defensor'
      const retadorNombre = retadorNombreRow[0]?.nombre ?? 'El retador'

      const sinPuntos = pR === 0 && pD === 0
      const contenido = sinPuntos
        ? (MENSAJES_EMPATE_DUELO[faccion.dios]?.(defensorNombre, retadorNombre) ??
            `El duelo en ${faccion.nombre} ha concluido. ${defensorNombre} conserva el título.`)
        : (MENSAJES_VICTORIA_DUELO[faccion.dios]?.(ganadorNombre, perdedorNombre) ??
            `El duelo en ${faccion.nombre} ha concluido. ${ganadorNombre} es el Campeón.`)

      await db.insert(postsDioses).values({
        id: crypto.randomUUID(),
        diosNombre: faccion.dios,
        tipo: 'duelo_campeon_resolucion',
        contenido,
        metadata: {
          disputaId: disputa.id,
          faccionId: disputa.faccionId,
          ganadorId,
          perdedorId,
          puntosRetador: pR,
          puntosDefensor: pD,
        },
        cerrado: false,
      })

      const tituloGanador = `⚔️ Victoria — ${faccion.nombre}`
      const tituloPerdedor = `⚔️ Derrota — ${faccion.nombre}`

      await db.insert(notificaciones).values({
        id: crypto.randomUUID(),
        agonistId: ganadorId,
        tipo: 'duelo_campeon',
        titulo: tituloGanador,
        descripcion: `Mantuviste el dominio de ${faccion.nombre}. Sigues siendo Campeón.`,
        metadata: { disputaId: disputa.id, faccionId: disputa.faccionId },
        leida: false,
      })

      await db.insert(notificaciones).values({
        id: crypto.randomUUID(),
        agonistId: perdedorId,
        tipo: 'duelo_campeon',
        titulo: tituloPerdedor,
        descripcion: `Perdiste el dominio de ${faccion.nombre} y has bajado a Reconocido.`,
        metadata: { disputaId: disputa.id, faccionId: disputa.faccionId },
        leida: false,
      })
    }
  } catch (error) {
    console.error('[resolverDisputasVencidas] Error:', error)
  }
}
