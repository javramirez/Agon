'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Props {
  nombre: string
}

type Paso = 'bienvenida' | 'dioses' | 'pacto' | 'sellando'

// ─── DATOS ────────────────────────────────────────────────────────────────────

const DIOSES_PREVIEW = [
  { key: 'ares',    src: '/dioses/ares.jpg',    nombre: 'Ares',    color: '#C41E1E', dominio: 'Combate físico' },
  { key: 'apolo',   src: '/dioses/apolo.png',   nombre: 'Apolo',   color: '#3B82F6', dominio: 'Razón y luz' },
  { key: 'nike',    src: '/dioses/nike.png',     nombre: 'Nike',    color: '#F59E0B', dominio: 'Victoria' },
  { key: 'hermes',  src: '/dioses/hermes.png',  nombre: 'Hermes',  color: '#D97706', dominio: 'Velocidad' },
  { key: 'demeter', src: '/dioses/demeter.png', nombre: 'Deméter', color: '#22C55E', dominio: 'Nutrición' },
  { key: 'morfeo',  src: '/dioses/morfeo.jpg',  nombre: 'Morfeo',  color: '#7C3AED', dominio: 'Sueño' },
  { key: 'eris',    src: '/dioses/eris.png',    nombre: 'Eris',    color: '#9CA3AF', dominio: 'Discordia' },
]

const PRUEBAS_PREVIEW = [
  { icono: '💧', nombre: 'Solo agua', kleos: 10 },
  { icono: '🛡️', nombre: 'Sin comida rápida', kleos: 10 },
  { icono: '👟', nombre: '10.000 pasos', kleos: 20 },
  { icono: '🌙', nombre: '7h de sueño', kleos: 15 },
  { icono: '📖', nombre: '10 páginas', kleos: 15 },
  { icono: '🏋️', nombre: 'Gym ×4/semana', kleos: 30 },
  { icono: '⚡', nombre: 'Cardio ×3/semana', kleos: 25 },
]

// ─── PARTÍCULAS ───────────────────────────────────────────────────────────────

const PARTICLES = [
  { left: '8%',  top: '15%', duration: 4.2, delay: 0 },
  { left: '88%', top: '12%', duration: 3.8, delay: 0.6 },
  { left: '20%', top: '78%', duration: 5.1, delay: 1.2 },
  { left: '75%', top: '82%', duration: 4.5, delay: 0.3 },
  { left: '50%', top: '8%',  duration: 3.5, delay: 1.8 },
  { left: '92%', top: '50%', duration: 4.8, delay: 0.9 },
  { left: '5%',  top: '55%', duration: 5.3, delay: 0.4 },
  { left: '60%', top: '20%', duration: 3.9, delay: 2.1 },
]

function ParticleField() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-amber/30"
          style={{ left: p.left, top: p.top }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0], y: [0, -24, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        />
      ))}
    </div>
  )
}

// ─── PASO 1: BIENVENIDA ───────────────────────────────────────────────────────

