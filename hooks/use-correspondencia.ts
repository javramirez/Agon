'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Correspondencia } from '@/lib/db/schema'

export function useCorrespondencia(intervaloMs = 5000) {
  const [mensajes, setMensajes] = useState<Correspondencia[]>([])
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMensajes = useCallback(async () => {
    try {
      const res = await fetch('/api/correspondencia')
      if (!res.ok) return
      const data = (await res.json()) as { mensajes: Correspondencia[] }
      setMensajes(data.mensajes)
    } catch {
      // Silencioso
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    fetchMensajes()
    const intervalo = setInterval(fetchMensajes, intervaloMs)
    return () => clearInterval(intervalo)
  }, [fetchMensajes, intervaloMs])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function enviarMensaje(contenido: string) {
    if (!contenido.trim() || enviando) return

    setEnviando(true)
    try {
      const res = await fetch('/api/correspondencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido }),
      })
      if (res.ok) {
        await fetchMensajes()
      }
    } finally {
      setEnviando(false)
    }
  }

  return { mensajes, cargando, enviando, enviarMensaje, bottomRef }
}
