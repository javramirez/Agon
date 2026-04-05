'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Props {
  nombre: string
}

export function OnboardingClient({ nombre }: Props) {
  const [paso, setPaso] = useState<'bienvenida' | 'oraculo' | 'sellando'>('bienvenida')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  async function sellarOraculo() {
    if (mensaje.trim().length < 10) {
      setError('El Oráculo requiere al menos 10 caracteres.')
      return
    }

    setCargando(true)
    setPaso('sellando')
    setError('')

    try {
      const res = await fetch('/api/oraculo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al sellar')
      setCargando(false)
      setPaso('oraculo')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">

      {paso === 'bienvenida' && (
        <div className="max-w-lg text-center space-y-8 animate-in fade-in duration-700">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm tracking-widest uppercase font-body">
              El Gran Agon
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight">
              El Altis te reconoce,<br />
              <span className="text-amber">{nombre}.</span>
            </h1>
          </div>

          <div className="space-y-4 text-muted-foreground text-base leading-relaxed font-body">
            <p>
              Durante 29 días, cada prueba que superes acumulará kleos.
              Cada prueba que falles, el Altis lo registrará también.
            </p>
            <p>
              Tu antagonista ya está listo. El agon no espera.
            </p>
            <p className="text-muted-foreground/70 text-sm italic">
              &quot;La excelencia no se declara. Se inscribe.&quot;
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPaso('oraculo')}
            className="w-full py-4 bg-amber text-primary-foreground font-bold text-sm tracking-widest uppercase rounded-lg hover:opacity-90 transition-opacity font-body"
          >
            Consultar El Oráculo
          </button>
        </div>
      )}

      {paso === 'oraculo' && (
        <div className="max-w-lg w-full space-y-8 animate-in fade-in duration-500">
          <div className="text-center space-y-3">
            <p className="text-amber text-xs tracking-widest uppercase font-body">
              El Oráculo
            </p>
            <h2 className="font-display text-2xl font-bold">
              Escribe un mensaje para tu yo del día 29.
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed font-body">
              El Altis lo sellará hoy. Solo se revelará el 4 de mayo,
              en La Ceremonia del Veredicto. El Oráculo no miente
              — y tampoco olvida.
            </p>
          </div>

          <div className="space-y-3">
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="¿Qué le dirías a tu yo del día 1 si lo cumplieras todo?"
              rows={6}
              className={cn(
                'w-full bg-surface-2 border border-border rounded-xl p-4',
                'text-foreground placeholder:text-muted-foreground resize-none',
                'focus:outline-none focus:border-amber/50 transition-colors',
                'text-base leading-relaxed font-body'
              )}
            />
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground text-xs font-body">
                {mensaje.length} caracteres
                {mensaje.length < 10 && ' — mínimo 10'}
              </p>
              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={sellarOraculo}
            disabled={cargando || mensaje.trim().length < 10}
            className="w-full py-4 bg-amber text-primary-foreground font-bold text-sm tracking-widest uppercase rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed font-body"
          >
            Sellar El Oráculo
          </button>

          <p className="text-center text-muted-foreground/70 text-xs font-body">
            Una vez sellado, no podrás modificarlo.
          </p>
        </div>
      )}

      {paso === 'sellando' && (
        <div className="max-w-lg text-center space-y-6 animate-in fade-in duration-500">
          <div className="text-6xl">⚖️</div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold">El Oráculo ha sido consultado.</h2>
            <p className="text-muted-foreground text-sm font-body">
              Tu mensaje quedó sellado en el Altis. Solo el Gran Agon
              puede revelarlo.
            </p>
          </div>
          <p className="text-amber text-sm animate-pulse font-body">
            Entrando al Gran Agon...
          </p>
        </div>
      )}

    </div>
  )
}
