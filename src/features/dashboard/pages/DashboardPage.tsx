import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { PageHeader } from '../../../components/ui/PageHeader'
import { StatCard } from '../../../components/ui/StatCard'

export function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Vista inicial del panel de control."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Ordenes de hoy" value="24" />
          <StatCard label="Produccion activa" value="8 lotes" />
          <StatCard label="Alertas de stock" value="3" />
        </div>
      </div>
    </DashboardLayout>
  )
}
