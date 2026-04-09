import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { PageHeader } from '../../../components/ui/PageHeader'
import { StatCard } from '../../../components/ui/StatCard'

export function ProductsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Productos"
          description="Gestion de prendas, talles, colores y stock."
        />

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 px-5 py-3">
            <h3 className="font-medium text-slate-800">Resumen rapido</h3>
          </header>
          <div className="grid gap-4 px-5 py-4 md:grid-cols-3">
            <StatCard label="Productos activos" value="128" />
            <StatCard label="Sin stock" value="7" />
            <StatCard label="Categorias" value="12" />
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
