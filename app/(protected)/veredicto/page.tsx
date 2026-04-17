import { getCurrentAgonista } from '@/lib/auth'
import { getRetoPorId } from '@/lib/db/queries'
import { redirect } from 'next/navigation'
import { isVeredictoDay } from '@/lib/utils'
import { VeredictoCeremonia } from '@/components/agon/veredicto-ceremonia'
import { AgonCard } from '@/components/agon/agon-card'
import { sleep } from '@/lib/utils/sleep'

function fechaInicioAString(
  fecha: string | Date | null | undefined
): string | null {
  if (fecha == null) return null
  if (typeof fecha === 'string') return fecha
  return fecha.toISOString().slice(0, 10)
}

export default async function VeredictPage() {
  const __pageLoadT0 = Date.now()
  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')
  if (!agonista.retoId) redirect('/seleccionar-modo')

  const reto = await getRetoPorId(agonista.retoId)
  const fechaInicio = fechaInicioAString(reto?.fechaInicio)
  if (!fechaInicio) redirect('/esperando')

  const esVeredicto = isVeredictoDay(fechaInicio)

  await sleep(Math.max(0, 4000 - (Date.now() - __pageLoadT0)))

  if (!esVeredicto) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="pt-2">
          <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-1">
            La Ceremonia del Veredicto
          </p>
          <h1 className="font-display text-2xl font-bold tracking-wide">
            El Gran Agon aún no ha concluido.
          </h1>
        </div>

        <AgonCard>
          <div className="py-8 text-center space-y-4">
            <span className="text-5xl opacity-30">⚖️</span>
            <div className="space-y-2">
              <p className="font-display text-base font-semibold text-foreground">
                El Altis no emite veredictos prematuros.
              </p>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                La Ceremonia del Veredicto se activa el día 29 del Gran Agon.
                Mientras tanto, el agon continúa. Las pruebas no esperan.
              </p>
            </div>
          </div>
        </AgonCard>
      </div>
    )
  }

  return <VeredictoCeremonia modo={reto.modo} />
}
