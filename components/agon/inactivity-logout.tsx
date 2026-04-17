'use client'

import { useEffect, useRef } from 'react'
import { useClerk } from '@clerk/nextjs'

const TIMEOUT_MS = 5 * 60 * 1000 // 5 minutos

export function InactivityLogout() {
  const { signOut } = useClerk()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        void signOut({ redirectUrl: '/sign-in' })
      }, TIMEOUT_MS)
    }

    const eventos = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
    ] as const

    eventos.forEach((e) =>
      window.addEventListener(e, resetTimer, { passive: true })
    )
    resetTimer()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      eventos.forEach((e) =>
        window.removeEventListener(e, resetTimer)
      )
    }
  }, [signOut])

  return null
}
