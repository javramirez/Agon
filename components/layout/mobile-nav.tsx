'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const LINKS_PRINCIPALES = [
  { href: '/dashboard', label: 'El Agon', icon: '⚔️' },
  { href: '/altis', label: 'El Altis', icon: '🏛️' },
  { href: '/agora', label: 'El Ágora', icon: '🗣️' },
]

const LINKS_AGONISTA = [
  {
    href: '/perfil',
    label: 'Mi Perfil',
    icon: '👤',
    desc: 'Tu nivel, stats y llamas',
  },
  {
    href: '/poderes',
    label: 'Poderes',
    icon: '⚡',
    desc: 'Provocaciones, Señalamiento y Ekecheiria',
  },
  {
    href: '/inscripciones',
    label: 'Las Inscripciones',
    icon: '📜',
    desc: 'Tu legado grabado en el Altis',
  },
  {
    href: '/cronicas',
    label: 'Las Crónicas',
    icon: '📰',
    desc: 'La memoria del Gran Agon',
  },
  {
    href: '/oraculo',
    label: 'El Oráculo',
    icon: '⚖️',
    desc: 'Tu mensaje sellado del día 1',
  },
  {
    href: '/contrato',
    label: 'El Contrato',
    icon: '📋',
    desc: 'El documento que lo inició todo',
  },
  {
    href: '/veredicto',
    label: 'El Veredicto',
    icon: '🏛️',
    desc: 'La Ceremonia del Gran Agon',
  },
  {
    href: '/admin',
    label: 'Altis Admin',
    icon: '⚙️',
    desc: 'Panel de administración',
    adminOnly: true as const,
  },
]

export function MobileNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const [agonistOpen, setAgonistOpen] = useState(false)

  const agonistaVisible = LINKS_AGONISTA.filter(
    (l) => !('adminOnly' in l && l.adminOnly) || isAdmin
  )
  const isAgonistaActive = agonistaVisible.some((l) => l.href === pathname)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm sm:hidden">
        <div className="flex items-center justify-around h-16 px-1">
          {LINKS_PRINCIPALES.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors min-w-0 active:scale-95',
                pathname === link.href
                  ? 'text-amber'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="text-xs tracking-wide truncate">{link.label}</span>
            </Link>
          ))}

          <button
            type="button"
            onClick={() => setAgonistOpen(true)}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors min-w-0 active:scale-95',
              isAgonistaActive ? 'text-amber' : 'text-muted-foreground'
            )}
            aria-expanded={agonistOpen}
            aria-haspopup="dialog"
          >
            <span className="text-xl">👤</span>
            <span className="text-xs tracking-wide">Yo</span>
          </button>
        </div>

        <div className="pb-safe bg-background/95" aria-hidden />
      </nav>

      {agonistOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm sm:hidden"
            aria-label="Cerrar menú"
            onClick={() => setAgonistOpen(false)}
          />

          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-2xl sm:hidden max-h-[85vh] flex flex-col">
            <div className="p-5 space-y-2 overflow-y-auto flex-1 min-h-0">
              <div className="w-10 h-1 bg-border-strong rounded-full mx-auto mb-3 shrink-0" />

              <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-3">
                El Agonista
              </p>

              {agonistaVisible.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setAgonistOpen(false)}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all active:scale-[0.98]',
                    pathname === link.href
                      ? 'bg-surface-2 border-amber/20'
                      : 'bg-surface-1 border-border'
                  )}
                >
                  <span className="text-xl flex-shrink-0">{link.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-body font-medium text-foreground">
                      {link.label}
                    </p>
                    <p className="text-xs text-muted-foreground font-body truncate">
                      {link.desc}
                    </p>
                  </div>
                </Link>
              ))}

              <div className="pb-safe pt-2">
                <button
                  type="button"
                  onClick={() => setAgonistOpen(false)}
                  className="w-full py-3 text-xs text-muted-foreground font-body"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
