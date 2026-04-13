/**
 * Configuración visual de los dioses del Agon.
 * Conecta los datos de config.ts con los assets visuales.
 */

export interface DiosVisualConfig {
  imagen: string
  colorPrimario: string
  colorGlow: string
  colorBorde: string
  colorTexto: string
  colorFondo: string
}

export const DIOSES_VISUAL: Record<string, DiosVisualConfig> = {
  ares: {
    imagen: '/dioses/ares.jpg',
    colorPrimario: '#C41E1E',
    colorGlow: 'rgba(196, 30, 30, 0.4)',
    colorBorde: 'rgba(196, 30, 30, 0.35)',
    colorTexto: '#F87171',
    colorFondo: 'rgba(196, 30, 30, 0.06)',
  },
  apolo: {
    imagen: '/dioses/apolo.png',
    colorPrimario: '#3B82F6',
    colorGlow: 'rgba(59, 130, 246, 0.4)',
    colorBorde: 'rgba(59, 130, 246, 0.35)',
    colorTexto: '#93C5FD',
    colorFondo: 'rgba(59, 130, 246, 0.06)',
  },
  demeter: {
    imagen: '/dioses/demeter.png',
    colorPrimario: '#22C55E',
    colorGlow: 'rgba(34, 197, 94, 0.4)',
    colorBorde: 'rgba(34, 197, 94, 0.35)',
    colorTexto: '#86EFAC',
    colorFondo: 'rgba(34, 197, 94, 0.06)',
  },
  eris: {
    imagen: '/dioses/eris.png',
    colorPrimario: '#9CA3AF',
    colorGlow: 'rgba(156, 163, 175, 0.3)',
    colorBorde: 'rgba(156, 163, 175, 0.3)',
    colorTexto: '#D1D5DB',
    colorFondo: 'rgba(156, 163, 175, 0.05)',
  },
  hermes: {
    imagen: '/dioses/hermes.png',
    colorPrimario: '#D97706',
    colorGlow: 'rgba(217, 119, 6, 0.4)',
    colorBorde: 'rgba(217, 119, 6, 0.35)',
    colorTexto: '#FCD34D',
    colorFondo: 'rgba(217, 119, 6, 0.06)',
  },
  morfeo: {
    imagen: '/dioses/morfeo.jpg',
    colorPrimario: '#7C3AED',
    colorGlow: 'rgba(124, 58, 237, 0.4)',
    colorBorde: 'rgba(124, 58, 237, 0.35)',
    colorTexto: '#C4B5FD',
    colorFondo: 'rgba(124, 58, 237, 0.07)',
  },
  nike: {
    imagen: '/dioses/nike.png',
    colorPrimario: '#F59E0B',
    colorGlow: 'rgba(245, 158, 11, 0.45)',
    colorBorde: 'rgba(245, 158, 11, 0.4)',
    colorTexto: '#FDE68A',
    colorFondo: 'rgba(245, 158, 11, 0.07)',
  },
}

export function getDiosVisual(nombre: string): DiosVisualConfig | null {
  return DIOSES_VISUAL[nombre.toLowerCase()] ?? null
}
