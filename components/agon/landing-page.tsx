'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

// ─── DATOS ────────────────────────────────────────────────────────────────────

const DIOSES_LANDING = [
  {
    nombre: 'Ares',
    imagen: '/dioses/ares.jpg',
    dominio: 'Guerra y combate físico',
    descripcion:
      'Brutal y sin piedad. Respeta el esfuerzo genuino. Desprecia la mediocridad.',
    color: '#C41E1E',
    glow: 'rgba(196,30,30,0.5)',
    borde: 'rgba(196,30,30,0.4)',
  },
  {
    nombre: 'Apolo',
    imagen: '/dioses/apolo.png',
    dominio: 'Razón, luz y conocimiento',
    descripcion:
      'Filosófico y elevado. Cita a los grandes pensadores. Ve el agon como ejercicio espiritual.',
    color: '#3B82F6',
    glow: 'rgba(59,130,246,0.5)',
    borde: 'rgba(59,130,246,0.4)',
  },
  {
    nombre: 'Nike',
    imagen: '/dioses/nike.png',
    dominio: 'Victoria y gloria',
    descripcion:
      'Genuinamente eufórica con cada victoria. La primera en aparecer cuando el agonista triunfa.',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.5)',
    borde: 'rgba(245,158,11,0.4)',
  },
  {
    nombre: 'Hermes',
    imagen: '/dioses/hermes.png',
    dominio: 'Velocidad y movimiento',
    descripcion:
      'Irónico y veloz. El más astuto del Olimpo. Disfruta genuinamente de las contradicciones humanas.',
    color: '#D97706',
    glow: 'rgba(217,119,6,0.5)',
    borde: 'rgba(217,119,6,0.4)',
  },
  {
    nombre: 'Deméter',
    imagen: '/dioses/demeter.png',
    dominio: 'Nutrición y disciplina alimentaria',
    descripcion:
      'Maternal pero exigente. Conoce cada macro, cada ciclo de hidratación. No perdona la pereza.',
    color: '#22C55E',
    glow: 'rgba(34,197,94,0.5)',
    borde: 'rgba(34,197,94,0.4)',
  },
  {
    nombre: 'Morfeo',
    imagen: '/dioses/morfeo.jpg',
    dominio: 'Sueño y recuperación',
    descripcion:
      'Onírico y misterioso. Aparece de noche. Conoce la ciencia del sueño mejor que ningún mortal.',
    color: '#7C3AED',
    glow: 'rgba(124,58,237,0.5)',
    borde: 'rgba(124,58,237,0.4)',
  },
  {
    nombre: 'Eris',
    imagen: '/dioses/eris.png',
    dominio: 'Discordia y caos',
    descripcion:
      'Nunca cruel, pero siempre incómoda. Dice lo que todos piensan pero nadie dice.',
    color: '#9CA3AF',
    glow: 'rgba(156,163,175,0.4)',
    borde: 'rgba(156,163,175,0.35)',
  },
]

const PRUEBAS_LANDING = [
  { icono: '💧', nombre: 'Solo Agua', descripcion: 'Sin bebidas azucaradas. Solo agua, todo el día.', kleos: 10 },
  {
    icono: '🛡️',
    nombre: 'Sin Comida Rápida',
    descripcion: 'Cero fast food. El cuerpo es el templo del agonista.',
    kleos: 10,
  },
  { icono: '👟', nombre: '10.000 Pasos', descripcion: 'El movimiento constante es la base del agon.', kleos: 20 },
  { icono: '🌙', nombre: '7 Horas de Sueño', descripcion: 'La recuperación es parte del combate.', kleos: 15 },
  { icono: '📖', nombre: '10 Páginas', descripcion: 'La mente también se entrena. Sin excepción.', kleos: 15 },
  { icono: '🏋️', nombre: 'Gym', descripcion: '4 sesiones semanales mínimo. Ares está mirando.', kleos: 30 },
  { icono: '⚡', nombre: 'Cardio', descripcion: '3 sesiones semanales. Hermes no acepta excusas.', kleos: 25 },
]

const TERMINOS_UNIVERSO = [
  { termino: 'El Gran Agon', significado: 'El desafío completo de 29 días' },
  { termino: 'Kleos', significado: 'Gloria acumulada con actos reales' },
  { termino: 'Las Pruebas', significado: 'Los 7 hábitos diarios a completar' },
  { termino: 'El Altis', significado: 'El scoreboard del Gran Agon' },
  { termino: 'La Hegemonía', significado: 'El ganador de cada semana' },
  { termino: 'Las Inscripciones', significado: 'Los logros desbloqueados' },
  { termino: 'El Oráculo', significado: 'Mensaje sellado del día 1, revelado el día 29' },
  { termino: 'La Ekecheiria', significado: 'La tregua sagrada entre agonistas' },
]

