'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  mensaje: string
  tipo: 'exito' | 'error' | 'info'
  icono?: string
}

let toastCallback: ((toast: Omit<Toast, 'id'>) => void) | null = null

export function mostrarToast(toast: Omit<Toast, 'id'>) {
  toastCallback?.(toast)
}

export function ToastAltis() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    toastCallback = (toast) => {
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now())
      setToasts((prev) => [...prev, { ...toast, id }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 4000)
    }

    return () => {
      toastCallback = null
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-16 right-4 z-[100] space-y-2 max-w-xs pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 px-4 py-3 rounded-lg border pointer-events-auto',
            'bg-surface-1 shadow-lg animate-fade-in',
            toast.tipo === 'exito' && 'border-amber/30',
            toast.tipo === 'error' && 'border-danger/30',
            toast.tipo === 'info' && 'border-border'
          )}
        >
          {toast.icono && (
            <span className="text-base flex-shrink-0">{toast.icono}</span>
          )}
          <p
            className={cn(
              'text-xs font-body leading-relaxed',
              toast.tipo === 'exito' && 'text-amber',
              toast.tipo === 'error' && 'text-danger',
              toast.tipo === 'info' && 'text-foreground'
            )}
          >
            {toast.mensaje}
          </p>
        </div>
      ))}
    </div>
  )
}
