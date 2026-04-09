import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export function ProductsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">Productos</h2>
          <p className="mt-1 text-slate-600">
            Gestion de prendas, talles, colores y stock.
          </p>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 px-5 py-3">
            <h3 className="font-medium text-slate-800">Resumen rapido</h3>
          </header>
          <div className="grid gap-4 px-5 py-4 md:grid-cols-3">
            <article className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Productos activos</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">128</p>
            </article>
            <article className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Sin stock</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">7</p>
            </article>
            <article className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Categorias</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">12</p>
            </article>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
