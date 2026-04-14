import { auth } from '@clerk/nextjs/server'
import { getCurrentAgonista } from '@/lib/auth'
import { NIVEL_LABELS, NIVEL_ICONOS } from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Landmark, MessagesSquare, Swords, type LucideIcon } from 'lucide-react'
import { NavAgonistaDropdown } from '@/components/layout/nav-agonista-dropdown'
import { NavCiudadDropdown } from '@/components/layout/nav-ciudad-dropdown'
import { NavbarClient } from '@/components/layout/navbar-client'
import { CampanaNotificaciones } from '@/components/agon/campana-notificaciones'

type NavMainLink = { href: string; label: string; Icon: LucideIcon }

const NAV_MAIN: NavMainLink[] = [
  { href: '/dashboard', label: 'El Agon', Icon: Swords },
  { href: '/altis', label: 'El Altis', Icon: Landmark },
  { href: '/agora', label: 'El Ágora', Icon: MessagesSquare },
]

const navMainIconClass = 'shrink-0 opacity-80'

export async function Navbar() {
  const { userId } = await auth()
  const agonista = await getCurrentAgonista()
  if (!agonista) return null

  const isAdmin = userId === process.env.CLERK_JAVIER_USER_ID
  const nivel = agonista.nivel as NivelKey
  const nivelLabel = NIVEL_LABELS[nivel]
  const NivelIcono = NIVEL_ICONOS[nivel]

  return (
    <NavbarClient>
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-lg font-bold tracking-widest text-amber">
            AGON
          </span>
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden sm:flex items-center gap-4 md:gap-6 flex-wrap justify-end">
          {NAV_MAIN.map((link) => {
            const Icon = link.Icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 text-xs tracking-wider text-muted-foreground hover:text-amber transition-colors duration-200 uppercase font-body"
              >
                <Icon size={14} className={navMainIconClass} aria-hidden />
                {link.label}
              </Link>
            )
          })}
          <NavCiudadDropdown />
          <NavAgonistaDropdown isAdmin={Boolean(isAdmin)} />
        </div>

        {/* Kleos badge + UserButton */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-2 md:px-3 py-1.5 bg-surface-1 rounded-full border border-border max-w-[min(100%,12rem)]">
            <NivelIcono size={14} className="text-amber shrink-0" />
            <span className="text-xs text-muted-foreground font-body truncate hidden md:inline">
              {nivelLabel}
            </span>
            <span className="text-xs text-amber font-body font-medium whitespace-nowrap">
              {agonista.kleosTotal.toLocaleString()} kleos
            </span>
          </div>
          <CampanaNotificaciones />
          <UserButton />
        </div>
      </div>
    </NavbarClient>
  )
}
