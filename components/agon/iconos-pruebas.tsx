import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

export interface IconProps {
  className?: string
  size?: number
}

// ─── AGUA ────────────────────────────────────────────
export function IconoAgua({ className, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('flex-shrink-0', className)}
    >
      <path
        d="M12 2C12 2 5 9.5 5 14.5C5 18.09 8.13 21 12 21C15.87 21 19 18.09 19 14.5C19 9.5 12 2 12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 15.5C8.5 17.5 10.5 18.5 12.5 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── COMIDA ──────────────────────────────────────────
export function IconoComida({ className, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('flex-shrink-0', className)}
    >
      {/* Escudo */}
      <path
        d="M12 3L4 6V12C4 16.4 7.4 20.5 12 21C16.6 20.5 20 16.4 20 12V6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Check dentro del escudo */}
      <path
        d="M8.5 12L10.5 14L15.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── PASOS ───────────────────────────────────────────
export function IconoPasos({ className, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('flex-shrink-0', className)}
    >
      {/* Pie izquierdo */}
      <path
        d="M8 6C8 4.9 8.9 4 10 4H11C12.1 4 13 4.9 13 6V10C13 11.1 12.1 12 11 12H9C7.9 12 7 11.1 7 10L8 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pie derecho */}
      <path
        d="M14 12C14 10.9 14.9 10 16 10H17C18.1 10 19 10.9 19 12V16C19 17.1 18.1 18 17 18H15C13.9 18 13 17.1 13 16L14 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dedos pie izquierdo */}
      <path d="M8 6H13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      {/* Dedos pie derecho */}
      <path d="M14 12H19" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

// ─── SUEÑO ───────────────────────────────────────────
export function IconoSueno({ className, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('flex-shrink-0', className)}
    >
      {/* Luna creciente */}
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Estrellas */}
      <circle cx="17" cy="5" r="0.8" fill="currentColor" />
      <circle cx="20" cy="8" r="0.6" fill="currentColor" />
      <circle cx="19" cy="3" r="0.5" fill="currentColor" />
    </svg>
  )
}

// ─── LECTURA ─────────────────────────────────────────
export function IconoLectura({ className, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('flex-shrink-0', className)}
    >
      {/* Libro abierto */}
      <path
        d="M2 6C2 6 6 5 12 5C18 5 22 6 22 6V19C22 19 18 18 12 18C6 18 2 19 2 19V6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Lomo del libro */}
      <line
        x1="12"
        y1="5"
        x2="12"
        y2="18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Líneas de texto izquierda */}
      <line x1="5" y1="9" x2="10" y2="9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="5" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="5" y1="15" x2="10" y2="15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      {/* Líneas de texto derecha */}
      <line x1="14" y1="9" x2="19" y2="9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="14" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="14" y1="15" x2="19" y2="15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

// ─── GYM ─────────────────────────────────────────────
export function IconoGym({ className, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('flex-shrink-0', className)}
    >
      {/* Barra central */}
      <line
        x1="8"
        y1="12"
        x2="16"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Soporte izquierdo */}
      <line
        x1="5"
        y1="9"
        x2="5"
        y2="15"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Soporte derecho */}
      <line
        x1="19"
        y1="9"
        x2="19"
        y2="15"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Peso izquierdo exterior */}
      <line
        x1="2"
        y1="10"
        x2="2"
        y2="14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Peso derecho exterior */}
      <line
        x1="22"
        y1="10"
        x2="22"
        y2="14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Conectores izquierdos */}
      <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Conectores derechos */}
      <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── CARDIO ──────────────────────────────────────────
export function IconoCardio({ className, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('flex-shrink-0', className)}
    >
      {/* Corazón */}
      <path
        d="M12 21C12 21 3 15 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.81 3.81 12 5C12.19 3.81 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 15 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Rayo sobre el corazón */}
      <path
        d="M12 5L10 9H13L11 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── MAP: id → componente ─────────────────────────────
export const ICONOS_PRUEBAS: Record<string, ComponentType<IconProps>> = {
  agua: IconoAgua,
  comida: IconoComida,
  pasos: IconoPasos,
  sueno: IconoSueno,
  lectura: IconoLectura,
  gym: IconoGym,
  cardio: IconoCardio,
}