function PasoBienvenida({ nombre, onNext }: { nombre: string; onNext: () => void }) {
  return (
    <motion.div
      key="bienvenida"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-lg w-full text-center space-y-10"
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="font-display text-7xl font-bold tracking-widest shimmer-text">
          AGON
        </h1>
      </motion.div>

      {/* Saludo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="space-y-3"
      >
        <p className="text-xs text-amber/70 tracking-widest uppercase font-body">
          El Gran Agon
        </p>
        <h2 className="font-display text-3xl font-bold leading-tight">
          El Altis te reconoce,<br />
          <span className="text-amber">{nombre}.</span>
        </h2>
      </motion.div>

      {/* Descripción */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="space-y-4 text-muted-foreground text-sm leading-relaxed font-body"
      >
        <p>
          Durante 29 días, cada prueba que superes acumulará kleos.
          Cada prueba que falles, el Altis también lo registrará.
        </p>
        <p>
          Los siete dioses del Olimpo observarán cada acción.
          Tu antagonista ya está listo.
        </p>
        <p className="text-muted-foreground/60 italic text-xs">
          &ldquo;La excelencia no se declara. Se inscribe.&rdquo;
        </p>
      </motion.div>

      {/* Las 7 pruebas — preview rápido */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="grid grid-cols-7 gap-1"
      >
        {PRUEBAS_PREVIEW.map((p, i) => (
          <motion.div
            key={p.nombre}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 + i * 0.07, duration: 0.4 }}
            className="flex flex-col items-center gap-1 p-2 bg-surface-1 rounded-lg border border-border"
            title={`${p.nombre} · ${p.kleos} kleos`}
          >
            <span className="text-lg">{p.icono}</span>
            <span className="text-amber text-xs font-body">+{p.kleos}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.button
        type="button"
        onClick={onNext}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-4 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-amber/90 transition-colors"
      >
        Conocer a los dioses
      </motion.button>
    </motion.div>
  )
}

// ─── PASO 2: LOS DIOSES ───────────────────────────────────────────────────────

function PasoDioses({ onNext }: { onNext: () => void }) {
  const [seleccionado, setSeleccionado] = useState<typeof DIOSES_PREVIEW[0] | null>(null)

  return (
    <motion.div
      key="dioses"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-xl w-full space-y-8"
    >
      <div className="text-center space-y-2">
        <p className="text-xs text-amber/70 tracking-widest uppercase font-body">
          El Olimpo
        </p>
        <h2 className="font-display text-2xl font-bold">
          Los Dioses del Agon
        </h2>
        <p className="text-sm text-muted-foreground font-body">
          Siete deidades observarán tu agon. Sus palabras no se piden — se ganan.
        </p>
      </div>

      {/* Grid de dioses */}
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
        {DIOSES_PREVIEW.map((dios, i) => (
          <motion.button
            key={dios.key}
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setSeleccionado(
              seleccionado?.key === dios.key ? null : dios
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className="relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200"
              style={{
                borderColor: seleccionado?.key === dios.key
                  ? dios.color
                  : 'rgba(255,255,255,0.08)',
                boxShadow: seleccionado?.key === dios.key
                  ? `0 0 16px ${dios.color}60`
                  : 'none',
              }}
            >
              <Image
                src={dios.src}
                alt={dios.nombre}
                fill
                className="object-cover object-top"
                sizes="80px"
              />
            </div>
            <p
              className="text-xs font-display font-bold text-center leading-tight transition-colors"
              style={{ color: seleccionado?.key === dios.key ? dios.color : undefined }}
            >
              {dios.nombre}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Panel del dios seleccionado */}
      <AnimatePresence mode="wait">
        {seleccionado && (
          <motion.div
            key={seleccionado.key}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border p-4 overflow-hidden"
            style={{
              borderColor: `${seleccionado.color}40`,
              background: `${seleccionado.color}08`,
            }}
          >
            <p
              className="text-xs font-display font-bold tracking-wide mb-1"
              style={{ color: seleccionado.color }}
            >
              {seleccionado.nombre} — {seleccionado.dominio}
            </p>
            <p className="text-xs text-muted-foreground font-body">
              Toca para seleccionar · Los dioses comentan en El Ágora cuando accionas en su dominio.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={onNext}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-4 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-amber/90 transition-colors"
      >
        Iniciar el Pacto
      </motion.button>
    </motion.div>
  )
}

// ─── PASO 3: EL PACTO INICIAL ────────────────────────────────────────────────

type ArquetipoKey = 'constante' | 'explosivo' | 'metodico' | 'caotico'

type PreocupacionEscala = { tiempo: number; constancia: number; rival: number }

type RespuestasPacto = {
  objetivo: string
  arquetipo: ArquetipoKey | ''
  puntoPartida: string
  compromisoEscala: number
  lineaBaseGym: number
  lineaBaseCardio: number
  lineaBasePaginas: number
  sombraTipo: string
  sombraOtros: string
  apuestaGanas: string
  apuestaPierdes: string
  rivalFortalezas: string[]
  rivalFortalezasOtros: string
  rivalDebilidad: string
  rivalDebilidadOtros: string
  preocupacionEscala: PreocupacionEscala
}

const ARQUETIPOS = [
  {
    key: 'constante' as ArquetipoKey,
    titulo: 'El Constante',
    descripcion: 'La disciplina diaria es tu motor. Lento, pero inquebrantable.',
  },
  {
    key: 'explosivo' as ArquetipoKey,
    titulo: 'El Explosivo',
    descripcion: 'Tus mejores días son legendarios. Tus peores, un abismo.',
  },
  {
    key: 'metodico' as ArquetipoKey,
    titulo: 'El Metódico',
    descripcion: 'Cada prueba es un sistema. Mides, ajustas, optimizas.',
  },
  {
    key: 'caotico' as ArquetipoKey,
    titulo: 'El Caótico',
    descripcion: 'Funcionas a ráfagas de energía. El orden te asfixia.',
  },
]

const PUNTOS_PARTIDA = [
  { key: 'fecha_limite', texto: 'Tengo un evento o fecha límite concreta que me exige.' },
  { key: 'reconstruccion', texto: 'Estoy reconstruyendo algo que perdí o abandoné.' },
  { key: 'interno', texto: 'No tengo objetivo externo. Esto es solo contra mí mismo.' },
  {
    key: 'transformacion',
    texto: 'Busco transformación física sin una fecha que me presione.',
  },
]

const SOMBRAS = [
  { key: 'comodidad', texto: 'La comodidad cuando estoy descansado.' },
  { key: 'consistencia', texto: 'La falta de consistencia entre semanas.' },
  { key: 'social', texto: 'Las salidas sociales que rompen rutinas.' },
  { key: 'motivacion', texto: 'Perder motivación después de días malos.' },
  { key: 'perfeccionismo', texto: 'El perfeccionismo — todo o nada.' },
  { key: 'fisico', texto: 'Las lesiones o el agotamiento físico.' },
]

const RIVAL_FORTALEZAS = [
  { key: 'consistencia', texto: 'Consistencia diaria' },
  { key: 'mental', texto: 'Fortaleza mental' },
  { key: 'fisico', texto: 'Condición física' },
  { key: 'alimentacion', texto: 'Disciplina en alimentación' },
  { key: 'motivacion', texto: 'Alta motivación inicial' },
  { key: 'adaptabilidad', texto: 'Adaptabilidad' },
]

const RIVAL_DEBILIDADES = [
  { key: 'constancia', texto: 'Falta de constancia a largo plazo.' },
  { key: 'lesiones', texto: 'Propenso a lesiones.' },
  { key: 'social', texto: 'Cede ante lo social.' },
  { key: 'perfeccionismo', texto: 'Perfeccionismo — se paraliza.' },
  { key: 'inicio', texto: 'Lento para arrancar.' },
  { key: 'presion', texto: 'Se achica bajo presión.' },
]

const PREOCUPACIONES = [
  {
    key: 'tiempo' as keyof PreocupacionEscala,
    texto: 'No tendré tiempo suficiente los próximos 29 días.',
  },
  {
    key: 'constancia' as keyof PreocupacionEscala,
    texto: 'Perderé constancia en la segunda mitad del reto.',
  },
  {
    key: 'rival' as keyof PreocupacionEscala,
    texto: 'El antagonista será más consistente que yo.',
  },
]

const ESCALA_ACUERDO = [
  { valor: 1, etiqueta: 'Totalmente en desacuerdo' },
  { valor: 2, etiqueta: 'En desacuerdo' },
  { valor: 3, etiqueta: 'Ni de acuerdo ni en desacuerdo' },
  { valor: 4, etiqueta: 'De acuerdo' },
  { valor: 5, etiqueta: 'Totalmente de acuerdo' },
]

function EscalaCompromiso({
  valor,
  onChange,
}: {
  valor: number
  onChange: (v: number) => void
}) {
  const etiquetas = ['', 'Casi nunca', 'Pocas veces', 'A veces', 'Casi siempre', 'Siempre']
  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              'flex-1 py-3 rounded-xl border font-display font-bold text-lg transition-all duration-200',
              valor === n
                ? 'border-amber bg-amber/10 text-amber'
                : 'border-border bg-surface-1 text-muted-foreground hover:border-border/60'
            )}
          >
            {n}
          </button>
        ))}
      </div>
      {valor > 0 && (
        <motion.p
          key={valor}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-amber font-body"
        >
          {etiquetas[valor]}
        </motion.p>
      )}
    </div>
  )
}

function OpcionConOtros({
  opciones,
  valorSeleccionado,
  textoOtros,
  onSeleccionar,
  onTextoOtros,
}: {
  opciones: { key: string; texto: string }[]
  valorSeleccionado: string
  textoOtros: string
  onSeleccionar: (key: string) => void
  onTextoOtros: (texto: string) => void
}) {
  const esOtros = valorSeleccionado === 'otros'
  return (
    <div className="space-y-2">
      {opciones.map((op) => (
        <button
          key={op.key}
          type="button"
          onClick={() => onSeleccionar(op.key)}
          className={cn(
            'w-full text-left px-4 py-3 rounded-xl border text-sm font-body transition-all duration-200',
            valorSeleccionado === op.key
              ? 'border-amber/60 bg-amber/8 text-foreground'
              : 'border-border bg-surface-1 text-muted-foreground hover:border-border/60 hover:text-foreground'
          )}
        >
          {op.texto}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onSeleccionar('otros')}
        className={cn(
          'w-full text-left px-4 py-3 rounded-xl border text-sm font-body transition-all duration-200',
          esOtros
            ? 'border-amber/60 bg-amber/8 text-foreground'
            : 'border-border bg-surface-1 text-muted-foreground hover:border-border/60 hover:text-foreground'
        )}
      >
        Otros...
      </button>
      <AnimatePresence>
        {esOtros && (
          <motion.input
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            type="text"
            value={textoOtros}
            onChange={(e) => onTextoOtros(e.target.value)}
            placeholder="Escribe tu respuesta..."
            autoFocus
            className={cn(
              'w-full bg-surface-1 border border-amber/30 rounded-xl px-4 py-3',
              'text-foreground placeholder:text-muted-foreground text-sm font-body',
              'focus:outline-none focus:border-amber/60 transition-colors'
            )}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function MultiSeleccionConOtros({
  opciones,
  seleccionados,
  textoOtros,
  max,
  onToggle,
  onTextoOtros,
}: {
  opciones: { key: string; texto: string }[]
  seleccionados: string[]
  textoOtros: string
  max: number
  onToggle: (key: string) => void
  onTextoOtros: (texto: string) => void
}) {
  const tieneOtros = seleccionados.includes('otros')
  return (
    <div className="space-y-2">
      {opciones.map((op) => {
        const activo = seleccionados.includes(op.key)
        const lleno = seleccionados.length >= max && !activo
        return (
          <button
            key={op.key}
            type="button"
            onClick={() => !lleno && onToggle(op.key)}
            className={cn(
              'w-full text-left px-4 py-3 rounded-xl border text-sm font-body transition-all duration-200',
              activo
                ? 'border-amber/60 bg-amber/8 text-foreground'
                : lleno
                  ? 'border-border bg-surface-1 text-muted-foreground/40 cursor-not-allowed'
                  : 'border-border bg-surface-1 text-muted-foreground hover:border-border/60 hover:text-foreground'
            )}
          >
            <span className="flex items-center justify-between">
              {op.texto}
              {activo && <span className="text-amber text-xs">✓</span>}
            </span>
          </button>
        )
      })}
      <button
        type="button"
        onClick={() => {
          const lleno = seleccionados.length >= max && !tieneOtros
          if (!lleno) onToggle('otros')
        }}
        className={cn(
          'w-full text-left px-4 py-3 rounded-xl border text-sm font-body transition-all duration-200',
          tieneOtros
            ? 'border-amber/60 bg-amber/8 text-foreground'
            : seleccionados.length >= max
              ? 'border-border bg-surface-1 text-muted-foreground/40 cursor-not-allowed'
              : 'border-border bg-surface-1 text-muted-foreground hover:border-border/60 hover:text-foreground'
        )}
      >
        <span className="flex items-center justify-between">
          Otros...
          {tieneOtros && <span className="text-amber text-xs">✓</span>}
        </span>
      </button>
      <AnimatePresence>
        {tieneOtros && (
          <motion.input
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            type="text"
            value={textoOtros}
            onChange={(e) => onTextoOtros(e.target.value)}
            placeholder="Escribe tu respuesta..."
            autoFocus
            className={cn(
              'w-full bg-surface-1 border border-amber/30 rounded-xl px-4 py-3',
              'text-foreground placeholder:text-muted-foreground text-sm font-body',
              'focus:outline-none focus:border-amber/60 transition-colors'
            )}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function EscalaAcuerdo({
  preguntas,
  valores,
  onChange,
}: {
  preguntas: { key: keyof PreocupacionEscala; texto: string }[]
  valores: PreocupacionEscala
  onChange: (key: keyof PreocupacionEscala, valor: number) => void
}) {
  return (
    <div className="space-y-6">
      {preguntas.map((p) => (
        <div key={p.key} className="space-y-3">
          <p className="text-sm text-foreground font-body leading-snug">{p.texto}</p>
          <div className="flex gap-1.5">
            {ESCALA_ACUERDO.map((e) => (
              <button
                key={e.valor}
                type="button"
                title={e.etiqueta}
                onClick={() => onChange(p.key, e.valor)}
                className={cn(
                  'flex-1 py-2.5 rounded-lg border text-xs font-display font-bold transition-all duration-200',
                  valores[p.key] === e.valor
                    ? 'border-amber bg-amber/10 text-amber'
                    : 'border-border bg-surface-1 text-muted-foreground hover:border-border/60'
                )}
              >
                {e.valor}
              </button>
            ))}
          </div>
          {valores[p.key] > 0 && (
            <p className="text-xs text-amber/70 font-body">
              {ESCALA_ACUERDO.find((e) => e.valor === valores[p.key])?.etiqueta}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

const TITULOS_PREGUNTA = [
  {
    bloque: 'Tú · 1/4',
    titulo: 'El Objetivo',
    subtitulo: 'Una meta concreta y medible. El Altis no acepta vaguedades.',
  },
  {
    bloque: 'Tú · 2/4',
    titulo: 'El Arquetipo',
    subtitulo: 'El Oráculo necesita conocerte. ¿Cómo compites?',
  },
  {
    bloque: 'Tú · 3/4',
    titulo: 'Tu punto de partida',
    subtitulo: '¿Desde dónde llegas al Gran Agon?',
  },
  {
    bloque: 'Tú · 4/4',
    titulo: 'Tu compromiso',
    subtitulo: 'Cuando me comprometo con algo, lo cumplo.',
  },
  {
    bloque: 'Tu sombra · 1/2',
    titulo: 'La Sombra',
    subtitulo: '¿Qué te ha hecho fallar en retos anteriores?',
  },
  {
    bloque: 'Tu sombra · 2/2',
    titulo: 'La Apuesta',
    subtitulo: 'El Altis necesita que declares las consecuencias.',
  },
  {
    bloque: 'El rival · 1/3',
    titulo: 'Sus fortalezas',
    subtitulo: 'Elige hasta 2. Sé honesto — el Altis lo registra.',
  },
  {
    bloque: 'El rival · 2/3',
    titulo: 'Su mayor debilidad',
    subtitulo: 'El punto donde el antagonista puede caer.',
  },
  {
    bloque: 'El rival · 3/3',
    titulo: 'Tus preocupaciones',
    subtitulo: 'Del 1 (totalmente en desacuerdo) al 5 (totalmente de acuerdo).',
  },
]

function PasoPacto({
  onSellar,
  cargando,
  error,
}: {
  onSellar: (r: RespuestasPacto) => void
  cargando: boolean
  error: string
}) {
  const [idx, setIdx] = useState(0)
  const [r, setR] = useState<RespuestasPacto>({
    objetivo: '',
    arquetipo: '',
    puntoPartida: '',
    compromisoEscala: 0,
    lineaBaseGym: 0,
    lineaBaseCardio: 0,
    lineaBasePaginas: 0,
    sombraTipo: '',
    sombraOtros: '',
    apuestaGanas: '',
    apuestaPierdes: '',
    rivalFortalezas: [],
    rivalFortalezasOtros: '',
    rivalDebilidad: '',
    rivalDebilidadOtros: '',
    preocupacionEscala: { tiempo: 0, constancia: 0, rival: 0 },
  })

  const total = 9
  const esUltima = idx === total - 1
  const meta = TITULOS_PREGUNTA[idx]

  function puedeAvanzar(): boolean {
    switch (idx) {
      case 0:
        return r.objetivo.trim().length >= 5
      case 1:
        return r.arquetipo !== ''
      case 2:
        return r.puntoPartida !== ''
      case 3:
        return r.compromisoEscala > 0
      case 4:
        return (
          r.sombraTipo !== '' &&
          (r.sombraTipo !== 'otros' || r.sombraOtros.trim().length >= 3)
        )
      case 5:
        return r.apuestaGanas.trim().length >= 3 && r.apuestaPierdes.trim().length >= 3
      case 6:
        return (
          r.rivalFortalezas.length > 0 &&
          (!r.rivalFortalezas.includes('otros') ||
            r.rivalFortalezasOtros.trim().length >= 3)
        )
      case 7:
        return (
          r.rivalDebilidad !== '' &&
          (r.rivalDebilidad !== 'otros' || r.rivalDebilidadOtros.trim().length >= 3)
        )
      case 8:
        return (
          r.preocupacionEscala.tiempo > 0 &&
          r.preocupacionEscala.constancia > 0 &&
          r.preocupacionEscala.rival > 0
        )
      default:
        return false
    }
  }

  function avanzar() {
    if (!puedeAvanzar()) return
    if (esUltima) {
      onSellar(r)
    } else {
      setIdx((i) => i + 1)
    }
  }

  function toggleFortaleza(key: string) {
    setR((prev) => {
      const ya = prev.rivalFortalezas.includes(key)
      if (ya) return { ...prev, rivalFortalezas: prev.rivalFortalezas.filter((k) => k !== key) }
      if (prev.rivalFortalezas.length >= 2) return prev
      return { ...prev, rivalFortalezas: [...prev.rivalFortalezas, key] }
    })
  }

  return (
    <motion.div
      key="pacto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-lg w-full space-y-7"
    >
      <div className="text-center space-y-3">
        <motion.div
          animate={{ rotate: [0, -2, 2, -1, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="text-4xl"
        >
          ⚖️
        </motion.div>
        <p className="text-xs text-amber/70 tracking-widest uppercase font-body">{meta.bloque}</p>

        <div className="flex gap-1 justify-center">
          {Array.from({ length: total }).map((_, i) => (
            <motion.div
              key={i}
              className="h-1 rounded-full"
              animate={{
                width: i === idx ? 20 : 6,
                backgroundColor:
                  i < idx
                    ? 'rgba(245,158,11,0.9)'
                    : i === idx
                      ? 'rgba(245,158,11,0.9)'
                      : 'rgba(255,255,255,0.12)',
              }}
              transition={{ duration: 0.25 }}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-5"
        >
          <div className="space-y-1.5">
            <h2 className="font-display text-xl font-bold">{meta.titulo}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-body">
              {meta.subtitulo}
            </p>
          </div>

          {idx === 0 && (
            <textarea
              value={r.objetivo}
              onChange={(e) => setR((p) => ({ ...p, objetivo: e.target.value }))}
              placeholder="Ej: Completar las 7 pruebas al menos 20 de los 29 días..."
              rows={3}
              className={cn(
                'w-full bg-surface-1 border border-border rounded-xl p-4',
                'text-foreground placeholder:text-muted-foreground resize-none',
                'focus:outline-none focus:border-amber/50 transition-colors text-sm font-body'
              )}
            />
          )}

          {idx === 1 && (
            <div className="grid grid-cols-1 gap-2">
              {ARQUETIPOS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => setR((p) => ({ ...p, arquetipo: a.key }))}
                  className={cn(
                    'text-left p-4 rounded-xl border transition-all duration-200',
                    r.arquetipo === a.key
                      ? 'border-amber/60 bg-amber/8'
                      : 'border-border bg-surface-1 hover:border-border/60'
                  )}
                >
                  <p
                    className={cn(
                      'font-display font-bold text-sm',
                      r.arquetipo === a.key ? 'text-amber' : 'text-foreground'
                    )}
                  >
                    {a.titulo}
                  </p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">{a.descripcion}</p>
                </button>
              ))}
            </div>
          )}

          {idx === 2 && (
            <div className="space-y-2">
              {PUNTOS_PARTIDA.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setR((prev) => ({ ...prev, puntoPartida: p.key }))}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-xl border text-sm font-body transition-all duration-200',
                    r.puntoPartida === p.key
                      ? 'border-amber/60 bg-amber/8 text-foreground'
                      : 'border-border bg-surface-1 text-muted-foreground hover:border-border/60 hover:text-foreground'
                  )}
                >
                  {p.texto}
                </button>
              ))}
            </div>
          )}

          {idx === 3 && (
            <div className="space-y-8">
              <EscalaCompromiso
                valor={r.compromisoEscala}
                onChange={(v) => setR((p) => ({ ...p, compromisoEscala: v }))}
              />

              <div className="flex flex-col gap-6 mt-2">
                <div>
                  <p className="text-sm text-white/60 mb-1 leading-relaxed font-body">
                    Antes del Agon — ¿cuántas veces por semana ibas al gimnasio?
                  </p>
                  <p className="text-xs text-white/30 mb-3 font-body">
                    Sé honesto. Esto no se muestra a tu rival — es solo para que el Olimpo te
                    conozca.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setR((prev) => ({ ...prev, lineaBaseGym: n }))}
                        className="w-9 h-9 rounded-lg text-sm font-medium transition-all duration-150 font-body"
                        style={{
                          backgroundColor:
                            r.lineaBaseGym === n
                              ? 'rgba(226,75,74,0.2)'
                              : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${
                            r.lineaBaseGym === n
                              ? 'rgba(226,75,74,0.6)'
                              : 'rgba(255,255,255,0.08)'
                          }`,
                          color:
                            r.lineaBaseGym === n
                              ? 'rgb(226,75,74)'
                              : 'rgba(255,255,255,0.4)',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-white/60 mb-1 leading-relaxed font-body">
                    ¿Cuántas sesiones de cardio hacías por semana?
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setR((prev) => ({ ...prev, lineaBaseCardio: n }))}
                        className="w-9 h-9 rounded-lg text-sm font-medium transition-all duration-150 font-body"
                        style={{
                          backgroundColor:
                            r.lineaBaseCardio === n
                              ? 'rgba(29,158,117,0.2)'
                              : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${
                            r.lineaBaseCardio === n
                              ? 'rgba(29,158,117,0.6)'
                              : 'rgba(255,255,255,0.08)'
                          }`,
                          color:
                            r.lineaBaseCardio === n
                              ? 'rgb(29,158,117)'
                              : 'rgba(255,255,255,0.4)',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-white/60 mb-1 leading-relaxed font-body">
                    ¿Cuántas páginas leías al día antes del Agon?
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {[0, 5, 10, 15, 20, 25, 30].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setR((prev) => ({ ...prev, lineaBasePaginas: n }))}
                        className="w-9 h-9 rounded-lg text-sm font-medium transition-all duration-150 font-body min-w-[2.25rem]"
                        style={{
                          backgroundColor:
                            r.lineaBasePaginas === n
                              ? 'rgba(55,138,221,0.2)'
                              : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${
                            r.lineaBasePaginas === n
                              ? 'rgba(55,138,221,0.6)'
                              : 'rgba(255,255,255,0.08)'
                          }`,
                          color:
                            r.lineaBasePaginas === n
                              ? 'rgb(55,138,221)'
                              : 'rgba(255,255,255,0.4)',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {idx === 4 && (
            <OpcionConOtros
              opciones={SOMBRAS}
              valorSeleccionado={r.sombraTipo}
              textoOtros={r.sombraOtros}
              onSeleccionar={(key) => setR((p) => ({ ...p, sombraTipo: key }))}
              onTextoOtros={(t) => setR((p) => ({ ...p, sombraOtros: t }))}
            />
          )}

          {idx === 5 && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs text-amber/80 font-body tracking-wide uppercase">
                  Si gano...
                </label>
                <input
                  type="text"
                  value={r.apuestaGanas}
                  onChange={(e) => setR((p) => ({ ...p, apuestaGanas: e.target.value }))}
                  placeholder="Ej: Me doy una semana de vacaciones sin culpa"
                  className={cn(
                    'w-full bg-surface-1 border border-border rounded-xl px-4 py-3',
                    'text-foreground placeholder:text-muted-foreground text-sm font-body',
                    'focus:outline-none focus:border-amber/50 transition-colors'
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-amber/80 font-body tracking-wide uppercase">
                  Si pierdo...
                </label>
                <input
                  type="text"
                  value={r.apuestaPierdes}
                  onChange={(e) => setR((p) => ({ ...p, apuestaPierdes: e.target.value }))}
                  placeholder="Ej: Le pago una cena al antagonista"
                  className={cn(
                    'w-full bg-surface-1 border border-border rounded-xl px-4 py-3',
                    'text-foreground placeholder:text-muted-foreground text-sm font-body',
                    'focus:outline-none focus:border-amber/50 transition-colors'
                  )}
                />
              </div>
            </div>
          )}

          {idx === 6 && (
            <MultiSeleccionConOtros
              opciones={RIVAL_FORTALEZAS}
              seleccionados={r.rivalFortalezas}
              textoOtros={r.rivalFortalezasOtros}
              max={2}
              onToggle={toggleFortaleza}
              onTextoOtros={(t) => setR((p) => ({ ...p, rivalFortalezasOtros: t }))}
            />
          )}

          {idx === 7 && (
            <OpcionConOtros
              opciones={RIVAL_DEBILIDADES}
              valorSeleccionado={r.rivalDebilidad}
              textoOtros={r.rivalDebilidadOtros}
              onSeleccionar={(key) => setR((p) => ({ ...p, rivalDebilidad: key }))}
              onTextoOtros={(t) => setR((p) => ({ ...p, rivalDebilidadOtros: t }))}
            />
          )}

          {idx === 8 && (
            <EscalaAcuerdo
              preguntas={PREOCUPACIONES}
              valores={r.preocupacionEscala}
              onChange={(key, valor) =>
                setR((p) => ({
                  ...p,
                  preocupacionEscala: { ...p.preocupacionEscala, [key]: valor },
                }))
              }
            />
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <p className="text-red-400 text-xs font-body text-center">{error}</p>
      )}

      <div className="space-y-2 pt-1">
        <motion.button
          type="button"
          onClick={avanzar}
          disabled={!puedeAvanzar() || cargando}
          whileHover={{ scale: puedeAvanzar() ? 1.02 : 1 }}
          whileTap={{ scale: puedeAvanzar() ? 0.97 : 1 }}
          className="w-full py-4 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-amber/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {cargando ? 'Sellando...' : esUltima ? 'Sellar el Pacto' : 'Siguiente'}
        </motion.button>

        {idx > 0 && !cargando && (
          <button
            type="button"
            onClick={() => setIdx((i) => i - 1)}
            className="w-full py-2 text-xs text-muted-foreground font-body hover:text-foreground transition-colors"
          >
            ← Volver
          </button>
        )}

        {esUltima && (
          <p className="text-center text-muted-foreground/40 text-xs font-body pt-1">
            Una vez sellado, el Pacto queda inscrito en el Altis para siempre.
          </p>
        )}
      </div>
    </motion.div>
  )
}


// ─── PASO 4: SELLANDO ─────────────────────────────────────────────────────────

function PasoSellando() {
  return (
    <motion.div
      key="sellando"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg text-center space-y-8"
    >
      {/* Ícono animado */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute w-32 h-32 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="text-6xl relative"
        >
          ⚖️
        </motion.div>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-amber tracking-widest uppercase font-body">
          El Altis inscribe
        </p>
        <h2 className="font-display text-2xl font-bold">
          El Pacto ha sido sellado.
        </h2>
        <p className="text-muted-foreground text-sm font-body leading-relaxed">
          Tu declaración quedó inscrita en el Altis. Los dioses la custodiarán
          hasta La Ceremonia del Veredicto.
        </p>
      </div>

      <motion.p
        className="text-amber text-sm font-body"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Entrando al Gran Agon...
      </motion.p>
    </motion.div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export function OnboardingClient({ nombre }: Props) {
  const [paso, setPaso] = useState<Paso>('bienvenida')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  const pasos = ['bienvenida', 'dioses', 'pacto'] as const
  const pasoActual = pasos.indexOf(paso as (typeof pasos)[number])

  async function sellarPacto(respuestas: RespuestasPacto) {
    setCargando(true)
    setPaso('sellando')
    setError('')

    if (!respuestas.arquetipo) {
      setError('Selecciona un arquetipo.')
      setCargando(false)
      setPaso('pacto')
      return
    }

    const payload = {
      objetivo: respuestas.objetivo,
      arquetipo: respuestas.arquetipo,
      puntoPartida: respuestas.puntoPartida,
      compromisoEscala: respuestas.compromisoEscala,
      lineaBaseGym: respuestas.lineaBaseGym,
      lineaBaseCardio: respuestas.lineaBaseCardio,
      lineaBasePaginas: respuestas.lineaBasePaginas,
      sombraTipo:
        respuestas.sombraTipo === 'otros' ? respuestas.sombraOtros : respuestas.sombraTipo,
      apuestaGanas: respuestas.apuestaGanas,
      apuestaPierdes: respuestas.apuestaPierdes,
      rivalFortalezas: respuestas.rivalFortalezas.map((k) =>
        k === 'otros' ? respuestas.rivalFortalezasOtros : k
      ),
      rivalDebilidad:
        respuestas.rivalDebilidad === 'otros'
          ? respuestas.rivalDebilidadOtros
          : respuestas.rivalDebilidad,
      preocupacionEscala: respuestas.preocupacionEscala,
    }

    try {
      const res = await fetch('/api/pacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? 'Error al sellar el Pacto')
      }

      setTimeout(() => router.push('/dashboard'), 2500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al sellar el Pacto')
      setCargando(false)
      setPaso('pacto')
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] text-foreground flex flex-col items-center justify-center p-6 relative">
      <ParticleField />

      {paso !== 'sellando' && pasoActual >= 0 && (
        <motion.div
          className="fixed top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {pasos.map((p, i) => (
            <motion.div
              key={p}
              className="rounded-full transition-all duration-300"
              animate={{
                width: i === pasoActual ? 24 : 6,
                height: 6,
                background:
                  i <= pasoActual
                    ? 'rgba(245,158,11,0.9)'
                    : 'rgba(255,255,255,0.15)',
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {paso === 'bienvenida' && (
          <PasoBienvenida nombre={nombre} onNext={() => setPaso('dioses')} />
        )}
        {paso === 'dioses' && <PasoDioses onNext={() => setPaso('pacto')} />}
        {paso === 'pacto' && (
          <PasoPacto onSellar={sellarPacto} cargando={cargando} error={error} />
        )}
        {paso === 'sellando' && <PasoSellando />}
      </AnimatePresence>
    </div>
  )
}
