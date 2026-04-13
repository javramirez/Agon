// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type Narrative = 'origen' | 'consistencia' | 'gloria' | 'legado' | 'easter_egg'
export type Intensity = 'forjada' | 'templada' | 'epica'

export interface VisualTokens {
  // Colores base
  primaryColor: string // Color dominante (hex)
  secondaryColor: string // Color secundario
  glowColor: string // Color del glow (rgba)
  bgGradient: string // Gradiente del fondo de la carta

  // Marco
  borderColor: string // Color del borde
  borderGlow: string // box-shadow del borde

  // Partículas
  particleColor: string
  particleDensity: number // 20 | 60 | 120
  particleSize: number // 2 | 3 | 4

  // Efectos de luz
  lightRays: boolean
  lightRayColor: string
  glowIntensity: number // 0.3 | 0.6 | 1.0

  // Cámara
  shake: number // 0 | 0.3 | 0.8
  scaleOnReveal: number // 1.0 | 1.05 | 1.12

  // Flash
  flashColor: string // Color del flash en el peak
  flashIntensity: number // 0.4 | 0.7 | 1.0

  // Fondo animado (Épica + Easter Egg)
  animatedBg: boolean
  bgAnimation: 'none' | 'columns' | 'flames' | 'sunburst' | 'runes' | 'custom'

  // Tipografía
  titleColor: string
  subtitleColor: string

  // Label de categoría
  categoryLabel: string
  categoryColor: string
}

// ─── SISTEMA VISUAL ───────────────────────────────────────────────────────────

