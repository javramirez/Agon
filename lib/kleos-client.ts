// Réplica client-side de la lógica de kleos del servidor
// Permite calcular el kleos localmente sin esperar al servidor

import {
  KLEOS_POR_PRUEBA,
  KLEOS_DIA_PERFECTO,
  KLEOS_DIA_PERFECTO_NIVEL_9,
} from '@/lib/db/constants'
import { METAS_HABITO } from '@/lib/facciones/config'

export const KLEOS_BASE = {
  agua: KLEOS_POR_PRUEBA.agua.base,
  comida: KLEOS_POR_PRUEBA.comida.base,
  pasos: KLEOS_POR_PRUEBA.pasos.base,
  sueno: KLEOS_POR_PRUEBA.sueno.base,
  lectura: KLEOS_POR_PRUEBA.lectura.base,
  gym: KLEOS_POR_PRUEBA.gym.base,
  cardio: KLEOS_POR_PRUEBA.cardio.base,
} as const

export { KLEOS_DIA_PERFECTO, KLEOS_DIA_PERFECTO_NIVEL_9 }

export interface EstadoPruebas {
  soloAgua: boolean
  sinComidaRapida: boolean
  pasos: number
  horasSueno: number
  paginasLeidas: number
  sesionesGym: number
  sesionesCardio: number
}

/** Umbrales de hábitos (p. ej. ventajas de Campeón). */
export interface MetasUmbralHabito {
  pasos: number
  horasSueno: number
  paginasLeidas: number
  sesionesGym: number
  sesionesCardio: number
}

const METAS_DEFAULT: MetasUmbralHabito = {
  pasos: METAS_HABITO.pasos,
  horasSueno: METAS_HABITO.horasSueno,
  paginasLeidas: METAS_HABITO.paginasLeidas,
  sesionesGym: METAS_HABITO.sesionesGym,
  sesionesCardio: METAS_HABITO.sesionesCardio,
}

function metasResueltas(m?: Partial<MetasUmbralHabito>): MetasUmbralHabito {
  return {
    pasos: m?.pasos ?? METAS_DEFAULT.pasos,
    horasSueno: m?.horasSueno ?? METAS_DEFAULT.horasSueno,
    paginasLeidas: m?.paginasLeidas ?? METAS_DEFAULT.paginasLeidas,
    sesionesGym: m?.sesionesGym ?? METAS_DEFAULT.sesionesGym,
    sesionesCardio: m?.sesionesCardio ?? METAS_DEFAULT.sesionesCardio,
  }
}

export function calcularKleosLocal(
  estado: EstadoPruebas,
  multiplicadorRacha: number = 1,
  multiplicadorSagrado: number = 1,
  nivel: string = 'aspirante',
  metasEfectivas?: Partial<MetasUmbralHabito>
): number {
  const m = metasResueltas(metasEfectivas)
  const mult = multiplicadorRacha * multiplicadorSagrado
  let total = 0
  const k = KLEOS_POR_PRUEBA

  if (estado.soloAgua) total += Math.round(k.agua.base * mult)
  if (estado.sinComidaRapida) total += Math.round(k.comida.base * mult)
  if (estado.pasos >= m.pasos) total += Math.round(k.pasos.base * mult)
  if (estado.horasSueno >= m.horasSueno) total += Math.round(k.sueno.base * mult)
  if (estado.paginasLeidas >= m.paginasLeidas) total += Math.round(k.lectura.base * mult)
  if (estado.sesionesGym >= m.sesionesGym) total += Math.round(k.gym.base * mult)
  if (estado.sesionesCardio >= m.sesionesCardio) total += Math.round(k.cardio.base * mult)

  if (esDiaPerfectoLocal(estado, metasEfectivas)) {
    const bonus =
      nivel === 'leyenda_del_agon' || nivel === 'inmortal'
        ? KLEOS_DIA_PERFECTO_NIVEL_9
        : KLEOS_DIA_PERFECTO
    total += bonus
  }

  return total
}

export function esDiaPerfectoLocal(
  estado: EstadoPruebas,
  metasEfectivas?: Partial<MetasUmbralHabito>
): boolean {
  const m = metasResueltas(metasEfectivas)
  return (
    estado.soloAgua &&
    estado.sinComidaRapida &&
    estado.pasos >= m.pasos &&
    estado.horasSueno >= m.horasSueno &&
    estado.paginasLeidas >= m.paginasLeidas &&
    estado.sesionesGym >= m.sesionesGym &&
    estado.sesionesCardio >= m.sesionesCardio
  )
}

export function aplicarCambio(
  estado: EstadoPruebas,
  campo: string,
  valor: boolean | number
): EstadoPruebas {
  return { ...estado, [campoToKey(campo)]: valor }
}

function campoToKey(campo: string): keyof EstadoPruebas {
  const map: Record<string, keyof EstadoPruebas> = {
    soloAgua: 'soloAgua',
    sinComidaRapida: 'sinComidaRapida',
    pasos: 'pasos',
    horasSueno: 'horasSueno',
    paginasLeidas: 'paginasLeidas',
    sesionesGym: 'sesionesGym',
    sesionesCardio: 'sesionesCardio',
  }
  return map[campo] ?? (campo as keyof EstadoPruebas)
}
