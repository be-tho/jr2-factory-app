import {
  IconChevronLeft,
  IconChevronRight,
  IconPackage,
  IconPackageOff,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconStack,
  IconTag,
  IconX,
} from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '../../../components/ui/StatCard'
import { useProductsQuery } from '../hooks/useProducts'
import { ic } from '../../../lib/tabler'
import { ArticuloCard } from '../components/ArticuloCard'
import type { Product } from '../../../types/database'

const PAGE_SIZE = 12

type EstadoFilter = 'todos' | 'activo' | 'inactivo'

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function getPaginationRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const delta = 1
  const left = current - delta
  const right = current + delta
  const pages: (number | '…')[] = []
  let prev: number | null = null
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= left && i <= right)) {
      if (prev !== null && i - prev > 1) pages.push('…')
      pages.push(i)
      prev = i
    }
  }
  return pages
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const range = getPaginationRange(currentPage, totalPages)

  return (
    <nav aria-label="Paginación de artículos" className="flex items-center justify-center gap-1">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Página anterior"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8e4f0] bg-white text-[#6e6b7b] transition hover:bg-[#f8f7fa] hover:text-[#3d3b4f] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <IconChevronLeft size={16} stroke={1.5} aria-hidden />
      </button>

      {range.map((item, idx) =>
        item === '…' ? (
          <span key={`ellipsis-${idx}`} className="flex h-9 w-9 items-center justify-center text-sm text-[#b9b6c3]">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === currentPage ? 'page' : undefined}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition ${
              item === currentPage
                ? 'bg-brand-primary text-white shadow-sm'
                : 'border border-[#e8e4f0] bg-white text-[#6e6b7b] hover:bg-[#f8f7fa] hover:text-[#3d3b4f]'
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Página siguiente"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8e4f0] bg-white text-[#6e6b7b] transition hover:bg-[#f8f7fa] hover:text-[#3d3b4f] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <IconChevronRight size={16} stroke={1.5} aria-hidden />
      </button>
    </nav>
  )
}

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
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [query, categoriaFilter, estadoFilter])

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const hasFilters = query.trim() !== '' || categoriaFilter !== '' || estadoFilter !== 'todos'

  function clearFilters() {
    setQuery('')
    setCategoriaFilter('')
    setEstadoFilter('todos')
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
              <IconStack {...ic.headerSm} aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">Artículos</h1>
          </div>
          <p className="mt-1.5 text-sm text-[#6e6b7b]">Gestión de prendas, talles, colores y stock.</p>
        </div>
        <Link
          to="/inventario/articulos/nuevo"
          className={`inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover ${loading ? 'pointer-events-none opacity-60' : ''}`}
          onClick={(e) => { if (loading) e.preventDefault() }}
        >
          <IconPlus {...ic.btn} aria-hidden />
          Nuevo artículo
        </Link>
      </div>

      {/* Stats islands */}
      <div className="grid gap-4 sm:grid-cols-3">
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
          label="Categorías en catálogo"
          value={loading ? '…' : String(categorias.length)}
          icon={<IconTag {...ic.stat} aria-hidden />}
        />
      </div>

      {/* Filter bar island */}
      {!errorMessage && (
        <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch
              size={15}
              stroke={1.5}
              className="pointer-events-none absolute inset-y-0 left-3 my-auto text-[#b9b6c3]"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, código, categoría o temporada…"
              className="w-full rounded-lg border border-[#e8e4f0] bg-[#f8f7fa] py-2 pl-9 pr-3 text-sm text-[#3d3b4f] outline-none transition placeholder:text-[#b9b6c3] focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-blush/50"
            />
          </div>

          <select
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            className="rounded-lg border border-[#e8e4f0] bg-[#f8f7fa] px-3 py-2 text-sm text-[#3d3b4f] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50 sm:w-44"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(([id, nombre]) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 rounded-lg border border-[#e8e4f0] bg-[#f8f7fa] p-1">
            {(['todos', 'activo', 'inactivo'] as const).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => setEstadoFilter(op)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                  estadoFilter === op
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-[#6e6b7b] hover:text-[#3d3b4f]'
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4f0] px-3 py-2 text-sm text-[#6e6b7b] transition hover:bg-[#f8f7fa] hover:text-[#3d3b4f]"
            >
              <IconX size={14} stroke={2} aria-hidden />
              Limpiar
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {errorMessage ? (
        <div className="rounded-xl bg-red-50 px-5 py-4 text-sm ring-1 ring-red-200">
          <p className="font-semibold text-red-800">No se pudieron cargar los artículos</p>
          <p className="mt-1 text-red-600">{errorMessage}</p>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-800 transition hover:bg-red-100"
            onClick={() => void refetch()}
          >
            <IconRefresh size={15} stroke={1.5} className="shrink-0" aria-hidden />
            Reintentar
          </button>
        </div>
      ) : null}

      {/* Loading skeleton */}
      {loading && !errorMessage ? (
        <ul className="grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="animate-pulse overflow-hidden rounded-2xl bg-brand-surface ring-1 ring-brand-border">
              <div className="aspect-4/3 bg-brand-canvas" />
              <div className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-16 rounded-md bg-brand-primary-ghost" />
                  <div className="h-3 w-12 rounded bg-brand-border" />
                </div>
                <div className="h-4 w-4/5 rounded bg-brand-border" />
                <div className="h-3 w-2/3 rounded bg-brand-border" />
                <div className="mt-3 flex items-center justify-between border-t border-brand-border-subtle pt-3">
                  <div className="h-5 w-20 rounded bg-brand-border" />
                  <div className="h-5 w-16 rounded-full bg-brand-border" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Empty — no articles at all */}
      {!loading && !errorMessage && articles.length === 0 ? (
        <div className="rounded-xl bg-white px-5 py-14 text-center shadow-sm ring-1 ring-black/4">
          <IconPackage size={40} stroke={1.25} className="mx-auto text-[#b9b6c3]" aria-hidden />
          <p className="mt-3 text-sm font-medium text-[#3d3b4f]">No hay artículos todavía</p>
          <p className="mt-1 text-sm text-[#6e6b7b]">
            <Link to="/inventario/articulos/nuevo" className="font-semibold text-brand-primary hover:underline">
              Crear el primero
            </Link>
          </p>
        </div>
      ) : null}

      {/* Empty — filtered */}
      {!loading && !errorMessage && articles.length > 0 && filtered.length === 0 ? (
        <div className="rounded-xl bg-white px-5 py-14 text-center shadow-sm ring-1 ring-black/4">
          <p className="text-sm text-[#6e6b7b]">Ningún artículo coincide con los filtros aplicados.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4f0] px-3 py-1.5 text-sm text-[#6e6b7b] transition hover:text-[#3d3b4f]"
          >
            <IconX size={14} stroke={2} aria-hidden />
            Limpiar filtros
          </button>
        </div>
      ) : null}

      {/* Results */}
      {!loading && !errorMessage && filtered.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-brand-ink-faint">
              {filtered.length === articles.length
                ? `${filtered.length} artículos`
                : `${filtered.length} de ${articles.length} artículos`}
            </p>
            {totalPages > 1 && (
              <p className="text-xs font-medium text-brand-ink-faint">
                Página {safePage} de {totalPages}
              </p>
            )}
          </div>
          <ul className="grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginated.map((product) => (
              <li key={product.id}>
                <ArticuloCard product={product} />
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : null}
    </div>
  )
}
