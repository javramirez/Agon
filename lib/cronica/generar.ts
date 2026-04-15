import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'
import {
  pruebasDiarias,
  cronicas,
  agoraEventos,
  hegemonias,
  inscripciones,
} from '@/lib/db/schema'
import { eq, and, gte, lte, asc } from 'drizzle-orm'
import { getAmbosAgonistas, getSemanaActual, getSemanaRango } from '@/lib/db/queries'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'
import { NIVEL_LABELS } from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface DatosSemana {
  semana: number
  fechaInicio: string
  fechaFin: string
  agonista1: DatosAgonista
  agonista2: DatosAgonista
  hegemonia: {
    ganador: string | null
    empate: boolean
    kleosGanador: number
    kleosRival: number
  }
  eventosDestacados: string[]
}

interface DatosAgonista {
  nombre: string
  nivel: string
  kleosTotal: number
  kleosSemana: number
  diasPerfectos: number
  pruebasCompletadas: number
  pruebasTotales: number
  inscripcionesNuevas: number
}

export async function generarCronica(semana?: number): Promise<string> {
  const semanaNum = semana ?? getSemanaActual()
  const datos = await recopilarDatosSemana(semanaNum)

  const prompt = construirPrompt(datos)

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  const relato = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('')
    .trim()

  await db.delete(cronicas).where(eq(cronicas.semana, semanaNum))

  await db.insert(cronicas).values({
    id: crypto.randomUUID(),
    semana: semanaNum,
    fechaInicio: datos.fechaInicio,
    fechaFin: datos.fechaFin,
    relato,
    metadata: datos as unknown as Record<string, unknown>,
  })

  const ambos = await getAmbosAgonistas()
  if (ambos.length > 0) {
    const eventoId = crypto.randomUUID()
    await db.insert(agoraEventos).values({
      id: eventoId,
      agonistId: ambos[0].id,
      tipo: 'cronica_semanal',
      contenido: relato,
      metadata: {
        semana: semanaNum,
        tipo: 'cronica',
        fechaInicio: datos.fechaInicio,
        fechaFin: datos.fechaFin,
        kleosPropio: ambos[0].kleosTotal,
        kleosRival: ambos[1]?.kleosTotal ?? 0,
      },
    })

    void triggerComentariosDioses(eventoId).catch((err) =>
      console.error('triggerComentariosDioses cronica_semanal', err)
    )
  }

  return relato
}

/** Igual que getSemanaRango pero con fecha de inicio del Gran Agon explícita (p. ej. primera fecha con datos en DB). */
function rangoSemanaDesdeFechaInicio(
  fechaInicioGranAgon: string,
  semana: number
): { inicioStr: string; finStr: string } {
  const inicio = new Date(fechaInicioGranAgon)
  const inicioSemana = new Date(inicio)
  inicioSemana.setDate(inicio.getDate() + (semana - 1) * 7)
  const finSemana = new Date(inicioSemana)
  finSemana.setDate(inicioSemana.getDate() + 6)

  return {
    inicioStr: inicioSemana.toISOString().split('T')[0],
    finStr: finSemana.toISOString().split('T')[0],
  }
}

async function recopilarDatosSemana(semana: number): Promise<DatosSemana> {
  const { inicioSemana: inicioStr, finSemana: finStr } = getSemanaRango(semana)
  return recopilarDatosEnRango(semana, inicioStr, finStr)
}

async function recopilarDatosSemanaConFecha(
  semana: number,
  fechaInicioGranAgon: string
): Promise<DatosSemana> {
  const { inicioStr, finStr } = rangoSemanaDesdeFechaInicio(
    fechaInicioGranAgon,
    semana
  )
  return recopilarDatosEnRango(semana, inicioStr, finStr)
}

