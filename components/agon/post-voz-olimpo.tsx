'use client'

import { motion } from 'framer-motion'
import { ExternalLink, BookOpen, Video, FileText, Wrench } from 'lucide-react'
import { DIOSES } from '@/lib/dioses/config'
import { getDiosVisual } from '@/lib/dioses/imagen-config'

export interface LinkPostVozOlimpo {
  titulo: string
  url: string
  tipo: 'libro' | 'video' | 'articulo' | 'herramienta'
}

interface PostVozOlimpoProps {
  diosNombre: string
  titular: string
  descripcion: string
  links: LinkPostVozOlimpo[]
  esSobreexigencia: boolean
  intensidad: 'leve' | 'media' | 'fuerte'
}

const ICONO_TIPO: Record<string, React.ElementType> = {
  libro: BookOpen,
  video: Video,
  articulo: FileText,
  herramienta: Wrench,
}

const LABEL_TIPO: Record<string, string> = {
  libro: 'Libro',
  video: 'Video',
  articulo: 'Artículo',
  herramienta: 'Herramienta',
}

function getDiosColor(nombre: string): string {
  const colores: Record<string, string> = {
    ares: '#E24B4A',
    apolo: '#378ADD',
    demeter: '#639922',
    eris: '#D85A30',
    hermes: '#1D9E75',
    morfeo: '#7F77DD',
    nike: '#BA7517',
  }
  return colores[nombre] ?? '#888888'
}

export function PostVozOlimpo({
  diosNombre,
  titular,
  descripcion,
  links,
  esSobreexigencia,
}: PostVozOlimpoProps) {
  const dios = DIOSES[diosNombre]
  const visual = getDiosVisual(diosNombre)
  const color = getDiosColor(diosNombre)
  const imagenUrl = visual?.imagen

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl overflow-hidden w-full min-w-0"
      style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: `1px solid ${color}33`,
      }}
    >
      <div
        className="px-4 sm:px-5 py-3 flex items-center gap-3 min-w-0"
        style={{
          backgroundColor: `${color}0F`,
          borderBottom: `1px solid ${color}22`,
        }}
      >
        {imagenUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- asset estático bajo /public
          <img
            src={imagenUrl}
            alt={dios?.nombre ?? diosNombre}
            className="w-7 h-7 rounded-full object-cover shrink-0"
            style={{ border: `1px solid ${color}44` }}
          />
        ) : (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
            style={{
              backgroundColor: `${color}22`,
              color,
              border: `1px solid ${color}44`,
            }}
          >
            {dios?.nombre?.[0] ?? '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium" style={{ color }}>
            {dios?.nombre ?? diosNombre}
          </span>
          <span
            className="text-[10px] ml-2"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            La Voz del Olimpo
          </span>
        </div>
        {esSobreexigencia && (
          <span
            className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-medium shrink-0"
            style={{ backgroundColor: `${color}22`, color }}
          >
            Alerta
          </span>
        )}
      </div>

      <div className="px-4 sm:px-5 py-5 flex flex-col gap-4 min-w-0">
        <h3
          className="text-base font-semibold leading-snug break-words"
          style={{ color: 'rgba(255,255,255,0.9)' }}
        >
          {titular}
        </h3>

        <p
          className="text-sm leading-relaxed break-words"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          {descripcion}
        </p>

        <div
          className="h-px w-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
        />

        <div className="flex flex-col gap-2 min-w-0">
          <p
            className="text-[10px] uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Recursos del Olimpo
          </p>
          {links.map((link, i) => {
            const tipoKey =
              link.tipo in ICONO_TIPO ? link.tipo : 'articulo'
            const IconoTipo = ICONO_TIPO[tipoKey] ?? FileText
            return (
              <a
                key={`${link.url}-${i}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl px-3 sm:px-4 py-3 transition-all duration-150 group min-w-0"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${color}15`,
                    border: `1px solid ${color}33`,
                  }}
                >
                  <IconoTipo size={13} style={{ color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-medium truncate sm:whitespace-normal sm:line-clamp-2 transition-colors duration-150"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    {link.titulo}
                  </p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                  >
                    {LABEL_TIPO[tipoKey] ?? link.tipo}
                  </p>
                </div>

                <ExternalLink
                  size={12}
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                  className="shrink-0 group-hover:opacity-60 transition-opacity"
                  aria-hidden
                />
              </a>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
