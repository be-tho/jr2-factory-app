import {
  IconAlertTriangle,
  IconCalendar,
  IconFileDescription,
  IconLayoutDashboard,
  IconPackage,
  IconScissors,
  IconTrendingUp,
} from '@tabler/icons-react'
import { Link } from 'react-router-dom'
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
import { ic } from '../../../lib/tabler'
import { usePatronesQuery } from '../../patterns/hooks/usePatrones'
import { useCortesQuery } from '../../production/hooks/useCortes'
import { useProductsQuery } from '../../inventory/hooks/useProducts'
import type { CorteEstado } from '../../../types/database'

// ─── Colores del tema ────────────────────────────────────────────────────────
const ESTADO_COLOR: Record<CorteEstado, string> = {
  pendiente: '#f59e0b',
  en_proceso: '#6366f1',
  completado: '#10b981',
  cancelado: '#9ca3af',
}
const ESTADO_LABEL: Record<CorteEstado, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

const BAR_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe']

const STOCK_BAJO_UMBRAL = 10

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sub,
  subColor = 'text-brand-ink-faint',
  loading,
  to,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  subColor?: string
  loading?: boolean
  to?: string
}) {
  const inner = (
    <article className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/4 transition hover:shadow-md hover:ring-brand-primary/20">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-brand-ink-muted">{label}</p>
        <span className="shrink-0 text-brand-ink-faint">{icon}</span>
      </div>
      {loading ? (
        <div className="mt-3 h-7 w-20 animate-pulse rounded-lg bg-brand-border" />
      ) : (
        <p className="mt-2 text-2xl font-bold tabular-nums text-brand-ink">{value}</p>
      )}
      {sub && !loading && (
        <p className={`mt-1 text-xs ${subColor}`}>{sub}</p>
      )}
    </article>
  )

  if (to) {
    return <Link to={to}>{inner}</Link>
  }
  return inner
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
      <header className="border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">{title}</h2>
      </header>
      {children}
    </div>
  )
}

// ─── Tooltip personalizado para el pie ───────────────────────────────────────
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

