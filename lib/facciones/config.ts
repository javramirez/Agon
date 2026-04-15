import {
  Shield,
  BookOpen,
  Leaf,
  Zap,
  Footprints,
  Moon,
  Trophy,
  type LucideIcon,
} from 'lucide-react'

export type FaccionId =
  | 'guardia_hierro'
  | 'escuela_logos'
  | 'gremio_tierra'
  | 'hermandad_caos'
  | 'corredores_alba'
  | 'concilio_sombras'
  | 'tribunal_kleos'

export interface Faccion {
  id: FaccionId
  nombre: string
  dios: string
  lider: string
  poblacionBase: number
  color: string
  icono: LucideIcon
  descripcion: string
  habitosActivadores: string[]
}

export interface RangoAfinidad {
  rango: number
  nombre: string
  minPuntos: number
  porcentajePoblacion: number
}

export const FACCIONES: Record<FaccionId, Faccion> = {
  guardia_hierro: {
    id: 'guardia_hierro',
    nombre: 'La Guardia de Hierro',
    dios: 'Ares',
    lider: 'Diomedes',
    poblacionBase: 8400,
    color: '#E24B4A',
    icono: Shield,
    descripcion:
      'Guerreros forjados en el dolor y la repetición. Solo reconocen el cuerpo disciplinado.',
    habitosActivadores: ['gym', 'cardio'],
  },
  escuela_logos: {
    id: 'escuela_logos',
    nombre: 'La Escuela del Logos',
    dios: 'Apolo',
    lider: 'Pitágoras',
    poblacionBase: 5200,
    color: '#378ADD',
    icono: BookOpen,
    descripcion:
      'Custodios del conocimiento. Miden el valor de un hombre por lo que aprende cada día.',
    habitosActivadores: ['lectura'],
  },
  gremio_tierra: {
    id: 'gremio_tierra',
    nombre: 'El Gremio de la Tierra',
    dios: 'Deméter',
    lider: 'Triptólemo',
    poblacionBase: 12000,
    color: '#639922',
    icono: Leaf,
    descripcion:
      'Agricultores del cuerpo. Veneran el agua pura y el rechazo a lo que envenena.',
    habitosActivadores: ['agua', 'alimentacion'],
  },
  hermandad_caos: {
    id: 'hermandad_caos',
    nombre: 'La Hermandad del Caos',
    dios: 'Eris',
    lider: 'Tersites',
    poblacionBase: 3100,
    color: '#D85A30',
    icono: Zap,
    descripcion:
      'Prosperan en el conflicto. Solo se unen a quienes alimentan la llama de la rivalidad.',
    habitosActivadores: ['rivalidad'],
  },
  corredores_alba: {
    id: 'corredores_alba',
    nombre: 'Los Corredores del Alba',
    dios: 'Hermes',
    lider: 'Feidípides',
    poblacionBase: 7600,
    color: '#1D9E75',
    icono: Footprints,
    descripcion:
      'Mensajeros incansables. Respetan a quien mueve el cuerpo antes de que el sol alcance su cenit.',
    habitosActivadores: ['pasos'],
  },
  concilio_sombras: {
    id: 'concilio_sombras',
    nombre: 'El Concilio de las Sombras',
    dios: 'Morfeo',
    lider: 'Endimión',
    poblacionBase: 6800,
    color: '#7F77DD',
    icono: Moon,
    descripcion:
      'Guardianes del descanso sagrado. Desconfían de quien sacrifica el sueño por la gloria.',
    habitosActivadores: ['sueno'],
  },
  tribunal_kleos: {
    id: 'tribunal_kleos',
    nombre: 'El Tribunal del Kleos',
    dios: 'Nike',
    lider: 'Milcíades',
    poblacionBase: 4300,
    color: '#BA7517',
    icono: Trophy,
    descripcion:
      'Jueces implacables de la excelencia. Solo reconocen al que domina sin concesiones.',
    habitosActivadores: ['dia_perfecto', 'hegemonia', 'racha'],
  },
}

