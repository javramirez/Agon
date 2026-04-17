import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'
import {
  pruebasDiarias,
  agonistas,
  pactoInicial,
  agoraEventos,
  mentorConversaciones,
  consultaMediodia,
} from '@/lib/db/schema'
import { eq, desc, and, gte } from 'drizzle-orm'
import { getRetoPorId } from '@/lib/db/queries'

export interface SeñalDetectada {
  dios: string
  tipoContenido: string
  contextoNarrativo: string
  datosConcretos: string
  intensidad: 'leve' | 'media' | 'fuerte'
  esSobreexigencia: boolean
}

export interface DatosPruebas {
  soloAgua: boolean
  sinComidaRapida: boolean
  pasos: number
  horasSueno: number
  paginasLeidas: number
  sesionesGym: number
  sesionesCardio: number
  diaPerfecto: boolean
  fecha: string
}

export type ContextoVozOlimpo = Awaited<
  ReturnType<typeof recopilarContexto>
>

function fechaRetoAString(fecha: string | Date): string {
  return typeof fecha === 'string' ? fecha : fecha.toISOString().slice(0, 10)
}

// ─── Recopilación de contexto ────────────────────────────────────────────────

export async function recopilarContexto(
  agonistId: string,
  fechaInicioReto?: string
) {
  const hace7Dias = new Date()
  hace7Dias.setDate(hace7Dias.getDate() - 7)
  const fechaSieteAtras = hace7Dias.toISOString().split('T')[0]!

  const agonistaR = await db
    .select({ retoId: agonistas.retoId })
    .from(agonistas)
    .where(eq(agonistas.id, agonistId))
    .limit(1)

  let inicioEfectivo: string | null = fechaInicioReto ?? null
  if (!inicioEfectivo && agonistaR[0]?.retoId) {
    const reto = await getRetoPorId(agonistaR[0].retoId)
    if (reto?.fechaInicio) {
      inicioEfectivo = fechaRetoAString(reto.fechaInicio as string | Date)
    }
  }

  const startDate = inicioEfectivo ?? fechaSieteAtras
  const fechaMin =
    fechaSieteAtras > startDate ? fechaSieteAtras : startDate

  const [
    ultimasPruebas,
    agonistaRows,
    pactoRows,
    ultimosEventos,
    ultimasConversaciones,
    consultaRows,
  ] = await Promise.all([
      db
        .select()
        .from(pruebasDiarias)
        .where(
          and(
            eq(pruebasDiarias.agonistId, agonistId),
            gte(pruebasDiarias.fecha, fechaMin)
          )
        )
        .orderBy(desc(pruebasDiarias.fecha))
        .limit(7),
      db
        .select()
        .from(agonistas)
        .where(eq(agonistas.id, agonistId))
        .limit(1),
      db
        .select()
        .from(pactoInicial)
        .where(eq(pactoInicial.agonistId, agonistId))
        .limit(1),
      db
        .select()
        .from(agoraEventos)
        .where(eq(agoraEventos.agonistId, agonistId))
        .orderBy(desc(agoraEventos.createdAt))
        .limit(10),
      db
        .select({ contenido: mentorConversaciones.contenido })
        .from(mentorConversaciones)
        .where(
          and(
            eq(mentorConversaciones.agonistId, agonistId),
            eq(mentorConversaciones.rol, 'user')
          )
        )
        .orderBy(desc(mentorConversaciones.createdAt))
        .limit(5),
      db
        .select({
          elSacrificio: consultaMediodia.elSacrificio,
          elMomento: consultaMediodia.elMomento,
          queHaCambiado: consultaMediodia.queHaCambiado,
        })
        .from(consultaMediodia)
        .where(eq(consultaMediodia.agonistId, agonistId))
        .limit(1),
    ])

  return {
    pruebas: ultimasPruebas as DatosPruebas[],
    agonista: agonistaRows[0] ?? null,
    pacto: pactoRows[0] ?? null,
    eventos: ultimosEventos,
    mensajesMentor: ultimasConversaciones.map((c) => c.contenido),
    consulta: consultaRows[0] ?? null,
  }
}

// ─── Helpers de detección ────────────────────────────────────────────────────

