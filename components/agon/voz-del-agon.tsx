'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PROVOCACIONES } from '@/lib/db/constants'
import { cn } from '@/lib/utils'

interface Props {
  nivel: string
  onEnviada?: () => void
}

const NIVEL_MINIMO = [
  'agonista',
  'luchador',
  'campeon',
  'heroe',
  'semidios',
  'olimpico',
  'leyenda_del_agon',
  'inmortal',
] as const

export function VozDelAgon({ nivel, onEnviada }: Props) {
  const router = useRouter()
  const [modo, setModo] = useState<'banco' | 'custom'>('banco')
  const [seleccionada, setSeleccionada] = useState<string | null>(null)
  const [custom, setCustom] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState(false)
  const [error, setError] = useState('')

  const tieneAcceso = NIVEL_MINIMO.includes(nivel as (typeof NIVEL_MINIMO)[number])

  async function enviar() {
    const mensaje = modo === 'banco' ? seleccionada : custom.trim()
    if (!mensaje) return

    setEnviando(true)
    setError('')

    const res = await fetch('/api/provocaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje }),
    })

    if (res.ok) {
      setEnviada(true)
      setSeleccionada(null)
      setCustom('')
      onEnviada?.()
      router.refresh()
      setTimeout(() => setEnviada(false), 3000)
    } else {
      const data = (await res.json()) as { error?: string }
      setError(data.error ?? 'Error')
    }

    setEnviando(false)
  }

  if (!tieneAcceso) {
    return (
      <div className="bg-surface-1 rounded-lg border border-border p-4 text-center space-y-2">
        <p className="text-2xl opacity-30">🗣️</p>
        <p className="text-xs text-muted-foreground font-body">
          La Voz del Agon se desbloquea en nivel Agonista.
        </p>
      </div>
    )
  }

  if (enviada) {
    return (
      <div className="bg-surface-1 rounded-lg border border-amber/20 p-4 text-center space-y-2 animate-fade-in">
        <p className="text-2xl">🗣️</p>
        <p className="text-sm font-display text-amber">La Voz del Agon habló.</p>
        <p className="text-xs text-muted-foreground font-body">
          El Ágora lo presenció todo.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setModo('banco')}
          className={cn(
            'flex-1 py-2 rounded-lg border text-xs font-body transition-all',
            modo === 'banco'
              ? 'bg-surface-2 border-border-strong text-foreground'
              : 'bg-transparent border-border text-muted-foreground hover:text-foreground'
          )}
        >
          Del banco
        </button>
        <button
          type="button"
          onClick={() => setModo('custom')}
          className={cn(
            'flex-1 py-2 rounded-lg border text-xs font-body transition-all',
            modo === 'custom'
              ? 'bg-surface-2 border-border-strong text-foreground'
              : 'bg-transparent border-border text-muted-foreground hover:text-foreground'
          )}
        >
          Escribir la mía
        </button>
      </div>

      {modo === 'banco' && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {PROVOCACIONES.map((p, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setSeleccionada(p)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border text-sm font-body',
                'italic transition-all leading-relaxed',
                seleccionada === p
                  ? 'bg-surface-2 border-amber/40 text-foreground'
                  : 'bg-surface-1 border-border text-muted-foreground hover:border-border-strong hover:text-foreground'
              )}
            >
              &ldquo;{p}&rdquo;
            </button>
          ))}
        </div>
      )}

      {modo === 'custom' && (
        <div className="space-y-2">
          <textarea
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Escribe tu provocación al antagonista..."
            rows={3}
            maxLength={200}
            className={cn(
              'w-full bg-surface-1 border border-border rounded-lg px-4 py-3',
              'text-sm font-body text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:border-amber/40 transition-colors resize-none'
            )}
          />
          <p className="text-xs text-muted-foreground text-right font-body">
            {custom.length}/200
          </p>
        </div>
      )}

      {error && <p className="text-xs text-red-400 font-body">{error}</p>}

      <button
        type="button"
        onClick={() => void enviar()}
        disabled={enviando || (modo === 'banco' ? !seleccionada : !custom.trim())}
        className={cn(
          'w-full py-3 rounded-lg font-display font-bold text-sm tracking-widest uppercase',
          'bg-amber text-black hover:bg-amber/90 transition-all',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
      >
        {enviando ? 'El Ágora escucha...' : 'Lanzar La Voz del Agon'}
      </button>
    </div>
  )
}
