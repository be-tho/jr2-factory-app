import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { StatCard } from '../../../components/ui/StatCard'
import type { Product } from '../../../types/database'
import { listProducts } from '../services/products.service'
import { ArticuloCard } from '../components/ArticuloCard'
import { NuevoArticuloDialog } from '../components/NuevoArticuloDialog'

export function ArticulosPage() {
  const [articles, setArticles] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await listProducts()
    if (err) {
      setError(err.message)
      setArticles([])
    } else {
      setArticles(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const categoryCount = new Set(articles.map((a) => a.category)).size

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Artículos"
          description="Gestión de prendas, talles, colores y stock."
        />
        <button
          type="button"
          className="shrink-0 rounded-lg border border-brand-border-strong bg-brand-primary px-4 py-2.5 text-sm font-medium text-brand-ink shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => setDialogOpen(true)}
          disabled={loading}
        >
          Nuevo artículo
        </button>
      </div>

      <NuevoArticuloDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreated={load} />

      <section className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle">
        <header className="border-b border-brand-border bg-brand-blush/20 px-5 py-3">
          <h3 className="font-medium text-brand-ink">Resumen rápido</h3>
        </header>
        <div className="grid gap-4 px-5 py-4 md:grid-cols-3">
          <StatCard label="Artículos activos" value={loading ? '…' : String(articles.length)} />
          <StatCard label="Sin stock" value="—" />
          <StatCard label="Categorías (en catálogo)" value={loading ? '…' : String(categoryCount)} />
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          <p className="font-medium">No se pudieron cargar los artículos</p>
          <p className="mt-1 text-red-700">{error}</p>
          <button
            type="button"
            className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-900 transition hover:bg-red-100"
            onClick={() => void load()}
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {loading && !error ? (
        <p className="text-center text-sm text-brand-ink-muted">Cargando artículos…</p>
      ) : null}

      {!loading && !error && articles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-border bg-brand-surface/80 px-5 py-10 text-center text-sm text-brand-ink-muted">
          No hay artículos todavía. Usá <span className="font-medium text-brand-ink">Nuevo artículo</span> para cargar el primero.
        </p>
      ) : null}

      {!loading && !error && articles.length > 0 ? (
        <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {articles.map((product) => (
            <li key={product.id}>
              <ArticuloCard product={product} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
