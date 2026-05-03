import { useMemo, useState } from 'react'
import {
  IconAlertTriangle,
  IconCalendar,
  IconFileDescription,
  IconLayoutDashboard,
  IconPackage,
  IconScissors,
  IconTrendingUp,
  IconX,
} from '@tabler/icons-react'
import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { ic } from '../../../lib/tabler'
import { usePatronesQuery } from '../../patterns/hooks/usePatrones'
import { useCortesQuery } from '../../production/hooks/useCortes'
import { useProductsQuery } from '../../inventory/hooks/useProducts'
import { SectionCard } from '../components/SectionCard'
import { formatARS } from '../../sales/lib/pricing'
import { SkeletonStats, SkeletonTable, SkeletonChart } from '../../../components/ui/SkeletonLoader'
import { getMockProducts, getMockCortes, getMockPatrones } from '../lib/mockData'
import type { CorteEstado, Product, Corte, Patron } from '../../../types/database'

const DashboardChartsSection = lazy(() =>
  import('../components/DashboardChartsSection').then((m) => ({ default: m.DashboardChartsSection })),
)

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

const STOCK_BAJO_UMBRAL = 10

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

const ESTADO_BADGE: Record<CorteEstado, { bg: string; text: string }> = {
  pendiente:  { bg: 'bg-amber-50 ring-1 ring-amber-200',  text: 'text-amber-700' },
  en_proceso: { bg: 'bg-indigo-50 ring-1 ring-indigo-200', text: 'text-indigo-700' },
  completado: { bg: 'bg-green-50 ring-1 ring-green-200',  text: 'text-green-700' },
  cancelado:  { bg: 'bg-gray-100 ring-1 ring-gray-200',   text: 'text-gray-500' },
}

