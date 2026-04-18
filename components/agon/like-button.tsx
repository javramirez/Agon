'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { getTierFromLikes } from '@/lib/facciones/adeptos'

interface LikeButtonProps {
  totalLikes: number
  liked: boolean
  onLike: () => Promise<void>
  disabled?: boolean
}

function formatLikes(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

const TIER_CONFIG = {
  1: { color: 'text-muted-foreground', glow: '', pulse: false, particles: false, epic: false },
  2: { color: 'text-amber-400', glow: 'drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]', pulse: false, particles: false, epic: false },
  3: { color: 'text-amber-400', glow: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]', pulse: true, particles: false, epic: false },
  4: { color: 'text-yellow-400', glow: 'drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]', pulse: true, particles: true, epic: false },
  5: { color: 'text-yellow-300', glow: 'drop-shadow-[0_0_16px_rgba(253,224,71,1)]', pulse: true, particles: true, epic: true },
}

export function LikeButton({ totalLikes, liked, onLike, disabled }: LikeButtonProps) {
  const [loading, setLoading] = useState(false)
  const tier = getTierFromLikes(totalLikes)
  const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] ?? TIER_CONFIG[1]

  const handleClick = async () => {
    if (disabled || loading) return
    setLoading(true)
    try {
      await onLike()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex items-center gap-1.5">
      {config.epic && (
        <motion.span
          className="text-yellow-300 text-xs"
          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          ♥
        </motion.span>
      )}

      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={disabled || loading}
        className="relative flex items-center gap-1.5 text-xs font-body transition-colors disabled:cursor-default"
      >
        {config.particles && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {[...Array(3)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-yellow-400 text-[8px]"
                style={{ left: `${10 + i * 25}%`, top: '-2px' }}
                animate={{ y: [0, -12, 0], opacity: [0, 0.9, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
              >
                ✦
              </motion.span>
            ))}
          </div>
        )}

        <motion.span
          className={`text-base transition-all duration-300 ${liked ? 'text-amber-400' : config.color} ${config.glow}`}
          animate={config.pulse ? { scale: [1, 1.15, 1] } : {}}
          transition={config.pulse ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
        >
          ♥
        </motion.span>

        <motion.span
          className={`tabular-nums transition-colors duration-300 ${liked ? 'text-amber-400' : config.color}`}
          key={totalLikes}
          initial={{ scale: 1.15, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {formatLikes(totalLikes)}
        </motion.span>
      </button>

      {config.epic && (
        <>
          <motion.span
            className="text-yellow-300 text-xs"
            animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
          >
            ♥
          </motion.span>
          <motion.span
            className="absolute -top-5 left-1/2 -translate-x-1/2 text-sm"
            animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          >
            👍
          </motion.span>
        </>
      )}
    </div>
  )
}
