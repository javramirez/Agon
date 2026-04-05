'use client'

import { useState, useEffect } from 'react'
import { PRUEBAS_EXTRAORDINARIAS } from '@/lib/db/constants'
import { cn } from '@/lib/utils'

interface DiagnosticoCronica {
  agonista1: {
    nombre: string
    registros: number
    diasPerfectos: number
    diasPerfectosPorLogica: number
    kleosDesdePruebas: number
  }
  agonista2: {
    nombre: string
    registros: number
    diasPerfectos: number
    diasPerfectosPorLogica: number
    kleosDesdePruebas: number
  }
  rangoDetectado: { fechaMinima: string; fechaMaxima: string }
  totalRegistros: number
}

export function AdminPanel() {
  const [semanaSagradaActiva, setSemanaSagradaActiva] = useState(false)
  const [pruebaSeleccionada, setPruebaSeleccionada] = useState<string | null>(
    null
  )
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [generandoCronica, setGenerandoCronica] = useState(false)
  const [cronica, setCronica] = useState<string | null>(null)
  const [diagnostico, setDiagnostico] = useState<DiagnosticoCronica | null>(
    null
  )
  const [probandoCronica, setProbandoCronica] = useState(false)

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

  async function generarCronicaSemanaActual() {
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

  async function diagnosticarCronica() {
    const res = await fetch('/api/cronica/test')
    const data = (await res.json()) as {
      diagnostico?: DiagnosticoCronica
      error?: string
    }
    if (res.ok && data.diagnostico) {
      setDiagnostico(data.diagnostico)
      setMensaje('')
    } else {
      setDiagnostico(null)
      setMensaje(data.error ?? 'Error al diagnosticar')
    }
  }

  async function probarCronica() {
    setProbandoCronica(true)
    try {
      const res = await fetch('/api/cronica/test', { method: 'POST' })
      const data = (await res.json()) as { ok?: boolean; relato?: string; error?: string }
      if (data.ok && data.relato) {
        setCronica(data.relato)
        setMensaje('📜 Crónica de prueba generada.')
      } else {
        setMensaje(`Error: ${data.error ?? res.statusText}`)
      }
    } finally {
      setProbandoCronica(false)
    }
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
          onClick={generarCronicaSemanaActual}
          disabled={generandoCronica}
          className="px-6 py-3 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-amber/90 transition-all disabled:opacity-40"
        >
          {generandoCronica
            ? 'El cronista escribe...'
            : 'Generar La Crónica'}
        </button>

        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground font-body">
            Herramientas de diagnóstico
          </p>

          <button
            type="button"
            onClick={() => void diagnosticarCronica()}
            className="w-full py-2.5 border border-border rounded-lg text-xs font-body text-muted-foreground hover:text-foreground transition-all"
          >
            Ver datos en DB
          </button>

          {diagnostico && (
            <div className="bg-surface-2 rounded-lg p-3 space-y-2 text-xs font-body">
              <p className="text-amber font-medium">Datos encontrados en DB:</p>
              <div className="space-y-1 text-muted-foreground">
                <p>
                  {diagnostico.agonista1.nombre}:{' '}
                  {diagnostico.agonista1.registros} días ·{' '}
                  {diagnostico.agonista1.diasPerfectos} perfectos (DB) ·{' '}
                  {diagnostico.agonista1.diasPerfectosPorLogica} perfectos
                  (lógica) · {diagnostico.agonista1.kleosDesdePruebas} kleos
                </p>
                <p>
                  {diagnostico.agonista2.nombre}:{' '}
                  {diagnostico.agonista2.registros} días ·{' '}
                  {diagnostico.agonista2.diasPerfectos} perfectos (DB) ·{' '}
                  {diagnostico.agonista2.diasPerfectosPorLogica} perfectos
                  (lógica) · {diagnostico.agonista2.kleosDesdePruebas} kleos
                </p>
                <p>
                  Fechas: {diagnostico.rangoDetectado.fechaMinima} →{' '}
                  {diagnostico.rangoDetectado.fechaMaxima}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => void probarCronica()}
            disabled={probandoCronica}
            className="w-full py-2.5 border border-amber/30 rounded-lg text-xs font-body text-amber hover:bg-amber/5 transition-all disabled:opacity-50"
          >
            {probandoCronica
              ? 'Generando crónica de prueba...'
              : 'Generar crónica con datos reales de DB'}
          </button>
        </div>
      </div>
    </div>
  )
}
