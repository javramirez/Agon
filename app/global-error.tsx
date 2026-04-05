'use client'

import { useEffect } from 'react'
import { ErrorAltis } from '@/components/agon/error-altis'
import './globals.css'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error global:', error)
  }, [error])

  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-6 p-6 max-w-md">
          <h1 className="font-display text-2xl font-bold text-amber tracking-widest">
            AGON
          </h1>
          <ErrorAltis
            mensaje="El Altis encontró un error inesperado. El agon continúa."
            onReintentar={reset}
          />
        </div>
      </body>
    </html>
  )
}
