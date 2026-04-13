'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { RefObject } from 'react'

interface MensajeMentor {
  id: string
  rol: 'user' | 'mentor'
  contenido: string
  createdAt: string
}

function normalizeHistorial(rows: unknown[]): MensajeMentor[] {
  return rows.map((row) => {
    const r = row as Record<string, unknown>
    const created = r.createdAt
    return {
      id: String(r.id),
      rol: r.rol === 'user' ? 'user' : 'mentor',
      contenido: String(r.contenido ?? ''),
      createdAt:
        typeof created === 'string'
          ? created
          : created instanceof Date
            ? created.toISOString()
            : new Date().toISOString(),
    }
  })
}

interface UseMentorReturn {
  mensajes: MensajeMentor[]
  cargando: boolean
  enviando: boolean
  mentorAsignado: string | null
  enviarMensaje: (texto: string) => Promise<void>
  bottomRef: RefObject<HTMLDivElement | null>
}

export function useMentor(): UseMentorReturn {
  const [mensajes, setMensajes] = useState<MensajeMentor[]>([])
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [mentorAsignado, setMentorAsignado] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  useEffect(() => {
    async function cargarHistorial() {
      try {
        const res = await fetch('/api/mentor')
        if (!res.ok) return
        const data = (await res.json()) as {
          historial: unknown[]
          mentorAsignado: string | null
        }
        setMensajes(normalizeHistorial(data.historial ?? []))
        setMentorAsignado(data.mentorAsignado)
      } catch {
        // silencioso
      } finally {
        setCargando(false)
        scrollToBottom()
      }
    }
    void cargarHistorial()
  }, [scrollToBottom])

  async function enviarMensaje(texto: string) {
    if (!texto.trim() || enviando) return
    setEnviando(true)

    const tempId = crypto.randomUUID()
    const mensajeUsuario: MensajeMentor = {
      id: tempId,
      rol: 'user',
      contenido: texto.trim(),
      createdAt: new Date().toISOString(),
    }
    setMensajes((prev) => [...prev, mensajeUsuario])
    scrollToBottom()

    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto.trim() }),
      })

      if (!res.ok) {
        setMensajes((prev) => prev.filter((m) => m.id !== tempId))
        return
      }

      const data = (await res.json()) as { historial?: unknown[] }
      if (data.historial?.length) {
        setMensajes(normalizeHistorial(data.historial))
      }
      scrollToBottom()
    } catch {
      setMensajes((prev) => prev.filter((m) => m.id !== tempId))
    } finally {
      setEnviando(false)
    }
  }

  return { mensajes, cargando, enviando, mentorAsignado, enviarMensaje, bottomRef }
}
