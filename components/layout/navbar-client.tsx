'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { CampanaNotificaciones } from '@/components/agon/campana-notificaciones'

export function NavbarClient({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 12)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-amber/10 bg-[#080808]/95 backdrop-blur-md shadow-[0_1px_0_rgba(245,158,11,0.08)]'
          : 'border-b border-border/40 bg-[#080808]/80 backdrop-blur-sm'
      )}
    >
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-px transition-opacity duration-300',
          scrolled ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(245,158,11,0.4), transparent)',
        }}
      />

      <div className="hidden sm:block">{children}</div>

      <div className="sm:hidden max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <Link
          href="/dashboard"
          className="font-display text-lg font-bold tracking-widest text-amber shrink-0"
        >
          AGON
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <CampanaNotificaciones />
          <UserButton />
        </div>
      </div>
    </nav>
  )
}
