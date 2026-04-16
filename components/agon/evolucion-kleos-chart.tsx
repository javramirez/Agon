'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'

interface PuntoData {
  fecha: string
  [nombre: string]: number | string
}

interface Props {
  datos: PuntoData[]
  nombre1: string
  nombre2: string
}

function formatFecha(fecha: string): string {
  const d = new Date(fecha + 'T12:00:00')
  return `D${d.getDate()}`
}

function CustomTooltip({
  active,
  payload,
  label,
  nombre1,
  nombre2,
}: TooltipProps<number, string> & { nombre1: string; nombre2: string }) {
  if (!active || !payload?.length) return null

  const v1 = payload.find((p) => p.dataKey === nombre1)?.value ?? 0
  const v2 = payload.find((p) => p.dataKey === nombre2)?.value ?? 0

  return (
    <div
      className="rounded-xl border border-border/60 px-4 py-3 space-y-2 text-xs font-body"
      style={{
        background: 'rgba(10,10,10,0.97)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,158,11,0.08)',
      }}
    >
      <p className="text-amber/60 tracking-widest uppercase text-[10px]">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
        <span className="text-muted-foreground truncate max-w-[80px]">{nombre1}</span>
        <span className="text-amber font-semibold tabular-nums ml-auto">
          {(v1 as number).toLocaleString()}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0" />
        <span className="text-muted-foreground truncate max-w-[80px]">{nombre2}</span>
        <span className="text-zinc-400 font-semibold tabular-nums ml-auto">
          {(v2 as number).toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export function EvolucionKleosChart({ datos, nombre1, nombre2 }: Props) {
  if (datos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-muted-foreground font-body tracking-wide">
          La evolución del kleos aparecerá aquí.
        </p>
      </div>
    )
  }

  const ultimo = datos[datos.length - 1]
  const kleosUltimo1 =
    typeof ultimo?.[nombre1] === 'number' ? (ultimo[nombre1] as number) : 0
  const kleosUltimo2 =
    typeof ultimo?.[nombre2] === 'number' ? (ultimo[nombre2] as number) : 0

  const datosFormateados = datos.map((d) => ({
    ...d,
    _label: formatFecha(d.fecha),
  }))

  // Mostrar máximo ~10 ticks en el eje X
  const tickInterval = Math.max(1, Math.floor(datos.length / 10))

  return (
    <div className="space-y-4">
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={datosFormateados}
            margin={{ top: 8, right: 4, left: -16, bottom: 0 }}
          >
            <defs>
              {/* Gradiente ámbar para nombre1 */}
              <linearGradient id="gradAmbar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(43 96% 56%)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(43 96% 56%)" stopOpacity={0.02} />
              </linearGradient>
              {/* Gradiente gris para nombre2 */}
              <linearGradient id="gradGris" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0 0% 30%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(0 0% 30%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(0 0% 12%)"
              vertical={false}
            />

            <XAxis
              dataKey="_label"
              tick={{ fill: 'hsl(0 0% 40%)', fontSize: 10, fontFamily: 'Inter' }}
              tickLine={false}
              axisLine={false}
              interval={tickInterval}
            />

            <YAxis
              tick={{ fill: 'hsl(0 0% 40%)', fontSize: 10, fontFamily: 'Inter' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
              }
            />

            <Tooltip
              content={<CustomTooltip nombre1={nombre1} nombre2={nombre2} />}
              cursor={{
                stroke: 'hsl(43 96% 56%)',
                strokeWidth: 1,
                strokeDasharray: '4 4',
                strokeOpacity: 0.4,
              }}
            />

            {/* Antagonista debajo para que el ámbar quede encima */}
            <Area
              type="monotone"
              dataKey={nombre2}
              stroke="hsl(0 0% 28%)"
              strokeWidth={1.5}
              fill="url(#gradGris)"
              dot={false}
              activeDot={{ r: 3, fill: 'hsl(0 0% 50%)', strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey={nombre1}
              stroke="hsl(43 96% 56%)"
              strokeWidth={2}
              fill="url(#gradAmbar)"
              dot={false}
              activeDot={{
                r: 4,
                fill: 'hsl(43 96% 56%)',
                stroke: 'hsl(43 96% 80%)',
                strokeWidth: 1,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda */}
      <div className="flex justify-between text-xs font-body gap-2 flex-wrap pt-1 border-t border-border/40">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-amber shrink-0" />
          <span className="text-muted-foreground truncate">{nombre1}</span>
          <span className="text-amber font-semibold tabular-nums">
            {kleosUltimo1.toLocaleString()} kleos
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-zinc-600 shrink-0" />
          <span className="text-muted-foreground truncate">{nombre2}</span>
          <span className="text-zinc-400 font-semibold tabular-nums">
            {kleosUltimo2.toLocaleString()} kleos
          </span>
        </div>
      </div>
    </div>
  )
}