export const RANGOS_AFINIDAD: RangoAfinidad[] = [
  { rango: 1, nombre: 'Desconocido', minPuntos: 0, porcentajePoblacion: 0 },
  { rango: 2, nombre: 'Conocido', minPuntos: 20, porcentajePoblacion: 2 },
  { rango: 3, nombre: 'Reconocido', minPuntos: 55, porcentajePoblacion: 8 },
  { rango: 4, nombre: 'Aliado', minPuntos: 100, porcentajePoblacion: 25 },
  { rango: 5, nombre: 'Campeón', minPuntos: 150, porcentajePoblacion: 70 },
]

export const MAX_CAMPEON_FACCIONES = 2

// Puntos por evento — tabla aprobada
export const PUNTOS_EVENTO = {
  demeter_paquete: 10, // agua + alimentación el mismo día
  morfeo_sueno: 8,
  apolo_lectura: 8,
  hermes_pasos: 8,
  ares_gym: 7,
  ares_cardio: 6,
  nike_dia_perfecto: 20,
  nike_hegemonia: 25,
  nike_racha_milestone: 15, // se da en día 7, 14 y 21 de racha
  eris_igualados: 15,
  eris_kleos: 20,
  eris_hegemonia_cambio: 25,
  eris_dia_perfecto_ambos: 30,
} as const

export const RACHA_MILESTONES = [7, 14, 21] as const

export const METAS_HABITO = {
  pasos: 10000,
  horasSueno: 7,
  paginasLeidas: 10,
  sesionesGym: 4,
  sesionesCardio: 3,
} as const

export function calcularRango(puntos: number): number {
  if (puntos >= 150) return 5
  if (puntos >= 100) return 4
  if (puntos >= 55) return 3
  if (puntos >= 20) return 2
  return 1
}

export function getRangoInfo(rango: number): RangoAfinidad {
  return RANGOS_AFINIDAD.find((r) => r.rango === rango) ?? RANGOS_AFINIDAD[0]
}

export function getPoblacionVisible(faccion: Faccion, rango: number): number {
  const rangoInfo = getRangoInfo(rango)
  return Math.floor(
    (faccion.poblacionBase * rangoInfo.porcentajePoblacion) / 100
  )
}

// Ventajas de Campeón — Fase A
// Solo ventajas que NO modifican pruebas/route.ts ni hegemonía

export interface VentajaCampeon {
  faccionId: FaccionId
  titulo: string
  descripcion: string
  nota: string
}

export const VENTAJAS_CAMPEON: Partial<Record<FaccionId, VentajaCampeon>> = {
  concilio_sombras: {
    faccionId: 'concilio_sombras',
    titulo: 'Sueño Sagrado',
    descripcion:
      'Morfeo acepta 6 horas como descanso suficiente. Tu meta de sueño baja a 6h.',
    nota: 'Meta efectiva: horasSueno >= 6 en vez de >= 7',
  },
  escuela_logos: {
    faccionId: 'escuela_logos',
    titulo: 'Lectura Profunda',
    descripcion:
      'Apolo reconoce que 5 páginas con concentración valen más que 10 a medias. Tu meta baja a 5 páginas.',
    nota: 'Meta efectiva: paginasLeidas >= 5 en vez de >= 10',
  },
  corredores_alba: {
    faccionId: 'corredores_alba',
    titulo: 'Paso del Mensajero',
    descripcion:
      'Hermes sabe que 9.000 pasos son suficientes para quien ya es su Campeón.',
    nota: 'Meta efectiva: pasos >= 9000 en vez de >= 10000',
  },
  gremio_tierra: {
    faccionId: 'gremio_tierra',
    titulo: 'Ofrenda de la Tierra',
    descripcion:
      'Deméter recompensa la disciplina doble con más afinidad. El paquete de agua + alimentación otorga 15 pts.',
    nota: 'PUNTOS_EVENTO.demeter_paquete efectivo: 15 en vez de 10',
  },
  guardia_hierro: {
    faccionId: 'guardia_hierro',
    titulo: 'Forja Continua',
    descripcion:
      'Ares recompensa al Campeón con mayor reconocimiento por sesión y exigencia reducida: gym 3 sesiones y cardio 2 bastan.',
    nota: 'Gym: 9 pts / Cardio: 8 pts. Meta semanal: gym >= 3, cardio >= 2',
  },
}
