import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, parseISO, startOfDay } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Día 1 = `fechaInicio` del reto; acotado a 1–29. */
export function getDiaDelAgan(fechaInicio: string): number {
  const inicio = startOfDay(parseISO(fechaInicio))
  const hoy = startOfDay(new Date())
  const diff = differenceInDays(hoy, inicio) + 1
  return Math.max(1, Math.min(diff, 29))
}

/** Día del reto (1–29) para una fecha concreta respecto al inicio del reto. */
export function getDiaDelRetoRelativo(fechaInicio: string, fecha: Date): number {
  const inicio = startOfDay(parseISO(fechaInicio))
  const ref = startOfDay(fecha)
  const diff = differenceInDays(ref, inicio) + 1
  return Math.max(1, Math.min(diff, 29))
}

/** Días hasta el día 29 del Gran Agon (anclado a `fechaInicio`). */
export function getDiasRestantes(fechaInicio: string): number {
  const dia = getDiaDelAgan(fechaInicio)
  return Math.max(0, 29 - dia)
}

export function isGranAgonActivo(fechaInicio: string, fechaFin: string): boolean {
  const inicio = startOfDay(parseISO(fechaInicio))
  const fin = startOfDay(parseISO(fechaFin))
  const hoy = startOfDay(new Date())
  return hoy >= inicio && hoy <= fin
}

/** Ceremonia del Veredicto: día 29 en adelante (índice del Agon desde `fechaInicio`). */
export function isVeredictoDay(fechaInicio: string): boolean {
  return getDiaDelAgan(fechaInicio) >= 29
}

/** Último día del periodo de 29 días (día 29 del Agon). */
export function isUltimoDia(fechaInicio: string): boolean {
  return getDiaDelAgan(fechaInicio) === 29
}

export function formatKleos(cantidad: number): string {
  return cantidad.toLocaleString('es-CL')
}

export function calcularAdherencia(
  pruebasCompletadas: number,
  pruebasTotales: number
): number {
  if (pruebasTotales === 0) return 0
  return Math.round((pruebasCompletadas / pruebasTotales) * 100)
}

export function getMensajeHora(): string {
  const hora = new Date().getHours()
  if (hora < 7) return 'El agonista que madruga gana la mitad del agon.'
  if (hora < 12) return 'La mañana es tuya. El agon también.'
  if (hora < 17)
    return 'La tarde es donde se separan los agonistas de los aspirantes.'
  if (hora < 20) return 'Quedan horas. El Altis sigue contando.'
  if (hora < 22) return 'El agon de hoy aún puede ser tuyo.'
  return 'El tiempo se acaba. El Altis espera.'
}
