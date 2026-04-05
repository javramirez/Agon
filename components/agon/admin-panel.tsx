'use client'

import { useState, useEffect } from 'react'
import { PRUEBAS_EXTRAORDINARIAS } from '@/lib/db/constants'
import { cn } from '@/lib/utils'

export function AdminPanel() {
  const [semanaSagradaActiva, setSemanaSagradaActiva] = useState(false)
  const [pruebaSeleccionada, setPruebaSeleccionada] = useState<string | null>(
    null
  )
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [generandoCronica, setGenerandoCronica] = useState(false)
  const [cronica, setCronica] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/semana-sagrada')
      .then((r) => r.json())
      .then((d) => setSemanaSagradaActiva(d.activa))
  }, [])

  async function activarSemanaSagrada() {
    setEnviando(true)
    const res = await fetch('/api/admin/semana-sagrada', { method: 'POST' })
    if (res.ok) {
      setSemanaSagradaActiva(true)
      setMensaje('⚡ La Semana Sagrada fue activada. El Ágora ya lo sabe.')
    } else {
      const d = await res.json()
      setMensaje(d.error ?? 'Error')
    }
    setEnviando(false)
  }

  async function activarPruebaExtraordinaria() {
    if (!pruebaSeleccionada) return
    setEnviando(true)
    const res = await fetch('/api/admin/prueba-extraordinaria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pruebaId: pruebaSeleccionada }),
    })
    if (res.ok) {
      setMensaje(
        '🌟 La Prueba Extraordinaria fue activada. Expira a medianoche.'
      )
      setPruebaSeleccionada(null)
    } else {
      const d = await res.json()
      setMensaje(d.error ?? 'Error')
    }
    setEnviando(false)
  }

  async function generarCronica() {
    setGenerandoCronica(true)
    const res = await fetch('/api/cronica', { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setCronica(data.relato)
      setMensaje('📜 La Crónica del Período fue generada y publicada en El Ágora.')
    } else {
      const d = await res.json()
      setMensaje(d.error ?? 'Error')
    }
    setGenerandoCronica(false)
  }

  return (
    <div className="space-y-8">
      {mensaje && (
        <div className="px-4 py-3 bg-surface-1 border border-amber/20 rounded-lg">
          <p className="text-sm font-body text-amber">{mensaje}</p>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h2 className="font-display text-lg font-semibold">
            La Semana Sagrada
          </h2>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Activa el multiplicador x2 de kleos para la semana actual. Solo puede
            usarse una vez en todo el Gran Agon.
          </p>
        </div>
        <button
          type="button"
          onClick={activarSemanaSagrada}
          disabled={enviando || semanaSagradaActiva}
          className="px-6 py-3 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-amber/90 transition-all disabled:opacity-40"
        >
          {semanaSagradaActiva ? 'Ya está activa' : 'Activar Semana Sagrada'}
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="font-display text-lg font-semibold">
            La Prueba Extraordinaria
          </h2>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Selecciona y activa el reto del día. Expira a medianoche.
          </p>
        </div>

        <div className="space-y-2">
          {PRUEBAS_EXTRAORDINARIAS.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => setPruebaSeleccionada(p.id)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border text-sm font-body transition-all',
                pruebaSeleccionada === p.id
                  ? 'bg-surface-2 border-amber/40 text-foreground'
                  : 'bg-surface-1 border-border text-muted-foreground hover:border-border'
              )}
            >
              <span className="text-foreground">{p.descripcion}</span>
              <span className="text-amber ml-2 text-xs">+{p.kleos} kleos</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={activarPruebaExtraordinaria}
          disabled={enviando || !pruebaSeleccionada}
          className="px-6 py-3 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-amber/90 transition-all disabled:opacity-40"
        >
          Activar Prueba Extraordinaria
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="font-display text-lg font-semibold">
            La Crónica del Período
          </h2>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Genera el resumen épico de la semana actual. Se publica automáticamente
            en El Ágora.
          </p>
        </div>

        {cronica && (
          <div className="bg-surface-1 border border-amber/20 rounded-lg p-4">
            <p className="text-sm font-body text-foreground leading-relaxed italic">
              &ldquo;{cronica}&rdquo;
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={generarCronica}
          disabled={generandoCronica}
          className="px-6 py-3 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-amber/90 transition-all disabled:opacity-40"
        >
          {generandoCronica
            ? 'El cronista escribe...'
            : 'Generar La Crónica'}
        </button>
      </div>
    </div>
  )
}