function diasConsecutivosConCondicion(
  pruebas: DatosPruebas[],
  condicion: (p: DatosPruebas) => boolean
): number {
  let contador = 0
  for (const prueba of pruebas) {
    if (condicion(prueba)) contador++
    else break
  }
  return contador
}

function promedioUltimosDias(
  pruebas: DatosPruebas[],
  campo: keyof DatosPruebas,
  dias: number
): number {
  const muestra = pruebas.slice(0, dias)
  if (muestra.length === 0) return 0
  const suma = muestra.reduce((acc, p) => acc + Number(p[campo] ?? 0), 0)
  return suma / muestra.length
}

// ─── Detección de sobreexigencia ─────────────────────────────────────────────

function detectarSobreexigencia(
  pruebas: DatosPruebas[],
  pacto: NonNullable<ContextoVozOlimpo['pacto']>
): SeñalDetectada | null {
  if (pruebas.length < 5) return null

  const META_GYM_SEMANAL = 4
  const META_CARDIO_SEMANAL = 3
  const META_PAGINAS = 10
  const META_PASOS = 10000
  const META_SUENO = 7

  const gymSemana = pruebas
    .slice(0, 7)
    .reduce((acc, p) => acc + (p.sesionesGym ?? 0), 0)
  const cardioSemana = pruebas
    .slice(0, 7)
    .reduce((acc, p) => acc + (p.sesionesCardio ?? 0), 0)
  const c1Gym = gymSemana >= META_GYM_SEMANAL * 2
  const c1Cardio = cardioSemana >= META_CARDIO_SEMANAL * 2
  const c1 = c1Gym || c1Cardio

  const habitosSuperados = [
    promedioUltimosDias(pruebas, 'paginasLeidas', 5) >= META_PAGINAS * 1.8,
    promedioUltimosDias(pruebas, 'pasos', 5) >= META_PASOS * 1.8,
    promedioUltimosDias(pruebas, 'horasSueno', 5) >= META_SUENO * 1.2,
  ].filter(Boolean).length
  const c2 = habitosSuperados >= 2

  const diasIntensivos = diasConsecutivosConCondicion(
    pruebas,
    (p) =>
      (p.sesionesGym > 0 || p.sesionesCardio > 0) &&
      (p.paginasLeidas >= META_PAGINAS || p.pasos >= META_PASOS)
  )
  const c4 = diasIntensivos >= 5

  if (!c1 || !c4) return null

  const lineaBaseGym = pacto.lineaBaseGym ?? 0
  const lineaBaseCardio = pacto.lineaBaseCardio ?? 0
  const lineaBasePaginas = pacto.lineaBasePaginas ?? 0

  const c3Gym = lineaBaseGym > 0 && gymSemana >= lineaBaseGym * 2.5
  const c3Cardio = lineaBaseCardio > 0 && cardioSemana >= lineaBaseCardio * 2.5
  const c3Paginas =
    lineaBasePaginas > 0 &&
    promedioUltimosDias(pruebas, 'paginasLeidas', 5) >= lineaBasePaginas * 2.5
  const c3 = c3Gym || c3Cardio || c3Paginas

  const señalFuerte = c1 && c2 && c3 && c4

  const dios = señalFuerte ? 'eris' : Math.random() > 0.5 ? 'morfeo' : 'nike'

  const detalles = [
    c1Gym && `${gymSemana} sesiones de gym esta semana (meta: ${META_GYM_SEMANAL})`,
    c1Cardio &&
      `${cardioSemana} sesiones de cardio esta semana (meta: ${META_CARDIO_SEMANAL})`,
    c3Gym && `venía haciendo ${lineaBaseGym} días de gym antes del Agon`,
    c3Cardio && `venía haciendo ${lineaBaseCardio} días de cardio antes del Agon`,
  ]
    .filter(Boolean)
    .join('. ')

  return {
    dios,
    tipoContenido: señalFuerte
      ? 'sobreexigencia_critica'
      : 'sobreexigencia_moderada',
    contextoNarrativo: señalFuerte
      ? `El agonista está en zona de riesgo real de overreaching. ${detalles}.`
      : `El agonista muestra señales de sobreexigencia sostenida. ${detalles}.`,
    datosConcretos: detalles,
    intensidad: señalFuerte ? 'fuerte' : 'media',
    esSobreexigencia: true,
  }
}