// ─── Estado badge ─────────────────────────────────────────────────────────────
const ESTADO_BADGE: Record<CorteEstado, { bg: string; text: string }> = {
  pendiente:  { bg: 'bg-amber-50 ring-1 ring-amber-200',  text: 'text-amber-700' },
  en_proceso: { bg: 'bg-indigo-50 ring-1 ring-indigo-200', text: 'text-indigo-700' },
  completado: { bg: 'bg-green-50 ring-1 ring-green-200',  text: 'text-green-700' },
  cancelado:  { bg: 'bg-gray-100 ring-1 ring-gray-200',   text: 'text-gray-500' },
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const { data: articles = [], isPending: loadingArticles } = useProductsQuery()
  const { data: cortes = [], isPending: loadingCortes } = useCortesQuery()
  const { data: patrones = [], isPending: loadingPatrones } = usePatronesQuery()

  const loading = loadingArticles || loadingCortes || loadingPatrones

  // ── Artículos ──
  const articulosActivos = articles.filter((a) => a.activo).length
  const stockBajo = articles.filter((a) => a.activo && a.stock_actual <= STOCK_BAJO_UMBRAL)
  const valorStock = articles
    .filter((a) => a.activo)
    .reduce((sum, a) => sum + (a.precio_lista * a.stock_actual), 0)

  // ── Cortes ──
  const cortesPendientes = cortes.filter((c) => c.estado === 'pendiente').length
  const cortesEnProceso = cortes.filter((c) => c.estado === 'en_proceso').length
  const cortesActivos = cortesPendientes + cortesEnProceso
  const unidadesEnProceso = cortes
    .filter((c) => c.estado === 'en_proceso' || c.estado === 'pendiente')
    .reduce((sum, c) => sum + c.cantidad_total, 0)

  // ── Patrones ──
  const patronesActivos = patrones.filter((p) => p.activo).length

  // ── Gráfico 1: Cortes por estado ──
  const cortesEstadoData = (['pendiente', 'en_proceso', 'completado', 'cancelado'] as CorteEstado[])
    .map((estado) => ({
      name: ESTADO_LABEL[estado],
      value: cortes.filter((c) => c.estado === estado).length,
      color: ESTADO_COLOR[estado],
    }))
    .filter((d) => d.value > 0)

  // ── Gráfico 2: Stock por categoría ──
  const categoriaStock = articles
    .filter((a) => a.activo && a.category)
    .reduce<Record<string, number>>((acc, a) => {
      acc[a.category] = (acc[a.category] ?? 0) + a.stock_actual
      return acc
    }, {})

  const stockCategoriaData = Object.entries(categoriaStock)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, stock]) => ({ name, stock }))

  // ── Últimos cortes ──
  const ultimosCortes = [...cortes]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
              <IconLayoutDashboard {...ic.headerSm} aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">Dashboard</h1>
          </div>
          <p className="mt-1.5 text-sm capitalize text-[#6e6b7b]">{today}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<IconPackage {...ic.stat} aria-hidden />}
          label="Artículos en inventario"
          value={loading ? '…' : articles.length}
          sub={loading ? undefined : `${articulosActivos} activos · ${articles.length - articulosActivos} inactivos`}
          loading={loading}
          to="/inventario/articulos"
        />
        <KpiCard
          icon={<IconScissors {...ic.stat} aria-hidden />}
          label="Cortes activos"
          value={loading ? '…' : cortesActivos}
          sub={loading ? undefined : `${cortesPendientes} pendientes · ${cortesEnProceso} en proceso · ${unidadesEnProceso} unidades`}
          loading={loading}
          to="/produccion/cortes"
        />
        <KpiCard
          icon={<IconAlertTriangle {...ic.stat} aria-hidden />}
          label="Stock bajo"
          value={loading ? '…' : stockBajo.length}
          sub={loading ? undefined : stockBajo.length > 0 ? `Artículos con ≤${STOCK_BAJO_UMBRAL} unidades` : 'Todo en orden'}
          subColor={stockBajo.length > 0 ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'}
          loading={loading}
          to="/inventario/articulos"
        />
        <KpiCard
          icon={<IconFileDescription {...ic.stat} aria-hidden />}
          label="Patrones activos"
          value={loading ? '…' : patronesActivos}
          sub={loading ? undefined : `${patrones.length - patronesActivos} inactivos`}
          loading={loading}
          to="/produccion/patrones"
        />
      </div>

      {/* Valor de stock — fila adicional */}
      <div className="rounded-xl bg-linear-to-r from-brand-primary to-indigo-500 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/80">Valor total del stock activo</p>
            {loading ? (
              <div className="mt-2 h-8 w-48 animate-pulse rounded-lg bg-white/20" />
            ) : (
              <p className="mt-1 text-3xl font-bold tabular-nums text-white">
                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(valorStock)}
              </p>
            )}
            <p className="mt-1 text-xs text-white/60">Calculado sobre precio de lista × stock actual</p>
          </div>
          <IconTrendingUp size={40} stroke={1.25} className="shrink-0 text-white/30" aria-hidden />
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cortes por estado */}
        <SectionCard title="Cortes por estado">
          <div className="px-5 py-5">
            {loading ? (
              <div className="flex h-52 items-center justify-center">
                <div className="h-40 w-40 animate-pulse rounded-full bg-brand-border" />
              </div>
            ) : cortes.length === 0 ? (
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
                      <span className="text-sm font-bold text-brand-ink">{cortes.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Stock por categoría */}
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
                <BarChart
                  data={stockCategoriaData}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                >
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

      {/* Últimos cortes */}
      <SectionCard title={`Últimos cortes (${ultimosCortes.length})`}>
        {loading ? (
          <div className="space-y-2 p-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-brand-border" />
            ))}
          </div>
        ) : ultimosCortes.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-brand-ink-faint">
            No hay cortes registrados.{' '}
            <Link to="/produccion/cortes/nuevo" className="font-medium text-brand-primary underline-offset-2 hover:underline">
              Crear el primero
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-brand-border-subtle">
            {ultimosCortes.map((corte) => {
              const badge = ESTADO_BADGE[corte.estado]
              return (
                <li key={corte.id}>
                  <Link
                    to={`/produccion/cortes/${corte.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-[#faf9fb]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
                      <IconScissors size={16} stroke={1.5} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-ink">
                        Corte #{corte.numero_corte}
                        <span className="ml-2 font-normal text-brand-ink-faint">— {corte.tipo_tela}</span>
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-brand-ink-faint">
                        <IconCalendar size={11} stroke={1.5} aria-hidden />
                        {new Date(corte.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                        <span className="mx-0.5 text-brand-border">·</span>
                        {corte.cantidad_total} unidades
                        {corte.articulos.length > 0 && (
                          <>
                            <span className="mx-0.5 text-brand-border">·</span>
                            {corte.articulos.map((a) => a.nombre).join(', ')}
                          </>
                        )}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.bg} ${badge.text}`}>
                      {ESTADO_LABEL[corte.estado]}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
        {ultimosCortes.length > 0 && (
          <div className="border-t border-brand-border-subtle px-5 py-3">
            <Link
              to="/produccion/cortes"
              className="text-sm font-medium text-brand-primary transition hover:text-brand-primary-hover"
            >
              Ver todos los cortes →
            </Link>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
