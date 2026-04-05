// Thresholds de kleos para cada nivel
export const NIVEL_THRESHOLDS = {
  aspirante: 0,
  atleta: 150,
  agonista: 350,
  luchador: 600,
  campeon: 900,
  heroe: 1300,
  semidios: 1800,
  olimpico: 2400,
  leyenda_del_agon: 3100,
  inmortal: 3900,
} as const

export type NivelKey = keyof typeof NIVEL_THRESHOLDS

export const NIVEL_LABELS: Record<NivelKey, string> = {
  aspirante: 'Aspirante',
  atleta: 'Atleta',
  agonista: 'Agonista',
  luchador: 'Luchador',
  campeon: 'Campeón',
  heroe: 'Héroe',
  semidios: 'Semidiós',
  olimpico: 'Olímpico',
  leyenda_del_agon: 'Leyenda del Agon',
  inmortal: 'Inmortal',
}

export const NIVEL_ICONOS: Record<NivelKey, string> = {
  aspirante: '🌱',
  atleta: '🏃',
  agonista: '⚡',
  luchador: '🛡️',
  campeon: '⚔️',
  heroe: '🔥',
  semidios: '🦅',
  olimpico: '⭐',
  leyenda_del_agon: '👑',
  inmortal: '🏛️',
}

// Kleos base por prueba
export const KLEOS_POR_PRUEBA = {
  agua: { base: 10, conRacha: 15 },
  comida: { base: 10, conRacha: 15 },
  pasos: { base: 20, conRacha: 30 },
  sueno: { base: 15, conRacha: 22 },
  lectura: { base: 15, conRacha: 22 },
  gym: { base: 30, conRacha: 45 },
  cardio: { base: 25, conRacha: 38 },
} as const

export const KLEOS_DIA_PERFECTO = 30
export const KLEOS_DIA_PERFECTO_NIVEL_9 = 50
export const KLEOS_SENALAMIENTO_PENALIDAD = 50
export const ACLAMACIONES_POR_DIA = 5
export const MAX_NIVEL_POR_DIA = 1

