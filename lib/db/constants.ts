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

// Pool de Pruebas Extraordinarias
export const PRUEBAS_EXTRAORDINARIAS = [
  { id: 'pe_01', descripcion: 'Haz 100 sentadillas antes del anochecer.', kleos: 50 },
  { id: 'pe_02', descripcion: 'Lee 20 páginas hoy en vez de 10.', kleos: 25 },
  { id: 'pe_03', descripcion: 'Duerme antes de las 23:00.', kleos: 30 },
  { id: 'pe_04', descripcion: 'Camina 15.000 pasos hoy.', kleos: 40 },
  { id: 'pe_05', descripcion: 'Completa dos sesiones de cardio en un solo día.', kleos: 60 },
  { id: 'pe_06', descripcion: 'No uses redes sociales por 24 horas.', kleos: 35 },
  { id: 'pe_07', descripcion: 'Haz 50 flexiones antes del mediodía.', kleos: 45 },
  {
    id: 'pe_08',
    descripcion:
      'Medita 10 minutos. El agonista que solo entrena el cuerpo es a medias.',
    kleos: 25,
  },
  { id: 'pe_09', descripcion: 'Bebe 3 litros de agua hoy.', kleos: 20 },
  {
    id: 'pe_10',
    descripcion:
      'Termina el día sin ningún hábito pendiente antes de las 21:00.',
    kleos: 55,
  },
] as const

export type PruebaExtraordinariaId =
  (typeof PRUEBAS_EXTRAORDINARIAS)[number]['id']
