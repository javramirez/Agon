'use client'

import { ErrorAltis } from '@/components/agon/error-altis'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <ErrorAltis
      mensaje="El Altis no puede mostrar los datos del Gran Agon en este momento."
      onReintentar={reset}
    />
  )
}
