import { db } from '@/lib/db'
import {
  pruebasDiarias,
  agonistas,
  pactoInicial,
  agoraEventos,
} from '@/lib/db/schema'
import { eq, desc, and, gte } from 'drizzle-orm'

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

export type ContextoVozOlimpo = Awaited<ReturnType<typeof recopilarContexto>>

// ─── Recopilación de contexto ────────────────────────────────────────────────

export async function recopilarContexto(agonistId: string) {
  const hace7Dias = new Date()
  hace7Dias.setDate(hace7Dias.getDate() - 7)
  const fechaMin = hace7Dias.toISOString().split('T')[0]!

  const [ultimasPruebas, agonistaRows, pactoRows, ultimosEventos] =
    await Promise.all([
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
    ])

  return {
    pruebas: ultimasPruebas as DatosPruebas[],
    agonista: agonistaRows[0] ?? null,
    pacto: pactoRows[0] ?? null,
    eventos: ultimosEventos,
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

// ─── Orquestador de detección ─────────────────────────────────────────────────

export async function detectarSeñal(agonistId: string): Promise<SeñalDetectada | null> {
  const { pruebas, agonista, pacto } = await recopilarContexto(agonistId)

  if (!agonista || pruebas.length === 0) return null

  if (pacto) {
    const sobreexigencia = detectarSobreexigencia(pruebas, pacto)
    if (sobreexigencia) return sobreexigencia
  }

  const habitoFallido = detectarHabitoFallido(pruebas)
  if (habitoFallido) return habitoFallido

  const estancamiento = detectarEstancamiento(pruebas, agonista)
  if (estancamiento) return estancamiento

  const racha = detectarRacha(pruebas)
  if (racha) return racha

  const metaSuperada = detectarMetaSuperada(pruebas)
  if (metaSuperada) return metaSuperada

  const diaPerfecto = detectarDiaPerfecto(pruebas)
  if (diaPerfecto) return diaPerfecto

  return null
}