// ─── Detección de señales regulares ──────────────────────────────────────────

function detectarHabitoFallido(pruebas: DatosPruebas[]): SeñalDetectada | null {
  if (pruebas.length < 3) return null

  const habitos: Array<{
    campo: keyof DatosPruebas
    meta: number
    dios: string
    nombre: string
    tipo: string
  }> = [
    {
      campo: 'paginasLeidas',
      meta: 10,
      dios: 'apolo',
      nombre: 'lectura',
      tipo: 'retomar_lectura',
    },
    {
      campo: 'horasSueno',
      meta: 7,
      dios: 'morfeo',
      nombre: 'sueño',
      tipo: 'higiene_sueno',
    },
    {
      campo: 'pasos',
      meta: 10000,
      dios: 'hermes',
      nombre: 'pasos',
      tipo: 'retomar_movimiento',
    },
  ]

  for (const habito of habitos) {
    const diasFallidos = diasConsecutivosConCondicion(
      pruebas,
      (p) => Number(p[habito.campo] ?? 0) < habito.meta
    )

    if (diasFallidos >= 3) {
      const intensidad =
        diasFallidos >= 6 ? 'fuerte' : diasFallidos >= 4 ? 'media' : 'leve'
      return {
        dios: habito.dios,
        tipoContenido: habito.tipo,
        contextoNarrativo: `El agonista lleva ${diasFallidos} días consecutivos sin completar el hábito de ${habito.nombre}.`,
        datosConcretos: `Meta: ${habito.meta} ${String(habito.campo)}. Días fallidos consecutivos: ${diasFallidos}.`,
        intensidad,
        esSobreexigencia: false,
      }
    }
  }

  const gymSemana = pruebas
    .slice(0, 7)
    .reduce((acc, p) => acc + (p.sesionesGym ?? 0), 0)
  const cardioSemana = pruebas
    .slice(0, 7)
    .reduce((acc, p) => acc + (p.sesionesCardio ?? 0), 0)

  if (gymSemana === 0 && cardioSemana === 0 && pruebas.length >= 5) {
    return {
      dios: 'ares',
      tipoContenido: 'retomar_entrenamiento',
      contextoNarrativo:
        'El agonista no ha registrado ninguna sesión de gym ni cardio en los últimos 7 días.',
      datosConcretos: `Gym esta semana: ${gymSemana}. Cardio esta semana: ${cardioSemana}.`,
      intensidad: 'media',
      esSobreexigencia: false,
    }
  }

  return null
}

function detectarEstancamiento(
  pruebas: DatosPruebas[],
  _agonista: NonNullable<ContextoVozOlimpo['agonista']>
): SeñalDetectada | null {
  if (pruebas.length < 4) return null

  const diasSinDiaPerfecto = diasConsecutivosConCondicion(
    pruebas,
    (p) => !p.diaPerfecto
  )

  if (diasSinDiaPerfecto >= 4) {
    return {
      dios: 'nike',
      tipoContenido: 'mentalidad_competitiva',
      contextoNarrativo: `El agonista lleva ${diasSinDiaPerfecto} días sin alcanzar un día perfecto.`,
      datosConcretos: `Días sin día perfecto: ${diasSinDiaPerfecto}.`,
      intensidad: diasSinDiaPerfecto >= 6 ? 'media' : 'leve',
      esSobreexigencia: false,
    }
  }

  return null
}

function detectarRacha(pruebas: DatosPruebas[]): SeñalDetectada | null {
  const diasConActividad = diasConsecutivosConCondicion(
    pruebas,
    (p) =>
      p.diaPerfecto || p.paginasLeidas >= 10 || p.pasos >= 10000
  )

  if (diasConActividad < 7) return null

  const promedioPaginas = promedioUltimosDias(
    pruebas,
    'paginasLeidas',
    diasConActividad
  )
  const superandoLectura = promedioPaginas >= 20

  return {
    dios: superandoLectura ? 'apolo' : 'nike',
    tipoContenido: superandoLectura
      ? 'recomendacion_libros_avanzados'
      : 'sostener_momentum',
    contextoNarrativo: `El agonista lleva ${diasConActividad} días consecutivos de actividad sostenida.`,
    datosConcretos: `Días de racha: ${diasConActividad}. Promedio páginas: ${Math.round(promedioPaginas)}.`,
    intensidad:
      diasConActividad >= 14 ? 'fuerte' : diasConActividad >= 10 ? 'media' : 'leve',
    esSobreexigencia: false,
  }
}

