'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Notificacion } from '@/lib/db/schema'

export function useNotificacionesCount(intervaloMs = 10000) {
  const [count, setCount] = useState(0)

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notificaciones/count')
      if (!res.ok) return
      const data = (await res.json()) as { count: number }
      setCount(data.count)
    } catch {
      // Silencioso
    }
  }, [])

  useEffect(() => {
    void fetchCount()
    const handleAccion = () => void fetchCount()
    window.addEventListener('agon:prueba-completada', handleAccion)
    const intervalo = setInterval(fetchCount, intervaloMs)
    return () => {
      clearInterval(intervalo)
      window.removeEventListener('agon:prueba-completada', handleAccion)
    }
  }, [fetchCount, intervaloMs])

  return { count, refetch: fetchCount }
}

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [cargando, setCargando] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const res = await fetch('/api/notificaciones')
      if (!res.ok) return
      const data = (await res.json()) as { notificaciones: Notificacion[] }
      setNotificaciones(data.notificaciones)
    } catch {
      // Silencioso
    } finally {
      setCargando(false)
    }
  }, [])

  const marcarLeidas = useCallback(async () => {
    try {
      await fetch('/api/notificaciones', { method: 'PATCH' })
    } catch {
      // Silencioso
    }
  }, [])

  return { notificaciones, cargando, cargar, marcarLeidas }
}
