'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FACCIONES,
  RANGOS_AFINIDAD,
  VENTAJAS_CAMPEON,
  getPoblacionVisible,
  type FaccionId,
} from '@/lib/facciones/config'
import { faccionesAfinidad } from '@/lib/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

type AfinidadRow = InferSelectModel<typeof faccionesAfinidad>

interface Props {
  agonistaNombre: string
  rivalNombre: string
  miAfinidad: AfinidadRow[]
  rivalAfinidad: AfinidadRow[]
}

function getAfinidad(afinidades: AfinidadRow[], faccionId: FaccionId) {
  return afinidades.find((a) => a.faccionId === faccionId)
}

function RangoBadge({ rango, nombre }: { rango: number; nombre: string }) {
  const estilos: Record<number, { bg: string; text: string }> = {
    1: { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.3)' },
    2: { bg: 'rgba(45,212,191,0.12)', text: 'rgb(94,234,212)' },
    3: { bg: 'rgba(99,102,241,0.14)', text: 'rgb(165,180,252)' },
    4: { bg: 'rgba(167,139,250,0.16)', text: 'rgb(196,181,253)' },
    5: { bg: 'rgba(251,191,36,0.16)', text: 'rgb(252,211,77)' },
  }
  const s = estilos[rango] ?? estilos[1]
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {nombre}
    </span>
  )
}

function BarraProgreso({
  puntos,
  color,
  delay = 0,
}: {
  puntos: number
  color: string
  delay?: number
}) {
  const pct = Math.min(100, Math.round((puntos / 150) * 100))
  return (
    <div
      className="w-full h-[3px] rounded-full"
      style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: 'easeOut', delay }}
      />
    </div>
  )
}

function FaccionCard({
  faccionId,
  miAfinidad,
  rivalAfinidad,
  rivalNombre,
  seleccionada,
  onClick,
}: {
  faccionId: FaccionId
  miAfinidad: AfinidadRow[]
  rivalAfinidad: AfinidadRow[]
  agonistaNombre: string
  rivalNombre: string
  seleccionada: boolean
  onClick: () => void
}) {
  const faccion = FACCIONES[faccionId]
  const Icono = faccion.icono
  const miData = getAfinidad(miAfinidad, faccionId)
  const rivData = getAfinidad(rivalAfinidad, faccionId)

  const miPuntos = miData?.puntosAfinidad ?? 0
  const rivPuntos = rivData?.puntosAfinidad ?? 0
  const miRango = miData?.rango ?? 1
  const esCampeon = miRango === 5

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left rounded-2xl p-4 transition-all duration-200"
      style={{
        backgroundColor: seleccionada
          ? `${faccion.color}0F`
          : 'rgba(255,255,255,0.02)',
        border: `1px solid ${seleccionada ? `${faccion.color}55` : 'rgba(255,255,255,0.06)'}`,
        boxShadow: seleccionada ? `0 0 0 1px ${faccion.color}22` : 'none',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `${faccion.color}18`,
            border: `1px solid ${faccion.color}33`,
          }}
        >
          <Icono size={17} style={{ color: faccion.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white/90 leading-tight">
              {faccion.nombre}
            </span>
            {esCampeon && (
              <span
                className="text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${faccion.color}22`,
                  color: faccion.color,
                }}
              >
                Campeón
              </span>
            )}
          </div>
          <div
            className="text-[11px] mt-0.5"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            {faccion.dios} · {faccion.lider}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div
            className="text-sm font-medium"
            style={{
              color: miPuntos > 0 ? faccion.color : 'rgba(255,255,255,0.2)',
            }}
          >
            {miPuntos}
          </div>
          {rivPuntos > 0 && (
            <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {rivalNombre.split(' ')[0]}: {rivPuntos}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3">
        <BarraProgreso puntos={miPuntos} color={faccion.color} />
      </div>
    </motion.button>
  )
}

function AvatarAfinidad({
  inicial,
  puntos,
  rango,
  nombre,
  color,
}: {
  inicial: string
  puntos: number
  rango: number
  nombre: string
  color: string
}) {
  const rangoInfo = RANGOS_AFINIDAD.find((r) => r.rango === rango)
  const activo = rango > 1

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300"
        style={{
          border: `1.5px solid ${activo ? color : 'rgba(255,255,255,0.1)'}`,
          color: activo ? color : 'rgba(255,255,255,0.25)',
          backgroundColor: activo ? `${color}0F` : 'transparent',
        }}
      >
        {inicial}
      </div>
      <div className="text-center">
        <div className="text-xs text-white/50 mb-1">{nombre.split(' ')[0]}</div>
        <RangoBadge rango={rango} nombre={rangoInfo?.nombre ?? 'Desconocido'} />
        <div
          className="text-[11px] mt-1.5"
          style={{ color: activo ? color : 'rgba(255,255,255,0.2)' }}
        >
          {puntos} pts
        </div>
      </div>
    </div>
  )
}

