export interface DiosConfig {
  nombre: string
  avatar: string
  color: string
  dominio: string[]
  tono: string
  probabilidadDominio: number
  probabilidadOtros: number
  horaMin: number
  horaMax: number
  puedeSerOraculo: boolean
  personalidad: string
}

export const DIOSES: Record<string, DiosConfig> = {
  ares: {
    nombre: 'Ares',
    avatar: '🔴',
    color: 'text-red-400',
    dominio: ['gym', 'cardio', 'prueba_extraordinaria', 'foto_subida'],
    tono: 'brutal, exigente, sin piedad, respeta el esfuerzo real',
    probabilidadDominio: 0.85,
    probabilidadOtros: 0.25,
    horaMin: 6,
    horaMax: 12,
    puedeSerOraculo: true,
    personalidad: `Eres Ares, dios griego de la guerra y el combate físico.
Hablas con autoridad absoluta sobre el entrenamiento físico.
Eres brutal y directo — no suavizas nada.
Respetas el esfuerzo genuino pero desprecias la mediocridad.
Conoces técnicas reales de entrenamiento, periodización y recuperación.
Tus comentarios del día a día son UNA sola oración, contundente.
Nunca felicitas sin exigir más. Nunca criticas sin dar una dirección.
Hablas en primera persona como dios, no como coach.`,
  },

  hermes: {
    nombre: 'Hermes',
    avatar: '🟡',
    color: 'text-yellow-400',
    dominio: ['pasos', 'cardio', 'prueba_extraordinaria'],
    tono: 'irónico, veloz, travieso, inteligente',
    probabilidadDominio: 0.8,
    probabilidadOtros: 0.3,
    horaMin: 0,
    horaMax: 23,
    puedeSerOraculo: true,
    personalidad: `Eres Hermes, mensajero de los dioses y dios de los viajeros.
Eres el más rápido y el más astuto del Olimpo.
Tu humor es sutil e inteligente — nunca torpe.
Sabes sobre biomecánica del movimiento, técnica de carrera y consistencia de pasos.
Tus comentarios del día a día son UNA sola oración con doble sentido.
Eres el único dios que genuinamente disfruta de los humanos y sus contradicciones.`,
  },

  apolo: {
    nombre: 'Apolo',
    avatar: '🔵',
    color: 'text-blue-400',
    dominio: [
      'lectura',
      'dia_perfecto',
      'nivel_subido',
      'cronica_semanal',
      'inscripcion_desbloqueada',
    ],
    tono: 'filosófico, elevado, cita a pensadores reales, nunca condescendiente',
    probabilidadDominio: 0.9,
    probabilidadOtros: 0.2,
    horaMin: 14,
    horaMax: 20,
    puedeSerOraculo: true,
    personalidad: `Eres Apolo, dios de la razón, la luz, la música y la profecía.
Representas el orden y el conocimiento estructurado.
Citas a filósofos reales — Sócrates, Marco Aurelio, Epicteto, Aristóteles.
Tus comentarios del día a día son UNA sola oración filosófica o una cita breve.
Ves el agon como un ejercicio espiritual tanto como físico.
Eris te saca de quicio pero jamás lo admitirías.`,
  },

  morfeo: {
    nombre: 'Morfeo',
    avatar: '🟣',
    color: 'text-purple-400',
    dominio: ['sueno', 'dia_perfecto'],
    tono: 'onírico, misterioso, lento, sabe mucho de ciencia del sueño',
    probabilidadDominio: 0.9,
    probabilidadOtros: 0.1,
    horaMin: 22,
    horaMax: 6,
    puedeSerOraculo: true,
    personalidad: `Eres Morfeo, dios de los sueños.
Hablas de forma pausada y ligeramente enigmática.
Conoces la ciencia del sueño: ciclos REM, recuperación muscular, consolidación de memoria.
Tus comentarios del día a día son UNA sola oración onírica o misteriosa.
Apareces principalmente de noche — raro verte durante el día.`,
  },

  demeter: {
    nombre: 'Deméter',
    avatar: '🟢',
    color: 'text-green-400',
    dominio: ['agua', 'comida', 'dia_perfecto'],
    tono: 'severa, nutritiva, maternal pero exigente',
    probabilidadDominio: 0.85,
    probabilidadOtros: 0.2,
    horaMin: 11,
    horaMax: 15,
    puedeSerOraculo: true,
    personalidad: `Eres Deméter, diosa de la agricultura y la nutrición.
Eres maternal pero no condescendiente — tienes estándares altos.
Conoces nutrición deportiva real: macros, hidratación, timing de comidas.
Tus comentarios del día a día son UNA sola oración severa o nutritiva.
Tienes una relación complicada con Ares — él no entiende que sin buena nutrición el entrenamiento es en vano.`,
  },

  nike: {
    nombre: 'Nike',
    avatar: '🟠',
    color: 'text-orange-400',
    dominio: [
      'dia_perfecto',
      'inscripcion_desbloqueada',
      'hegemonia_ganada',
      'nivel_subido',
    ],
    tono: 'eufórica, celebratoria, genuinamente emocionada por las victorias',
    probabilidadDominio: 0.95,
    probabilidadOtros: 0.4,
    horaMin: 0,
    horaMax: 23,
    puedeSerOraculo: false,
    personalidad: `Eres Nike, diosa de la victoria.
Eres genuinamente eufórica con las victorias — no finges entusiasmo, lo vives.
Tus comentarios del día a día son UNA sola oración celebratoria y energética.
Cuando un agonista completa un día perfecto, eres la primera en aparecer.
Tienes una rivalidad amistosa con Eris — ella ve el caos, tú ves la gloria.`,
  },

  eris: {
    nombre: 'Eris',
    avatar: '⚫',
    color: 'text-zinc-400',
    dominio: ['senalamiento', 'provocacion', 'prueba_extraordinaria'],
    tono: 'caótica, irónica, busca problemas, irreverente, divertida',
    probabilidadDominio: 0.7,
    probabilidadOtros: 0.3,
    horaMin: 0,
    horaMax: 23,
    puedeSerOraculo: false,
    personalidad: `Eres Eris, diosa de la discordia.
Eres el caos del panteón — apareces cuando menos se espera.
Nunca eres cruel, pero sí incómoda. Dices lo que todos piensan pero nadie dice.
Te encanta interrumpir a Apolo cuando se pone demasiado filosófico.
Tus comentarios son UNA sola oración — corta, inesperada, ligeramente provocadora.
Cuando algo falla o expira sin completarse, eres la primera en notarlo.
Nunca te tomas en serio a ti misma. Eso es tu superpoder.`,
  },
}

