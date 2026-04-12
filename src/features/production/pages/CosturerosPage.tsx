import { IconUsers } from '@tabler/icons-react'
import { StatCard } from '../../../components/ui/StatCard'
import { ic } from '../../../lib/tabler'

export function CosturerosPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
            <IconUsers {...ic.headerSm} aria-hidden />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">Costureros</h1>
        </div>
        <p className="mt-1.5 text-sm text-[#6e6b7b]">Asignación y avance por operario.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Costureros activos" value="—" />
        <StatCard label="Prendas en curso" value="—" />
        <StatCard label="Eficiencia del turno" value="—" />
      </div>
    </div>
  )
}
