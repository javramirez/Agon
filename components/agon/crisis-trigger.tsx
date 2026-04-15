'use client'

import { useState, useEffect } from 'react'
import { CrisisOverlay, type CrisisData } from './crisis-overlay'

export function CrisisTrigger() {
  const [crisis, setCrisis] = useState<CrisisData | null>(null)
  const [visible, setVisible] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch('/api/crisis/estado')
      .then((r) => r.json())
      .then((data: { crisis?: CrisisData | null }) => {
        if (data.crisis && !data.crisis.resuelta) {
          setCrisis(data.crisis)
          setVisible(true)
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  if (cargando || !visible || !crisis) return null

  return (
    <CrisisOverlay
      crisis={crisis}
      onDecidido={() => {
        fetch('/api/crisis/estado')
          .then((r) => r.json())
          .then((data: { crisis?: CrisisData | null }) => {
            if (data.crisis && !data.crisis.resuelta) {
              setCrisis(data.crisis)
            } else {
              setVisible(false)
            }
          })
          .catch(() => {})
      }}
    />
  )
}
