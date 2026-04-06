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

type CalendarioRow = typeof calendarioAgan.$inferSelect

export async function generarCalendarioAgan(): Promise<void> {
  const existente = await db.select().from(calendarioAgan).limit(1)
  if (existente.length > 0) {
    console.log('Calendario ya generado — saltando')
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
    semanaSagradaSemana,
    tripticoOrden,
    destinoOrden,
    destinoHorarios,
  })

  console.log(
    `Calendario generado — Semana Sagrada: semana ${semanaSagradaSemana}`
  )
}

export async function getCalendario() {
  const result = await db.select().from(calendarioAgan).limit(1)
  return result[0] ?? null
}

export async function verificarYActivarPruebas(diaActual: number): Promise<{
  tripticoActivado: boolean
  destinoLatente: string | null
}> {
  const calendario = await getCalendario()
  if (!calendario) return { tripticoActivado: false, destinoLatente: null }

  const start = process.env.NEXT_PUBLIC_AGON_START_DATE
  if (!start) return { tripticoActivado: false, destinoLatente: null }

  const inicio = parseISO(start)
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
      calendario
    )
  }

  const destinoLatente = await getEventoDestinoLatente(
    diaActual,
    fecha,
    semana,
    calendario
  )

  return { tripticoActivado, destinoLatente }
}

async function insertarTripticoSiCorresponde(
  diaActual: number,
  diaDeLaSemana: number,
  semana: number,
  fecha: string,
  calendario: CalendarioRow
): Promise<boolean> {
  const tripticoOrden = calendario.tripticoOrden as string[]
  const indiceBase = (semana - 1) * 3
  const indice = indiceBase + (diaDeLaSemana - 1)

  if (indice >= tripticoOrden.length) return false

  const pruebaId = tripticoOrden[indice]

  const yaExiste = await db
    .select()
    .from(pruebaExtraordinaria)
    .where(eq(pruebaExtraordinaria.pruebaId, pruebaId))
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
        eq(pruebaExtraordinaria.fecha, fecha)
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
    completadaPorJavier: false,
    completadaPorMatias: false,
    fechaExpira,
  })

  await publicarEnAgora(
    `📜 El Altis lanza una nueva prueba del Tríptico Semanal: "${config.descripcion}" Vale ${config.kleos} kleos. Disponible hasta el domingo.`,
    { tipo: 'triptico', pruebaId, semana }
  )

  return true
}

async function getEventoDestinoLatente(
  diaActual: number,
  _fecha: string,
  _semana: number,
  calendario: CalendarioRow
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
    .where(eq(pruebaExtraordinaria.pruebaId, pruebaIdHoy))
    .limit(1)

  if (yaExiste.length > 0) return null

  return pruebaIdHoy
}

export async function activarEventoDestino(
  pruebaId: string,
  diaActual: number
): Promise<boolean> {
  const calendario = await getCalendario()
  if (!calendario) return false

  const start = process.env.NEXT_PUBLIC_AGON_START_DATE
  if (!start) return false

  const inicio = parseISO(start)
  const fecha = format(addDays(inicio, diaActual - 1), 'yyyy-MM-dd')
  const semana = Math.ceil(diaActual / 7)

  const yaExiste = await db
    .select()
    .from(pruebaExtraordinaria)
    .where(eq(pruebaExtraordinaria.pruebaId, pruebaId))
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
    completadaPorJavier: false,
    completadaPorMatias: false,
    fechaExpira: expiraFinal,
  })

  await publicarEnAgora(
    `⚡ El Altis desencadena un Evento del Destino: "${config.descripcion}" Vale ${config.kleos} kleos. El tiempo corre.`,
    { tipo: 'destino', pruebaId, semana }
  )

  return true
}

async function publicarEnAgora(
  contenido: string,
  metadata: object
): Promise<void> {
  const ambos = await getAmbosAgonistas()
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