// Inscripciones del Agon
export const INSCRIPCIONES = [
  {
    id: 'la_llama_viva',
    nombre: 'La Llama Viva',
    descripcion: '3 agonías completas seguidas. El fuego del agon no conoce la extinción.',
    icono: '🔥',
    secreto: false,
  },
  {
    id: 'agua_sagrada',
    nombre: 'El Agua Sagrada',
    descripcion: '7 días de pureza. El cuerpo del agonista no acepta lo que lo debilita.',
    icono: '💧',
    secreto: false,
  },
  {
    id: 'semana_olimpica',
    nombre: 'La Semana Olímpica',
    descripcion: 'Todas las pruebas, todos los días, durante 7 días. El Altis lo inscribe en dorado.',
    icono: '👑',
    secreto: false,
  },
  {
    id: 'furia_del_agon',
    nombre: 'La Furia del Agon',
    descripcion: 'Cinco sesiones de gimnasio en una semana. Más allá de lo que el contrato exige.',
    icono: '⚡',
    secreto: false,
  },
  {
    id: 'el_heraldo',
    nombre: 'El Heraldo',
    descripcion: 'El agonista que inicia antes que el sol no teme al día que viene.',
    icono: '🌅',
    secreto: false,
  },
  {
    id: 'filosofo_del_agon',
    nombre: 'El Filósofo del Agon',
    descripcion: 'Cien páginas leídas. El agonista que solo entrena el cuerpo es a medias.',
    icono: '📜',
    secreto: false,
  },
  {
    id: 'ayuno_de_hierro',
    nombre: 'El Ayuno de Hierro',
    descripcion: '14 días sin comida rápida. La disciplina del cuerpo empieza en la boca.',
    icono: '💀',
    secreto: false,
  },
  {
    id: 'imparable',
    nombre: 'Imparable',
    descripcion: '14 agonías completas. El agonista que llega a la mitad ya no puede ser detenido.',
    icono: '🚀',
    secreto: false,
  },
  {
    id: 'gemelos_del_agon',
    nombre: 'Los Gemelos del Agon',
    descripcion: 'Ambos agonistas completan el mismo día perfecto. El agon los igualó.',
    icono: '🤝',
    secreto: false,
  },
  {
    id: 'la_remontada',
    nombre: 'La Remontada',
    descripcion: '300 kleos de desventaja. Recuperados. El agon no termina hasta que termina.',
    icono: '📉',
    secreto: false,
  },
  {
    id: 'el_gran_agon',
    nombre: 'El Gran Agon',
    descripcion: '29 días. Todas las pruebas. El Altis te inscribe para siempre.',
    icono: '🏛️',
    secreto: false,
  },
  // Inscripciones secretas
  {
    id: 'guardian_de_la_noche',
    nombre: 'El Guardián de la Noche',
    descripcion: 'El agonista que el agon encuentra despierto a las 3am. Su llama nunca duerme.',
    icono: '🌙',
    secreto: true,
  },
  {
    id: 'precision_del_sabio',
    nombre: 'La Precisión del Sabio',
    descripcion: 'Exactamente 8 horas de sueño, tres días seguidos. El agonista que domina hasta el descanso.',
    icono: '😴',
    secreto: true,
  },
  {
    id: 'sinfonia_del_fracaso',
    nombre: 'La Sinfonía del Fracaso',
    descripcion: 'Ambos fallan la misma prueba el mismo día. El agon los quebró igual.',
    icono: '🪨',
    secreto: true,
  },
  {
    id: 'la_ekecheiria',
    nombre: 'La Ekecheiria',
    descripcion: 'La tregua sagrada fue invocada. Hasta los dioses se detienen ante la lesión.',
    icono: '⚖️',
    secreto: true,
  },
  {
    id: 'agonista_invisible',
    nombre: 'El Agonista Invisible',
    descripcion: 'Tres días completos sin una sola palabra en el Ágora. El kleos se acumula en silencio.',
    icono: '👻',
    secreto: true,
  },
  {
    id: 'senalamiento_perfecto',
    nombre: 'El Señalamiento Perfecto',
    descripcion: 'Señalaste al antagonista el día que ya iba a caer. El agon tiene sentido del humor.',
    icono: '🎯',
    secreto: true,
  },
  {
    id: 'mas_alla_del_contrato',
    nombre: 'Más Allá del Contrato',
    descripcion: 'Cardio siete días seguidos. El contrato pedía tres por semana. El agon pide más.',
    icono: '🏃',
    secreto: true,
  },
  {
    id: 'lengua_del_agon',
    nombre: 'La Lengua del Agon',
    descripcion: 'Diez provocaciones en un día. El agonista que no puede callarse merece su propia inscripción.',
    icono: '🧂',
    secreto: true,
  },
] as const

export type InscripcionId = (typeof INSCRIPCIONES)[number]['id']

// Provocaciones de La Voz del Agon
export const PROVOCACIONES = [
  'Ausente.',
  'Interesante.',
  '¿Hoy también?',
  'El sofá ganó.',
  'Racha: muerta.',
  'El agon te llamó. No contestaste.',
  'Hoy te ganó el sofá. Felicitaciones al sofá.',
  'Excusas: infinitas. Pruebas completadas: insuficientes.',
  'Ni el Altis quiso registrar lo que hiciste hoy.',
  'Tu racha murió. Descanse en paz. Fue breve.',
  '¿Eso fue gym o fue teatro?',
  'Impresionante consistencia. Consistentemente mediocre.',
  'Tu antagonista te admira. Sobre todo por la capacidad de no aparecer.',
  'No te preocupes. El kleos no se acumula solo. Espera — sí lo hace. Para el otro.',
  'El agon te preguntó si venías hoy. Sigue esperando respuesta.',
  'Bonita estrategia la tuya. ¿Cómo se llama? ¿Rendirse con estilo?',
  'El Altis tiene una sección especial para los que casi lo intentaron.',
  'Epicteto decía que la libertad no es hacer lo que quieres, sino querer lo que debes. Medita eso.',
  'Hay dos tipos de agonistas: los que se forjan en el fuego y los que lo observan desde lejos. Elegiste hoy.',
  'Aristóteles decía que somos lo que hacemos repetidamente. Tomo nota.',
  'Los griegos tenían un nombre para los que no se presentaban al agon. Por respeto, no lo diremos.',
  'La Hegemonía de esta semana ya tiene destino. Y no es tu cabeza.',
  'El Gran Agon no distingue entre intenciones y excusas. Solo entre actos y ausencias.',
] as const

