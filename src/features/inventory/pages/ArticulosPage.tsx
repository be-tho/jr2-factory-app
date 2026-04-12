import {
  IconPackage,
  IconPackageOff,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconStack,
  IconTag,
  IconX,
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../../components/ui/PageHeader'
import { StatCard } from '../../../components/ui/StatCard'
import { useProductsQuery } from '../hooks/useProducts'
import { ic } from '../../../lib/tabler'
import { ArticuloCard } from '../components/ArticuloCard'
import type { Product } from '../../../types/database'

type EstadoFilter = 'todos' | 'activo' | 'inactivo'

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function filterArticulos(
  articles: Product[],
  query: string,
  categoria: string,
  estado: EstadoFilter,
): Product[] {
  const q = normalize(query.trim())
  return articles.filter((a) => {
    if (estado === 'activo' && !a.activo) return false
    if (estado === 'inactivo' && a.activo) return false
    if (categoria && a.categoria_id !== categoria) return false
    if (!q) return true
    return (
      normalize(a.name).includes(q) ||
      normalize(a.sku).includes(q) ||
      normalize(a.category).includes(q) ||
      normalize(a.temporada).includes(q)
    )
  })
}

export function ArticulosPage() {
  const { data: articles = [], isPending: loading, isError, error, refetch } = useProductsQuery()
  const errorMessage = isError && error instanceof Error ? error.message : null

  const [query, setQuery] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('todos')

  const activeCount = articles.filter((a) => a.activo).length
  const noStockCount = articles.filter((a) => a.stock_actual === 0).length

  const categorias = useMemo(() => {
    const map = new Map<string, string>()
    for (const a of articles) {
      if (a.categoria_id && a.category) map.set(a.categoria_id, a.category)
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1], 'es'))
  }, [articles])

  const filtered = useMemo(
    () => filterArticulos(articles, query, categoriaFilter, estadoFilter),
    [articles, query, categoriaFilter, estadoFilter],
  )

  const hasFilters = query.trim() !== '' || categoriaFilter !== '' || estadoFilter !== 'todos'

  function clearFilters() {
    setQuery('')
    setCategoriaFilter('')
    setEstadoFilter('todos')
  }

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
        <header className="border-b border-brand-border bg-brand-primary-ghost px-5 py-3">
          <h3 className="font-medium text-brand-ink">Resumen rápido</h3>
        </header>
        <div className="grid gap-4 px-5 py-4 md:grid-cols-3">
          <StatCard
            label="Artículos activos"
            value={loading ? '…' : String(activeCount)}
            icon={<IconPackage {...ic.stat} aria-hidden />}
          />
          <StatCard
            label="Sin stock"
            value={loading ? '…' : String(noStockCount)}
            icon={<IconPackageOff {...ic.stat} aria-hidden />}
          />
          <StatCard
            label="Categorías (en catálogo)"
            value={loading ? '…' : String(categorias.length)}
            icon={<IconTag {...ic.stat} aria-hidden />}
          />
        </div>
      </section>

      {/* Barra de búsqueda y filtros */}
      {!errorMessage && (
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch
              size={16}
              stroke={1.5}
              className="pointer-events-none absolute inset-y-0 left-3 my-auto text-brand-ink-faint"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, código, categoría o temporada…"
              className="w-full rounded-lg border border-brand-border-strong bg-brand-surface py-2 pl-9 pr-3 text-sm text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
            />
          </div>

          <select
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            className="rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50 sm:w-44"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(([id, nombre]) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 rounded-lg border border-brand-border-strong bg-brand-surface p-1">
            {(['todos', 'activo', 'inactivo'] as const).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => setEstadoFilter(op)}
                className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition ${
                  estadoFilter === op
                    ? 'bg-brand-primary text-brand-on-primary shadow-sm'
                    : 'text-brand-ink-muted hover:text-brand-ink'
                }`}
              >
                {op === 'todos' ? 'Todos' : op === 'activo' ? 'Activos' : 'Inactivos'}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border-strong px-3 py-2 text-sm text-brand-ink-muted transition hover:border-brand-border hover:text-brand-ink"
            >
              <IconX size={14} stroke={2} aria-hidden />
              Limpiar
            </button>
          )}
        </section>
      )}

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
        <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="animate-pulse rounded-xl border border-brand-border bg-brand-surface">
              <div className="aspect-4/3 rounded-t-xl bg-brand-canvas" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-1/3 rounded bg-brand-border" />
                <div className="h-4 w-3/4 rounded bg-brand-border" />
                <div className="h-3 w-1/2 rounded bg-brand-border" />
              </div>
            </li>
          ))}
        </ul>
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

      {!loading && !errorMessage && articles.length > 0 && filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-border bg-brand-surface/80 px-5 py-10 text-center">
          <p className="text-sm text-brand-ink-muted">
            Ningún artículo coincide con los filtros aplicados.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-brand-border-strong px-3 py-1.5 text-sm text-brand-ink-muted transition hover:text-brand-ink"
          >
            <IconX size={14} stroke={2} aria-hidden />
            Limpiar filtros
          </button>
        </div>
      ) : null}

      {!loading && !errorMessage && filtered.length > 0 ? (
        <>
          {hasFilters && (
            <p className="text-sm text-brand-ink-muted">
              {filtered.length === articles.length
                ? `${filtered.length} artículos`
                : `${filtered.length} de ${articles.length} artículos`}
            </p>
          )}
          <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filtered.map((product) => (
              <li key={product.id}>
                <ArticuloCard product={product} />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}
