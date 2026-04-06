'use client'

import { useState, useEffect } from 'react'
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
  const [semanaSagradaInfo, setSemanaSagradaInfo] = useState<{
    activa: boolean
    semanaSorteada: number | null
  } | null>(null)
  const [generandoCalendario, setGenerandoCalendario] = useState(false)
  const [calendarioGenerado, setCalendarioGenerado] = useState(false)
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
      .then((d: { activa?: boolean; semanaSorteada?: number | null }) => {
        setSemanaSagradaActiva(!!d.activa)
        setSemanaSagradaInfo({
          activa: !!d.activa,
          semanaSorteada: d.semanaSorteada ?? null,
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/admin/calendario')
      .then((r) => r.json())
      .then((d: { existe?: boolean }) => {
        if (d.existe) setCalendarioGenerado(true)
      })
      .catch(() => {})
  }, [])

  async function generarCalendario() {
    setGenerandoCalendario(true)
    const res = await fetch('/api/admin/calendario', { method: 'POST' })
    const data = (await res.json()) as { ok?: boolean; error?: string }
    if (data.ok) {
      setCalendarioGenerado(true)
      setMensaje(
        '🗓️ Calendario del Gran Agon generado. Los eventos se activarán con los triggers (dashboard, Ágora, Altis).'
      )
    } else {
      setMensaje(`Error: ${data.error ?? res.statusText}`)
    }
    setGenerandoCalendario(false)
  }

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
            Con el calendario generado, se activa sola cuando alguien abre el
            dashboard en la semana sorteada. El botón es solo respaldo de
            emergencia.
          </p>
        </div>
        {semanaSagradaInfo && (
          <div className="bg-surface-2 rounded-lg p-3 text-xs font-body space-y-1">
            <p className="text-muted-foreground">
              Semana sorteada:{' '}
              <span className="text-amber font-medium">
                Semana {semanaSagradaInfo.semanaSorteada ?? '—'}
              </span>
            </p>
            <p className="text-muted-foreground">
              Estado:{' '}
              <span
                className={
                  semanaSagradaInfo.activa
                    ? 'text-amber font-medium'
                    : 'text-muted-foreground'
                }
              >
                {semanaSagradaInfo.activa ? 'Activa ahora' : 'Pendiente'}
              </span>
            </p>
            <p className="text-muted-foreground/50 italic">
              Se activará automáticamente cuando cualquiera abra el dashboard
              durante la semana {semanaSagradaInfo.semanaSorteada ?? '—'}.
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={activarSemanaSagrada}
          disabled={enviando || semanaSagradaActiva}
          className="px-6 py-3 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-amber/90 transition-all disabled:opacity-40"
        >
          {semanaSagradaActiva ? 'Ya está activa' : 'Activar Semana Sagrada (manual)'}
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Calendario del Gran Agon
          </h2>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Genera el calendario el día 1 del desafío. Sortea la Semana Sagrada
            y distribuye los 20 Eventos del Destino en los días 3–27. Solo se
            puede generar una vez. Los eventos se activan con triggers en
            dashboard, Ágora y Altis.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void generarCalendario()}
          disabled={generandoCalendario || calendarioGenerado}
          className="px-6 py-3 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-amber/90 transition-all disabled:opacity-40"
        >
          {calendarioGenerado
            ? '✓ Calendario generado'
            : generandoCalendario
              ? 'Generando...'
              : 'Generar Calendario del Gran Agon'}
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
