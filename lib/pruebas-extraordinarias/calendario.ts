import { db } from '@/lib/db'
import { calendarioAgan, pruebaExtraordinaria, agoraEventos } from '@/lib/db/schema'
import { PRUEBAS_TRIPTICO, PRUEBAS_DESTINO } from '@/lib/db/constants'
import { getAmbosAgonistas } from '@/lib/db/queries'
import { eq, and } from 'drizzle-orm'
import { addDays, endOfDay, format, parseISO } from 'date-fns'

function horaAleatoriaEnVentana(horaMin: number, horaMax: number): number {
  if (horaMax <= horaMin) return horaMin
  return (
    horaMin + Math.floor(Math.random() * (horaMax - horaMin + 1))
  )
}

export async function generarCalendarioAgan(): Promise<void> {
  const existente = await db.select().from(calendarioAgan).limit(1)
  if (existente.length > 0) {
    console.log('Calendario ya generado — saltando')
    return
  }

  const start = process.env.NEXT_PUBLIC_AGON_START_DATE
  if (!start) throw new Error('NEXT_PUBLIC_AGON_START_DATE no está definida')

  parseISO(start)

  const semanasSagradas = [2, 3, 4]
  const semanaSagrada =
    semanasSagradas[Math.floor(Math.random() * semanasSagradas.length)]

  const tripticoBarajado = [...PRUEBAS_TRIPTICO]
    .sort(() => Math.random() - 0.5)
    .map((p) => p.id)

  const destinoBarajado = [...PRUEBAS_DESTINO]
    .sort(() => Math.random() - 0.5)
    .map((p) => p.id)

  const destinoHorarios: Record<string, { dia: number; hora: number }> = {}
  const diasUsados = new Set<number>()

  destinoBarajado.forEach((pruebaId) => {
    const config = PRUEBAS_DESTINO.find((p) => p.id === pruebaId)
    if (!config) return

    let intentos = 0
    let diaAsignado = -1

    while (intentos < 50 && diaAsignado === -1) {
      const dia = Math.floor(Math.random() * 27) + 1
      if (!diasUsados.has(dia)) {
        const horaRandom = horaAleatoriaEnVentana(
          config.ventana.horaMin,
          config.ventana.horaMax
        )
        destinoHorarios[pruebaId] = { dia, hora: horaRandom }
        diasUsados.add(dia)
        diaAsignado = dia
      }
      intentos++
    }

    if (diaAsignado === -1) {
      for (let d = 1; d <= 27; d++) {
        if (!diasUsados.has(d)) {
          const horaRandom = horaAleatoriaEnVentana(
            config.ventana.horaMin,
            config.ventana.horaMax
          )
          destinoHorarios[pruebaId] = { dia: d, hora: horaRandom }
          diasUsados.add(d)
          break
        }
      }
    }
  })

  await db.insert(calendarioAgan).values({
    id: crypto.randomUUID(),
    semanaSagradaSemana: semanaSagrada,
    tripticoOrden: tripticoBarajado,
    destinoOrden: destinoBarajado,
    destinoHorarios,
  })

  console.log(`Calendario generado — Semana Sagrada: semana ${semanaSagrada}`)
}

export async function getCalendario() {
  const result = await db.select().from(calendarioAgan).limit(1)
  return result[0] ?? null
}

export async function activarTripticoDia(dia: number): Promise<void> {
  const calendario = await getCalendario()
  if (!calendario) return

  const start = process.env.NEXT_PUBLIC_AGON_START_DATE
  if (!start) return

  const inicio = parseISO(start)
  const fecha = format(addDays(inicio, dia - 1), 'yyyy-MM-dd')
  const semana = Math.ceil(dia / 7)

  const diaDeLaSemana = ((dia - 1) % 7) + 1
  if (diaDeLaSemana > 3) return

  const yaHay = await db
    .select()
    .from(pruebaExtraordinaria)
    .where(
      and(
        eq(pruebaExtraordinaria.dia, dia),
        eq(pruebaExtraordinaria.tipo, 'triptico'),
        eq(pruebaExtraordinaria.fecha, fecha)
      )
    )
    .limit(1)

  if (yaHay.length > 0) return

  const tripticoOrden = calendario.tripticoOrden as string[]
  const indiceBase = (semana - 1) * 3
  const indice = indiceBase + (diaDeLaSemana - 1)

  if (indice >= tripticoOrden.length) return

  const pruebaId = tripticoOrden[indice]
  const config = PRUEBAS_TRIPTICO.find((p) => p.id === pruebaId)
  if (!config) return

  const diasHastaDomingo = 7 - diaDeLaSemana
  const fechaBase = parseISO(fecha)
  const fechaExpira = endOfDay(addDays(fechaBase, diasHastaDomingo))

  await db.insert(pruebaExtraordinaria).values({
    id: crypto.randomUUID(),
    semana,
    dia,
    fecha,
    pruebaId,
    tipo: 'triptico',
    descripcion: config.descripcion,
    kleosBonus: config.kleos,
    dificultad: config.dificultad,
    activa: true,
    fechaExpira,
  })

  await publicarEventoAgora(
    `El Altis lanza una nueva prueba del Tríptico: "${config.descripcion}" Vale ${config.kleos} kleos. Disponible hasta el domingo.`,
    { tipo: 'triptico', pruebaId, semana }
  )
}

export async function verificarEventosDestino(
  diaActual: number,
  horaActual: number
): Promise<void> {
  const calendario = await getCalendario()
  if (!calendario) return

  const start = process.env.NEXT_PUBLIC_AGON_START_DATE
  if (!start) return

  const inicio = parseISO(start)
  const fecha = format(addDays(inicio, diaActual - 1), 'yyyy-MM-dd')
  const semana = Math.ceil(diaActual / 7)

  const destinoHorarios = calendario.destinoHorarios as Record<
    string,
    { dia: number; hora: number }
  >

  for (const [pruebaId, horario] of Object.entries(destinoHorarios)) {
    if (horario.dia !== diaActual || horario.hora !== horaActual) continue

    const yaExiste = await db
      .select()
      .from(pruebaExtraordinaria)
      .where(eq(pruebaExtraordinaria.pruebaId, pruebaId))
      .limit(1)

    if (yaExiste.length > 0) continue

    const config = PRUEBAS_DESTINO.find((p) => p.id === pruebaId)
    if (!config) continue

    if (
      horaActual < config.ventana.horaMin ||
      horaActual > config.ventana.horaMax
    ) {
      continue
    }

    const fechaExpira = new Date()
    fechaExpira.setHours(
      fechaExpira.getHours() + config.ventana.duracionHoras
    )

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
      fechaExpira,
    })

    await publicarEventoAgora(
      `⚡ El Altis lanza un Evento del Destino: "${config.descripcion}" Vale ${config.kleos} kleos. Expira en ${config.ventana.duracionHoras} horas.`,
      { tipo: 'destino', pruebaId, semana }
    )

    console.log(`Evento del Destino activado: ${pruebaId}`)
  }
}

async function publicarEventoAgora(
  contenido: string,
  metadata: object
): Promise<void> {
  const ambos = await getAmbosAgonistas()
  if (ambos.length === 0) return

  await db.insert(agoraEventos).values({
    id: crypto.randomUUID(),
    agonistId: ambos[0].id,
    tipo: 'prueba_extraordinaria',
    contenido,
    metadata,
  })
}
