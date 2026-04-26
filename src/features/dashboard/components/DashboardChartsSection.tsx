import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { SectionCard } from './SectionCard'

const BAR_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe']

type CortesEstadoRow = { name: string; value: number; color: string }
type StockCatRow = { name: string; stock: number }

function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="rounded-lg border border-brand-border bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-brand-ink">{d.name}</p>
      <p className="text-brand-ink-muted">{d.value} corte{d.value !== 1 ? 's' : ''}</p>
    </div>
  )
}

function BarTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-brand-border bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-brand-ink">{label}</p>
      <p className="text-brand-ink-muted">{payload[0].value} unidades</p>
    </div>
  )
}

type Props = {
  loading: boolean
  cantidadCortes: number
  cortesEstadoData: CortesEstadoRow[]
  stockCategoriaData: StockCatRow[]
}

export function DashboardChartsSection({
  loading,
  cantidadCortes,
  cortesEstadoData,
  stockCategoriaData,
}: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard title="Cortes por estado">
        <div className="px-5 py-5">
          {loading ? (
            <div className="flex h-52 items-center justify-center">
              <div className="h-40 w-40 animate-pulse rounded-full bg-brand-border" />
            </div>
          ) : cantidadCortes === 0 ? (
            <div className="flex h-52 items-center justify-center">
              <p className="text-sm text-brand-ink-faint">Sin cortes registrados aún.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={cortesEstadoData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {cortesEstadoData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-1 flex-col gap-2">
                {cortesEstadoData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm text-brand-ink-muted">{d.name}</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-brand-ink">{d.value}</span>
                  </div>
                ))}
                <div className="mt-1 border-t border-brand-border pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brand-ink-muted">Total</span>
                    <span className="text-sm font-bold text-brand-ink">{cantidadCortes}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Stock por categoría">
        <div className="px-5 py-5">
          {loading ? (
            <div className="space-y-3">
              {[80, 60, 90, 45, 70].map((w, i) => (
                <div key={i} className="h-6 animate-pulse rounded bg-brand-border" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : stockCategoriaData.length === 0 ? (
            <div className="flex h-52 items-center justify-center">
              <p className="text-sm text-brand-ink-faint">Sin datos de categorías.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stockCategoriaData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#6e6b7b' }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: '#f3f0ff' }} />
                <Bar dataKey="stock" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {stockCategoriaData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
