'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTierFromLikes, LIKE_MILESTONES } from '@/lib/facciones/adeptos'

interface LikeButtonProps {
  /** Likes reales (DB) + likesAdeptos (metadata) */
  totalLikes: number
  /** Si el usuario ya dio like */
  liked: boolean
  onLike: () => Promise<void>
  disabled?: boolean
}

const TIER_CONFIG = {
  1: {
    heart: '♡',
    color: 'text-zinc-500',
    glow: '',
    pulse: false,
    particles: false,
    epic: false,
  },
  2: {
    heart: '♥',
    color: 'text-amber-400',
    glow: 'drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]',
    pulse: false,
    particles: false,
    epic: false,
  },
  3: {
    heart: '♥',
    color: 'text-amber-400',
    glow: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]',
    pulse: true,
    particles: false,
    epic: false,
  },
  4: {
    heart: '♥',
    color: 'text-yellow-400',
    glow: 'drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]',
    pulse: true,
    particles: true,
    epic: false,
  },
  5: {
    heart: '♥',
    color: 'text-yellow-300',
    glow: 'drop-shadow-[0_0_16px_rgba(253,224,71,1)]',
    pulse: true,
    particles: true,
    epic: true,
  },
}

function formatLikes(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

export function LikeButton({ totalLikes, liked, onLike, disabled }: LikeButtonProps) {
  const [loading, setLoading] = useState(false)
  const tier = getTierFromLikes(totalLikes)
  const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] ?? TIER_CONFIG[1]
  const milestone = LIKE_MILESTONES.find((m) => m.tier === tier)

  const handleClick = async () => {
    if (disabled || loading || liked) return
    setLoading(true)
    try {
      await onLike()
    } finally {
      setLoading(false)
    }
  }

  const heartGlyph = liked ? '♥' : config.heart

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center gap-3">
        {config.epic && (
          <>
            <motion.span
              className="text-yellow-300 text-sm"
              animate={{ y: [0, -4, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              ♥
            </motion.span>
          </>
        )}

        <button
          type="button"
          onClick={() => void handleClick()}
          disabled={disabled || loading || liked}
          className="flex items-center gap-2 transition-all duration-200 disabled:cursor-default"
        >
          <motion.span
            className={`text-2xl ${config.color} ${config.glow} transition-all duration-300`}
            animate={
              config.pulse
                ? {
                    scale: [1, 1.15, 1],
                  }
                : {}
            }
            transition={
              config.pulse
                ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
                : {}
            }
          >
            {heartGlyph}
          </motion.span>

          {tier >= 3 && (
            <motion.span
              className={`text-sm font-semibold ${config.color}`}
              key={totalLikes}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {formatLikes(totalLikes)}
            </motion.span>
          )}
        </button>

        {config.epic && (
          <motion.span
            className="text-yellow-300 text-sm"
            animate={{ y: [0, -4, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
          >
            ♥
          </motion.span>
        )}

        {config.particles && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-yellow-400 text-xs"
                style={{ left: `${20 + i * 18}%`, top: '0%' }}
                animate={{
                  y: [0, -16, 0],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeInOut',
                }}
              >
                ✦
              </motion.span>
            ))}
          </div>
        )}

        {config.epic && (
          <AnimatePresence>
            <motion.span
              className="absolute -top-6 left-1/2 -translate-x-1/2 text-base"
              animate={{ y: [0, -12, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            >
              👍
            </motion.span>
          </AnimatePresence>
        )}
      </div>

      {tier >= 2 && milestone?.label && (
        <motion.p
          className={`text-xs ${config.color} opacity-70`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
        >
          {milestone.label}
        </motion.p>
      )}
    </div>
  )
}
