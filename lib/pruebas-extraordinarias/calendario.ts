import { db } from '@/lib/db'
import {
  calendarioAgan,
  pruebaExtraordinaria,
  agoraEventos,
} from '@/lib/db/schema'
import { PRUEBAS_TRIPTICO, PRUEBAS_DESTINO } from '@/lib/db/constants'
import { eq, and } from 'drizzle-orm'
import { addDays, endOfDay, format, parseISO } from 'date-fns'
import { getAmbosAgonistas } from '@/lib/db/queries'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'
import { notificarPruebaExtraordinaria } from '@/lib/notificaciones/crear'

type CalendarioRow = typeof calendarioAgan.$inferSelect

export async function generarCalendarioAgan(retoId: string): Promise<void> {
  const existente = await db
    .select()
    .from(calendarioAgan)
    .where(eq(calendarioAgan.retoId, retoId))
    .limit(1)
  if (existente.length > 0) {
    return
  }

  const semanasSagradas = [2, 3, 4]
  const semanaSagradaSemana =
    semanasSagradas[Math.floor(Math.random() * semanasSagradas.length)]

  const tripticoOrden = [...PRUEBAS_TRIPTICO]
    .sort(() => Math.random() - 0.5)
    .map((p) => p.id)

  const destinoOrden = [...PRUEBAS_DESTINO]
    .sort(() => Math.random() - 0.5)
    .map((p) => p.id)

  const destinoHorarios: Record<string, { dia: number }> = {}
  const diasUsados = new Set<number>()

  destinoOrden.forEach((pruebaId) => {
    let intentos = 0
    let diaAsignado = -1

    while (intentos < 100 && diaAsignado === -1) {
      const dia = Math.floor(Math.random() * 25) + 3
      if (!diasUsados.has(dia)) {
        destinoHorarios[pruebaId] = { dia }
        diasUsados.add(dia)
        diaAsignado = dia
      }
      intentos++
    }

    if (diaAsignado === -1) {
      for (let d = 3; d <= 27; d++) {
        if (!diasUsados.has(d)) {
          destinoHorarios[pruebaId] = { dia: d }
          diasUsados.add(d)
          break
        }
      }
    }
  })

  await db.insert(calendarioAgan).values({
    id: crypto.randomUUID(),
    retoId,
    semanaSagradaSemana,
    tripticoOrden,
    destinoOrden,
    destinoHorarios,
  })
}

export async function getCalendario(retoId: string) {
  const result = await db
    .select()
    .from(calendarioAgan)
    .where(eq(calendarioAgan.retoId, retoId))
    .limit(1)
  return result[0] ?? null
}

export async function verificarYActivarPruebas(
  diaActual: number,
  fechaInicio: string,
  retoId: string
): Promise<{
  tripticoActivado: boolean
  destinoLatente: string | null
}> {
  const calendario = await getCalendario(retoId)
  if (!calendario) return { tripticoActivado: false, destinoLatente: null }

  if (!fechaInicio) return { tripticoActivado: false, destinoLatente: null }

  const inicio = parseISO(fechaInicio)
  const fecha = format(addDays(inicio, diaActual - 1), 'yyyy-MM-dd')
  const semana = Math.ceil(diaActual / 7)
  const diaDeLaSemana = ((diaActual - 1) % 7) + 1

  let tripticoActivado = false

  if (diaDeLaSemana <= 3) {
    tripticoActivado = await insertarTripticoSiCorresponde(
      diaActual,
      diaDeLaSemana,
      semana,
      fecha,
      calendario,
      retoId
    )
  }

  const destinoLatente = await getEventoDestinoLatente(
    diaActual,
    fecha,
    semana,
    calendario,
    retoId
  )

  return { tripticoActivado, destinoLatente }
}

async function insertarTripticoSiCorresponde(
  diaActual: number,
  diaDeLaSemana: number,
  semana: number,
  fecha: string,
  calendario: CalendarioRow,
  retoId: string
): Promise<boolean> {
  const tripticoOrden = calendario.tripticoOrden as string[]
  const indiceBase = (semana - 1) * 3
  const indice = indiceBase + (diaDeLaSemana - 1)

  if (indice >= tripticoOrden.length) return false

  const pruebaId = tripticoOrden[indice]

  const yaExiste = await db
    .select()
    .from(pruebaExtraordinaria)
    .where(
      and(
        eq(pruebaExtraordinaria.pruebaId, pruebaId),
        eq(pruebaExtraordinaria.retoId, retoId)
      )
    )
    .limit(1)

  if (yaExiste.length > 0) return false

  const config = PRUEBAS_TRIPTICO.find((p) => p.id === pruebaId)
  if (!config) return false

  const duplicadoDia = await db
    .select()
    .from(pruebaExtraordinaria)
    .where(
      and(
        eq(pruebaExtraordinaria.dia, diaActual),
        eq(pruebaExtraordinaria.tipo, 'triptico'),
        eq(pruebaExtraordinaria.fecha, fecha),
        eq(pruebaExtraordinaria.retoId, retoId)
      )
    )
    .limit(1)

  if (duplicadoDia.length > 0) return false

  const diasHastaDomingo = 7 - diaDeLaSemana
  const fechaBase = parseISO(fecha)
  const fechaExpira = endOfDay(addDays(fechaBase, diasHastaDomingo))

  await db.insert(pruebaExtraordinaria).values({
    id: crypto.randomUUID(),
    semana,
    dia: diaActual,
    fecha,
    pruebaId,
    tipo: 'triptico',
    descripcion: config.descripcion,
    kleosBonus: config.kleos,
    dificultad: config.dificultad,
    activa: true,
    fechaExpira,
    retoId,
  })

  await publicarEnAgora(
    `📜 El Altis lanza una nueva prueba del Tríptico Semanal: "${config.descripcion}" Vale ${config.kleos} kleos. Disponible hasta el domingo.`,
    { tipo: 'triptico', pruebaId, semana },
    retoId
  )

  void notificarAmbosPruebaExtra(config.descripcion, config.kleos, retoId)

  return true
}

