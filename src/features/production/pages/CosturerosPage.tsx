import { PageHeader } from '../../../components/ui/PageHeader'
import { StatCard } from '../../../components/ui/StatCard'

export function CosturerosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Costureros"
        description="Asignación y avance por operario."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Costureros activos" value="—" />
        <StatCard label="Prendas en curso" value="—" />
        <StatCard label="Eficiencia del turno" value="—" />
      </div>
    </div>
  )
}