function detectarMetaSuperada(pruebas: DatosPruebas[]): SeñalDetectada | null {
  if (pruebas.length < 5) return null

  const promPaginas = promedioUltimosDias(pruebas, 'paginasLeidas', 5)
  if (promPaginas >= 20) {
    return {
      dios: 'apolo',
      tipoContenido: 'recomendacion_libros_avanzados',
      contextoNarrativo:
        'El agonista está leyendo consistentemente el doble de la meta.',
      datosConcretos: `Meta: 10 páginas. Promedio real últimos 5 días: ${Math.round(promPaginas)} páginas.`,
      intensidad: 'media',
      esSobreexigencia: false,
    }
  }

  return null
}

function detectarDiaPerfecto(pruebas: DatosPruebas[]): SeñalDetectada | null {
  if (pruebas.length === 0) return null
  const reciente = pruebas[0]
  if (!reciente?.diaPerfecto) return null

  return {
    dios: Math.random() > 0.5 ? 'nike' : 'apolo',
    tipoContenido: 'sostener_excelencia',
    contextoNarrativo: 'El agonista alcanzó un día perfecto recientemente.',
    datosConcretos: `Día perfecto: ${reciente.fecha}.`,
    intensidad: 'leve',
    esSobreexigencia: false,
  }
}

// ─── Detección semántica en conversaciones del Mentor ─────────────────────────

const DOMINIO_A_SEÑAL: Record<
  string,
  { dios: string; tipoContenido: string; contexto: string }
> = {
  sueno: {
    dios: 'morfeo',
    tipoContenido: 'higiene_sueno',
    contexto:
      'El agonista ha mencionado problemas con el sueño o la recuperación en sus conversaciones con el Mentor.',
  },
  cansancio: {
    dios: 'morfeo',
    tipoContenido: 'sobreexigencia_moderada',
    contexto:
      'El agonista ha expresado cansancio o agotamiento en sus conversaciones con el Mentor.',
  },
  lectura: {
    dios: 'apolo',
    tipoContenido: 'retomar_lectura',
    contexto:
      'El agonista ha mencionado dificultades para mantener el hábito de lectura en sus conversaciones con el Mentor.',
  },
  motivacion: {
    dios: 'nike',
    tipoContenido: 'mentalidad_competitiva',
    contexto:
      'El agonista ha expresado dudas sobre su motivación o constancia en sus conversaciones con el Mentor.',
  },
  movimiento: {
    dios: 'hermes',
    tipoContenido: 'retomar_movimiento',
    contexto:
      'El agonista ha mencionado dificultades para moverse o caminar en sus conversaciones con el Mentor.',
  },
  entrenamiento: {
    dios: 'ares',
    tipoContenido: 'retomar_entrenamiento',
    contexto:
      'El agonista ha expresado problemas con el entrenamiento físico en sus conversaciones con el Mentor.',
  },
  rivalidad: {
    dios: 'eris',
    tipoContenido: 'mentalidad_competitiva',
    contexto:
      'El agonista ha mencionado al rival o la competencia en tono de preocupación en sus conversaciones con el Mentor.',
  },
}

const LINEAS_DOMINIO_MENTOR: Record<string, string> = {
  sueno: '- sueno (problemas para dormir, cansancio, recuperación)',
  cansancio: '- cansancio (agotamiento, burnout, sobrecarga)',
  lectura: '- lectura (no leer, dificultad para concentrarse)',
  motivacion: '- motivacion (duda, ganas de rendirse, sin energía)',
  movimiento: '- movimiento (sedentarismo, no caminar, pasos bajos)',
  entrenamiento:
    '- entrenamiento (no ir al gym, lesión, parón físico)',
  rivalidad:
    '- rivalidad (preocupación por el rival, sentirse atrás)',
}