async function getEventoDestinoLatente(
  diaActual: number,
  _fecha: string,
  _semana: number,
  calendario: CalendarioRow,
  retoId: string
): Promise<string | null> {
  const destinoHorarios = calendario.destinoHorarios as Record<
    string,
    { dia: number }
  >

  const pruebaIdHoy = Object.entries(destinoHorarios).find(
    ([, horario]) => horario.dia === diaActual
  )?.[0]

  if (!pruebaIdHoy) return null

  const yaExiste = await db
    .select()
    .from(pruebaExtraordinaria)
    .where(
      and(
        eq(pruebaExtraordinaria.pruebaId, pruebaIdHoy),
        eq(pruebaExtraordinaria.retoId, retoId)
      )
    )
    .limit(1)

  if (yaExiste.length > 0) return null

  return pruebaIdHoy
}

export async function activarEventoDestino(
  pruebaId: string,
  diaActual: number,
  fechaInicio: string,
  retoId: string
): Promise<boolean> {
  const calendario = await getCalendario(retoId)
  if (!calendario) return false

  if (!fechaInicio) return false

  const inicio = parseISO(fechaInicio)
  const fecha = format(addDays(inicio, diaActual - 1), 'yyyy-MM-dd')
  const semana = Math.ceil(diaActual / 7)

  const yaExiste = await db
    .select()
    .from(pruebaExtraordinaria)
    .where(
      and(
        eq(pruebaExtraordinaria.pruebaId, pruebaId),
        eq(pruebaExtraordinaria.retoId, retoId)
      )
    )
    .limit(1)

  if (yaExiste.length > 0) return false

  const config = PRUEBAS_DESTINO.find((p) => p.id === pruebaId)
  if (!config) return false

  const horaActual = new Date().getHours()
  if (
    horaActual < config.ventana.horaMin ||
    horaActual > config.ventana.horaMax
  ) {
    return false
  }

  const fechaExpira = new Date()
  fechaExpira.setHours(fechaExpira.getHours() + config.ventana.duracionHoras)

  const finDelDia = new Date()
  finDelDia.setHours(23, 59, 59, 999)
  const expiraFinal = fechaExpira > finDelDia ? finDelDia : fechaExpira

  await db.insert(pruebaExtraordinaria).values({
    id: crypto.randomUUID(),
    semana,
    dia: diaActual,
    fecha,
    pruebaId,
    tipo: 'destino',
    descripcion: config.descripcion,
    kleosBonus: config.kleos,
    dificultad: config.dificultad,
    activa: true,
    fechaExpira: expiraFinal,
    retoId,
  })

  await publicarEnAgora(
    `⚡ El Altis desencadena un Evento del Destino: "${config.descripcion}" Vale ${config.kleos} kleos. El tiempo corre.`,
    { tipo: 'destino', pruebaId, semana },
    retoId
  )

  void notificarAmbosPruebaExtra(config.descripcion, config.kleos, retoId)

  return true
}

async function notificarAmbosPruebaExtra(
  descripcion: string,
  kleosBonus: number,
  retoId: string
) {
  try {
    const ambos = await getAmbosAgonistas(retoId)
    await Promise.all(
      ambos.map((a) =>
        notificarPruebaExtraordinaria(a.id, descripcion, kleosBonus)
      )
    )
  } catch {
    // Silencioso
  }
}

async function publicarEnAgora(
  contenido: string,
  metadata: object,
  retoId: string
): Promise<void> {
  const ambos = await getAmbosAgonistas(retoId)
  if (ambos.length === 0) return

  const eventoId = crypto.randomUUID()
  await db.insert(agoraEventos).values({
    id: eventoId,
    agonistId: ambos[0].id,
    tipo: 'prueba_extraordinaria',
    contenido,
    metadata,
  })

  void triggerComentariosDioses(eventoId).catch((err) =>
    console.error('triggerComentariosDioses publicarEnAgora', err)
  )
}