// Partículas con posiciones fijas — evita hydration mismatch
const PARTICLES = [
  { left: '8%', top: '12%', duration: 4.2, delay: 0 },
  { left: '23%', top: '67%', duration: 3.8, delay: 0.8 },
  { left: '41%', top: '31%', duration: 5.1, delay: 1.6 },
  { left: '57%', top: '78%', duration: 4.5, delay: 0.3 },
  { left: '72%', top: '22%', duration: 3.5, delay: 2.1 },
  { left: '89%', top: '55%', duration: 4.8, delay: 1.1 },
  { left: '15%', top: '44%', duration: 5.3, delay: 0.6 },
  { left: '34%', top: '88%', duration: 3.9, delay: 1.9 },
  { left: '63%', top: '9%', duration: 4.1, delay: 2.4 },
  { left: '78%', top: '73%', duration: 5.0, delay: 0.1 },
  { left: '5%', top: '83%', duration: 3.7, delay: 1.4 },
  { left: '48%', top: '51%', duration: 4.4, delay: 0.9 },
  { left: '91%', top: '38%', duration: 3.6, delay: 2.7 },
  { left: '29%', top: '17%', duration: 5.2, delay: 0.4 },
  { left: '66%', top: '94%', duration: 4.7, delay: 1.7 },
  { left: '18%', top: '62%', duration: 4.0, delay: 2.2 },
  { left: '83%', top: '8%', duration: 3.4, delay: 0.7 },
  { left: '52%', top: '39%', duration: 4.9, delay: 1.3 },
  { left: '37%', top: '71%', duration: 5.4, delay: 0.5 },
  { left: '95%', top: '82%', duration: 4.3, delay: 2.0 },
]

// ─── COMPONENTES AUXILIARES ───────────────────────────────────────────────────

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!started) return
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(interval)
    }, 45)
    return () => clearInterval(interval)
  }, [started, text])

  return (
    <span>
      {displayed}
      {displayed.length < text.length && started && (
        <span className="animate-pulse text-amber">|</span>
      )}
    </span>
  )
}

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-amber/40"
          style={{ left: p.left, top: p.top }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            y: [0, -28, 0],
            opacity: [0, 0.7, 0],
            scale: [0, 1.2, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className="h-px bg-gradient-to-r from-transparent via-amber/40 to-transparent flex-1" />
      <span className="text-amber/60 text-xs">⚖</span>
      <div className="h-px bg-gradient-to-r from-transparent via-amber/40 to-transparent flex-1" />
    </div>
  )
}

