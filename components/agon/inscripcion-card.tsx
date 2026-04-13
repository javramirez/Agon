'use client'

import { motion } from 'framer-motion'
import {
  getVisualTokens,
  getNarrativeIntensity,
  type VisualTokens,
} from '@/lib/inscripciones/visual-system'
import { INSCRIPCIONES } from '@/lib/db/constants'
import { cn } from '@/lib/utils'

// ─── FONDOS ANIMADOS POR GRUPO ────────────────────────────────────────────────

function BgColumns({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[20, 46, 80, 114, 140].map((left, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0"
          style={{
            left,
            width: i === 2 ? 18 : 14,
            background: `linear-gradient(180deg, ${color} 0%, transparent 100%)`,
            borderTop: `2px solid ${color}`,
          }}
          animate={{
            height: [120 + i * 10, 140 + i * 10, 120 + i * 10],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.25,
            ease: 'easeInOut',
          }}
        />
      ))}
      {[0, 30, 60].map((_, i) => (
        <motion.div
          key={`ray-${i}`}
          className="absolute top-0"
          style={{
            left: `${35 + i * 15}%`,
            width: 1,
            background: `linear-gradient(180deg, ${color} 0%, transparent 100%)`,
            transformOrigin: 'top center',
          }}
          animate={{
            height: [0, 80, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

function BgFlames({ color }: { color: string }) {
  const flames = [
    { left: 20, height: 50, delay: 0, width: 18 },
    { left: 44, height: 70, delay: 0.2, width: 24 },
    { left: 72, height: 85, delay: 0.1, width: 30 },
    { left: 104, height: 70, delay: 0.3, width: 24 },
    { left: 132, height: 50, delay: 0.15, width: 18 },
  ]
  return (
    <div className="absolute inset-0 overflow-hidden">
      {flames.map((f, i) => (
        <motion.div
          key={i}
          className="absolute bottom-12"
          style={{
            left: f.left,
            width: f.width,
            background: color,
            borderRadius: '50% 50% 20% 20%',
            transformOrigin: 'bottom center',
          }}
          animate={{
            height: [f.height * 0.85, f.height, f.height * 0.85],
            scaleX: [1, 0.88, 1.06, 1],
            opacity: [0.7, 1, 0.8],
          }}
          transition={{
            duration: 0.8 + f.delay,
            repeat: Infinity,
            delay: f.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function BgSunburst({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: '35%',
            left: '50%',
            width: 2,
            height: 60,
            background: `linear-gradient(180deg, ${color} 0%, transparent 100%)`,
            transformOrigin: 'top center',
            transform: `rotate(${i * 30}deg) translateX(-50%)`,
          }}
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
      {[60, 90, 120].map((size, i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute rounded-full"
          style={{
            top: '35%',
            left: '50%',
            width: size,
            height: size,
            marginLeft: -size / 2,
            marginTop: -size / 2,
            border: `1px solid ${color}`,
          }}
          animate={{
            opacity: [0.2, 0.7, 0.2],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function BgRunes({ color }: { color: string }) {
  const runes = [
    { char: 'Ω', top: 15, left: 14, size: 16 },
    { char: 'Α', top: 15, right: 14, size: 16 },
    { char: 'Δ', top: 45, left: 8, size: 12 },
    { char: 'Σ', top: 45, right: 8, size: 12 },
    { char: 'Λ', top: 30, left: 30, size: 10 },
    { char: 'Φ', top: 30, right: 30, size: 10 },
  ]
  const cracks = [
    { top: 15, left: 35, height: 80, rotate: 15 },
    { top: 35, left: 75, height: 60, rotate: -20 },
    { top: 25, left: 125, height: 90, rotate: 10 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden">
      {cracks.map((c, i) => (
        <motion.div
          key={`crack-${i}`}
          className="absolute"
          style={{
            top: c.top,
            left: c.left,
            width: 1,
            height: c.height,
            background: color,
            transform: `rotate(${c.rotate}deg)`,
          }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.6,
            ease: 'easeInOut',
          }}
        />
      ))}
      {runes.map((r, i) => (
        <motion.div
          key={`rune-${i}`}
          className="absolute font-serif"
          style={{
            top: r.top,
            left: 'left' in r ? r.left : undefined,
            right: 'right' in r ? r.right : undefined,
            color,
            fontSize: r.size,
          }}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'easeInOut',
          }}
        >
          {r.char}
        </motion.div>
      ))}
    </div>
  )
}

function AnimatedBackground({
  animation,
  color,
}: {
  animation: VisualTokens['bgAnimation']
  color: string
}) {
  if (animation === 'columns') return <BgColumns color={color} />
  if (animation === 'flames') return <BgFlames color={color} />
  if (animation === 'sunburst') return <BgSunburst color={color} />
  if (animation === 'runes') return <BgRunes color={color} />
  return null
}

// ─── ESQUINAS DECORATIVAS ─────────────────────────────────────────────────────

function CornerDecor({ color, isEasterEgg }: { color: string; isEasterEgg: boolean }) {
  const size = isEasterEgg ? 20 : 14
  const offset = 8
  const thickness = isEasterEgg ? 2.5 : 1.5

  const corners = [
    {
      top: offset,
      left: offset,
      borderTop: thickness,
      borderLeft: thickness,
      borderRadius: '3px 0 0 0',
    },
    {
      top: offset,
      right: offset,
      borderTop: thickness,
      borderRight: thickness,
      borderRadius: '0 3px 0 0',
    },
    {
      bottom: offset,
      left: offset,
      borderBottom: thickness,
      borderLeft: thickness,
      borderRadius: '0 0 0 3px',
    },
    {
      bottom: offset,
      right: offset,
      borderBottom: thickness,
      borderRight: thickness,
      borderRadius: '0 0 3px 0',
    },
  ]

  return (
    <>
      {corners.map((c, i) => (
        <motion.div
          key={i}
          className="absolute z-20"
          style={{
            top: c.top,
            left: 'left' in c ? c.left : undefined,
            right: 'right' in c ? c.right : undefined,
            bottom: 'bottom' in c ? c.bottom : undefined,
            width: size,
            height: size,
            borderColor: color,
            borderStyle: 'solid',
            borderWidth: 0,
            borderTopWidth: c.borderTop ?? 0,
            borderLeftWidth: c.borderLeft ?? 0,
            borderRightWidth: c.borderRight ?? 0,
            borderBottomWidth: c.borderBottom ?? 0,
            borderRadius: c.borderRadius,
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  )
}

// ─── ESTRELLAS DE RAREZA (Easter Egg) ─────────────────────────────────────────

function RarityStars({ color }: { color: string }) {
  return (
    <div className="flex gap-1 items-center">
      {[0, 0.3, 0.6].map((delay, i) => (
        <motion.div
          key={i}
          style={{
            width: 7,
            height: 7,
            background: color,
            clipPath:
              'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ─── CARTA PRINCIPAL ──────────────────────────────────────────────────────────

interface InscripcionCardProps {
  inscripcionId: string
  className?: string
}

export function InscripcionCard({ inscripcionId, className }: InscripcionCardProps) {
  const config = INSCRIPCIONES.find((i) => i.id === inscripcionId)
  if (!config) return null

  const tokens = getVisualTokens(inscripcionId)
  const { narrative, intensity } = getNarrativeIntensity(inscripcionId)
  const isEpica = intensity === 'epica'
  const isEasterEgg = narrative === 'easter_egg'
  const hasAnimatedBg = tokens.animatedBg

  return (
    <div
      className={cn('relative overflow-hidden rounded-2xl', className)}
      style={{
        width: 240,
        height: 360,
        background: tokens.bgGradient,
        border: `2px solid ${tokens.borderColor}`,
        boxShadow: tokens.borderGlow,
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px z-10"
        style={{
          background: `linear-gradient(to right, transparent, ${tokens.primaryColor}, transparent)`,
          opacity: isEpica ? 0.8 : 0.4,
        }}
      />

      {hasAnimatedBg && (
        <AnimatedBackground animation={tokens.bgAnimation} color={tokens.glowColor} />
      )}

      <CornerDecor color={tokens.borderColor} isEasterEgg={isEasterEgg} />

      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center z-20" style={{ top: '-20%' }}>
        <motion.div
          animate={{
            filter: [
              `drop-shadow(0 0 8px ${tokens.glowColor})`,
              `drop-shadow(0 0 20px ${tokens.glowColor})`,
              `drop-shadow(0 0 8px ${tokens.glowColor})`,
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: isEasterEgg ? '5rem' : '4rem' }}
        >
          {config.icono}
        </motion.div>
      </div>

      {isEasterEgg && (
        <div
          className="absolute z-20"
          style={{
            top: '62%',
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(to right, transparent, ${tokens.borderColor}, transparent)`,
          }}
        />
      )}

      <div
        className="absolute bottom-0 left-0 right-0 z-20 p-4 space-y-2"
        style={{
          background: isEasterEgg
            ? 'linear-gradient(180deg, rgba(5,2,2,0.97) 0%, rgba(5,2,2,1) 100%)'
            : 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0.98) 100%)',
          height: isEasterEgg ? '40%' : '45%',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="h-px flex-1" style={{ background: `${tokens.primaryColor}40` }} />
          <p
            className="text-center font-body tracking-widest uppercase"
            style={{ fontSize: 8, color: tokens.categoryColor }}
          >
            {tokens.categoryLabel}
          </p>
          <div className="h-px flex-1" style={{ background: `${tokens.primaryColor}40` }} />
        </div>

        <p
          className="font-display font-bold leading-tight text-center"
          style={{
            fontSize: isEasterEgg ? 11 : 13,
            color: tokens.titleColor,
            letterSpacing: '0.05em',
          }}
        >
          {config.nombre}
        </p>

        {(isEpica || isEasterEgg) && (
          <p
            className="font-body italic text-center leading-snug"
            style={{
              fontSize: 9,
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.5,
            }}
          >
            {config.descripcion.length > 80
              ? config.descripcion.slice(0, 77) + '...'
              : config.descripcion}
          </p>
        )}

        {isEasterEgg && (
          <div
            className="flex items-center justify-between pt-1 border-t"
            style={{ borderColor: `${tokens.borderColor}30` }}
          >
            <p
              className="font-body"
              style={{
                fontSize: 7,
                letterSpacing: '0.15em',
                color: `${tokens.primaryColor}60`,
              }}
            >
              Easter Egg
            </p>
            <RarityStars color={tokens.primaryColor} />
          </div>
        )}
      </div>
    </div>
  )
}
