import { getCurrentAgonista } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isVeredictoDay } from '@/lib/utils'
import { VeredictoCeremonia } from '@/components/agon/veredicto-ceremonia'
import { AgonCard } from '@/components/agon/agon-card'

export default async function VeredictPage() {
  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  const esVeredicto = isVeredictoDay()

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
                La Ceremonia del Veredicto se activa el 4 de mayo de 2026.
                Mientras tanto, el agon continúa. Las pruebas no esperan.
              </p>
            </div>
          </div>
        </AgonCard>
      </div>
    )
  }

  return <VeredictoCeremonia />
}
