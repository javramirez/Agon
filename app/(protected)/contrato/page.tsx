import { getCurrentAgonista } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { ekecheiria } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { AgonCard } from '@/components/agon/agon-card'

const CLAUSULAS = [
  {
    numero: 'Primero',
    titulo: 'Objeto',
    texto:
      'Formalizar un compromiso personal orientado al cumplimiento de hábitos de disciplina física, salud y desarrollo personal.',
  },
  {
    numero: 'Segundo',
    titulo: 'Duración',
    texto:
      'Desde el lunes 6 de abril de 2026 hasta el día 4 de mayo de 2026, inclusive.',
  },
  {
    numero: 'Tercero',
    titulo: 'Obligaciones',
    texto:
      'Consumir exclusivamente agua, abstenerse de comida rápida, cumplir mínimo 4 sesiones de gimnasio semanales, 3 sesiones de cardio adicionales, 10.000 pasos diarios, 7-8 horas de sueño y 10 páginas de lectura diaria.',
  },
  {
    numero: 'Cuarto',
    titulo: 'Registro y Verificación',
    texto:
      'El principal criterio de verificación es la palabra de cada participante. La palabra de un hombre íntegro no debe ser puesta en duda.',
  },
  {
    numero: 'Quinto',
    titulo: 'Incumplimiento',
    texto:
      'El incumplimiento de cualquier obligación será considerado una falta dentro del desafío.',
  },
  {
    numero: 'Octavo',
    titulo: 'Consumo de Alcohol',
    texto:
      'El contrato no prohíbe el consumo de alcohol, quedando a libre disposición de cada parte.',
  },
  {
    numero: 'Noveno',
    titulo: 'Principio Fundamental',
    texto:
      'El verdadero valor del contrato radica en su cumplimiento íntegro, en cuanto representa una prueba concreta de disciplina, carácter y capacidad de sostener un compromiso en el tiempo.',
  },
]

const PREMIOS = [
  {
    agonista: 'Javier',
    cumple: 'Recibe un jockey.',
    falla:
      'Publica una historia en inglés exponiendo sus objetivos deportivos y su proceso personal.',
  },
  {
    agonista: 'Matías',
    cumple: 'Recibe 3 Monster blancos de Javier.',
    falla: 'Compra una creatina a Javier.',
  },
]

export default async function ContratoPage() {
  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  const ekecheiriaActiva = await db
    .select()
    .from(ekecheiria)
    .where(eq(ekecheiria.activa, true))
    .limit(1)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pt-2">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-1">
          El Contrato
        </p>
        <h1 className="font-display text-2xl font-bold tracking-wide">
          El documento que lo inició todo.
        </h1>
        <p className="text-xs text-muted-foreground font-body mt-1">
          La palabra de un hombre íntegro no debe ser puesta en duda.
        </p>
      </div>

      {ekecheiriaActiva.length > 0 && (
        <div className="bg-surface-1 rounded-lg border border-amber/20 p-4 space-y-1">
          <div className="flex items-center gap-2">
            <span>⚖️</span>
            <p className="text-sm font-display font-semibold text-amber">
              La Ekecheiria está activa.
            </p>
          </div>
          <p className="text-xs text-muted-foreground font-body pl-6">
            La tregua sagrada fue declarada. El agon continúa cuando ambas
            partes lo acuerden.
          </p>
          {ekecheiriaActiva[0].motivo && (
            <p className="text-xs text-muted-foreground/60 font-body pl-6 italic">
              &ldquo;{ekecheiriaActiva[0].motivo}&rdquo;
            </p>
          )}
        </div>
      )}

      <AgonCard>
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-4">
          Premios y Penitencias — Cláusula Sexta
        </p>
        <div className="space-y-4">
          {PREMIOS.map((p) => (
            <div key={p.agonista} className="space-y-2">
              <p className="text-sm font-display font-semibold text-foreground">
                {p.agonista}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surface-2 rounded-lg p-3 space-y-1">
                  <p className="text-xs text-amber font-body font-medium">
                    Si cumple
                  </p>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed">
                    {p.cumple}
                  </p>
                </div>
                <div className="bg-surface-2 rounded-lg p-3 space-y-1">
                  <p className="text-xs text-danger font-body font-medium">
                    Si falla
                  </p>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed">
                    {p.falla}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AgonCard>

      <div className="space-y-3">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">
          Las Cláusulas
        </p>
        {CLAUSULAS.map((c) => (
          <AgonCard key={c.numero}>
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-amber font-body font-medium uppercase tracking-wider">
                  {c.numero}
                </span>
                <span className="text-sm font-display font-semibold text-foreground">
                  {c.titulo}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                {c.texto}
              </p>
            </div>
          </AgonCard>
        ))}
      </div>

      <AgonCard variant="muted">
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground font-body font-medium uppercase tracking-wider">
              Séptimo
            </span>
            <span className="text-sm font-display font-semibold text-muted-foreground">
              La Ekecheiria — Cláusula de Fuerza Mayor
            </span>
          </div>
          <p className="text-sm text-muted-foreground/70 font-body leading-relaxed">
            En caso de enfermedad o lesión real, la parte afectada puede invocar
            La Ekecheiria. Se dispone de 7 días corridos posteriores al 4 de mayo
            como colchón de recuperación.
          </p>
        </div>
      </AgonCard>
    </div>
  )
}
