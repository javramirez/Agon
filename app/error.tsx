'use client'

import { useEffect } from 'react'
import { ErrorAltis } from '@/components/agon/error-altis'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error de segmento:', error)
  }, [error])

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <ErrorAltis
        mensaje="El Altis encontró un error inesperado. El agon continúa."
        onReintentar={reset}
      />
    </div>
  )
}
