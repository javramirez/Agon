'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const LINKS_PRINCIPALES = [
  { href: '/dashboard', label: 'El Agon', icon: '⚔️' },
  { href: '/altis', label: 'El Altis', icon: '🏛️' },
  { href: '/agora', label: 'El Ágora', icon: '🗣️' },
]

const LINKS_CIUDAD = [
  { href: '/olimpia', label: 'Facciones', icon: '🌆', desc: 'Las facciones de la Ciudad de Olimpia' },
  { href: '/codex', label: 'El Códex', icon: '📜', desc: 'La biblioteca del Gran Agon' },
  { href: '/oraculo', label: 'El Oráculo', icon: '⚖️', desc: 'Tu mensaje sellado del día 1' },
  { href: '/veredicto', label: 'El Veredicto', icon: '🏆', desc: 'La Ceremonia del Gran Agon' },
  {
    href: '/correspondencia',
    label: 'Correspondencia',
    icon: '✉️',
    desc: 'Mensajes directos con tu antagonista',
    pvpOnly: true as const,
  },
]

const LINKS_AGONISTA = [
  { href: '/perfil', label: 'Mi Perfil', icon: '👤', desc: 'Tu nivel, stats y llamas' },
  {
    href: '/poderes',
    label: 'Poderes',
    icon: '⚡',
    desc: 'Provocaciones, Señalamiento y Ekecheiria',
    pvpOnly: true as const,
  },
  { href: '/mentor', label: 'El Mentor', icon: '🏛️', desc: 'Conversación con tu guía asignado' },
  { href: '/admin', label: 'Altis Admin', icon: '⚙️', desc: 'Panel de administración', adminOnly: true as const },
]

