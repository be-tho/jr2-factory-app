import { IconCircleCheck, IconClipboardList, IconLayoutDashboard, IconPackage } from '@tabler/icons-react'
import { StatCard } from '../../../components/ui/StatCard'
import { ic } from '../../../lib/tabler'
import { useProductsQuery } from '../../inventory/hooks/useProducts'

export function DashboardPage() {
  const { data: articles = [], isPending: productsLoading } = useProductsQuery()
  const activos = articles.filter((a) => a.activo).length

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
            <IconLayoutDashboard {...ic.headerSm} aria-hidden />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">Dashboard</h1>
        </div>
        <p className="mt-1.5 text-sm text-[#6e6b7b]">Resumen general de operación: métricas clave e indicadores.</p>
      </div>

      {/* KPI islands */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Artículos en inventario"
          value={productsLoading ? '…' : String(articles.length)}
          icon={<IconPackage {...ic.stat} aria-hidden />}
        />
        <StatCard
          label="Artículos activos"
          value={productsLoading ? '…' : String(activos)}
          icon={<IconCircleCheck {...ic.stat} aria-hidden />}
        />
        <StatCard label="Órdenes de hoy" value="—" icon={<IconClipboardList {...ic.stat} aria-hidden />} />
      </div>

      {/* Chart placeholder islands */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex min-h-[220px] flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/4">
          <h3 className="text-sm font-semibold text-[#3d3b4f]">Producción vs. objetivo</h3>
          <p className="mt-0.5 text-xs text-[#b9b6c3]">Gráfico de barras o líneas (próximamente)</p>
          <div className="mt-auto flex flex-1 items-center justify-center rounded-lg bg-[#f8f7fa] py-8">
            <span className="text-sm text-[#b9b6c3]">Área para gráfico</span>
          </div>
        </div>
        <div className="flex min-h-[220px] flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/4">
          <h3 className="text-sm font-semibold text-[#3d3b4f]">Stock por categoría</h3>
          <p className="mt-0.5 text-xs text-[#b9b6c3]">Gráfico circular o treemap (próximamente)</p>
          <div className="mt-auto flex flex-1 items-center justify-center rounded-lg bg-[#f8f7fa] py-8">
            <span className="text-sm text-[#b9b6c3]">Área para gráfico</span>
          </div>
        </div>
      </div>
    </div>
  )
}
