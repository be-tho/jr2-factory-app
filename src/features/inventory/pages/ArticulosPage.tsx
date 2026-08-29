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
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from '@tanstack/react-table'
import { StatCard } from '../../../components/ui/StatCard'
import { SimplePagination } from '../../../components/ui/SimplePagination'
import { useProductsQuery } from '../hooks/useProducts'
import { ic } from '../../../lib/tabler'
import { normalizeForSearch } from '../../../lib/normalize'
import { ArticuloCard } from '../components/ArticuloCard'
import {
  buildArticulosListSearch,
  parseArticulosListSearch,
  type EstadoFilter,
} from '../lib/articulosListFilters'

const PAGE_SIZE = 12

export function ArticulosPage() {
  const { data: articles = [], isPending: loading, isError, error, refetch } = useProductsQuery()
  const errorMessage = isError && error instanceof Error ? error.message : null
  const [searchParams, setSearchParams] = useSearchParams()
  const initialFilters = useMemo(
    () => parseArticulosListSearch(searchParams.toString()),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only read URL on first mount
    [],
  )

  const [query, setQuery] = useState(initialFilters.query)
  const [categoriaFilter, setCategoriaFilter] = useState(initialFilters.categoria)
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>(initialFilters.estado)
  const [temporadaFilter, setTemporadaFilter] = useState(initialFilters.temporada)
  const [sortDescending, setSortDescending] = useState(true)

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState(initialFilters.query)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialFilters.page - 1,
    pageSize: PAGE_SIZE,
  })

  useEffect(() => {
    setGlobalFilter(query)
  }, [query])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = buildArticulosListSearch({
        query,
        categoria: categoriaFilter,
        estado: estadoFilter,
        temporada: temporadaFilter,
        page: pagination.pageIndex + 1,
      })

      setSearchParams(nextSearch ? nextSearch : {}, { replace: true })
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [query, categoriaFilter, estadoFilter, temporadaFilter, pagination.pageIndex, setSearchParams])

  const listSearch = buildArticulosListSearch({
    query,
    categoria: categoriaFilter,
    estado: estadoFilter,
    temporada: temporadaFilter,
    page: pagination.pageIndex + 1,
  })

  useEffect(() => {
    if (categoriaFilter) {
      setColumnFilters((prev) => {
        const existing = prev.find((f) => f.id === 'categoria_id')
        if (existing) {
          return prev.map((f) => f.id === 'categoria_id' ? { id: 'categoria_id', value: categoriaFilter } : f)
        } else {
          return [...prev, { id: 'categoria_id', value: categoriaFilter }]
        }
      })
    } else {
      setColumnFilters((prev) => prev.filter((f) => f.id !== 'categoria_id'))
    }
  }, [categoriaFilter])

  useEffect(() => {
    if (estadoFilter === 'todos') {
      setColumnFilters((prev) => prev.filter((f) => f.id !== 'activo'))
    } else {
      const isActive = estadoFilter === 'activo'
      setColumnFilters((prev) => {
        const existing = prev.find((f) => f.id === 'activo')
        if (existing) {
          return prev.map((f) => f.id === 'activo' ? { id: 'activo', value: isActive } : f)
        } else {
          return [...prev, { id: 'activo', value: isActive }]
        }
      })
    }
  }, [estadoFilter])

  useEffect(() => {
    if (temporadaFilter) {
      setColumnFilters((prev) => {
        const existing = prev.find((f) => f.id === 'temporada_id')
        if (existing) {
          return prev.map((f) => f.id === 'temporada_id' ? { id: 'temporada_id', value: temporadaFilter } : f)
        } else {
          return [...prev, { id: 'temporada_id', value: temporadaFilter }]
        }
      })
    } else {
      setColumnFilters((prev) => prev.filter((f) => f.id !== 'temporada_id'))
    }
  }, [temporadaFilter])

  const activeCount = articles.filter((a) => a.activo).length
  const noStockCount = articles.filter((a) => a.stock_actual === 0).length

  const categorias = useMemo(() => {
    const map = new Map<string, string>()
    for (const a of articles) {
      if (a.categoria_id && a.category) map.set(a.categoria_id, a.category)
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1], 'es'))
  }, [articles])

  const temporadas = useMemo(() => {
    const map = new Map<string, string>()
    for (const a of articles) {
      if (a.temporada_id && a.temporada) map.set(a.temporada_id, a.temporada)
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1], 'es'))
  }, [articles])

  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => {
      const numA = getCodigoNumber(a.codigo)
      const numB = getCodigoNumber(b.codigo)
      return sortDescending ? numB - numA : numA - numB
    })
  }, [articles, sortDescending])

  const hasFilters = query.trim() !== '' || categoriaFilter !== '' || estadoFilter !== 'todos' || temporadaFilter !== ''

  function resetPage() {
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }))
  }

  function clearFilters() {
    setQuery('')
    setCategoriaFilter('')
    setEstadoFilter('todos')
    setTemporadaFilter('')
    setColumnFilters([])
    setGlobalFilter('')
    resetPage()
  }

  // Función para extraer número del código (ART-12345 -> 12345)
  function getCodigoNumber(codigo: string): number {
    const match = codigo.match(/\d+/)
    return match ? parseInt(match[0], 10) : 0
  }

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: (props: any) => (
        <span className="text-sm font-semibold text-brand-ink">{props.row.original.name}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: (props: any) => (
        <span className="font-mono text-sm text-brand-ink">{props.row.original.sku}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'category',
      header: 'Categoría',
      cell: (props: any) => (
        <span className="text-sm text-brand-ink-muted">{props.row.original.category || '—'}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'temporada',
      header: 'Temporada',
      cell: (props: any) => (
        <span className="text-sm text-brand-ink-muted">{props.row.original.temporada || '—'}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'categoria_id',
      header: '',
      cell: () => null,
      enableSorting: false,
    },
    {
      accessorKey: 'activo',
      header: '',
      cell: () => null,
      enableSorting: false,
    },
    {
      accessorKey: 'codigo',
      header: '',
      cell: () => null,
      enableSorting: false,
    },
    {
      accessorKey: 'temporada_id',
      header: '',
      cell: () => null,
      enableSorting: false,
    },
  ], [])

  const table = useReactTable({
    data: sortedArticles,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = normalizeForSearch(filterValue as string)
      if (!q) return true
      const a = row.original
      return (
        normalizeForSearch(a.name).includes(q) ||
        normalizeForSearch(a.sku).includes(q) ||
        normalizeForSearch(a.codigo).includes(q) ||
        normalizeForSearch(a.category).includes(q) ||
        normalizeForSearch(a.temporada).includes(q)
      )
    },
  })

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
              <IconStack {...ic.headerSm} aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-brand-ink">Artículos</h1>
          </div>
          <p className="mt-1.5 text-sm text-brand-ink-muted">Gestión de prendas, talles, colores y stock.</p>
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
        <div className="flex flex-col gap-3 rounded-xl bg-brand-surface p-4 shadow-sm ring-1 ring-brand-border">
          <div className="relative min-w-0 w-full">
            <IconSearch
              size={15}
              stroke={1.5}
              className="pointer-events-none absolute inset-y-0 left-3 my-auto text-brand-ink-muted"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                resetPage()
              }}
              placeholder="Buscar por nombre, código, categoría o temporada…"
              className="w-full rounded-lg border border-brand-border bg-brand-canvas py-2 pl-9 pr-3 text-sm text-brand-ink outline-none transition placeholder:text-brand-ink-muted focus:border-brand-primary focus:bg-brand-surface focus:ring-2 focus:ring-brand-blush/50"
            />
          </div>

          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:flex-wrap">
            <select
              value={categoriaFilter}
              onChange={(e) => {
                setCategoriaFilter(e.target.value)
                resetPage()
              }}
              className="w-full min-w-0 rounded-lg border border-brand-border bg-brand-canvas px-3 py-2 text-sm text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50 lg:w-44 lg:shrink-0"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(([id, nombre]) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>

            <select
              value={temporadaFilter}
              onChange={(e) => {
                setTemporadaFilter(e.target.value)
                resetPage()
              }}
              className="w-full min-w-0 rounded-lg border border-brand-border bg-brand-canvas px-3 py-2 text-sm text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50 lg:w-44 lg:shrink-0"
            >
              <option value="">Todas las temporadas</option>
              {temporadas.map(([temporada_id, nombre]) => (
                <option key={temporada_id} value={temporada_id}>
                  {nombre}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setSortDescending(!sortDescending)}
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-brand-border bg-brand-canvas px-3 py-2 text-sm text-brand-ink-muted transition hover:bg-brand-primary hover:text-white hover:border-brand-primary"
              aria-label={sortDescending ? 'Ordenar ascendente' : 'Ordenar descendente'}
              title={sortDescending ? 'Ordenar ascendente' : 'Ordenar descendente'}
            >
              {sortDescending ? '↓' : '↑'}
            </button>

            <div className="grid min-w-0 grid-cols-3 gap-1 rounded-lg border border-brand-border bg-brand-canvas p-1 lg:shrink-0">
              {(['todos', 'activo', 'inactivo'] as const).map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => {
                    setEstadoFilter(op)
                    resetPage()
                  }}
                  className={`rounded-md px-2 py-1.5 text-sm font-medium transition sm:px-3 ${
                    estadoFilter === op
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-brand-ink-muted hover:text-brand-ink'
                  }`}
                >
                  {op === 'todos' ? 'Todos' : op === 'activo' ? 'Activos' : 'Inactivos'}
                </button>
              ))}
            </div>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-ink-muted transition hover:bg-brand-canvas hover:text-brand-ink lg:w-auto"
              >
                <IconX size={14} stroke={2} aria-hidden />
                Limpiar
              </button>
            ) : null}
          </div>
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
          <IconPackage size={40} stroke={1.25} className="mx-auto text-brand-ink-muted" aria-hidden />
          <p className="mt-3 text-sm font-medium text-brand-ink">No hay artículos todavía</p>
          <p className="mt-1 text-sm text-brand-ink-muted">
            <Link to="/inventario/articulos/nuevo" className="font-semibold text-brand-primary hover:underline">
              Crear el primero
            </Link>
          </p>
        </div>
      ) : null}

      {/* Empty — filtered */}
      {!loading && !errorMessage && articles.length > 0 && table.getFilteredRowModel().rows.length === 0 ? (
        <div className="rounded-xl bg-white px-5 py-14 text-center shadow-sm ring-1 ring-black/4">
          <p className="text-sm text-brand-ink-muted">Ningún artículo coincide con los filtros aplicados.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-brand-border px-3 py-1.5 text-sm text-brand-ink-muted transition hover:text-brand-ink"
          >
            <IconX size={14} stroke={2} aria-hidden />
            Limpiar filtros
          </button>
        </div>
      ) : null}

      {/* Results - Cards grid using TanStack Table data */}
      {!loading && !errorMessage && table.getFilteredRowModel().rows.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-brand-ink-faint">
              {table.getFilteredRowModel().rows.length} artículo{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
            </p>
            {table.getPageCount() > 1 && (
              <p className="text-xs font-medium text-brand-ink-faint">
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
              </p>
            )}
          </div>
          <ul className="grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {table.getRowModel().rows.map((row) => (
              <li key={row.id}>
                <ArticuloCard product={row.original} listSearch={listSearch} />
              </li>
            ))}
          </ul>
          {table.getPageCount() > 1 && (
            <SimplePagination
              page={table.getState().pagination.pageIndex + 1}
              totalPages={table.getPageCount()}
              totalItems={table.getFilteredRowModel().rows.length}
              pageSize={PAGE_SIZE}
              onPageChange={(newPage) => table.setPageIndex(newPage - 1)}
              ariaLabel="Paginación de artículos"
            />
          )}
        </>
      ) : null}
    </div>
  )
}