async function recopilarDatosEnRango(
  semana: number,
  inicioStr: string,
  finStr: string
): Promise<DatosSemana> {
  const inicioDia = new Date(inicioStr + 'T12:00:00.000Z')
  const finDia = new Date(finStr + 'T23:59:59.999Z')

  const ambos = await getAmbosAgonistas()
  if (ambos.length < 2) throw new Error('No hay suficientes agonistas')

  const [a1, a2] = ambos

  const [pruebas1, pruebas2, inscripciones1, inscripciones2, hegemoniaData, eventos] =
    await Promise.all([
      db
        .select()
        .from(pruebasDiarias)
        .where(
          and(
            eq(pruebasDiarias.agonistId, a1.id),
            gte(pruebasDiarias.fecha, inicioStr),
            lte(pruebasDiarias.fecha, finStr)
          )
        ),
      db
        .select()
        .from(pruebasDiarias)
        .where(
          and(
            eq(pruebasDiarias.agonistId, a2.id),
            gte(pruebasDiarias.fecha, inicioStr),
            lte(pruebasDiarias.fecha, finStr)
          )
        ),
      db
        .select()
        .from(inscripciones)
        .where(
          and(
            eq(inscripciones.agonistId, a1.id),
            gte(inscripciones.desbloqueadoEn, inicioDia),
            lte(inscripciones.desbloqueadoEn, finDia)
          )
        ),
      db
        .select()
        .from(inscripciones)
        .where(
          and(
            eq(inscripciones.agonistId, a2.id),
            gte(inscripciones.desbloqueadoEn, inicioDia),
            lte(inscripciones.desbloqueadoEn, finDia)
          )
        ),
      db
        .select()
        .from(hegemonias)
        .where(eq(hegemonias.semana, semana))
        .limit(1),
      db
        .select()
        .from(agoraEventos)
        .where(
          and(
            gte(agoraEventos.createdAt, inicioDia),
            lte(agoraEventos.createdAt, finDia)
          )
        )
        .orderBy(asc(agoraEventos.createdAt)),
    ])

  const calcularDatos = (
    agonista: (typeof ambos)[0],
    pruebas: typeof pruebas1,
    nuevasInscripciones: typeof inscripciones1
  ): DatosAgonista => {
    const diasPerfectos = pruebas.filter((p) => p.diaPerfecto).length
    const kleosSemana = pruebas.reduce((s, p) => s + p.kleosGanado, 0)
    const pruebasCompletadas = pruebas.reduce((sum, p) => {
      let count = 0
      if (p.soloAgua) count++
      if (p.sinComidaRapida) count++
      if (p.pasos >= 10000) count++
      if (p.horasSueno >= 7) count++
      if (p.paginasLeidas >= 10) count++
      if (p.sesionesGym >= 4) count++
      if (p.sesionesCardio >= 3) count++
      return sum + count
    }, 0)

    return {
      nombre: agonista.nombre,
      nivel: NIVEL_LABELS[agonista.nivel as NivelKey],
      kleosTotal: agonista.kleosTotal,
      kleosSemana,
      diasPerfectos,
      pruebasCompletadas,
      pruebasTotales: pruebas.length * 7,
      inscripcionesNuevas: nuevasInscripciones.length,
    }
  }

  const heg = hegemoniaData[0]

  const tiposDestacados = [
    'dia_perfecto',
    'inscripcion_desbloqueada',
    'hegemonia_ganada',
    'senalamiento',
    'prueba_extraordinaria',
  ] as const

  const eventosDestacados = eventos
    .filter((e) =>
      (tiposDestacados as readonly string[]).includes(e.tipo)
    )
    .map((e) => e.contenido)
    .slice(0, 10)

  return {
    semana,
    fechaInicio: inicioStr,
    fechaFin: finStr,
    agonista1: calcularDatos(a1, pruebas1, inscripciones1),
    agonista2: calcularDatos(a2, pruebas2, inscripciones2),
    hegemonia: {
      ganador:
        heg?.ganadorId === a1.id
          ? a1.nombre
          : heg?.ganadorId === a2.id
            ? a2.nombre
            : null,
      empate: heg?.empate ?? false,
      kleosGanador: heg?.kleosGanador ?? 0,
      kleosRival: heg?.kleosRival ?? 0,
    },
    eventosDestacados,
  }
}

