'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Landmark,
  MessageSquare,
  Settings,
  User,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type AgonistaNavLink = {
  href: string
  label: string
  Icon: LucideIcon
  desc: string
  adminOnly?: true
  pvpOnly?: true
}

const LINKS: AgonistaNavLink[] = [
  {
    href: '/perfil',
    label: 'Mi Perfil',
    Icon: User,
    desc: 'Tu nivel, stats y llamas',
  },
  {
    href: '/poderes',
    label: 'Poderes',
    Icon: Zap,
    desc: 'Provocaciones, Señalamiento y Ekecheiria',
    pvpOnly: true as const,
  },
  {
    href: '/correspondencia',
    label: 'Correspondencia',
    Icon: MessageSquare,
    desc: 'Mensajes directos con tu antagonista',
    pvpOnly: true as const,
  },
  {
    href: '/mentor',
    label: 'El Mentor',
    Icon: Landmark,
    desc: 'Conversación con tu guía asignado',
  },
  {
    href: '/admin',
    label: 'Altis Admin',
    Icon: Settings,
    desc: 'Panel de administración',
    adminOnly: true as const,
  },
]

const navIconTrigger = 'shrink-0 opacity-80'
const navIconMenu = 'shrink-0 opacity-80 mt-0.5'

export function NavAgonistaDropdown({
  isAdmin,
  modo,
}: {
  isAdmin: boolean
  modo: 'solo' | 'duelo'
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const visible = LINKS.filter((l) => {
    if ('adminOnly' in l && l.adminOnly && !isAdmin) return false
    if ('pvpOnly' in l && l.pvpOnly && modo === 'solo') return false
    return true
  })

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
        <User size={14} className={navIconTrigger} aria-hidden />
        <span>El Agonista</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border/60 py-1 z-[60] animate-fade-in overflow-hidden"
          style={{
            background: 'rgba(10,10,10,0.98)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,158,11,0.06)',
          }}
        >
          {visible.map((link) => {
            const Icon = link.Icon
            return (
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
                <Icon size={16} className={navIconMenu} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-xs font-display font-semibold text-foreground">
                    {link.label}
                  </span>
                  <span className="block text-[11px] text-muted-foreground font-body leading-snug mt-0.5">
                    {link.desc}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
