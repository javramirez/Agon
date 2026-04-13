import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCurrentAgonista } from '@/lib/auth'
import { getEkecheiriaActiva } from '@/lib/ekecheiria/estado'
import { procesarExpiracionEkecheiria } from '@/lib/ekecheiria/procesar'
import { procesarSenalamientoPendiente } from '@/lib/senalamiento/procesar'
import { detectarEventosRivalidad } from '@/lib/dioses/rivalidad'
import { orquestarVozOlimpo } from '@/lib/dioses/voz-olimpo/orquestar'
import { consultaDisponible } from '@/lib/consulta-mediodia/config'
import { Navbar } from '@/components/layout/navbar'
import { MobileNav } from '@/components/layout/mobile-nav'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')
  if (!agonista.oraculoSellado) redirect('/onboarding')

  if (agonista.senalamiento_recibido) {
    void procesarSenalamientoPendiente(agonista.id)
  }

  void detectarEventosRivalidad(agonista.id).catch(() => {})

  void orquestarVozOlimpo(agonista.id).catch(() => {})

  const expiracion = await procesarExpiracionEkecheiria()

  const ekecheiriaActiva = await getEkecheiriaActiva()
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const esRutaEkecheiria = pathname.startsWith('/ekecheiria-activa')
  const esRutaDisclaimer = pathname.startsWith('/ekecheiria-expirada')

  if (ekecheiriaActiva && !esRutaEkecheiria) {
    redirect('/ekecheiria-activa')
  }

  if (expiracion.expirada && !esRutaDisclaimer) {
    redirect('/ekecheiria-expirada')
  }

  // Consulta del Mediodía — día 15
  const startDate = process.env.NEXT_PUBLIC_AGON_START_DATE ?? ''
  const esConsulta = pathname.includes('consulta-mediodia')
  const necesitaConsulta = consultaDisponible(
    startDate,
    agonista.consultaMediaCompleta ?? false
  )

  if (necesitaConsulta && !esConsulta) {
    redirect('/consulta-mediodia')
  }

  const isAdmin = userId === process.env.CLERK_JAVIER_USER_ID

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-28 sm:pb-10">
        {children}
      </main>
      <MobileNav isAdmin={Boolean(isAdmin)} />
    </div>
  )
}
