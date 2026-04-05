'use client'

import { useState, useEffect } from 'react'

export function useCierreDramatico(diaPerfecto: boolean) {
  const [mostrar, setMostrar] = useState(false)
  const [minutosRestantes, setMinutosRestantes] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (diaPerfecto) setDismissed(false)
  }, [diaPerfecto])

  useEffect(() => {
    function calcular() {
      const ahora = new Date()
      const hora = ahora.getHours()
      const minutos = ahora.getMinutes()

      if (hora < 22) setDismissed(false)

      if (hora >= 22 && !diaPerfecto) {
        const restantes = (23 - hora) * 60 + (59 - minutos)
        setMinutosRestantes(restantes)
        setMostrar(!dismissed)
      } else {
        setMostrar(false)
      }
    }

    calcular()
    const intervalo = setInterval(calcular, 30000)
    return () => clearInterval(intervalo)
  }, [diaPerfecto, dismissed])

  function cerrarIgual() {
    setDismissed(true)
    setMostrar(false)
  }

  return { mostrar, minutosRestantes, cerrarIgual }
}