export async function generarCronicaConFecha(
  semana: number,
  fechaInicioOverride: string
): Promise<string> {
  const datos = await recopilarDatosSemanaConFecha(semana, fechaInicioOverride)

  const prompt = construirPrompt(datos)

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  const relato = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('')
    .trim()

  await db.delete(cronicas).where(eq(cronicas.semana, semana))

  await db.insert(cronicas).values({
    id: crypto.randomUUID(),
    semana,
    fechaInicio: datos.fechaInicio,
    fechaFin: datos.fechaFin,
    relato,
    metadata: datos as unknown as Record<string, unknown>,
  })

  const ambos = await getAmbosAgonistas()
  if (ambos.length > 0) {
    const eventoId = crypto.randomUUID()
    await db.insert(agoraEventos).values({
      id: eventoId,
      agonistId: ambos[0].id,
      tipo: 'cronica_semanal',
      contenido: relato,
      metadata: {
        semana,
        tipo: 'cronica_prueba',
        fechaInicio: datos.fechaInicio,
        fechaFin: datos.fechaFin,
        kleosPropio: ambos[0].kleosTotal,
        kleosRival: ambos[1]?.kleosTotal ?? 0,
      },
    })

    void triggerComentariosDioses(eventoId).catch((err) =>
      console.error('triggerComentariosDioses cronica_semanal prueba', err)
    )
  }

  return relato
}

function construirPrompt(datos: DatosSemana): string {
  const { agonista1, agonista2, hegemonia, semana, eventosDestacados } = datos

  const ganadorTexto = hegemonia.empate
    ? 'La semana terminó en empate — el Altis no pudo decidir.'
    : hegemonia.ganador
      ? `${hegemonia.ganador} conquistó La Hegemonía de esta semana.`
      : 'La Hegemonía no fue reclamada esta semana.'

  const eventosTexto =
    eventosDestacados.length > 0
      ? `\nEVENTOS DESTACADOS DE LA SEMANA:\n${eventosDestacados.map((e, i) => `${i + 1}. ${e}`).join('\n')}`
      : '\nEVENTOS: Sin eventos destacados esta semana.'

  return `Eres el cronista del Gran Agon — una competencia épica de 29 días de disciplina personal entre dos amigos. Escribes en el estilo del universo Agon: épico, filosófico, con referencias a la antigua Grecia, pero también con humor y calidez humana. Nunca cursi, siempre con peso.

Datos de la Semana ${semana}:

AGONISTA 1: ${agonista1.nombre}
- Nivel: ${agonista1.nivel}
- Kleos esta semana: ${agonista1.kleosSemana}
- Kleos total: ${agonista1.kleosTotal}
- Días perfectos: ${agonista1.diasPerfectos}
- Pruebas completadas: ${agonista1.pruebasCompletadas}/${agonista1.pruebasTotales}
- Inscripciones nuevas: ${agonista1.inscripcionesNuevas}

AGONISTA 2: ${agonista2.nombre}
- Nivel: ${agonista2.nivel}
- Kleos esta semana: ${agonista2.kleosSemana}
- Kleos total: ${agonista2.kleosTotal}
- Días perfectos: ${agonista2.diasPerfectos}
- Pruebas completadas: ${agonista2.pruebasCompletadas}/${agonista2.pruebasTotales}
- Inscripciones nuevas: ${agonista2.inscripcionesNuevas}

HEGEMONÍA: ${ganadorTexto}
${eventosTexto}

Escribe La Crónica del Período en exactamente 120-150 palabras en español. Debe:
1. Comenzar con una frase épica sobre el agon o la semana
2. Narrar el rendimiento de ambos agonistas mencionando eventos reales si los hay
3. Declarar el resultado de La Hegemonía con peso dramático
4. Terminar con una frase filosófica que mire hacia la semana siguiente

IMPORTANTE: Si hay eventos destacados, menciónalos en la narrativa con el tono del universo Agon. No inventes eventos que no están en la lista.
NO uses markdown, bullets ni formato especial. Solo prosa fluida y épica.
NO inventes datos que no están en los números ni en la lista de eventos dados.
SÍ puedes hacer referencias filosóficas griegas cuando corresponda.`
}