export function MobileNav({
  isAdmin,
  modo,
}: {
  isAdmin: boolean
  modo: 'solo' | 'duelo'
}) {
  const pathname = usePathname()
  const [ciudadOpen, setCiudadOpen] = useState(false)
  const [agonistOpen, setAgonistOpen] = useState(false)

  const agonistaVisible = LINKS_AGONISTA.filter((l) => {
    if ('adminOnly' in l && l.adminOnly && !isAdmin) return false
    if ('pvpOnly' in l && l.pvpOnly && modo === 'solo') return false
    return true
  })

  const ciudadVisible = LINKS_CIUDAD.filter((l) => {
    if ('pvpOnly' in l && l.pvpOnly && modo === 'solo') return false
    return true
  })

  const isCiudadActive = ciudadVisible.some((l) => l.href === pathname)
  const isAgonistaActive = agonistaVisible.some((l) => l.href === pathname)

  return (
    <>
      {/* ─── BARRA INFERIOR ──────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
        <div className="h-px bg-gradient-to-r from-transparent via-amber/20 to-transparent" />

        <div
          className="flex items-center justify-around h-16 px-1"
          style={{ background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(12px)' }}
        >
          {/* Links principales */}
          {LINKS_PRINCIPALES.map((link) => {
            const activo = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-0 active:scale-90',
                  activo ? 'text-amber' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="relative">
                  <span className="text-xl">{link.icon}</span>
                  {activo && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs tracking-wide truncate transition-colors duration-200',
                    activo ? 'text-amber font-medium' : ''
                  )}
                >
                  {link.label}
                </span>
              </Link>
            )
          })}

          {/* Botón La Ciudad */}
          <button
            type="button"
            onClick={() => {
              setCiudadOpen(true)
              setAgonistOpen(false)
            }}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-0 active:scale-90',
              isCiudadActive ? 'text-amber' : 'text-muted-foreground'
            )}
          >
            <div className="relative">
              <span className="text-xl">🌆</span>
              {isCiudadActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </div>
            <span className="text-xs tracking-wide">La Ciudad</span>
          </button>

          {/* Botón El Agonista */}
          <button
            type="button"
            onClick={() => {
              setAgonistOpen(true)
              setCiudadOpen(false)
            }}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-0 active:scale-90',
              isAgonistaActive ? 'text-amber' : 'text-muted-foreground'
            )}
          >
            <div className="relative">
              <span className="text-xl">👤</span>
              {isAgonistaActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </div>
            <span className="text-xs tracking-wide">Agonista</span>
          </button>
        </div>

        <div className="pb-safe" style={{ background: 'rgba(8,8,8,0.97)' }} aria-hidden />
      </nav>

      {/* ─── SHEET LA CIUDAD ─────────────────────────── */}
      <AnimatePresence>
        {ciudadOpen && (
          <>
            <motion.div
              key="backdrop-ciudad"
              className="fixed inset-0 z-50 sm:hidden"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setCiudadOpen(false)}
            />
            <motion.div
              key="sheet-ciudad"
              className="fixed bottom-0 left-0 right-0 z-[60] sm:hidden rounded-t-2xl overflow-hidden"
              style={{ background: 'rgba(10,10,10,0.99)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            >
              <div className="h-px bg-gradient-to-r from-transparent via-amber/40 to-transparent" />
              <div className="p-5 space-y-2 overflow-y-auto max-h-[85vh]">
                <div className="w-10 h-1 bg-border-strong rounded-full mx-auto mb-3" />
                <p className="text-xs text-amber/60 tracking-widest uppercase font-body mb-4">
                  La Ciudad
                </p>
                <div className="space-y-2">
                  {ciudadVisible.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setCiudadOpen(false)}
                        className={cn(
                          'flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all active:scale-[0.98]',
                          pathname === link.href
                            ? 'bg-surface-2 border-amber/20'
                            : 'bg-surface-1 border-border hover:border-border-strong'
                        )}
                      >
                        <span className="text-xl flex-shrink-0">{link.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              'text-sm font-body font-medium',
                              pathname === link.href ? 'text-amber' : 'text-foreground'
                            )}
                          >
                            {link.label}
                          </p>
                          <p className="text-xs text-muted-foreground font-body truncate">
                            {link.desc}
                          </p>
                        </div>
                        {pathname === link.href && (
                          <span className="text-amber text-xs flex-shrink-0">◆</span>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
                <div className="pb-safe pt-3">
                  <button
                    type="button"
                    onClick={() => setCiudadOpen(false)}
                    className="w-full py-3 text-xs text-muted-foreground font-body hover:text-foreground transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── SHEET EL AGONISTA ───────────────────────── */}
      <AnimatePresence>
        {agonistOpen && (
          <>
            <motion.div
              key="backdrop-agonista"
              className="fixed inset-0 z-50 sm:hidden"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setAgonistOpen(false)}
            />
            <motion.div
              key="sheet-agonista"
              className="fixed bottom-0 left-0 right-0 z-[60] sm:hidden rounded-t-2xl overflow-hidden"
              style={{ background: 'rgba(10,10,10,0.99)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            >
              <div className="h-px bg-gradient-to-r from-transparent via-amber/40 to-transparent" />
              <div className="p-5 space-y-2 overflow-y-auto max-h-[85vh]">
                <div className="w-10 h-1 bg-border-strong rounded-full mx-auto mb-3" />
                <p className="text-xs text-amber/60 tracking-widest uppercase font-body mb-4">
                  El Agonista
                </p>
                <div className="space-y-2">
                  {agonistaVisible.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setAgonistOpen(false)}
                        className={cn(
                          'flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all active:scale-[0.98]',
                          pathname === link.href
                            ? 'bg-surface-2 border-amber/20'
                            : 'bg-surface-1 border-border hover:border-border-strong'
                        )}
                      >
                        <span className="text-xl flex-shrink-0">{link.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              'text-sm font-body font-medium',
                              pathname === link.href ? 'text-amber' : 'text-foreground'
                            )}
                          >
                            {link.label}
                          </p>
                          <p className="text-xs text-muted-foreground font-body truncate">
                            {link.desc}
                          </p>
                        </div>
                        {pathname === link.href && (
                          <span className="text-amber text-xs flex-shrink-0">◆</span>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
                <div className="pb-safe pt-3">
                  <button
                    type="button"
                    onClick={() => setAgonistOpen(false)}
                    className="w-full py-3 text-xs text-muted-foreground font-body hover:text-foreground transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
