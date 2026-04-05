export type Agonista = {
  clerkId: string
  nombre: string
  apodo: string
}

export type Prueba = {
  id: string
  nombre: string
  tipo: 'toggle' | 'contador' | 'contador_semanal'
  kleos: number
  kleosConRacha: number
  unidad?: string
  meta?: number
}

export const PRUEBAS: Prueba[] = [
  { id: 'agua', nombre: 'Solo agua', tipo: 'toggle', kleos: 10, kleosConRacha: 15 },
  { id: 'comida', nombre: 'Sin comida rápida', tipo: 'toggle', kleos: 10, kleosConRacha: 15 },
  { id: 'pasos', nombre: 'Pasos', tipo: 'contador', kleos: 20, kleosConRacha: 30, unidad: 'pasos', meta: 10000 },
  { id: 'sueno', nombre: 'Horas de sueño', tipo: 'contador', kleos: 15, kleosConRacha: 22, unidad: 'horas', meta: 7 },
  { id: 'lectura', nombre: 'Páginas leídas', tipo: 'contador', kleos: 15, kleosConRacha: 22, unidad: 'páginas', meta: 10 },
  { id: 'gym', nombre: 'Gym', tipo: 'contador_semanal', kleos: 30, kleosConRacha: 45, unidad: 'sesiones', meta: 4 },
  { id: 'cardio', nombre: 'Cardio', tipo: 'contador_semanal', kleos: 25, kleosConRacha: 38, unidad: 'sesiones', meta: 3 },
]

export { KLEOS_DIA_PERFECTO, KLEOS_DIA_PERFECTO_NIVEL_9 } from '@/lib/db/constants'
