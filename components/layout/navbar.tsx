import { auth } from '@clerk/nextjs/server'
import { getCurrentAgonista } from '@/lib/auth'
import { NIVEL_LABELS, NIVEL_ICONOS } from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { NavAgonistaDropdown } from '@/components/layout/nav-agonista-dropdown'

const NAV_MAIN = [
  { href: '/dashboard', label: 'El Agon' },
  { href: '/altis', label: 'El Altis' },
  { href: '/agora', label: 'El Ágora' },
] as const

export async function Navbar() {
  const { userId } = await auth()
  const agonista = await getCurrentAgonista()
  if (!agonista) return null

  const isAdmin = userId === process.env.CLERK_JAVIER_USER_ID

  const nivel = agonista.nivel as NivelKey
  const nivelLabel = NIVEL_LABELS[nivel]
  const nivelIcono = NIVEL_ICONOS[nivel]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-lg font-bold tracking-widest text-amber">
            AGON
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-4 md:gap-6 flex-wrap justify-end">
          {NAV_MAIN.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs tracking-wider text-muted-foreground hover:text-foreground transition-colors uppercase"
            >
              {link.label}
            </Link>
          ))}
          <NavAgonistaDropdown isAdmin={Boolean(isAdmin)} />
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-2 md:px-3 py-1.5 bg-surface-1 rounded-full border border-border max-w-[min(100%,12rem)]">
            <span className="text-xs shrink-0">{nivelIcono}</span>
            <span className="text-xs text-muted-foreground font-body truncate hidden md:inline">
              {nivelLabel}
            </span>
            <span className="text-xs text-amber font-body font-medium whitespace-nowrap">
              {agonista.kleosTotal.toLocaleString()} kleos
            </span>
          </div>
          <UserButton />
        </div>
      </div>
    </nav>
  )
}
