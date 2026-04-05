'use client'

import { ErrorAltis } from '@/components/agon/error-altis'

export default function Error({ reset }: { reset: () => void }) {
  return <ErrorAltis onReintentar={reset} />
}
