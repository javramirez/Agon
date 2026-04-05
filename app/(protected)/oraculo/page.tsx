import { getCurrentAgonista } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isVeredictoDay } from '@/lib/utils'

export default async function OraculoPage() {
  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  const veredicto = isVeredictoDay()
  const sellado = agonista.oraculoSellado
  const mensaje = agonista.oraculoMensaje

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pt-2">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-1">
          El Oráculo
        </p>
        <h1 className="font-display text-2xl font-bold tracking-wide">
          {veredicto ? 'El Oráculo habla.' : 'El Oráculo guarda silencio.'}
        </h1>
      </div>

      <div className="min-h-64 flex flex-col items-center justify-center">
        {!sellado ? (
          <div className="text-center space-y-4">
            <span className="text-5xl opacity-20">⚖️</span>
            <p className="text-sm text-muted-foreground font-body">
              El Oráculo aún no fue consultado.
            </p>
          </div>
        ) : veredicto ? (
          <div className="max-w-sm w-full space-y-6 text-center animate-fade-in">
            <span className="text-5xl">⚖️</span>
            <div className="space-y-2">
              <p className="text-xs text-amber tracking-widest uppercase font-body">
                El Oráculo revela su mensaje
              </p>
              <div className="bg-surface-1 border border-amber/30 rounded-xl p-6">
                <p className="text-base font-body text-foreground leading-relaxed italic">
                  &ldquo;{mensaje}&rdquo;
                </p>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-3">
                Esto escribiste el día 1 del Gran Agon. El Altis lo guardó hasta
                hoy.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-sm w-full text-center space-y-6">
            <div className="relative">
              <span className="text-6xl opacity-30">⚖️</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-display font-semibold text-foreground">
                El mensaje está sellado.
              </p>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">
                El Oráculo que consultaste el día 1 guarda tu mensaje en
                silencio. Solo El Gran Agon puede revelarlo.
              </p>
              <p className="text-xs text-amber font-body">
                Se revelará el 4 de mayo, en La Ceremonia del Veredicto.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border p-6">
              <p className="text-sm font-body text-foreground leading-relaxed blur-sm select-none">
                {mensaje ??
                  'El mensaje del agonista permanece sellado hasta el veredicto final.'}
              </p>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs text-muted-foreground font-body bg-background/80 px-3 py-1 rounded-full">
                  Sellado hasta el 4 de mayo
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
