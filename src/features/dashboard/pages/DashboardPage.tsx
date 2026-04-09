import { PageHeader } from '../../../components/ui/PageHeader'
import { StatCard } from '../../../components/ui/StatCard'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen general de operación: métricas clave e indicadores."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Órdenes de hoy" value="24" />
        <StatCard label="Producción activa" value="8 lotes" />
        <StatCard label="Alertas de stock" value="3" />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="flex min-h-[220px] flex-col rounded-xl border border-dashed border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-slate-800">Producción vs. objetivo</h3>
          <p className="mt-1 text-xs text-slate-500">Gráfico de barras o líneas (próximamente)</p>
          <div className="mt-auto flex flex-1 items-center justify-center rounded-lg bg-slate-50 py-8">
            <span className="text-sm text-slate-400">Área para gráfico</span>
          </div>
        </div>
        <div className="flex min-h-[220px] flex-col rounded-xl border border-dashed border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-slate-800">Stock por categoría</h3>
          <p className="mt-1 text-xs text-slate-500">Gráfico circular o treemap (próximamente)</p>
          <div className="mt-auto flex flex-1 items-center justify-center rounded-lg bg-slate-50 py-8">
            <span className="text-sm text-slate-400">Área para gráfico</span>
          </div>
        </div>
      </section>
    </div>
  )
}
