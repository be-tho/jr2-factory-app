import { PageHeader } from '../../../components/ui/PageHeader'
import { StatCard } from '../../../components/ui/StatCard'
import { useProductsQuery } from '../../inventory/hooks/useProducts'

export function DashboardPage() {
  const { data: articles = [], isPending: productsLoading } = useProductsQuery()
  const activos = articles.filter((a) => a.activo).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen general de operación: métricas clave e indicadores."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Artículos en inventario"
          value={productsLoading ? '…' : String(articles.length)}
        />
        <StatCard label="Artículos activos" value={productsLoading ? '…' : String(activos)} />
        <StatCard label="Órdenes de hoy" value="—" />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="flex min-h-[220px] flex-col rounded-xl border border-dashed border-brand-border bg-brand-surface p-5 shadow-sm">
          <h3 className="text-sm font-medium text-brand-ink">Producción vs. objetivo</h3>
          <p className="mt-1 text-xs text-brand-ink-muted">Gráfico de barras o líneas (próximamente)</p>
          <div className="mt-auto flex flex-1 items-center justify-center rounded-lg bg-brand-blush/25 py-8">
            <span className="text-sm text-brand-ink-faint">Área para gráfico</span>
          </div>
        </div>
        <div className="flex min-h-[220px] flex-col rounded-xl border border-dashed border-brand-border bg-brand-surface p-5 shadow-sm">
          <h3 className="text-sm font-medium text-brand-ink">Stock por categoría</h3>
          <p className="mt-1 text-xs text-brand-ink-muted">Gráfico circular o treemap (próximamente)</p>
          <div className="mt-auto flex flex-1 items-center justify-center rounded-lg bg-brand-blush/25 py-8">
            <span className="text-sm text-brand-ink-faint">Área para gráfico</span>
          </div>
        </div>
      </section>
    </div>
  )
}
