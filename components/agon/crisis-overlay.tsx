'use client'

import { createPortal } from 'react-dom'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface OpcionCrisis {
  label: string
  argumentoFavor: string
  argumentoContra: string
}

interface ConfigCrisis {
  titulo: string
  lider?: string
  mecanicas: string[]
  descripcionNarrativa: string
  opcionA: OpcionCrisis
  opcionB: OpcionCrisis
  estrivia?: boolean
  categoriasTrivia?: string[]
  habitoApuesta?: string
  kleosApuesta?: number
  kleosSacrificio?: number
}

export interface PreguntaTriviaUi {
  id: string
  pregunta: string
  opciones: [string, string, string, string]
  correcta: 0 | 1 | 2 | 3
}

export interface CrisisData {
  id: string
  crisisId: string
  semana: number
  fechaExpiracion: string
  resuelta: boolean
  config: ConfigCrisis
  miDecision: string | null
  decisionRival: string | null
  miTexto: string | null
  textoRival: string | null
  miPuntaje: number | null
  triviaPreguntas: string[] | null
  liderModificado: unknown
}

interface Props {
  crisis: CrisisData
  onDecidido: () => void
}

function ComponenteTrivia({
  preguntas,
  onCompletado,
}: {
  preguntas: PreguntaTriviaUi[]
  onCompletado: (puntaje: number) => void
}) {
  const [indice, setIndice] = useState(0)
  const [seleccionada, setSeleccionada] = useState<number | null>(null)
  const [respuestas, setRespuestas] = useState<boolean[]>([])
  const [tiempoRestante, setTiempoRestante] = useState(180)
  const [completada, setCompletada] = useState(false)

  const respuestasRef = useRef<boolean[]>([])
  const onCompletadoRef = useRef(onCompletado)
  const tiempoAgotadoEnviado = useRef(false)

  useEffect(() => {
    onCompletadoRef.current = onCompletado
  }, [onCompletado])

  useEffect(() => {
    respuestasRef.current = respuestas
  }, [respuestas])

  useEffect(() => {
    if (completada) return
    const interval = setInterval(() => {
      setTiempoRestante((t) => {
        if (t <= 1) {
          clearInterval(interval)
          if (!tiempoAgotadoEnviado.current) {
            tiempoAgotadoEnviado.current = true
            const puntaje = respuestasRef.current.filter(Boolean).length * 10
            onCompletadoRef.current(puntaje)
          }
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [completada])

  const preguntaActual = preguntas[indice]
  if (!preguntaActual) return null

  const minutos = Math.floor(tiempoRestante / 60)
  const segundos = tiempoRestante % 60

  function confirmarRespuesta() {
    if (seleccionada === null) return

    const esCorrecta = seleccionada === preguntaActual.correcta
    const nuevasRespuestas = [...respuestas, esCorrecta]
    setRespuestas(nuevasRespuestas)
    respuestasRef.current = nuevasRespuestas

    if (indice + 1 >= preguntas.length) {
      setCompletada(true)
      tiempoAgotadoEnviado.current = true
      const puntaje = nuevasRespuestas.filter(Boolean).length * 10
      setTimeout(() => onCompletadoRef.current(puntaje), 800)
    } else {
      setIndice(indice + 1)
      setSeleccionada(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          Pregunta {indice + 1} de {preguntas.length}
        </p>
        <p
          className="text-sm font-semibold tabular-nums"
          style={{
            color:
              tiempoRestante < 30 ? '#ef4444' : 'rgba(255,255,255,0.5)',
          }}
        >
          {minutos}:{segundos.toString().padStart(2, '0')}
        </p>
      </div>

      <p
        className="text-sm leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.85)' }}
      >
        {preguntaActual.pregunta}
      </p>

      <div className="flex flex-col gap-2">
        {preguntaActual.opciones.map((opcion, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSeleccionada(i)}
            className="w-full text-left rounded-xl px-4 py-3 text-sm transition-all duration-150"
            style={{
              backgroundColor:
                seleccionada === i
                  ? 'rgba(251,191,36,0.15)'
                  : 'rgba(255,255,255,0.04)',
              border: `1px solid ${
                seleccionada === i
                  ? 'rgba(251,191,36,0.4)'
                  : 'rgba(255,255,255,0.08)'
              }`,
              color:
                seleccionada === i
                  ? 'rgb(252,211,77)'
                  : 'rgba(255,255,255,0.6)',
            }}
          >
            {opcion}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={confirmarRespuesta}
        disabled={seleccionada === null}
        className="w-full rounded-xl py-3 text-sm font-semibold uppercase tracking-widest transition-all"
        style={{
          backgroundColor:
            seleccionada !== null ? 'rgb(252,211,77)' : 'rgba(255,255,255,0.08)',
          color: seleccionada !== null ? '#000' : 'rgba(255,255,255,0.2)',
          cursor: seleccionada !== null ? 'pointer' : 'not-allowed',
        }}
      >
        Confirmar
      </button>
    </div>
  )
}

export function CrisisOverlay({ crisis, onDecidido }: Props) {
  const [montado, setMontado] = useState(false)
  const [fase, setFase] = useState<
    'narrativa' | 'decision' | 'texto' | 'trivia' | 'confirmado' | 'espera'
  >('narrativa')
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<'A' | 'B' | null>(
    null
  )
  const [textoLibre, setTextoLibre] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [preguntasTrivia, setPreguntasTrivia] = useState<PreguntaTriviaUi[]>([])

  const esH = crisis.config.mecanicas.includes('H')
  const esG = crisis.config.mecanicas.includes('G')
  const esTrivia = crisis.config.estrivia

  useEffect(() => {
    setMontado(true)
  }, [])

  useEffect(() => {
    if (!crisis.miDecision) return
    setOpcionSeleccionada(crisis.miDecision as 'A' | 'B')
    setFase((f) => {
      if (f === 'confirmado' || f === 'espera') return f
      return esH ? 'confirmado' : 'espera'
    })
  }, [crisis.miDecision, esH])

  const enviarDecision = useCallback(
    async (decision: 'A' | 'B', texto?: string, puntaje?: number) => {
      setEnviando(true)
      try {
        await fetch('/api/crisis/decidir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decision,
            respuestaTexto: texto,
            puntaje,
          }),
        })
        setFase(esH ? 'confirmado' : 'espera')
        onDecidido()
      } catch {
        console.error('Error enviando decisión')
      } finally {
        setEnviando(false)
      }
    },
    [esH, onDecidido]
  )

  async function handleConfirmarDesdeOpciones() {
    if (!opcionSeleccionada) return
    if (esG) {
      setFase('texto')
      return
    }
    if (esTrivia && opcionSeleccionada === 'A') {
      setEnviando(true)
      try {
        const res = await fetch(
          `/api/crisis/trivia?crisisId=${encodeURIComponent(crisis.crisisId)}`
        )
        const data = (await res.json()) as { preguntas?: PreguntaTriviaUi[] }
        if (Array.isArray(data.preguntas) && data.preguntas.length > 0) {
          setPreguntasTrivia(data.preguntas)
          setFase('trivia')
        } else {
          void enviarDecision('A')
        }
      } catch {
        void enviarDecision('A')
      } finally {
        setEnviando(false)
      }
      return
    }
    void enviarDecision(opcionSeleccionada)
  }

  const horasRestantes = Math.max(
    0,
    Math.floor(
      (new Date(crisis.fechaExpiracion).getTime() - Date.now()) /
        (1000 * 60 * 60)
    )
  )

  if (!montado) return null

  const colorCrisis = '#BA7517'

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.97)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="pointer-events-none absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(to right, transparent, ${colorCrisis}, transparent)`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(to right, transparent, ${colorCrisis}66, transparent)`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        <motion.div
          className="w-full max-w-lg flex flex-col gap-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div
                className="px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-semibold"
                style={{ backgroundColor: `${colorCrisis}22`, color: colorCrisis }}
              >
                ⚡ Crisis de Ciudad — Semana {crisis.semana}
              </div>
              <p
                className="text-[10px]"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                {horasRestantes}h restantes
              </p>
            </div>
            <h1
              className="text-2xl font-semibold tracking-tight"
              style={{ color: 'rgba(255,255,255,0.92)' }}
            >
              {crisis.config.titulo}
            </h1>
            {crisis.config.lider && (
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Protagonista: {crisis.config.lider}
              </p>
            )}
          </div>

          <div
            className="h-px w-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
          />

          {fase === 'narrativa' && (
            <motion.div
              className="flex flex-col gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                {crisis.config.descripcionNarrativa}
              </p>

              {esH && (
                <div
                  className="rounded-xl p-4 text-xs leading-relaxed"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  ⚠️ Decisión ciega — no sabrás lo que eligió tu rival hasta que
                  ambos decidan o expire el plazo de {horasRestantes}h.
                </div>
              )}

              {esG && !crisis.miDecision && crisis.decisionRival && (
                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <p
                    className="text-[10px] uppercase tracking-widest mb-2"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    Tu rival ya respondió
                  </p>
                  <p
                    className="text-sm italic"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    &ldquo;{crisis.textoRival}&rdquo;
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setFase('decision')}
                className="w-full rounded-xl py-4 text-sm font-bold uppercase tracking-widest transition-all"
                style={{ backgroundColor: colorCrisis, color: '#000' }}
              >
                Ver las opciones
              </button>
            </motion.div>
          )}

          {fase === 'decision' && (
            <motion.div
              className="flex flex-col gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {(['A', 'B'] as const).map((opcion) => {
                const datos =
                  opcion === 'A' ? crisis.config.opcionA : crisis.config.opcionB
                const seleccionada = opcionSeleccionada === opcion

                return (
                  <button
                    key={opcion}
                    type="button"
                    onClick={() => setOpcionSeleccionada(opcion)}
                    className="w-full text-left rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200"
                    style={{
                      backgroundColor: seleccionada
                        ? `${colorCrisis}12`
                        : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${
                        seleccionada
                          ? `${colorCrisis}55`
                          : 'rgba(255,255,255,0.07)'
                      }`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                        style={{
                          backgroundColor: seleccionada
                            ? colorCrisis
                            : 'rgba(255,255,255,0.08)',
                          color: seleccionada ? '#000' : 'rgba(255,255,255,0.4)',
                        }}
                      >
                        {opcion}
                      </div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: 'rgba(255,255,255,0.85)' }}
                      >
                        {datos.label}
                      </p>
                    </div>

                    {seleccionada && (
                      <motion.div
                        className="flex flex-col gap-2 ml-9"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        <div className="flex gap-2">
                          <span className="text-[10px] text-green-400 uppercase tracking-widest shrink-0">
                            A favor:
                          </span>
                          <p
                            className="text-xs"
                            style={{ color: 'rgba(255,255,255,0.5)' }}
                          >
                            {datos.argumentoFavor}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[10px] text-red-400 uppercase tracking-widest shrink-0">
                            En contra:
                          </span>
                          <p
                            className="text-xs"
                            style={{ color: 'rgba(255,255,255,0.5)' }}
                          >
                            {datos.argumentoContra}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </button>
                )
              })}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFase('narrativa')}
                  className="flex-1 rounded-xl py-3 text-xs uppercase tracking-widest transition-all"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  Volver
                </button>
                <button
                  type="button"
                  disabled={!opcionSeleccionada || enviando}
                  onClick={() => void handleConfirmarDesdeOpciones()}
                  className="flex-[2] rounded-xl py-3 text-sm font-bold uppercase tracking-widest transition-all"
                  style={{
                    backgroundColor: opcionSeleccionada
                      ? colorCrisis
                      : 'rgba(255,255,255,0.08)',
                    color: opcionSeleccionada ? '#000' : 'rgba(255,255,255,0.2)',
                    cursor: opcionSeleccionada ? 'pointer' : 'not-allowed',
                  }}
                >
                  {enviando ? 'Enviando...' : esG ? 'Continuar →' : 'Confirmar decisión'}
                </button>
              </div>
            </motion.div>
          )}

          {fase === 'texto' && (
            <motion.div
              className="flex flex-col gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p
                className="text-xs uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                Tu mayor obstáculo interno — máximo 280 caracteres
              </p>

              <textarea
                value={textoLibre}
                onChange={(e) => setTextoLibre(e.target.value.slice(0, 280))}
                placeholder="Escribe con honestidad. Esta reflexión quedará inscrita en el Altis permanentemente."
                className="w-full rounded-xl p-4 text-sm resize-none outline-none"
                rows={5}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.8)',
                }}
              />

              <p
                className="text-xs text-right"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                {textoLibre.length}/280
              </p>

              <button
                type="button"
                disabled={textoLibre.trim().length < 10 || enviando}
                onClick={() =>
                  void enviarDecision(opcionSeleccionada!, textoLibre.trim())
                }
                className="w-full rounded-xl py-4 text-sm font-bold uppercase tracking-widest transition-all"
                style={{
                  backgroundColor:
                    textoLibre.trim().length >= 10
                      ? colorCrisis
                      : 'rgba(255,255,255,0.08)',
                  color:
                    textoLibre.trim().length >= 10 ? '#000' : 'rgba(255,255,255,0.2)',
                  cursor:
                    textoLibre.trim().length >= 10 ? 'pointer' : 'not-allowed',
                }}
              >
                {enviando ? 'Inscribiendo...' : 'Inscribir en el Altis'}
              </button>
            </motion.div>
          )}

          {fase === 'trivia' && preguntasTrivia.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p
                className="text-xs uppercase tracking-widest mb-4"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                El Juicio del Logos — 7 preguntas · 3 minutos
              </p>
              <ComponenteTrivia
                preguntas={preguntasTrivia}
                onCompletado={(puntaje) => {
                  void enviarDecision('A', undefined, puntaje)
                }}
              />
            </motion.div>
          )}

          {fase === 'espera' && (
            <motion.div
              className="flex flex-col gap-4 items-center text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{
                  backgroundColor: `${colorCrisis}18`,
                  border: `1px solid ${colorCrisis}44`,
                }}
              >
                ⚔️
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  Tu decisión está inscrita
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Elegiste la opción {opcionSeleccionada}.
                  {!crisis.decisionRival
                    ? ' Esperando a tu rival...'
                    : ' La crisis se resolverá en tu próximo login.'}
                </p>
              </div>

              {crisis.decisionRival && !esH && (
                <div
                  className="rounded-xl px-4 py-2 text-xs"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  Tu rival eligió la opción {crisis.decisionRival}
                </div>
              )}

              <button
                type="button"
                onClick={onDecidido}
                className="mt-2 rounded-xl px-8 py-3 text-xs uppercase tracking-widest font-semibold transition-all"
                style={{ backgroundColor: colorCrisis, color: '#000' }}
              >
                Continuar al Agon
              </button>
            </motion.div>
          )}

          {fase === 'confirmado' && (
            <motion.div
              className="flex flex-col gap-4 items-center text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Tu decisión está sellada. Nadie sabrá lo que elegiste hasta que el
                plazo expire.
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {horasRestantes}h restantes para que tu rival decida.
              </p>
              <button
                type="button"
                onClick={onDecidido}
                className="mt-2 rounded-xl px-8 py-3 text-xs uppercase tracking-widest font-semibold"
                style={{ backgroundColor: colorCrisis, color: '#000' }}
              >
                Continuar al Agon
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
