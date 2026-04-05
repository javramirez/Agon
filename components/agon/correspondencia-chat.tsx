'use client'

import { useState, useEffect, useRef } from 'react'
import { useCorrespondencia } from '@/hooks/use-correspondencia'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Props {
  agonistId: string
  nombrePropio: string
  nombreAntagonista: string
}

export function CorrespondenciaChat({
  agonistId,
  nombrePropio,
  nombreAntagonista,
}: Props) {
  const { mensajes, cargando, enviando, enviarMensaje, bottomRef } =
    useCorrespondencia(5000)
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handler = () => {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [bottomRef])

  async function handleEnviar() {
    if (!input.trim()) return
    const texto = input
    setInput('')
    await enviarMensaje(texto)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleEnviar()
    }
  }

  return (
    <div className="flex flex-col h-[65vh] max-h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 py-4 px-1">
        {cargando ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-muted-foreground font-body animate-pulse">
              El Altis consulta la correspondencia...
            </p>
          </div>
        ) : mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <span className="text-4xl opacity-20">✉️</span>
            <div className="space-y-1">
              <p className="text-sm font-display font-semibold text-muted-foreground">
                La correspondencia está vacía.
              </p>
              <p className="text-xs text-muted-foreground/60 font-body leading-relaxed max-w-xs">
                El primer mensaje entre agonistas define el tono del Gran Agon.
                Escribe con honor.
              </p>
            </div>
          </div>
        ) : (
          mensajes.map((m) => {
            const esPropio = m.remitenteId === agonistId
            return (
              <div
                key={m.id}
                className={cn(
                  'flex flex-col gap-1 max-w-[80%]',
                  esPropio ? 'ml-auto items-end' : 'items-start'
                )}
              >
                <p className="text-xs text-muted-foreground font-body px-1">
                  {esPropio ? nombrePropio : nombreAntagonista}
                </p>
                <div
                  className={cn(
                    'px-4 py-3 text-sm font-body leading-relaxed',
                    esPropio
                      ? 'bg-amber text-black rounded-2xl rounded-tr-sm'
                      : 'bg-surface-2 text-foreground border border-border rounded-2xl rounded-tl-sm'
                  )}
                >
                  {m.contenido}
                </div>
                <p className="text-xs text-muted-foreground/40 font-body px-1">
                  {formatDistanceToNow(new Date(m.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border pt-3 flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe al antagonista..."
          rows={1}
          disabled={enviando}
          className={cn(
            'flex-1 bg-surface-1 border border-border rounded-2xl px-4 py-3',
            'text-base font-body text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:border-amber/40 transition-colors',
            'resize-none disabled:opacity-50 max-h-32',
            'leading-relaxed'
          )}
          style={{ minHeight: '48px' }}
        />
        <button
          type="button"
          onClick={() => void handleEnviar()}
          disabled={enviando || !input.trim()}
          className={cn(
            'w-12 h-12 rounded-full font-body font-medium transition-all flex-shrink-0',
            'bg-amber text-black hover:bg-amber/90 active:scale-95',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'flex items-center justify-center text-lg'
          )}
        >
          ↑
        </button>
      </div>
    </div>
  )
}