// ─── SISTEMA DE PRUEBAS EXTRAORDINARIAS V2 ───────────────────────────────

export type TipoPrueba = 'triptico' | 'destino'
export type VentanaHoraria = {
  horaMin: number
  horaMax: number
  duracionHoras: number
}

export interface PruebaExtraordinariaConfig {
  id: string
  descripcion: string
  kleos: number
  tipo: TipoPrueba
  ventana: VentanaHoraria
  dificultad: 'facil' | 'media' | 'dificil'
}

export const PRUEBAS_TRIPTICO: PruebaExtraordinariaConfig[] = [
  { id: 'tr_01', descripcion: 'Lee 20 páginas hoy. El filósofo del agon no descansa.', kleos: 25, tipo: 'triptico', ventana: { horaMin: 8, horaMax: 21, duracionHoras: 24 }, dificultad: 'facil' },
  { id: 'tr_02', descripcion: 'Bebe 3 litros de agua hoy. El cuerpo del agonista no acepta menos.', kleos: 25, tipo: 'triptico', ventana: { horaMin: 8, horaMax: 14, duracionHoras: 24 }, dificultad: 'facil' },
  { id: 'tr_03', descripcion: 'No uses redes sociales por 4 horas continuas. El agonista que mira la vida de otros, olvida la propia.', kleos: 40, tipo: 'triptico', ventana: { horaMin: 8, horaMax: 18, duracionHoras: 24 }, dificultad: 'media' },
  { id: 'tr_04', descripcion: 'Apaga el celular 2 horas continuas. El silencio es parte del agon.', kleos: 30, tipo: 'triptico', ventana: { horaMin: 8, horaMax: 20, duracionHoras: 24 }, dificultad: 'media' },
  { id: 'tr_05', descripcion: 'Escucha un podcast o audiolibro por 30 minutos. El agonista entrena cuerpo y mente.', kleos: 20, tipo: 'triptico', ventana: { horaMin: 8, horaMax: 21, duracionHoras: 24 }, dificultad: 'facil' },
  { id: 'tr_06', descripcion: 'Come sin pantallas en todas tus comidas del día.', kleos: 40, tipo: 'triptico', ventana: { horaMin: 6, horaMax: 10, duracionHoras: 24 }, dificultad: 'media' },
  { id: 'tr_07', descripcion: 'Prepara tú mismo todas tus comidas hoy. Nada de delivery ni comprado listo.', kleos: 40, tipo: 'triptico', ventana: { horaMin: 6, horaMax: 11, duracionHoras: 24 }, dificultad: 'media' },
  { id: 'tr_08', descripcion: 'No consumas azúcar añadida en ninguna comida del día.', kleos: 35, tipo: 'triptico', ventana: { horaMin: 6, horaMax: 10, duracionHoras: 24 }, dificultad: 'media' },
  { id: 'tr_09', descripcion: 'No café ni energéticas hoy. El kleos no se compra con estimulantes.', kleos: 30, tipo: 'triptico', ventana: { horaMin: 6, horaMax: 10, duracionHoras: 24 }, dificultad: 'media' },
  { id: 'tr_10', descripcion: 'Escribe en papel qué quieres lograr esta semana. El agonista que no sabe a dónde va, no llega.', kleos: 20, tipo: 'triptico', ventana: { horaMin: 14, horaMax: 22, duracionHoras: 24 }, dificultad: 'facil' },
  { id: 'tr_11', descripcion: 'Escribe 3 cosas por las que estás agradecido hoy.', kleos: 20, tipo: 'triptico', ventana: { horaMin: 19, horaMax: 23, duracionHoras: 24 }, dificultad: 'facil' },
  { id: 'tr_12', descripcion: 'Escribe una carta a tu yo del futuro. No es el Oráculo — esta la guardas tú.', kleos: 25, tipo: 'triptico', ventana: { horaMin: 19, horaMax: 23, duracionHoras: 24 }, dificultad: 'facil' },
  { id: 'tr_13', descripcion: 'Llama o escribe a alguien a quien le debes una conversación pendiente.', kleos: 25, tipo: 'triptico', ventana: { horaMin: 14, horaMax: 20, duracionHoras: 24 }, dificultad: 'facil' },
  { id: 'tr_14', descripcion: 'Haz algo concreto por otra persona hoy, sin que te lo pidan y sin publicarlo en el Ágora.', kleos: 35, tipo: 'triptico', ventana: { horaMin: 14, horaMax: 20, duracionHoras: 24 }, dificultad: 'media' },
  { id: 'tr_15', descripcion: 'Estiramientos 15 minutos antes de dormir. El cuerpo forjado también necesita recuperarse.', kleos: 25, tipo: 'triptico', ventana: { horaMin: 20, horaMax: 23, duracionHoras: 24 }, dificultad: 'facil' },
  { id: 'tr_16', descripcion: '20 minutos de movilidad articular al despertar. El agonista que no se prepara, se quiebra.', kleos: 30, tipo: 'triptico', ventana: { horaMin: 6, horaMax: 10, duracionHoras: 24 }, dificultad: 'media' },
]