function DiosCard({
  dios,
  index,
}: {
  dios: (typeof DIOSES_LANDING)[0]
  index: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="relative group rounded-2xl overflow-hidden border cursor-default"
      style={{ borderColor: dios.borde }}
    >
      <div className="relative h-72 sm:h-80 overflow-hidden">
        <Image
          src={dios.imagen}
          alt={dios.nombre}
          fill
          className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, #080808 0%, #08080890 40%, transparent 70%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ boxShadow: `inset 0 0 40px ${dios.glow}` }}
        />
      </div>

      <div className="p-4 space-y-1.5 bg-[#080808]">
        <p className="font-display text-base font-bold tracking-wide" style={{ color: dios.color }}>
          {dios.nombre}
        </p>
        <p className="text-xs text-muted-foreground font-body uppercase tracking-widest">
          {dios.dominio}
        </p>
        <p className="text-xs text-foreground/70 font-body leading-relaxed pt-1">{dios.descripcion}</p>
      </div>

      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ boxShadow: `0 0 0 1px ${dios.borde}` }}
        whileHover={{ boxShadow: `0 0 20px 2px ${dios.glow}, 0 0 0 1px ${dios.color}` }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

// ─── LANDING PAGE PRINCIPAL ───────────────────────────────────────────────────

export function LandingPage() {
  const containerRef = useRef(null)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroY = useTransform(scrollY, [0, 400], [0, -60])

  return (
    <div ref={containerRef} className="min-h-screen bg-[#080808] text-foreground overflow-x-hidden">
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <ParticleField />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 space-y-8 max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-display text-8xl sm:text-9xl font-bold tracking-widest shimmer-text">
              AGON
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <p className="font-display text-xl sm:text-2xl text-amber/90 tracking-wide">
              <TypewriterText text="La excelencia no se declara. Se inscribe." delay={1200} />
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.4, duration: 0.7 }}
            className="text-muted-foreground font-body text-base sm:text-lg leading-relaxed max-w-xl mx-auto"
          >
            Una plataforma de gamificación para el desafío de disciplina más exigente que dos
            personas pueden proponerse. 29 días. 7 hábitos diarios. Los dioses del Olimpo como
            testigos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/sign-in"
              className="relative px-8 py-4 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-amber/90 transition-all duration-300 glow-amber hover:glow-amber-lg"
            >
              Entrar al Agon
            </Link>
            <a
              href="#universo"
              className="px-8 py-4 border border-border text-muted-foreground font-display text-sm tracking-widest uppercase rounded-xl hover:border-amber/40 hover:text-foreground transition-all duration-300"
            >
              Conocer el universo
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-px h-12 bg-gradient-to-b from-amber/60 to-transparent mx-auto"
          />
        </motion.div>
      </section>

      <section id="universo" className="px-6 py-24 max-w-4xl mx-auto">
        <SectionDivider />
        <div className="mt-16 space-y-16">
          <div className="text-center space-y-4">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs text-amber tracking-widest uppercase font-body"
            >
              El universo
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="font-display text-3xl sm:text-4xl font-bold"
            >
              El Gran Agon
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="text-muted-foreground font-body text-base leading-relaxed max-w-2xl mx-auto"
            >
              En la antigua Grecia, el agon era la competencia en que los atletas probaban su
              excelencia ante los dioses. Esta plataforma revive ese espíritu — dos agonistas, 29
              días, y la mirada del Olimpo sobre cada hábito completado o abandonado.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TERMINOS_UNIVERSO.map((t, i) => (
              <motion.div
                key={t.termino}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="bg-surface-1 border border-border rounded-xl p-4 space-y-1.5"
              >
                <p className="font-display text-xs font-bold text-amber leading-tight">{t.termino}</p>
                <p className="text-xs text-muted-foreground font-body leading-snug">{t.significado}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 bg-surface-1/30">
        <div className="max-w-4xl mx-auto space-y-16">
          <SectionDivider />
          <div className="text-center space-y-4 mt-16">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs text-amber tracking-widest uppercase font-body"
            >
              Los hábitos
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="font-display text-3xl sm:text-4xl font-bold"
            >
              Las 7 Pruebas del Día
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-muted-foreground font-body text-sm max-w-xl mx-auto"
            >
              Cada día es una nueva batalla. Siete pruebas. Cada una otorga kleos. Completarlas todas
              es un Día Perfecto.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRUEBAS_LANDING.map((prueba, i) => (
              <motion.div
                key={prueba.nombre}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex items-start gap-4 bg-[#080808] border border-border rounded-xl p-4 hover:border-amber/30 transition-colors group"
              >
                <span className="text-3xl flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  {prueba.icono}
                </span>
                <div className="space-y-1 min-w-0">
                  <p className="font-display text-sm font-bold text-foreground">{prueba.nombre}</p>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed">
                    {prueba.descripcion}
                  </p>
                  <p className="text-xs text-amber font-body">◆ {prueba.kleos} kleos</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 max-w-6xl mx-auto">
        <SectionDivider />
        <div className="space-y-16 mt-16">
          <div className="text-center space-y-4">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs text-amber tracking-widest uppercase font-body"
            >
              El Olimpo
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="font-display text-3xl sm:text-4xl font-bold"
            >
              Los Dioses del Agon
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-muted-foreground font-body text-sm max-w-xl mx-auto"
            >
              Siete dioses observan el Gran Agon. Cada uno interviene en su dominio, dejando sus
              comentarios en el Ágora. Sus palabras no se piden — se ganan.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {DIOSES_LANDING.map((dios, i) => (
              <DiosCard key={dios.nombre} dios={dios} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber/[0.06] to-transparent pointer-events-none" />
        <ParticleField />

        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <SectionDivider />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6 mt-12"
          >
            <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
              ¿Estás listo para
              <br />
              <span className="text-amber">inscribir tu kleos?</span>
            </h2>
            <p className="text-muted-foreground font-body text-base">
              El Gran Agon no espera. Cada día sin acción es un día que el Altis registra en
              silencio.
            </p>
            <Link
              href="/sign-in"
              className="inline-block px-10 py-5 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-amber/90 transition-all duration-300 glow-amber hover:glow-amber-lg"
            >
              Entrar al Olimpo
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center">
        <p className="font-display text-xs text-muted-foreground tracking-widest uppercase">
          Agon · La excelencia no se declara. Se inscribe.
        </p>
      </footer>
    </div>
  )
}
