import { PageHeader } from '../../../components/ui/PageHeader'
import { StatCard } from '../../../components/ui/StatCard'

export function CategoriasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorías"
        description="Organización de tipos de prenda y líneas."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Categorías activas" value="—" />
        <StatCard label="Artículos sin categoría" value="—" />
        <StatCard label="Última actualización" value="—" />
      </div>
    </div>
  )
}