export const VISUAL_SYSTEM: Record<Narrative, Record<Intensity, VisualTokens>> = {
  // ══════════════════════════════════════════════════════
  // EL ORIGEN — Azul / Mármol / Nacimiento
  // ══════════════════════════════════════════════════════
  origen: {
    forjada: {
      primaryColor: '#93a5cf',
      secondaryColor: '#5a7aad',
      glowColor: 'rgba(100,140,210,0.3)',
      bgGradient: 'linear-gradient(180deg, #1a1f2e 0%, #0d1117 100%)',
      borderColor: 'rgba(147,165,207,0.35)',
      borderGlow: '0 0 8px rgba(100,140,210,0.15)',
      particleColor: '#93a5cf',
      particleDensity: 20,
      particleSize: 2,
      lightRays: false,
      lightRayColor: 'rgba(100,140,210,0.4)',
      glowIntensity: 0.3,
      shake: 0,
      scaleOnReveal: 1.0,
      flashColor: 'rgba(147,165,207,0.4)',
      flashIntensity: 0.4,
      animatedBg: false,
      bgAnimation: 'none',
      titleColor: '#93a5cf',
      subtitleColor: '#5a7aad',
      categoryLabel: 'El Origen · Forjada',
      categoryColor: 'rgba(147,165,207,0.5)',
    },
    templada: {
      primaryColor: '#7eb4f0',
      secondaryColor: '#4a8fd4',
      glowColor: 'rgba(80,140,220,0.4)',
      bgGradient: 'linear-gradient(180deg, #1a2040 0%, #0d1228 100%)',
      borderColor: 'rgba(100,140,220,0.55)',
      borderGlow: '0 0 16px rgba(80,140,220,0.2), 0 0 4px rgba(80,140,220,0.4)',
      particleColor: '#7eb4f0',
      particleDensity: 60,
      particleSize: 3,
      lightRays: false,
      lightRayColor: 'rgba(80,140,220,0.5)',
      glowIntensity: 0.6,
      shake: 0.3,
      scaleOnReveal: 1.05,
      flashColor: 'rgba(100,160,255,0.6)',
      flashIntensity: 0.7,
      animatedBg: false,
      bgAnimation: 'none',
      titleColor: '#7eb4f0',
      subtitleColor: '#4a8fd4',
      categoryLabel: 'El Origen · Templada',
      categoryColor: 'rgba(100,140,220,0.6)',
    },
    epica: {
      primaryColor: '#a8d4ff',
      secondaryColor: '#5090e0',
      glowColor: 'rgba(80,140,255,0.6)',
      bgGradient: 'linear-gradient(180deg, #05080f 0%, #020408 100%)',
      borderColor: 'rgba(80,140,255,0.8)',
      borderGlow: '0 0 30px rgba(80,140,255,0.3), 0 0 8px rgba(80,140,255,0.6)',
      particleColor: '#a8d4ff',
      particleDensity: 120,
      particleSize: 4,
      lightRays: true,
      lightRayColor: 'rgba(120,180,255,0.7)',
      glowIntensity: 1.0,
      shake: 0.8,
      scaleOnReveal: 1.12,
      flashColor: 'rgba(160,210,255,0.9)',
      flashIntensity: 1.0,
      animatedBg: true,
      bgAnimation: 'columns',
      titleColor: '#a8d4ff',
      subtitleColor: '#5090e0',
      categoryLabel: 'El Origen · Épica',
      categoryColor: 'rgba(80,140,255,0.7)',
    },
  },

  // ══════════════════════════════════════════════════════
  // LA CONSISTENCIA — Naranja / Fuego / Forja
  // ══════════════════════════════════════════════════════
  consistencia: {
    forjada: {
      primaryColor: '#c87830',
      secondaryColor: '#8a4e18',
      glowColor: 'rgba(180,100,20,0.3)',
      bgGradient: 'linear-gradient(180deg, #1a0e00 0%, #0d0800 100%)',
      borderColor: 'rgba(180,100,20,0.35)',
      borderGlow: '0 0 8px rgba(180,100,20,0.15)',
      particleColor: '#c87830',
      particleDensity: 20,
      particleSize: 2,
      lightRays: false,
      lightRayColor: 'rgba(200,120,40,0.4)',
      glowIntensity: 0.3,
      shake: 0,
      scaleOnReveal: 1.0,
      flashColor: 'rgba(200,120,40,0.4)',
      flashIntensity: 0.4,
      animatedBg: false,
      bgAnimation: 'none',
      titleColor: '#c87830',
      subtitleColor: '#8a4e18',
      categoryLabel: 'La Consistencia · Forjada',
      categoryColor: 'rgba(180,100,20,0.5)',
    },
    templada: {
      primaryColor: '#ff8040',
      secondaryColor: '#c05020',
      glowColor: 'rgba(220,100,20,0.45)',
      bgGradient: 'linear-gradient(180deg, #200d00 0%, #100600 100%)',
      borderColor: 'rgba(220,100,20,0.6)',
      borderGlow: '0 0 16px rgba(220,100,20,0.2), 0 0 4px rgba(220,100,20,0.5)',
      particleColor: '#ff8040',
      particleDensity: 60,
      particleSize: 3,
      lightRays: false,
      lightRayColor: 'rgba(220,100,20,0.5)',
      glowIntensity: 0.6,
      shake: 0.3,
      scaleOnReveal: 1.05,
      flashColor: 'rgba(255,120,40,0.7)',
      flashIntensity: 0.7,
      animatedBg: false,
      bgAnimation: 'none',
      titleColor: '#ff8040',
      subtitleColor: '#c05020',
      categoryLabel: 'La Consistencia · Templada',
      categoryColor: 'rgba(220,100,20,0.6)',
    },
    epica: {
      primaryColor: '#ffb060',
      secondaryColor: '#cc6020',
      glowColor: 'rgba(255,100,0,0.6)',
      bgGradient: 'linear-gradient(180deg, #0f0800 0%, #070400 100%)',
      borderColor: 'rgba(220,80,20,0.8)',
      borderGlow: '0 0 30px rgba(220,80,20,0.3), 0 0 8px rgba(220,80,20,0.7)',
      particleColor: '#ffb060',
      particleDensity: 120,
      particleSize: 4,
      lightRays: true,
      lightRayColor: 'rgba(255,140,40,0.7)',
      glowIntensity: 1.0,
      shake: 0.8,
      scaleOnReveal: 1.12,
      flashColor: 'rgba(255,160,60,0.9)',
      flashIntensity: 1.0,
      animatedBg: true,
      bgAnimation: 'flames',
      titleColor: '#ffb060',
      subtitleColor: '#cc6020',
      categoryLabel: 'La Consistencia · Épica',
      categoryColor: 'rgba(220,80,20,0.7)',
    },
  },

  // ══════════════════════════════════════════════════════
  // LA GLORIA — Dorado / Luz / Olimpo
  // ══════════════════════════════════════════════════════
  gloria: {
    forjada: {
      primaryColor: '#c8a030',
      secondaryColor: '#8a6818',
      glowColor: 'rgba(200,160,40,0.3)',
      bgGradient: 'linear-gradient(180deg, #1a1500 0%, #0d0b00 100%)',
      borderColor: 'rgba(200,160,40,0.35)',
      borderGlow: '0 0 8px rgba(200,160,40,0.15)',
      particleColor: '#c8a030',
      particleDensity: 20,
      particleSize: 2,
      lightRays: false,
      lightRayColor: 'rgba(200,160,40,0.4)',
      glowIntensity: 0.3,
      shake: 0,
      scaleOnReveal: 1.0,
      flashColor: 'rgba(200,160,40,0.4)',
      flashIntensity: 0.4,
      animatedBg: false,
      bgAnimation: 'none',
      titleColor: '#c8a030',
      subtitleColor: '#8a6818',
      categoryLabel: 'La Gloria · Forjada',
      categoryColor: 'rgba(200,160,40,0.5)',
    },
    templada: {
      primaryColor: '#f0c040',
      secondaryColor: '#b08020',
      glowColor: 'rgba(220,170,40,0.45)',
      bgGradient: 'linear-gradient(180deg, #1a1200 0%, #0d0900 100%)',
      borderColor: 'rgba(220,170,40,0.6)',
      borderGlow: '0 0 16px rgba(220,170,40,0.2), 0 0 4px rgba(220,170,40,0.5)',
      particleColor: '#f0c040',
      particleDensity: 60,
      particleSize: 3,
      lightRays: false,
      lightRayColor: 'rgba(220,170,40,0.5)',
      glowIntensity: 0.6,
      shake: 0.3,
      scaleOnReveal: 1.05,
      flashColor: 'rgba(240,200,60,0.7)',
      flashIntensity: 0.7,
      animatedBg: false,
      bgAnimation: 'none',
      titleColor: '#f0c040',
      subtitleColor: '#b08020',
      categoryLabel: 'La Gloria · Templada',
      categoryColor: 'rgba(220,170,40,0.6)',
    },
    epica: {
      primaryColor: '#ffd760',
      secondaryColor: '#c09020',
      glowColor: 'rgba(245,158,11,0.7)',
      bgGradient: 'linear-gradient(180deg, #0a0800 0%, #050400 100%)',
      borderColor: 'rgba(245,158,11,0.9)',
      borderGlow: '0 0 40px rgba(245,158,11,0.4), 0 0 10px rgba(245,158,11,0.8)',
      particleColor: '#ffd760',
      particleDensity: 120,
      particleSize: 4,
      lightRays: true,
      lightRayColor: 'rgba(255,220,80,0.8)',
      glowIntensity: 1.0,
      shake: 0.8,
      scaleOnReveal: 1.12,
      flashColor: 'rgba(255,230,100,1.0)',
      flashIntensity: 1.0,
      animatedBg: true,
      bgAnimation: 'sunburst',
      titleColor: '#ffd760',
      subtitleColor: '#c09020',
      categoryLabel: 'La Gloria · Épica',
      categoryColor: 'rgba(245,158,11,0.7)',
    },
  },

  // ══════════════════════════════════════════════════════
  // EL LEGADO — Púrpura / Piedra / Eternidad
  // ══════════════════════════════════════════════════════
  legado: {
    forjada: {
      primaryColor: '#9060c0',
      secondaryColor: '#604080',
      glowColor: 'rgba(120,60,180,0.3)',
      bgGradient: 'linear-gradient(180deg, #0e0818 0%, #070410 100%)',
      borderColor: 'rgba(120,60,180,0.35)',
      borderGlow: '0 0 8px rgba(120,60,180,0.15)',
      particleColor: '#9060c0',
      particleDensity: 20,
      particleSize: 2,
      lightRays: false,
      lightRayColor: 'rgba(150,80,220,0.4)',
      glowIntensity: 0.3,
      shake: 0,
      scaleOnReveal: 1.0,
      flashColor: 'rgba(150,80,220,0.4)',
      flashIntensity: 0.4,
      animatedBg: false,
      bgAnimation: 'none',
      titleColor: '#9060c0',
      subtitleColor: '#604080',
      categoryLabel: 'El Legado · Forjada',
      categoryColor: 'rgba(120,60,180,0.5)',
    },
    templada: {
      primaryColor: '#c080ff',
      secondaryColor: '#8040c0',
      glowColor: 'rgba(150,70,230,0.45)',
      bgGradient: 'linear-gradient(180deg, #100820 0%, #080412 100%)',
      borderColor: 'rgba(150,70,230,0.6)',
      borderGlow: '0 0 16px rgba(150,70,230,0.2), 0 0 4px rgba(150,70,230,0.5)',
      particleColor: '#c080ff',
      particleDensity: 60,
      particleSize: 3,
      lightRays: false,
      lightRayColor: 'rgba(150,70,230,0.5)',
      glowIntensity: 0.6,
      shake: 0.3,
      scaleOnReveal: 1.05,
      flashColor: 'rgba(180,100,255,0.7)',
      flashIntensity: 0.7,
      animatedBg: false,
      bgAnimation: 'none',
      titleColor: '#c080ff',
      subtitleColor: '#8040c0',
      categoryLabel: 'El Legado · Templada',
      categoryColor: 'rgba(150,70,230,0.6)',
    },
    epica: {
      primaryColor: '#d4a8ff',
      secondaryColor: '#9050e0',
      glowColor: 'rgba(150,80,220,0.7)',
      bgGradient: 'linear-gradient(180deg, #040208 0%, #020104 100%)',
      borderColor: 'rgba(150,80,220,0.85)',
      borderGlow: '0 0 30px rgba(150,80,220,0.35), 0 0 8px rgba(150,80,220,0.7)',
      particleColor: '#d4a8ff',
      particleDensity: 120,
      particleSize: 4,
      lightRays: true,
      lightRayColor: 'rgba(180,100,255,0.7)',
      glowIntensity: 1.0,
      shake: 0.8,
      scaleOnReveal: 1.12,
      flashColor: 'rgba(200,140,255,0.9)',
      flashIntensity: 1.0,
      animatedBg: true,
      bgAnimation: 'runes',
      titleColor: '#d4a8ff',
      subtitleColor: '#9050e0',
      categoryLabel: 'El Legado · Épica',
      categoryColor: 'rgba(150,80,220,0.7)',
    },
  },

  // ══════════════════════════════════════════════════════
  // EASTER EGG — Dorado máximo / Carta personalizada
  // ══════════════════════════════════════════════════════
  easter_egg: {
    forjada: {
      primaryColor: '#F59E0B',
      secondaryColor: '#8B4513',
      glowColor: 'rgba(245,158,11,0.7)',
      bgGradient: 'linear-gradient(180deg, #0a0505 0%, #050202 100%)',
      borderColor: 'rgba(245,158,11,0.8)',
      borderGlow: '0 0 30px rgba(245,158,11,0.3)',
      particleColor: '#F59E0B',
      particleDensity: 120,
      particleSize: 4,
      lightRays: true,
      lightRayColor: 'rgba(245,158,11,0.7)',
      glowIntensity: 1.0,
      shake: 0.8,
      scaleOnReveal: 1.12,
      flashColor: 'rgba(255,220,80,1.0)',
      flashIntensity: 1.0,
      animatedBg: true,
      bgAnimation: 'custom',
      titleColor: '#F59E0B',
      subtitleColor: '#8B4513',
      categoryLabel: '✦ Easter Egg ✦',
      categoryColor: 'rgba(245,158,11,0.7)',
    },
    templada: {
      primaryColor: '#F59E0B',
      secondaryColor: '#8B4513',
      glowColor: 'rgba(245,158,11,0.7)',
      bgGradient: 'linear-gradient(180deg, #0a0505 0%, #050202 100%)',
      borderColor: 'rgba(245,158,11,0.8)',
      borderGlow: '0 0 30px rgba(245,158,11,0.3)',
      particleColor: '#F59E0B',
      particleDensity: 120,
      particleSize: 4,
      lightRays: true,
      lightRayColor: 'rgba(245,158,11,0.7)',
      glowIntensity: 1.0,
      shake: 0.8,
      scaleOnReveal: 1.12,
      flashColor: 'rgba(255,220,80,1.0)',
      flashIntensity: 1.0,
      animatedBg: true,
      bgAnimation: 'custom',
      titleColor: '#F59E0B',
      subtitleColor: '#8B4513',
      categoryLabel: '✦ Easter Egg ✦',
      categoryColor: 'rgba(245,158,11,0.7)',
    },
    epica: {
      primaryColor: '#F59E0B',
      secondaryColor: '#8B4513',
      glowColor: 'rgba(245,158,11,0.8)',
      bgGradient: 'linear-gradient(180deg, #0a0505 0%, #050202 100%)',
      borderColor: 'rgba(245,158,11,0.9)',
      borderGlow: '0 0 40px rgba(245,158,11,0.4), 0 0 10px rgba(245,158,11,0.8)',
      particleColor: '#F59E0B',
      particleDensity: 150,
      particleSize: 4,
      lightRays: true,
      lightRayColor: 'rgba(245,158,11,0.8)',
      glowIntensity: 1.0,
      shake: 1.0,
      scaleOnReveal: 1.15,
      flashColor: 'rgba(255,240,100,1.0)',
      flashIntensity: 1.0,
      animatedBg: true,
      bgAnimation: 'custom',
      titleColor: '#F59E0B',
      subtitleColor: '#c07820',
      categoryLabel: '✦ Easter Egg ✦',
      categoryColor: 'rgba(245,158,11,0.8)',
    },
  },
}

