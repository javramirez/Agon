import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCurrentAgonista } from '@/lib/auth'
import { getRetoPorId } from '@/lib/db/queries'
import { getEkecheiriaActiva } from '@/lib/ekecheiria/estado'
import { procesarExpiracionEkecheiria } from '@/lib/ekecheiria/procesar'
import { procesarSenalamientoPendiente } from '@/lib/senalamiento/procesar'
import { detectarEventosRivalidad } from '@/lib/dioses/rivalidad'
import { orquestarVozOlimpo } from '@/lib/dioses/voz-olimpo/orquestar'
import { resolverDisputasVencidas } from '@/lib/facciones/disputa'
import { verificarYActivarCrisis } from '@/lib/crisis/calendario'
import {
  resolverCrisisVencidas,
  aplicarConsecuenciasDiferidas,
} from '@/lib/crisis/resolver'
import { consultaDisponible } from '@/lib/consulta-mediodia/config'
import { activarRetosListos } from '@/lib/retos/activar'
import { CrisisTrigger } from '@/components/agon/crisis-trigger'
import { InactivityLogout } from '@/components/agon/inactivity-logout'
import { Navbar } from '@/components/layout/navbar'
import { MobileNav } from '@/components/layout/mobile-nav'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  if (userId === process.env.ADMIN_CLERK_ID && pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-background">
        <InactivityLogout />
        <main className="max-w-4xl mx-auto px-4 pt-12 pb-28 sm:pb-10">{children}</main>
      </div>
    )
  }

  const agonista = await getCurrentAgonista()

  // Sin registro en DB → crear agonista y reto
  if (!agonista) redirect('/seleccionar-modo')

  // Con agonista pero sin reto asignado
  if (!agonista.retoId) redirect('/seleccionar-modo')

  await activarRetosListos().catch(() => {})
  const reto = await getRetoPorId(agonista.retoId)
  if (!reto) redirect('/seleccionar-modo')

  // Reto en configuración → completar onboarding
  if (reto.estado === 'configurando') {
    if (!agonista.oraculoSellado) redirect('/onboarding')
    // Pacto sellado pero esperando al rival o fecha → pantalla de espera
    redirect('/esperando')
  }

  // Reto programado → cuenta regresiva
  if (reto.estado === 'programado') redirect('/esperando')

  // Reto completado → solo veredicto disponible
  if (reto.estado === 'completado' && !pathname.startsWith('/veredicto')) {
    redirect('/veredicto')
  }

  // ── Reto activo — procesos fire-and-forget ──────────────────

  void orquestarVozOlimpo(agonista.id, reto.id).catch(() => {})
  void verificarYActivarCrisis(
    reto.id,
    reto.fechaInicio ?? '',
    reto.modo === 'duelo' ? 'duelo' : 'solo'
  ).catch(() => {})
  void resolverCrisisVencidas(reto.id).catch(() => {})
  void aplicarConsecuenciasDiferidas(reto.id).catch(() => {})

  // Procesos exclusivos de modo duelo
  if (reto.modo === 'duelo') {
    if (agonista.senalamiento_recibido) {
      void procesarSenalamientoPendiente(agonista.id)
    }
    void detectarEventosRivalidad(agonista.id, agonista.retoId).catch(() => {})
    void resolverDisputasVencidas().catch(() => {})
  }

  const expiracion = await procesarExpiracionEkecheiria()
  const ekecheiriaActiva = await getEkecheiriaActiva()

  const esRutaEkecheiria = pathname.startsWith('/ekecheiria-activa')
  const esRutaDisclaimer = pathname.startsWith('/ekecheiria-expirada')

  if (ekecheiriaActiva && !esRutaEkecheiria) redirect('/ekecheiria-activa')
  if (expiracion.expirada && !esRutaDisclaimer) redirect('/ekecheiria-expirada')

  // Consulta del Mediodía — día 15 (fecha dinámica desde reto)
  const esConsulta = pathname.includes('consulta-mediodia')
  const fechaInicio = reto.fechaInicio ?? ''
  const necesitaConsulta = consultaDisponible(
    fechaInicio,
    agonista.consultaMediaCompleta ?? false
  )
  if (necesitaConsulta && !esConsulta) redirect('/consulta-mediodia')

  // Admin: env var dedicada, sin Clerk ID hardcodeado
  const isAdmin = userId === process.env.ADMIN_CLERK_ID

  return (
    <div className="min-h-screen bg-background">
      <InactivityLogout />
      <Navbar />
      <CrisisTrigger />
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-28 sm:pb-10">
        {children}
      </main>
      <MobileNav
        isAdmin={Boolean(isAdmin)}
        modo={reto.modo === 'duelo' ? 'duelo' : 'solo'}
      />
    </div>
  )
}
