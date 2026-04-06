'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const LINKS = [
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
    desc: 'Tu legado en el Altis',
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

export function NavAgonistaDropdown({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const visible = LINKS.filter((l) => !('adminOnly' in l && l.adminOnly) || isAdmin)

  const active = visible.some((l) => pathname === l.href)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'text-xs tracking-wider uppercase transition-colors flex items-center gap-1.5',
          open || active
            ? 'text-amber'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="text-sm leading-none">👤</span>
        <span>El Agonista</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-border bg-background shadow-lg py-1 z-[60] animate-fade-in"
        >
          {visible.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                'flex gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-1',
                pathname === link.href && 'bg-surface-1'
              )}
            >
              <span className="text-lg shrink-0">{link.icon}</span>
              <span className="min-w-0">
                <span className="block text-xs font-display font-semibold text-foreground">
                  {link.label}
                </span>
                <span className="block text-[11px] text-muted-foreground font-body leading-snug mt-0.5">
                  {link.desc}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
