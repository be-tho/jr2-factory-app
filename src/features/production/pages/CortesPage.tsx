import { PageHeader } from '../../../components/ui/PageHeader'
import { StatCard } from '../../../components/ui/StatCard'

export function CortesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cortes"
        description="Seguimiento de cortes y lotes en taller."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Cortes activos" value="—" />
        <StatCard label="Metros procesados hoy" value="—" />
        <StatCard label="Pendientes" value="—" />
      </div>
    </div>
  )
}