// ─── HELPER: obtener tokens desde una inscripción ──────────────────────────────

export type NarrativeKey = keyof typeof VISUAL_SYSTEM
export type IntensityKey = keyof typeof VISUAL_SYSTEM.origen

// Mapa de inscripción ID → narrativa + intensidad
export const INSCRIPCION_VISUAL_MAP: Record<
  string,
  { narrative: NarrativeKey; intensity: IntensityKey }
> = {
  // ── EL ORIGEN ──────────────────────────────────────────
  el_bautismo: { narrative: 'origen', intensity: 'forjada' },
  el_primer_combate: { narrative: 'origen', intensity: 'forjada' },
  la_primera_carrera: { narrative: 'origen', intensity: 'forjada' },
  el_primer_paso: { narrative: 'origen', intensity: 'forjada' },
  el_despertar_de_apolo: { narrative: 'origen', intensity: 'forjada' },
  el_heraldo: { narrative: 'origen', intensity: 'forjada' },
  el_iniciado: { narrative: 'origen', intensity: 'templada' },
  el_punto_sin_retorno: { narrative: 'origen', intensity: 'epica' },

  // ── LA CONSISTENCIA ────────────────────────────────────
  la_llama_viva: { narrative: 'consistencia', intensity: 'forjada' },
  agua_sagrada: { narrative: 'consistencia', intensity: 'forjada' },
  el_caminante: { narrative: 'consistencia', intensity: 'forjada' },
  el_discipulo_de_morfeo: { narrative: 'consistencia', intensity: 'forjada' },
  ayuno_de_hierro: { narrative: 'consistencia', intensity: 'templada' },
  el_madrugador: { narrative: 'consistencia', intensity: 'templada' },
  la_bestia: { narrative: 'consistencia', intensity: 'templada' },
  el_estoico: { narrative: 'consistencia', intensity: 'templada' },
  furia_del_agon: { narrative: 'consistencia', intensity: 'templada' },
  la_constancia: { narrative: 'consistencia', intensity: 'templada' },
  los_diez_del_altis: { narrative: 'consistencia', intensity: 'templada' },
  el_lector_voraz: { narrative: 'consistencia', intensity: 'templada' },
  el_rey_del_cardio: { narrative: 'consistencia', intensity: 'templada' },
  el_purista: { narrative: 'consistencia', intensity: 'epica' },
  la_pureza_del_agua: { narrative: 'consistencia', intensity: 'epica' },
  los_veinte_del_olimpo: { narrative: 'consistencia', intensity: 'epica' },
  la_biblioteca_del_agon: { narrative: 'consistencia', intensity: 'epica' },
  semana_olimpica: { narrative: 'consistencia', intensity: 'epica' },

  // ── LA GLORIA ──────────────────────────────────────────
  el_atleta_forjado: { narrative: 'gloria', intensity: 'forjada' },
  filosofo_del_agon: { narrative: 'gloria', intensity: 'forjada' },
  el_mil_kleos: { narrative: 'gloria', intensity: 'forjada' },
  el_agonista_forjado: { narrative: 'gloria', intensity: 'forjada' },
  el_campeon_del_altis: { narrative: 'gloria', intensity: 'templada' },
  los_dos_mil: { narrative: 'gloria', intensity: 'templada' },
  el_heroe_del_altis: { narrative: 'gloria', intensity: 'templada' },
  el_semidios: { narrative: 'gloria', intensity: 'epica' },
  el_olimpico: { narrative: 'gloria', intensity: 'epica' },
  la_gloria_maxima: { narrative: 'gloria', intensity: 'epica' },

  // ── EL LEGADO ──────────────────────────────────────────
  la_mitad_del_agon: { narrative: 'legado', intensity: 'forjada' },
  gemelos_del_agon: { narrative: 'legado', intensity: 'templada' },
  imparable: { narrative: 'legado', intensity: 'templada' },
  la_remontada: { narrative: 'legado', intensity: 'epica' },
  el_gran_agon: { narrative: 'legado', intensity: 'epica' },

  // ── SECRETAS ───────────────────────────────────────────
  guardian_de_la_noche: { narrative: 'origen', intensity: 'templada' },
  el_insomnio: { narrative: 'origen', intensity: 'templada' },
  el_primero_del_olimpo: { narrative: 'origen', intensity: 'epica' },
  precision_del_sabio: { narrative: 'consistencia', intensity: 'templada' },
  agonista_invisible: { narrative: 'consistencia', intensity: 'templada' },
  mas_alla_del_contrato: { narrative: 'consistencia', intensity: 'epica' },
  el_monje_del_altis: { narrative: 'consistencia', intensity: 'epica' },
  la_cadena_de_oro: { narrative: 'consistencia', intensity: 'epica' },
  el_hijo_de_ares: { narrative: 'consistencia', intensity: 'epica' },
  el_cuerpo_sin_limites: { narrative: 'consistencia', intensity: 'epica' },
  el_inmortal: { narrative: 'gloria', intensity: 'epica' },
  la_piedra_del_agon: { narrative: 'legado', intensity: 'forjada' },
  lengua_del_agon: { narrative: 'legado', intensity: 'forjada' },
  la_ekecheiria: { narrative: 'legado', intensity: 'templada' },
  el_espejo: { narrative: 'legado', intensity: 'templada' },
  el_constante: { narrative: 'legado', intensity: 'epica' },
  senalamiento_perfecto: { narrative: 'legado', intensity: 'epica' },
  la_herejia: { narrative: 'legado', intensity: 'epica' },
  la_venganza: { narrative: 'legado', intensity: 'epica' },
  el_ultimo_agon: { narrative: 'legado', intensity: 'epica' },

  // ── EASTER EGGS ────────────────────────────────────────
  el_boxeador_de_philadelphia: { narrative: 'easter_egg', intensity: 'epica' },
  espartanos_cual_es_su_oficio: { narrative: 'easter_egg', intensity: 'epica' },
  no_estas_entretenido: { narrative: 'easter_egg', intensity: 'epica' },
  el_fantasma_de_esparta: { narrative: 'easter_egg', intensity: 'epica' },
  winter_is_coming: { narrative: 'easter_egg', intensity: 'epica' },
  yo_soy_el_peligro: { narrative: 'easter_egg', intensity: 'epica' },
  un_agon_para_gobernarlos: { narrative: 'easter_egg', intensity: 'epica' },
  cada_intento_es_un_escape: { narrative: 'easter_egg', intensity: 'epica' },
  atrapalos_a_todos: { narrative: 'easter_egg', intensity: 'epica' },
  red_pill_or_blue_pill: { narrative: 'easter_egg', intensity: 'epica' },
  boogeyman: { narrative: 'easter_egg', intensity: 'epica' },
  not_my_tempo: { narrative: 'easter_egg', intensity: 'epica' },
  moneyball: { narrative: 'easter_egg', intensity: 'epica' },
  thats_what_she_said: { narrative: 'easter_egg', intensity: 'epica' },
  la_especia_debe_fluir: { narrative: 'easter_egg', intensity: 'epica' },
  may_the_fourth: { narrative: 'easter_egg', intensity: 'epica' },
  le_hice_una_oferta: { narrative: 'easter_egg', intensity: 'epica' },
  daniel_san: { narrative: 'easter_egg', intensity: 'epica' },
  primera_regla_del_agon: { narrative: 'easter_egg', intensity: 'epica' },
  dont_let_him_leave_murph: { narrative: 'easter_egg', intensity: 'epica' },
  el_orgullo_de_philadelphia: { narrative: 'easter_egg', intensity: 'epica' },
  run_agonista_run: { narrative: 'easter_egg', intensity: 'epica' },
  por_troya: { narrative: 'easter_egg', intensity: 'epica' },
  algunos_hombres: { narrative: 'easter_egg', intensity: 'epica' },
  di_hola_a_mi_pequeno_amigo: { narrative: 'easter_egg', intensity: 'epica' },
}

// ─── HELPER: obtener tokens desde un ID ──────────────────────────────────────

export function getVisualTokens(inscripcionId: string): VisualTokens {
  const mapping = INSCRIPCION_VISUAL_MAP[inscripcionId]
  if (!mapping) {
    return VISUAL_SYSTEM.origen.forjada
  }
  return VISUAL_SYSTEM[mapping.narrative][mapping.intensity]
}

export function getNarrativeIntensity(inscripcionId: string) {
  return (
    INSCRIPCION_VISUAL_MAP[inscripcionId] ?? {
      narrative: 'origen' as NarrativeKey,
      intensity: 'forjada' as IntensityKey,
    }
  )
}