export function DashboardPage() {
  const { data: realArticles = [], isPending: loadingArticles } = useProductsQuery()
  const { data: realCortes = [], isPending: loadingCortes } = useCortesQuery()
  const { data: realPatrones = [], isPending: loadingPatrones } = usePatronesQuery()
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null)

  const useMock = realArticles.length === 0 && realCortes.length === 0 && realPatrones.length === 0

  const articles = useMock ? (getMockProducts() as unknown as Product[]) : realArticles
  const cortes = useMock ? (getMockCortes() as unknown as Corte[]) : realCortes
  const patrones = useMock ? (getMockPatrones() as unknown as Patron[]) : realPatrones

  const loading = loadingArticles || loadingCortes || loadingPatrones

  // ─── Filtrar por rango de fechas ────────────────────────────────
  const filteredCortes = useMemo(() => {
    if (!dateRange) return cortes
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    return cortes.filter((c) => {
      const corteDate = new Date(c.fecha + 'T00:00:00')
      return corteDate >= start && corteDate <= end
    })
  }, [cortes, dateRange])

  const filteredArticles = useMemo(() => {
    if (!dateRange) return articles
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    return articles.filter((a) => {
      const articleDate = new Date(a.created_at)
      return articleDate >= start && articleDate <= end
    })
  }, [articles, dateRange])

  function clearDateFilter() {
    setDateRange(null)
  }

  const articulosActivos = useMemo(
    () => filteredArticles.filter((a) => a.activo).length,
    [filteredArticles],
  )

  const stockBajo = useMemo(
    () => filteredArticles.filter((a) => a.activo && a.stock_actual <= STOCK_BAJO_UMBRAL),
    [filteredArticles],
  )

  const valorStock = useMemo(
    () =>
      filteredArticles
        .filter((a) => a.activo)
        .reduce((sum, a) => sum + a.precio_lista * a.stock_actual, 0),
    [filteredArticles],
  )

  const cortesPendientes = useMemo(
    () => filteredCortes.filter((c) => c.estado === 'pendiente').length,
    [filteredCortes],
  )

  const cortesEnProceso = useMemo(
    () => filteredCortes.filter((c) => c.estado === 'en_proceso').length,
    [filteredCortes],
  )

  const cortesActivos = cortesPendientes + cortesEnProceso

  const unidadesEnProceso = useMemo(
    () =>
      filteredCortes
        .filter((c) => c.estado === 'en_proceso' || c.estado === 'pendiente')
        .reduce((sum, c) => sum + c.cantidad_total, 0),
    [filteredCortes],
  )

  const patronesActivos = useMemo(
    () => patrones.filter((p) => p.activo).length,
    [patrones],
  )

  const cortesEstadoData = useMemo(
    () =>
      (['pendiente', 'en_proceso', 'completado', 'cancelado'] as CorteEstado[])
        .map((estado) => ({
          name: ESTADO_LABEL[estado],
          value: filteredCortes.filter((c) => c.estado === estado).length,
          color: ESTADO_COLOR[estado],
        }))
        .filter((d) => d.value > 0),
    [filteredCortes],
  )

  const stockCategoriaData = useMemo(() => {
    const categoriaStock = filteredArticles
      .filter((a) => a.activo && a.category)
      .reduce<Record<string, number>>((acc, a) => {
        acc[a.category] = (acc[a.category] ?? 0) + a.stock_actual
        return acc
      }, {})

    return Object.entries(categoriaStock)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, stock]) => ({ name, stock }))
  }, [filteredArticles])

  const ultimosCortes = useMemo(() => {
    return [...filteredCortes]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6)
  }, [filteredCortes])

  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
              <IconLayoutDashboard {...ic.headerSm} aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-brand-ink">Dashboard</h1>
          </div>
          <p className="mt-1.5 text-sm capitalize text-brand-ink-muted">{today}</p>
        </div>
      </div>

      {/* Date filter */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-brand-surface p-4 shadow-sm ring-1 ring-brand-border">
        <div className="flex items-center gap-2">
          <IconCalendar size={15} stroke={1.5} className="text-brand-ink-muted" aria-hidden />
          <span className="text-sm font-medium text-brand-ink-muted">Filtrar por fecha:</span>
        </div>
        <input
          type="date"
          value={dateRange?.start ?? ''}
          onChange={(e) => setDateRange(e.target.value ? { start: e.target.value, end: dateRange?.end ?? e.target.value } : null)}
          className="rounded-lg border border-brand-border bg-brand-canvas px-3 py-2 text-sm text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
        />
        <span className="text-sm text-brand-ink-faint">al</span>
        <input
          type="date"
          value={dateRange?.end ?? ''}
          onChange={(e) => setDateRange(e.target.value ? { start: dateRange?.start ?? e.target.value, end: e.target.value } : null)}
          className="rounded-lg border border-brand-border bg-brand-canvas px-3 py-2 text-sm text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
        />
        {dateRange && (
          <button
            type="button"
            onClick={clearDateFilter}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-ink-muted transition hover:bg-brand-canvas hover:text-brand-ink"
          >
            <IconX size={14} stroke={2} aria-hidden />
            Limpiar
          </button>
        )}
        {useMock && !dateRange && (
          <span className="text-xs text-brand-ink-faint">(Mostrando datos de ejemplo)</span>
        )}
      </div>

      {loading ? (
        <SkeletonStats count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={<IconPackage {...ic.stat} aria-hidden />}
            label="Artículos en inventario"
            value={articles.length}
            sub={`${articulosActivos} activos · ${articles.length - articulosActivos} inactivos`}
            to="/inventario/articulos"
          />
          <KpiCard
            icon={<IconScissors {...ic.stat} aria-hidden />}
            label="Cortes activos"
            value={cortesActivos}
            sub={`${cortesPendientes} pendientes · ${cortesEnProceso} en proceso · ${unidadesEnProceso} unidades`}
            to="/produccion/cortes"
          />
          <KpiCard
            icon={<IconAlertTriangle {...ic.stat} aria-hidden />}
            label="Stock bajo"
            value={stockBajo.length}
            sub={stockBajo.length > 0 ? `Artículos con ≤${STOCK_BAJO_UMBRAL} unidades` : 'Todo en orden'}
            subColor={stockBajo.length > 0 ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'}
            to="/inventario/articulos"
          />
          <KpiCard
            icon={<IconFileDescription {...ic.stat} aria-hidden />}
            label="Patrones activos"
            value={patronesActivos}
            sub={`${patrones.length - patronesActivos} inactivos`}
            to="/produccion/patrones"
          />
        </div>
      )}

      {loading ? (
        <div className="animate-pulse rounded-xl bg-linear-to-r from-brand-primary to-indigo-500 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="h-4 w-32 rounded bg-white/20" />
              <div className="mt-2 h-8 w-48 rounded bg-white/20" />
              <div className="mt-1 h-3 w-64 rounded bg-white/20" />
            </div>
            <div className="h-10 w-10 rounded bg-white/20" />
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-linear-to-r from-brand-primary to-indigo-500 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/80">Valor total del stock activo</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-white">
                {formatARS(valorStock)}
              </p>
              <p className="mt-1 text-xs text-white/60">Calculado sobre precio de lista × stock actual</p>
            </div>
            <IconTrendingUp size={40} stroke={1.25} className="shrink-0 text-white/30" aria-hidden />
          </div>
        </div>
      )}

      <Suspense
        fallback={
          <div className="grid gap-6 lg:grid-cols-2">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        }
      >
        <DashboardChartsSection
          loading={loading}
          cantidadCortes={cortes.length}
          cortesEstadoData={cortesEstadoData}
          stockCategoriaData={stockCategoriaData}
        />
      </Suspense>

      <SectionCard title={`Últimos cortes (${loading ? '...' : ultimosCortes.length})`}>
        {loading ? (
          <div className="p-5">
            <SkeletonTable rows={3} cols={3} />
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
