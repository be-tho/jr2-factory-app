import { IconPackage, IconPackageOff, IconPlus, IconRefresh, IconStack, IconTag } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../../components/ui/PageHeader'
import { StatCard } from '../../../components/ui/StatCard'
import { useProductsQuery } from '../hooks/useProducts'
import { ic } from '../../../lib/tabler'
import { ArticuloCard } from '../components/ArticuloCard'

export function ArticulosPage() {
  const { data: articles = [], isPending: loading, isError, error, refetch } = useProductsQuery()
  const errorMessage = isError && error instanceof Error ? error.message : null
  const categoryCount = new Set(articles.map((a) => a.category)).size

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Artículos"
          description="Gestión de prendas, talles, colores y stock."
          icon={<IconStack {...ic.header} aria-hidden />}
        />
        <Link
          to="/inventario/articulos/nuevo"
          className={`inline-flex shrink-0 items-center gap-2 rounded-lg border border-brand-primary-hover bg-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-on-primary shadow-sm transition hover:bg-brand-primary-hover ${loading ? 'pointer-events-none opacity-60' : ''}`}
          onClick={(e) => {
            if (loading) e.preventDefault()
          }}
        >
          <IconPlus {...ic.btn} aria-hidden />
          Nuevo artículo
        </Link>
      </div>

      <section className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle">
        <header className="border-b border-brand-border bg-brand-blush/20 px-5 py-3">
          <h3 className="font-medium text-brand-ink">Resumen rápido</h3>
        </header>
        <div className="grid gap-4 px-5 py-4 md:grid-cols-3">
          <StatCard
            label="Artículos activos"
            value={loading ? '…' : String(articles.length)}
            icon={<IconPackage {...ic.stat} aria-hidden />}
          />
          <StatCard label="Sin stock" value="—" icon={<IconPackageOff {...ic.stat} aria-hidden />} />
          <StatCard
            label="Categorías (en catálogo)"
            value={loading ? '…' : String(categoryCount)}
            icon={<IconTag {...ic.stat} aria-hidden />}
          />
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          <p className="font-medium">No se pudieron cargar los artículos</p>
          <p className="mt-1 text-red-700">{errorMessage}</p>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-900 transition hover:bg-red-100"
            onClick={() => void refetch()}
          >
            <IconRefresh size={16} stroke={1.5} className="shrink-0" aria-hidden />
            Reintentar
          </button>
        </div>
      ) : null}

      {loading && !errorMessage ? (
        <p className="text-center text-sm text-brand-ink-muted">Cargando artículos…</p>
      ) : null}

      {!loading && !errorMessage && articles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-border bg-brand-surface/80 px-5 py-10 text-center text-sm text-brand-ink-muted">
          No hay artículos todavía.{' '}
          <Link to="/inventario/articulos/nuevo" className="font-medium text-brand-ink underline-offset-2 hover:underline">
            Crear el primero
          </Link>
          .
        </p>
      ) : null}

      {!loading && !errorMessage && articles.length > 0 ? (
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
