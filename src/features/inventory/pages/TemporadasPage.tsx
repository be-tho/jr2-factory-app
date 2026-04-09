import { PageHeader } from '../../../components/ui/PageHeader'
import { StatCard } from '../../../components/ui/StatCard'

export function TemporadasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Temporadas"
        description="Colecciones por campaña o temporada comercial."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Temporada actual" value="—" />
        <StatCard label="Colecciones" value="—" />
        <StatCard label="Próximo cierre" value="—" />
      </div>
    </div>
  )
}
