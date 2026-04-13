'use client'

import { useState, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { useMentor } from '@/hooks/use-mentor'
import { getMentor } from '@/lib/mentor/config'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  mentorKey: string
}

export function MentorChat({ mentorKey }: Props) {
  const { mensajes, cargando, enviando, enviarMensaje, bottomRef } = useMentor()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const mentor = getMentor(mentorKey)

  async function handleEnviar() {
    if (!input.trim() || enviando) return
    const texto = input
    setInput('')
    await enviarMensaje(texto)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleEnviar()
    }
  }

  if (!mentor) return null

  return (
    <div className="flex flex-col h-[65vh] max-h-[600px]">
      <div className="flex items-center gap-3 pb-4 border-b border-border mb-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-surface-1 border border-border flex-shrink-0">
          {mentor.avatar}
        </div>
        <div>
          <p className={cn('font-display font-bold text-sm', mentor.color)}>{mentor.nombre}</p>
          <p className="text-xs text-muted-foreground font-body">
            {mentor.titulo} · {mentor.arquetipo}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 py-2 px-1">
        {cargando ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-muted-foreground font-body animate-pulse">
              {mentor.nombre} prepara sus palabras...
            </p>
          </div>
        ) : mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <span className="text-5xl opacity-20">{mentor.avatar}</span>
            <div className="space-y-1.5">
              <p className="text-sm font-display font-semibold text-muted-foreground">
                {mentor.nombre} aguarda.
              </p>
              <p className="text-xs text-muted-foreground/60 font-body leading-relaxed max-w-xs">
                El primer mensaje abre la conversación. Habla con honestidad — el Mentor recuerda
                todo.
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {mensajes.map((m) => {
              const esMentor = m.rol === 'mentor'
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    'flex flex-col gap-1 max-w-[82%]',
                    esMentor ? 'items-start' : 'ml-auto items-end'
                  )}
                >
                  <p className="text-xs text-muted-foreground font-body px-1">
                    {esMentor ? mentor.nombre : 'Tú'}
                  </p>
                  <div
                    className={cn(
                      'px-4 py-3 text-sm font-body leading-relaxed',
                      esMentor
                        ? cn(
                            'bg-surface-2 border border-border rounded-2xl rounded-tl-sm',
                            mentor.color
                          )
                        : 'bg-amber text-black rounded-2xl rounded-tr-sm'
                    )}
                  >
                    {m.contenido}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}

        <AnimatePresence>
          {enviando && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 max-w-[82%]"
            >
              <p className="text-xs text-muted-foreground font-body px-1">{mentor.nombre}</p>
              <div className="bg-surface-2 border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border pt-3 flex gap-2 items-end mt-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Habla con ${mentor.nombre}...`}
          rows={1}
          disabled={enviando || cargando}
          className={cn(
            'flex-1 bg-surface-1 border border-border rounded-2xl px-4 py-3',
            'text-base font-body text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:border-amber/40 transition-colors',
            'resize-none disabled:opacity-50 max-h-32 leading-relaxed'
          )}
          style={{ minHeight: '48px' }}
        />
        <button
          type="button"
          onClick={() => void handleEnviar()}
          disabled={enviando || !input.trim() || cargando}
          className={cn(
            'w-12 h-12 rounded-full transition-all flex-shrink-0',
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