function PanelDetalle({
  faccionId,
  miAfinidad,
  rivalAfinidad,
  agonistaNombre,
  rivalNombre,
}: {
  faccionId: FaccionId
  miAfinidad: AfinidadRow[]
  rivalAfinidad: AfinidadRow[]
  agonistaNombre: string
  rivalNombre: string
}) {
  const faccion = FACCIONES[faccionId]
  const Icono = faccion.icono
  const miData = getAfinidad(miAfinidad, faccionId)
  const rivData = getAfinidad(rivalAfinidad, faccionId)

  const miPuntos = miData?.puntosAfinidad ?? 0
  const rivPuntos = rivData?.puntosAfinidad ?? 0
  const miRango = miData?.rango ?? 1
  const rivRango = rivData?.rango ?? 1

  const poblacionVisible = getPoblacionVisible(faccion, miRango)
  const poblacionRivVisible = getPoblacionVisible(faccion, rivRango)
  const sigRangoInfo = RANGOS_AFINIDAD.find((r) => r.rango === miRango + 1)
  const ptsParaSiguiente = sigRangoInfo ? sigRangoInfo.minPuntos - miPuntos : 0
  const pctPoblacion = Math.min(
    100,
    (poblacionVisible / faccion.poblacionBase) * 100
  )

  return (
    <motion.div
      key={faccionId}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-7"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `${faccion.color}18`,
            border: `1px solid ${faccion.color}44`,
          }}
        >
          <Icono size={22} style={{ color: faccion.color }} />
        </div>
        <div className="flex-1">
          <h2
            className="text-xl font-semibold leading-tight"
            style={{ color: 'rgba(255,255,255,0.92)' }}
          >
            {faccion.nombre}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {faccion.dios} · Liderada por {faccion.lider}
          </p>
          <p
            className="text-xs mt-3 leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {faccion.descripcion}
          </p>
        </div>
      </div>

      <div className="h-px w-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />

      <div>
        <p
          className="text-[10px] uppercase tracking-widest mb-5"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          Estado en esta facción
        </p>
        <div className="flex items-start justify-around gap-4">
          <AvatarAfinidad
            inicial={(agonistaNombre[0] ?? '?').toUpperCase()}
            puntos={miPuntos}
            rango={miRango}
            nombre={agonistaNombre}
            color={faccion.color}
          />
          <div className="text-xs pt-4" style={{ color: 'rgba(255,255,255,0.12)' }}>
            vs
          </div>
          <AvatarAfinidad
            inicial={(rivalNombre[0] ?? '?').toUpperCase()}
            puntos={rivPuntos}
            rango={rivRango}
            nombre={rivalNombre}
            color={faccion.color}
          />
        </div>
      </div>

      <div className="h-px w-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />

      <div>
        <p
          className="text-[10px] uppercase tracking-widest mb-4"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          Población aliada
        </p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-semibold" style={{ color: faccion.color }}>
            {poblacionVisible.toLocaleString()}
          </span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            de {faccion.poblacionBase.toLocaleString()} habitantes
          </span>
        </div>
        <BarraProgreso puntos={pctPoblacion * 1.5} color={faccion.color} delay={0.15} />
        {rivRango > 1 && (
          <p className="text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {rivalNombre.split(' ')[0]} tiene {poblacionRivVisible.toLocaleString()} aliados
          </p>
        )}
      </div>

      <div className="h-px w-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />

      {miRango < 5 ? (
        <div>
          <p
            className="text-[10px] uppercase tracking-widest mb-3"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Próximo rango
          </p>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white/70">{sigRangoInfo?.nombre}</span>
            <span className="text-sm font-semibold" style={{ color: faccion.color }}>
              {ptsParaSiguiente} pts
            </span>
          </div>
          <BarraProgreso puntos={miPuntos} color={faccion.color} delay={0.2} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div
            className="rounded-xl p-4 text-center"
            style={{
              backgroundColor: `${faccion.color}0F`,
              border: `1px solid ${faccion.color}33`,
            }}
          >
            <p className="text-sm font-semibold" style={{ color: faccion.color }}>
              ★ Campeón de {faccion.dios}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              El {faccion.dios} reconoce tu dominio sobre esta facción
            </p>
          </div>

          {VENTAJAS_CAMPEON[faccionId] && (
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <p
                className="text-[10px] uppercase tracking-widest mb-2"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                Ventaja activa
              </p>
              <p className="text-xs font-medium text-white/70 mb-1">
                {VENTAJAS_CAMPEON[faccionId]!.titulo}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                {VENTAJAS_CAMPEON[faccionId]!.descripcion}
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export function OlimpiaClient({
  agonistaNombre,
  rivalNombre,
  miAfinidad,
  rivalAfinidad,
}: Props) {
  const [faccionSeleccionada, setFaccionSeleccionada] =
    useState<FaccionId>('guardia_hierro')
  const faccionIds = Object.keys(FACCIONES) as FaccionId[]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">
            La Ciudad de Olimpia
          </h1>
          <p
            className="text-sm mt-2 max-w-md leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Las facciones observan el Agon. Gana su lealtad completando los hábitos que
            veneran.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] gap-10 items-start">
          <div className="flex flex-col gap-3">
            {faccionIds.map((id) => (
              <FaccionCard
                key={id}
                faccionId={id}
                miAfinidad={miAfinidad}
                rivalAfinidad={rivalAfinidad}
                agonistaNombre={agonistaNombre}
                rivalNombre={rivalNombre}
                seleccionada={faccionSeleccionada === id}
                onClick={() => setFaccionSeleccionada(id)}
              />
            ))}
          </div>

          <div
            className="md:sticky md:top-8 rounded-2xl p-7"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <AnimatePresence mode="wait">
              <PanelDetalle
                key={faccionSeleccionada}
                faccionId={faccionSeleccionada}
                miAfinidad={miAfinidad}
                rivalAfinidad={rivalAfinidad}
                agonistaNombre={agonistaNombre}
                rivalNombre={rivalNombre}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
