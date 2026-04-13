'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MENTORES } from '@/lib/mentor/config'
import {
  OPCIONES_CAMBIO,
  getMentorParaArquetipo,
} from '@/lib/consulta-mediodia/config'

interface Props {
  mentorActual: string
  arquetipoActual: string
  puntoPartida: string
}

type Paso =
  | 'intro'
  | 'sacrificio'
  | 'momento'
  | 'cambio'
  | 'decision_mentor'
  | 'cierre'

export function ConsultaMediadiaClient({
  mentorActual,
  arquetipoActual,
  puntoPartida,
}: Props) {
  const router = useRouter()
  const [paso, setPaso] = useState<Paso>('intro')
  const [elSacrificio, setElSacrificio] = useState('')
  const [elMomento, setElMomento] = useState('')
  const [queHaCambiado, setQueHaCambiado] = useState('')
  const [mentorNuevo, setMentorNuevo] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [submitRealizado, setSubmitRealizado] = useState(false)

  const mentorActualData = MENTORES[mentorActual as keyof typeof MENTORES]

  const opcionSeleccionada = useMemo(
    () => OPCIONES_CAMBIO.find((o) => o.valor === queHaCambiado) ?? null,
    [queHaCambiado]
  )

  function handleSeleccionCambio(valor: string) {
    setQueHaCambiado(valor)
    const opcion = OPCIONES_CAMBIO.find((o) => o.valor === valor)

    if (
      opcion?.arquetipoResultante &&
      opcion.arquetipoResultante !== arquetipoActual
    ) {
      const nuevoMentor = getMentorParaArquetipo(
        opcion.arquetipoResultante,
        puntoPartida
      )
      if (nuevoMentor !== mentorActual) {
        setMentorNuevo(nuevoMentor)
        setPaso('decision_mentor')
        return
      }
    }

    setMentorNuevo(null)
    void handleSubmit(false)
  }

  async function handleSubmit(aceptoCambioMentor: boolean) {
    if (submitRealizado) return
    setEnviando(true)
    try {
      const res = await fetch('/api/consulta-mediodia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elSacrificio,
          elMomento,
          queHaCambiado,
          aceptoCambioMentor,
        }),
      })

      if (!res.ok) {
        setEnviando(false)
        return
      }

      setSubmitRealizado(true)
      setPaso('cierre')
    } catch {
      setEnviando(false)
    }
  }

  const variantes = {
    entrada: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
    salida: { opacity: 0, y: -8 },
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: '#080808' }}
    >
      <AnimatePresence mode="wait">
        {paso === 'intro' && (
          <motion.div
            key="intro"
            variants={variantes}
            initial="entrada"
            animate="visible"
            exit="salida"
            transition={{ duration: 0.4 }}
            className="max-w-lg w-full text-center flex flex-col gap-8"
          >
            <div>
              <p
                className="text-[10px] uppercase tracking-widest mb-4"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                Día 15 · La Consulta del Mediodía
              </p>
              <h1
                className="text-3xl font-semibold leading-tight"
                style={{ color: 'rgba(255,255,255,0.92)' }}
              >
                El Oráculo te observa
              </h1>
              <p
                className="text-sm mt-4 leading-relaxed max-w-sm mx-auto"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Han pasado 15 días. Lo que declaraste en el Pacto era una promesa.
                Lo que has vivido es otra cosa. El Olimpo quiere saber qué
                encontraste.
              </p>
            </div>

            <div
              className="rounded-2xl p-5 text-left"
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <p
                className="text-[10px] uppercase tracking-widest mb-3"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                Tu guía hasta ahora
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {mentorActualData?.avatar ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">
                    {mentorActualData?.nombre ?? mentorActual}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    {mentorActualData?.arquetipo ?? ''}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setPaso('sacrificio')}
              className="w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              Responder al Oráculo
            </button>
          </motion.div>
        )}

        {paso === 'sacrificio' && (
          <motion.div
            key="sacrificio"
            variants={variantes}
            initial="entrada"
            animate="visible"
            exit="salida"
            transition={{ duration: 0.4 }}
            className="max-w-lg w-full flex flex-col gap-6"
          >
            <div>
              <p
                className="text-[10px] uppercase tracking-widest mb-3"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                I · El Sacrificio
              </p>
              <h2
                className="text-xl font-semibold"
                style={{ color: 'rgba(255,255,255,0.9)' }}
              >
                ¿Qué has tenido que dejar atrás estos 15 días?
              </h2>
              <p
                className="text-xs mt-2 leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                No hay respuesta correcta. Solo la tuya.
              </p>
            </div>

            <textarea
              value={elSacrificio}
              onChange={(e) => setElSacrificio(e.target.value)}
              placeholder="Escribe aquí..."
              rows={4}
              maxLength={280}
              className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.8)',
              }}
            />

            <div className="flex items-center justify-between">
              <span
                className="text-[10px]"
                style={{ color: 'rgba(255,255,255,0.2)' }}
              >
                {elSacrificio.length}/280
              </span>
              <button
                onClick={() => setPaso('momento')}
                disabled={elSacrificio.trim().length < 5}
                className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-30"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                Continuar →
              </button>
            </div>
          </motion.div>
        )}

        {paso === 'momento' && (
          <motion.div
            key="momento"
            variants={variantes}
            initial="entrada"
            animate="visible"
            exit="salida"
            transition={{ duration: 0.4 }}
            className="max-w-lg w-full flex flex-col gap-6"
          >
            <div>
              <p
                className="text-[10px] uppercase tracking-widest mb-3"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                II · El Momento
              </p>
              <h2
                className="text-xl font-semibold"
                style={{ color: 'rgba(255,255,255,0.9)' }}
              >
                ¿Hubo un momento en que quisiste abandonar?
              </h2>
              <p
                className="text-xs mt-2 leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Si lo hubo, ¿qué pasó? Si no lo hubo, ¿qué te sostuvo?
              </p>
            </div>

            <textarea
              value={elMomento}
              onChange={(e) => setElMomento(e.target.value)}
              placeholder="Escribe aquí..."
              rows={4}
              maxLength={280}
              className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.8)',
              }}
            />

            <div className="flex items-center justify-between">
              <button
                onClick={() => setPaso('sacrificio')}
                className="text-xs"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                ← Volver
              </button>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px]"
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                >
                  {elMomento.length}/280
                </span>
                <button
                  onClick={() => setPaso('cambio')}
                  disabled={elMomento.trim().length < 5}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-30"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.8)',
                  }}
                >
                  Continuar →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {paso === 'cambio' && (
          <motion.div
            key="cambio"
            variants={variantes}
            initial="entrada"
            animate="visible"
            exit="salida"
            transition={{ duration: 0.4 }}
            className="max-w-lg w-full flex flex-col gap-6"
          >
            <div>
              <p
                className="text-[10px] uppercase tracking-widest mb-3"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                III · El Cambio
              </p>
              <h2
                className="text-xl font-semibold"
                style={{ color: 'rgba(255,255,255,0.9)' }}
              >
                ¿Qué has descubierto sobre ti mismo?
              </h2>
              <p
                className="text-xs mt-2 leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Elige lo que más se acerca a tu verdad.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {OPCIONES_CAMBIO.map((opcion) => (
                <button
                  key={opcion.valor}
                  onClick={() => handleSeleccionCambio(opcion.valor)}
                  className="w-full text-left rounded-xl px-4 py-4 transition-all duration-200"
                  style={{
                    backgroundColor:
                      queHaCambiado === opcion.valor
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${
                      queHaCambiado === opcion.valor
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(255,255,255,0.06)'
                    }`,
                  }}
                >
                  <p className="text-sm font-medium text-white/80">
                    {opcion.label}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    {opcion.descripcion}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setPaso('momento')}
              className="text-xs text-left"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              ← Volver
            </button>
          </motion.div>
        )}

        {paso === 'decision_mentor' && mentorNuevo && (
          <motion.div
            key="decision_mentor"
            variants={variantes}
            initial="entrada"
            animate="visible"
            exit="salida"
            transition={{ duration: 0.4 }}
            className="max-w-lg w-full flex flex-col gap-6"
          >
            <div>
              <p
                className="text-[10px] uppercase tracking-widest mb-3"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                Una decisión más
              </p>
              <h2
                className="text-xl font-semibold"
                style={{ color: 'rgba(255,255,255,0.9)' }}
              >
                Tu camino ha cambiado
              </h2>
              <p
                className="text-xs mt-2 leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Lo que declaraste sugiere un nuevo guía. La decisión es tuya.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { key: mentorActual, label: 'Tu guía actual' },
                { key: mentorNuevo, label: 'Nuevo guía sugerido' },
              ].map(({ key, label }) => {
                const data = MENTORES[key as keyof typeof MENTORES]
                return (
                  <div
                    key={key}
                    className="rounded-xl p-4 text-center"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <p
                      className="text-[10px] uppercase tracking-widest mb-3"
                      style={{ color: 'rgba(255,255,255,0.25)' }}
                    >
                      {label}
                    </p>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto mb-2"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {data?.avatar ?? '?'}
                    </div>
                    <p className="text-sm font-medium text-white/80">
                      {data?.nombre ?? key}
                    </p>
                    <p
                      className="text-[11px] mt-0.5"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      {data?.arquetipo ?? ''}
                    </p>
                  </div>
                )
              })}
            </div>

            {MENTORES[mentorNuevo as keyof typeof MENTORES] && (
              <p
                className="text-xs leading-relaxed text-center"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                {
                  MENTORES[mentorNuevo as keyof typeof MENTORES]
                    .descripcion
                }
              </p>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => void handleSubmit(true)}
                disabled={enviando}
                className="w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                Acepto el nuevo guía
              </button>
              <button
                onClick={() => void handleSubmit(false)}
                disabled={enviando}
                className="w-full py-3 rounded-xl text-sm transition-all duration-200 disabled:opacity-50"
                style={{
                  color: 'rgba(255,255,255,0.35)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                Continúo con {mentorActualData?.nombre ?? mentorActual}
              </button>
            </div>
          </motion.div>
        )}

        {paso === 'cierre' && (
          <motion.div
            key="cierre"
            variants={variantes}
            initial="entrada"
            animate="visible"
            exit="salida"
            transition={{ duration: 0.4 }}
            className="max-w-lg w-full text-center flex flex-col gap-8"
          >
            <div>
              <p
                className="text-[10px] uppercase tracking-widest mb-4"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                El Oráculo ha escuchado
              </p>
              <h2
                className="text-2xl font-semibold"
                style={{ color: 'rgba(255,255,255,0.9)' }}
              >
                Quedan 14 días
              </h2>
              <p
                className="text-sm mt-3 leading-relaxed max-w-sm mx-auto"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Lo que declaraste hoy queda inscrito. El Olimpo lo recuerda.
                Ahora vuelve al Agon.
              </p>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              disabled={enviando}
              className="w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              Volver al Agon →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

