import { PageHeader } from '../../../components/ui/PageHeader'
import { StatCard } from '../../../components/ui/StatCard'

export function ArticulosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Artículos"
        description="Gestión de prendas, talles, colores y stock."
      />

      <section className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle">
        <header className="border-b border-brand-border bg-brand-blush/20 px-5 py-3">
          <h3 className="font-medium text-brand-ink">Resumen rápido</h3>
        </header>
        <div className="grid gap-4 px-5 py-4 md:grid-cols-3">
          <StatCard label="Artículos activos" value="128" />
          <StatCard label="Sin stock" value="7" />
          <StatCard label="Categorías" value="12" />
        </div>
      </section>
    </div>
  )
}