async function detectarSeñalMentor(
  mensajes: string[],
  consulta: { elSacrificio: string; elMomento: string; queHaCambiado: string } | null,
  esSolo = false
): Promise<SeñalDetectada | null> {
  if (mensajes.length === 0) return null

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const anthropic = new Anthropic({ apiKey })
  const textoConversaciones = mensajes
    .map((m, i) => `Mensaje ${i + 1}: "${m}"`)
    .join('\n')

  const dominiosValidos = esSolo
    ? Object.keys(DOMINIO_A_SEÑAL).filter((d) => d !== 'rivalidad')
    : Object.keys(DOMINIO_A_SEÑAL)

  const listaDominios = dominiosValidos
    .map((d) => LINEAS_DOMINIO_MENTOR[d])
    .filter(Boolean)
    .join('\n')

  try {
    const respuesta = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Analiza estos mensajes que un agonista envió a su mentor personal:

${textoConversaciones}

Identifica si el agonista menciona alguna de estas preocupaciones dominantes:
${listaDominios}

Responde SOLO con un JSON sin texto adicional:
{"dominio": "nombre_del_dominio_o_null"}

Si no hay una preocupación clara, responde: {"dominio": null}`,
        },
      ],
    })

    const texto = respuesta.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { text: string }).text)
      .join('')
      .trim()

    const sinCercas = texto.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(sinCercas) as { dominio: string | null }

    if (!parsed.dominio) return null
    if (esSolo && parsed.dominio === 'rivalidad') return null

    const señalConfig = DOMINIO_A_SEÑAL[parsed.dominio]
    if (!señalConfig) return null

    const contextoConsulta = consulta
      ? ` En la Consulta del Mediodía reveló: sacrificó "${consulta.elSacrificio}" y lo que más recuerda es "${consulta.elMomento}".`
      : ''

    return {
      dios: señalConfig.dios,
      tipoContenido: señalConfig.tipoContenido,
      contextoNarrativo: señalConfig.contexto + contextoConsulta,
      datosConcretos: `Detectado en conversaciones del Mentor. Mensajes analizados: ${mensajes.length}.`,
      intensidad: 'leve',
      esSobreexigencia: false,
    }
  } catch {
    return null
  }
}

// ─── Orquestador de detección ─────────────────────────────────────────────────

export async function detectarSeñal(
  agonistId: string,
  esSolo = false,
  fechaInicioReto?: string
): Promise<SeñalDetectada | null> {
  const { pruebas, agonista, pacto, mensajesMentor, consulta } =
    await recopilarContexto(agonistId, fechaInicioReto)

  if (!agonista || pruebas.length === 0) return null

  function enriquecerConConsulta(
    señal: SeñalDetectada,
    c: { elSacrificio: string; elMomento: string; queHaCambiado: string } | null
  ): SeñalDetectada {
    if (!c) return señal
    return {
      ...señal,
      contextoNarrativo: `${señal.contextoNarrativo} El agonista reveló en su Consulta que lo que cambió en él es: "${c.queHaCambiado}".`,
    }
  }

  if (pacto) {
    const sobreexigencia = detectarSobreexigencia(pruebas, pacto)
    if (sobreexigencia) return enriquecerConConsulta(sobreexigencia, consulta)
  }

  const habitoFallido = detectarHabitoFallido(pruebas)
  if (habitoFallido) return enriquecerConConsulta(habitoFallido, consulta)

  const estancamiento = detectarEstancamiento(pruebas, agonista)
  if (estancamiento) return enriquecerConConsulta(estancamiento, consulta)

  const racha = detectarRacha(pruebas)
  if (racha) return enriquecerConConsulta(racha, consulta)

  const metaSuperada = detectarMetaSuperada(pruebas)
  if (metaSuperada) return enriquecerConConsulta(metaSuperada, consulta)

  const señalMentor = await detectarSeñalMentor(mensajesMentor, consulta, esSolo)
  if (señalMentor) return señalMentor

  const diaPerfecto = detectarDiaPerfecto(pruebas)
  if (diaPerfecto) return enriquecerConConsulta(diaPerfecto, consulta)

  return null
}