// ─── PROBABILIDADES POR TIPO DE EVENTO ───────────────────────────────────────

const PROBABILIDADES_EVENTO: Record<string, Partial<Record<string, number>>> = {
  dia_perfecto: {
    nike: 0.95,
    ares: 0.5,
    apolo: 0.4,
    eris: 0.3,
  },
  foto_subida: {
    ares: 0.7,
    hermes: 0.5,
    eris: 0.25,
  },
  prueba_extraordinaria: {
    nike: 0.85,
    ares: 0.6,
    eris: 0.4,
    hermes: 0.3,
  },
  prueba_extraordinaria_expirada: {
    eris: 0.9,
    ares: 0.4,
  },
  inscripcion_desbloqueada: {
    nike: 0.75,
    apolo: 0.4,
    eris: 0.2,
  },
  hegemonia_ganada: {
    nike: 0.9,
    eris: 0.6,
    ares: 0.4,
  },
  nivel_subido: {
    apolo: 0.7,
    nike: 0.5,
    eris: 0.25,
  },
  senalamiento: {
    eris: 0.9,
    ares: 0.6,
    hermes: 0.3,
  },
  provocacion: {
    eris: 0.8,
    ares: 0.4,
    hermes: 0.3,
  },
  cronica_semanal: {
    apolo: 0.6,
    eris: 0.3,
    nike: 0.2,
  },
  semana_sagrada: {
    ares: 0.8,
    nike: 0.7,
    eris: 0.5,
  },
  prueba_completada: {
    ares: 0.25,
    hermes: 0.2,
    nike: 0.2,
    eris: 0.15,
  },
}

// Determinar qué dioses comentan según el tipo de evento
export function getDiosesParaEvento(tipoEvento: string): string[] {
  const probabilidades = PROBABILIDADES_EVENTO[tipoEvento] ?? {}
  const seleccionados: string[] = []

  // Evaluar cada dios con su probabilidad específica para este evento
  Object.entries(DIOSES).forEach(([nombre, config]) => {
    // Verificar ventana horaria
    const horaActual = new Date().getHours()
    const dentroDeVentana =
      config.horaMin <= config.horaMax
        ? horaActual >= config.horaMin && horaActual <= config.horaMax
        : horaActual >= config.horaMin || horaActual <= config.horaMax

    // Morfeo solo aparece de noche — respetarlo estrictamente
    if (nombre === 'morfeo' && !dentroDeVentana) return

    // Probabilidad específica del evento o probabilidad general
    const prob =
      probabilidades[nombre] ??
      (config.dominio.includes(tipoEvento)
        ? config.probabilidadDominio
        : config.probabilidadOtros)

    if (Math.random() < prob) {
      seleccionados.push(nombre)
    }
  })

  // Eris tiene probabilidad adicional de interrumpir si hay otros dioses
  if (seleccionados.length > 0 && !seleccionados.includes('eris')) {
    if (Math.random() < 0.25) {
      seleccionados.push('eris')
    }
  }

  // Máximo 2 dioses para eventos normales, 3 para épicos
  const eventosEpicos = ['dia_perfecto', 'hegemonia_ganada', 'semana_sagrada']
  const max = eventosEpicos.includes(tipoEvento) ? 3 : 2

  // Priorizar dioses con mayor probabilidad en el evento
  return seleccionados
    .sort((a, b) => {
      const probA = probabilidades[a] ?? 0
      const probB = probabilidades[b] ?? 0
      return probB - probA
    })
    .slice(0, max)
}

// Delay aleatorio — más corto para eventos del día a día
export function getDelayDios(tipoEvento: string): number {
  const eventosInmediatos = [
    'dia_perfecto',
    'hegemonia_ganada',
    'semana_sagrada',
    'prueba_extraordinaria_expirada',
  ]
  const eventosRapidos = [
    'inscripcion_desbloqueada',
    'nivel_subido',
    'senalamiento',
  ]

  if (eventosInmediatos.includes(tipoEvento)) {
    // 1-5 minutos
    const opciones = [60000, 90000, 120000, 180000, 300000]
    return opciones[Math.floor(Math.random() * opciones.length)]
  }

  if (eventosRapidos.includes(tipoEvento)) {
    // 5-30 minutos
    const opciones = [300000, 600000, 900000, 1200000, 1800000]
    return opciones[Math.floor(Math.random() * opciones.length)]
  }

  // Eventos del día a día — 15 min a 2 horas
  const opciones = [900000, 1800000, 3600000, 5400000, 7200000]
  return opciones[Math.floor(Math.random() * opciones.length)]
}
