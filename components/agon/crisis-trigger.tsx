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
          const crisisId = data.crisis.id
          const yaDecidio = data.crisis.miDecision !== null

          if (yaDecidio) {
            const dismissed = sessionStorage.getItem(
              `crisis_dismissed_${crisisId}`
            )
            if (dismissed) {
              setCrisis(data.crisis)
              setVisible(false)
              return
            }
          }

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
            if (!data.crisis || data.crisis.resuelta) {
              if (crisis.id) {
                sessionStorage.removeItem(`crisis_dismissed_${crisis.id}`)
              }
              setVisible(false)
              return
            }

            const yaDecidio = data.crisis.miDecision !== null
            setCrisis(data.crisis)

            if (yaDecidio) {
              sessionStorage.setItem(
                `crisis_dismissed_${data.crisis.id}`,
                '1'
              )
              setVisible(false)
            } else {
              setVisible(true)
            }
          })
          .catch(() => {})
      }}
    />
  )
}
