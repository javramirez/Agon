import { getCurrentAgonista } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getEkecheiriaActiva } from '@/lib/ekecheiria/estado'
import { EkecheiriaActivaClient } from '@/components/agon/ekecheiria-activa-client'

function fechaInicioToStr(fecha: string | Date): string {
  if (typeof fecha === 'string') return fecha
  return fecha.toISOString().split('T')[0]!
}

export default async function EkecheiriaActivaPage() {
  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  const ekecheiriaActiva = await getEkecheiriaActiva()
  if (!ekecheiriaActiva) redirect('/dashboard')

  const fechaInicioStr = fechaInicioToStr(ekecheiriaActiva.fechaInicio)
  const fechaInicio = new Date(`${fechaInicioStr}T00:00:00`)
  const fechaExpira = new Date(fechaInicio)
  fechaExpira.setDate(fechaInicio.getDate() + 7)
  const hoy = new Date()
  const diasRestantes = Math.max(
    0,
    Math.ceil((fechaExpira.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  )

  const yaConfirmo =
    ekecheiriaActiva.confirmacion_levantar_1 === agonista.id ||
    ekecheiriaActiva.confirmacion_levantar_2 === agonista.id

  const confirmaciones = [
    ekecheiriaActiva.confirmacion_levantar_1,
    ekecheiriaActiva.confirmacion_levantar_2,
  ].filter(Boolean).length

  return (
    <EkecheiriaActivaClient
      agonistId={agonista.id}
      motivo={ekecheiriaActiva.motivo}
      fechaInicio={fechaInicioStr}
      diasRestantes={diasRestantes}
      yaConfirmo={yaConfirmo}
      confirmaciones={confirmaciones}
    />
  )
}
