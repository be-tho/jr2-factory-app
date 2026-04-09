import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">Dashboard</h2>
          <p className="mt-1 text-slate-600">Vista inicial del panel de control.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Ordenes de hoy</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">24</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Produccion activa</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">8 lotes</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Alertas de stock</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">3</p>
          </article>
        </div>
      </div>
    </DashboardLayout>
  )
}