export const PRUEBAS_DESTINO: PruebaExtraordinariaConfig[] = [
  { id: 'de_01', descripcion: 'Completa tu sesión de gym antes de las 9am. El agon premia a los que madrugaron.', kleos: 60, tipo: 'destino', ventana: { horaMin: 5, horaMax: 7, duracionHoras: 2 }, dificultad: 'dificil' },
  { id: 'de_02', descripcion: 'Ayuno hasta el mediodía. El agonista que domina el hambre, domina el agon.', kleos: 50, tipo: 'destino', ventana: { horaMin: 6, horaMax: 9, duracionHoras: 3 }, dificultad: 'dificil' },
  { id: 'de_03', descripcion: '100 sentadillas antes del anochecer. El Altis no acepta excusas.', kleos: 50, tipo: 'destino', ventana: { horaMin: 8, horaMax: 18, duracionHoras: 6 }, dificultad: 'dificil' },
  { id: 'de_04', descripcion: '50 flexiones antes del mediodía. El agon empieza antes de que el sol llegue al centro.', kleos: 35, tipo: 'destino', ventana: { horaMin: 8, horaMax: 11, duracionHoras: 3 }, dificultad: 'media' },
  { id: 'de_05', descripcion: '15.000 pasos antes del anochecer. El Altis no acepta menos.', kleos: 55, tipo: 'destino', ventana: { horaMin: 8, horaMax: 14, duracionHoras: 6 }, dificultad: 'dificil' },
  { id: 'de_06', descripcion: 'Dos sesiones de cardio en un solo día. El agonista que se detiene una vez, puede detenerse dos.', kleos: 65, tipo: 'destino', ventana: { horaMin: 8, horaMax: 16, duracionHoras: 8 }, dificultad: 'dificil' },
  { id: 'de_07', descripcion: '30 minutos de cardio sin parar ahora. El agon no acepta pausas.', kleos: 45, tipo: 'destino', ventana: { horaMin: 14, horaMax: 19, duracionHoras: 6 }, dificultad: 'dificil' },
  { id: 'de_08', descripcion: 'Sal a caminar 30 minutos sin música, sin podcast. Solo el agon y tus pensamientos.', kleos: 35, tipo: 'destino', ventana: { horaMin: 6, horaMax: 11, duracionHoras: 4 }, dificultad: 'media' },
  { id: 'de_09', descripcion: 'Termina el día con todas tus pruebas completadas antes de las 21:00. No hay extensiones.', kleos: 55, tipo: 'destino', ventana: { horaMin: 19, horaMax: 20, duracionHoras: 2 }, dificultad: 'dificil' },
  { id: 'de_10', descripcion: 'Duerme antes de las 22:00. El agonista que descansa bien, gana el día siguiente.', kleos: 50, tipo: 'destino', ventana: { horaMin: 19, horaMax: 21, duracionHoras: 2 }, dificultad: 'dificil' },
  { id: 'de_11', descripcion: 'Haz 10 dominadas ahora mismo. El agonista que no puede sostenerse, no puede avanzar.', kleos: 45, tipo: 'destino', ventana: { horaMin: 8, horaMax: 20, duracionHoras: 2 }, dificultad: 'dificil' },
  { id: 'de_12', descripcion: 'Sube 10 pisos por escalera sin detenerte. El Olimpo no tiene ascensor.', kleos: 40, tipo: 'destino', ventana: { horaMin: 8, horaMax: 20, duracionHoras: 2 }, dificultad: 'media' },
  { id: 'de_13', descripcion: '50 burpees antes de que expire este evento. El agon no negocia.', kleos: 60, tipo: 'destino', ventana: { horaMin: 8, horaMax: 20, duracionHoras: 3 }, dificultad: 'dificil' },
  { id: 'de_14', descripcion: 'Corre 3 kilómetros sin parar ahora. No mañana. Ahora.', kleos: 55, tipo: 'destino', ventana: { horaMin: 7, horaMax: 19, duracionHoras: 4 }, dificultad: 'dificil' },
  { id: 'de_15', descripcion: 'Escribe durante 15 minutos sin parar sobre lo que sientes en este momento del agon.', kleos: 30, tipo: 'destino', ventana: { horaMin: 8, horaMax: 22, duracionHoras: 4 }, dificultad: 'media' },
  { id: 'de_16', descripcion: 'Aprende 10 palabras en un idioma que no hablas. El agonista que no crece en lo pequeño, no crece.', kleos: 25, tipo: 'destino', ventana: { horaMin: 8, horaMax: 22, duracionHoras: 3 }, dificultad: 'facil' },
  { id: 'de_17', descripcion: 'Llama a alguien que admiras y dile por qué. El agon también se gana con valentía social.', kleos: 40, tipo: 'destino', ventana: { horaMin: 14, horaMax: 20, duracionHoras: 6 }, dificultad: 'media' },
  { id: 'de_18', descripcion: 'No uses ninguna pantalla por las próximas 3 horas. El Altis te observa.', kleos: 50, tipo: 'destino', ventana: { horaMin: 8, horaMax: 20, duracionHoras: 3 }, dificultad: 'dificil' },
  { id: 'de_19', descripcion: 'Ducha fría completa. Sin gradual. Sin excusas. El frío es parte del agon.', kleos: 35, tipo: 'destino', ventana: { horaMin: 6, horaMax: 22, duracionHoras: 2 }, dificultad: 'media' },
  { id: 'de_20', descripcion: 'Lee sobre un tema que no conoces nada. Al menos 15 páginas.', kleos: 25, tipo: 'destino', ventana: { horaMin: 8, horaMax: 21, duracionHoras: 4 }, dificultad: 'facil' },
]

export const TODAS_PRUEBAS_EXTRAORDINARIAS = [
  ...PRUEBAS_TRIPTICO,
  ...PRUEBAS_DESTINO,
]

export type PruebaExtraordinariaId =
  | (typeof PRUEBAS_TRIPTICO)[number]['id']
  | (typeof PRUEBAS_DESTINO)[number]['id']

/** @deprecated Usar TODAS_PRUEBAS_EXTRAORDINARIAS */
export const PRUEBAS_EXTRAORDINARIAS = TODAS_PRUEBAS_EXTRAORDINARIAS
