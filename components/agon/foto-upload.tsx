'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  tipo: 'gym' | 'cardio'
  urlActual?: string | null
  onSubida: (url: string) => void
}

export function FotoUpload({ tipo, urlActual, onSubida }: Props) {
  const [cargando, setCargando] = useState(false)
  const [preview, setPreview] = useState<string | null>(urlActual ?? null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPreview(urlActual ?? null)
  }, [urlActual])

  const tipoLabel = tipo === 'gym' ? 'gym' : 'cardio'

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('La foto no puede superar 5MB')
      return
    }

    setError('')
    setCargando(true)

    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append('foto', file)
    formData.append('tipo', tipo)

    try {
      const res = await fetch('/api/fotos', {
        method: 'POST',
        body: formData,
      })

      const data = (await res.json()) as { error?: string; url?: string }

      if (!res.ok) {
        throw new Error(data.error ?? 'Error al subir')
      }

      if (data.url) {
        onSubida(data.url)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al subir'
      setError(message)
      setPreview(urlActual ?? null)
    } finally {
      setCargando(false)
      e.target.value = ''
    }
  }

  return (
    <div className="mt-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt={`Comprobante de ${tipoLabel}`}
            className="w-full h-32 object-cover rounded-lg border border-border"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={cargando}
            className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded border border-border hover:bg-black/90 transition-colors"
          >
            {cargando ? 'Subiendo...' : 'Cambiar'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={cargando}
          className={cn(
            'w-full py-3 rounded-lg border border-dashed border-border text-xs text-muted-foreground',
            'hover:border-amber/40 hover:text-amber/70 transition-all',
            'flex items-center justify-center gap-2',
            cargando && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span>📷</span>
          <span>
            {cargando
              ? 'Subiendo comprobante...'
              : `Subir foto de ${tipoLabel} (opcional)`}
          </span>
        </button>
      )}

      {error && (
        <p className="text-xs text-red-400 mt-1 font-body">{error}</p>
      )}
    </div>
  )
}
