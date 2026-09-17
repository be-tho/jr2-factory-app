import {
  IconCalendar,
  IconPalette,
  IconUsers,
  IconEdit,
  IconEye,
  IconPlus,
  IconRefresh,
  IconScissors,
  IconSearch,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type ColumnDef,
} from '@tanstack/react-table'
import { StatCard } from '../../../components/ui/StatCard'
import { SimplePagination } from '../../../components/ui/SimplePagination'
import { ic } from '../../../lib/tabler'
import { normalizeForSearch } from '../../../lib/normalize'
import {
  DEFAULT_ARTICLE_IMAGE_PUBLIC_URL,
  hasStorageCoverImage,
} from '../../../constants/defaultArticleImage'
import { getProductImagePublicUrl } from '../../media/services/storage.service'
import type { Corte, CorteEstado } from '../../../types/database'
import { useCortesQuery, useDeleteCorteMutation } from '../hooks/useCortes'
import { ArticuloImageModal } from '../components/ArticuloImageModal'

const PAGE_SIZE = 15

const ESTADO_CONFIG: Record<CorteEstado, { label: string; dot: string; bg: string; text: string }> = {
  pendiente:  { label: 'Pendiente',   dot: 'bg-amber-400',      bg: 'bg-amber-50 ring-1 ring-amber-200',  text: 'text-amber-700' },
  en_proceso: { label: 'En proceso',  dot: 'bg-blue-400',       bg: 'bg-blue-50 ring-1 ring-blue-200',    text: 'text-blue-700' },
  completado: { label: 'Completado',  dot: 'bg-brand-mint',     bg: 'bg-green-50 ring-1 ring-green-200',  text: 'text-green-700' },
  cancelado:  { label: 'Cancelado',   dot: 'bg-brand-ink-faint',bg: 'bg-gray-100 ring-1 ring-gray-200',   text: 'text-gray-500' },
}

const ESTADO_FILTERS: { value: CorteEstado | 'todos'; label: string }[] = [
  { value: 'todos',      label: 'Todos' },
  { value: 'pendiente',  label: 'Pendientes' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'completado', label: 'Completados' },
  { value: 'cancelado',  label: 'Cancelados' },
]

function EstadoBadge({ estado }: { estado: CorteEstado }) {
  const cfg = ESTADO_CONFIG[estado]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

interface ImageTargetState {
  nombre: string
  codigo: string
  cover_image_path: string | null
}

export function CortesPage() {
  const { data: cortes = [], isPending: loading, isError, error, refetch } = useCortesQuery()
  const deleteMutation = useDeleteCorteMutation()
  const errorMessage = isError && error instanceof Error ? error.message : null

  const [query, setQuery] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<CorteEstado | 'todos'>('todos')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [imageTarget, setImageTarget] = useState<ImageTargetState | null>(null)

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })

  useEffect(() => {
    setGlobalFilter(query)
  }, [query])

  useEffect(() => {
    if (estadoFilter === 'todos') {
      setColumnFilters((prev) => prev.filter((f) => f.id !== 'estado'))
    } else {
      setColumnFilters((prev) => {
        const existing = prev.find((f) => f.id === 'estado')
        if (existing) {
          return prev.map((f) => f.id === 'estado' ? { id: 'estado', value: estadoFilter } : f)
        } else {
          return [...prev, { id: 'estado', value: estadoFilter }]
        }
      })
    }
  }, [estadoFilter])

  const enProceso = cortes.filter((c) => c.estado === 'en_proceso').length
  const completados = cortes.filter((c) => c.estado === 'completado').length
  const pendientes = cortes.filter((c) => c.estado === 'pendiente').length

  const hasFilters = query.trim() !== '' || estadoFilter !== 'todos'

  function clearFilters() {
    setQuery('')
    setEstadoFilter('todos')
    setColumnFilters([])
    setGlobalFilter('')
  }

  async function handleDelete(id: string) {
    await deleteMutation.mutateAsync(id)
    setConfirmDeleteId(null)
  }

  const columns = useMemo<ColumnDef<Corte>[]>(
    () => [
      { accessorKey: 'numero_corte' },
      { accessorKey: 'tipo_tela' },
      { accessorKey: 'cantidad_total' },
      { accessorKey: 'estado' },
      { accessorKey: 'fecha' },
    ],
    [],
  )

  const table = useReactTable({
    data: cortes,
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
      const corte = row.original
      return (
        normalizeForSearch(corte.numero_corte).includes(q) ||
        normalizeForSearch(corte.tipo_tela).includes(q) ||
        (corte.costureros ? normalizeForSearch(corte.costureros).includes(q) : false) ||
        corte.articulos.some((a) => normalizeForSearch(a.nombre).includes(q) || normalizeForSearch(a.codigo).includes(q))
      )
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
              <IconScissors {...ic.headerSm} aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-brand-ink">Cortes</h1>
          </div>
          <p className="mt-1.5 text-sm text-brand-ink-muted">Seguimiento de cortes textiles y lotes en taller.</p>
        </div>
        <Link
          to="/produccion/cortes/nuevo"
          className={`inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover ${loading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <IconPlus {...ic.btn} aria-hidden />
          Nuevo corte
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total cortes"
          value={loading ? '…' : String(cortes.length)}
          icon={<IconScissors {...ic.stat} aria-hidden />}
        />
        <StatCard
          label="En proceso"
          value={loading ? '…' : String(enProceso)}
          icon={<IconScissors {...ic.stat} aria-hidden />}
        />
        <StatCard
          label="Completados"
          value={loading ? '…' : String(completados)}
          icon={<IconScissors {...ic.stat} aria-hidden />}
        />
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="rounded-xl bg-red-50 px-5 py-4 text-sm ring-1 ring-red-200">
          <p className="font-semibold text-red-800">No se pudieron cargar los cortes</p>
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
      )}

      {/* Filter bar */}
      {!errorMessage && (
        <div className="flex flex-col gap-3 rounded-xl bg-brand-surface p-4 shadow-sm ring-1 ring-brand-border sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch
              size={15}
              stroke={1.5}
              className="pointer-events-none absolute inset-y-0 left-3 my-auto text-brand-ink-muted"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por número, tela, artículo o costurero…"
              className="w-full rounded-lg border border-brand-border bg-brand-canvas py-2 pl-9 pr-3 text-sm text-brand-ink outline-none transition placeholder:text-brand-ink-muted focus:border-brand-primary focus:bg-brand-surface focus:ring-2 focus:ring-brand-blush/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-brand-border bg-brand-canvas p-1">
            {ESTADO_FILTERS.map((op) => (
              <button
                key={op.value}
                type="button"
                onClick={() => setEstadoFilter(op.value)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                  estadoFilter === op.value
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-brand-ink-muted hover:text-brand-ink'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-ink-muted transition hover:bg-brand-canvas hover:text-brand-ink"
            >
              <IconX size={14} stroke={2} aria-hidden />
              Limpiar
            </button>
          )}
        </div>
      )}

      {/* Skeleton */}
      {loading && !errorMessage && (
        <div className="overflow-hidden rounded-xl bg-brand-surface shadow-sm ring-1 ring-brand-border">
          <div className="divide-y divide-brand-border-subtle">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
                <div className="h-4 w-20 rounded bg-brand-border" />
                <div className="h-4 flex-1 rounded bg-brand-border" />
                <div className="h-5 w-24 rounded-full bg-brand-border" />
                <div className="h-4 w-16 rounded bg-brand-border" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty — no cortes */}
      {!loading && !errorMessage && cortes.length === 0 && (
        <div className="rounded-xl bg-white px-5 py-14 text-center shadow-sm ring-1 ring-black/4">
          <IconScissors size={40} stroke={1.25} className="mx-auto text-brand-ink-muted" aria-hidden />
          <p className="mt-3 text-sm font-medium text-brand-ink">No hay cortes todavía</p>
          <p className="mt-1 text-sm text-brand-ink-muted">
            <Link to="/produccion/cortes/nuevo" className="font-semibold text-brand-primary hover:underline">
              Crear el primero
            </Link>
          </p>
        </div>
      )}

      {/* Empty — filtered */}
      {!loading && !errorMessage && cortes.length > 0 && table.getFilteredRowModel().rows.length === 0 && (
        <div className="rounded-xl bg-white px-5 py-14 text-center shadow-sm ring-1 ring-black/4">
          <p className="text-sm text-brand-ink-muted">Ningún corte coincide con los filtros aplicados.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-brand-border px-3 py-1.5 text-sm text-brand-ink-muted transition hover:text-brand-ink"
          >
            <IconX size={14} stroke={2} aria-hidden />
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Board */}
      {!loading && !errorMessage && cortes.length > 0 && table.getFilteredRowModel().rows.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-brand-ink-faint">
              {table.getFilteredRowModel().rows.length} cortes
              {pendientes > 0 && ` · ${pendientes} pendiente${pendientes > 1 ? 's' : ''}`}
            </p>
            {table.getPageCount() > 1 && (
              <p className="text-xs font-medium text-brand-ink-faint">
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {table.getRowModel().rows.map((row, index) => (
              <CorteCard
                key={row.original.id}
                corte={row.original}
                index={index}
                onDelete={() => setConfirmDeleteId(row.original.id)}
                onImage={(articulo) => setImageTarget(articulo)}
              />
            ))}
          </div>

          {table.getPageCount() > 1 && (
            <SimplePagination
              page={table.getState().pagination.pageIndex + 1}
              totalPages={table.getPageCount()}
              totalItems={table.getFilteredRowModel().rows.length}
              pageSize={PAGE_SIZE}
              onPageChange={(newPage) => table.setPageIndex(newPage - 1)}
              ariaLabel="Paginación de cortes"
            />
          )}
        </>
      )}

      {/* Delete confirm dialog */}
      {confirmDeleteId && (
        <ConfirmDeleteModal
          onConfirm={() => void handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
          deleting={deleteMutation.isPending}
        />
      )}

      {/* Image lightbox */}
      {imageTarget && (
        <ArticuloImageModal articulo={imageTarget} onClose={() => setImageTarget(null)} />
      )}
    </div>
  )
}

function CorteCard({
  corte,
  index,
  onDelete,
  onImage,
}: {
  corte: Corte
  index: number
  onDelete: () => void
  onImage: (articulo: ImageTargetState) => void
}) {
  const date = new Date(`${corte.fecha}T00:00:00`).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const accent = {
    pendiente: 'bg-amber-400',
    en_proceso: 'bg-blue-500',
    completado: 'bg-emerald-500',
    cancelado: 'bg-slate-300',
  }[corte.estado]

  return (
    <article
      className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand-primary/20"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className={`h-1.5 ${accent}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-semibold tracking-wide text-brand-primary">CORTE</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-brand-ink">#{corte.numero_corte}</h2>
          </div>
          <div className="flex items-center gap-1">
            <Link
              to={`/produccion/cortes/${corte.id}`}
              aria-label={`Ver corte ${corte.numero_corte}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-brand-canvas hover:text-brand-ink"
            >
              <IconEye size={17} stroke={1.6} aria-hidden />
            </Link>
            <Link
              to={`/produccion/cortes/${corte.id}/editar`}
              aria-label={`Editar corte ${corte.numero_corte}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-brand-canvas hover:text-brand-ink"
            >
              <IconEdit size={17} stroke={1.6} aria-hidden />
            </Link>
            <button
              type="button"
              aria-label={`Eliminar corte ${corte.numero_corte}`}
              onClick={onDelete}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-red-50 hover:text-red-500"
            >
              <IconTrash size={17} stroke={1.6} aria-hidden />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <EstadoBadge estado={corte.estado} />
          <span className="inline-flex items-center gap-1.5 text-xs text-brand-ink-muted">
            <IconCalendar size={14} stroke={1.6} aria-hidden />
            {date}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-brand-canvas px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-ink-faint">Tela</p>
            <p className="mt-1 truncate text-sm font-semibold text-brand-ink" title={corte.tipo_tela}>{corte.tipo_tela}</p>
          </div>
          <div className="rounded-xl bg-brand-canvas px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-ink-faint">Encimadas</p>
            <p className="mt-1 font-mono text-lg font-bold leading-none text-brand-primary">{corte.cantidad_total}</p>
          </div>
        </div>

        <div className="mt-5 border-t border-brand-border-subtle pt-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-ink-faint">
              Artículos · {corte.articulos.length}
            </p>
            {corte.costureros && (
              <span className="inline-flex max-w-[150px] items-center gap-1 truncate text-xs text-brand-ink-muted" title={corte.costureros}>
                <IconUsers size={14} stroke={1.6} aria-hidden />
                {corte.costureros}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            {corte.articulos.length === 0 ? (
              <span className="text-xs text-brand-ink-faint">Sin artículos vinculados</span>
            ) : (
              <>
                <div className="flex -space-x-2">
                  {corte.articulos.slice(0, 4).map((art) => {
                    const hasImage = hasStorageCoverImage(art.cover_image_path)
                    const imageSrc = hasImage && art.cover_image_path
                      ? getProductImagePublicUrl(art.cover_image_path)
                      : DEFAULT_ARTICLE_IMAGE_PUBLIC_URL
                    return (
                      <button
                        key={art.articulo_id}
                        type="button"
                        aria-label={`Ver imagen de ${art.nombre}`}
                        title={`${art.nombre} · ${art.codigo}`}
                        onClick={() => onImage({ nombre: art.nombre, codigo: art.codigo, cover_image_path: art.cover_image_path })}
                        className="h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-brand-canvas transition hover:z-10 hover:scale-110"
                      >
                        <img
                          src={imageSrc}
                          alt=""
                          className={`h-full w-full ${hasImage ? 'object-cover' : 'object-contain p-0.5'}`}
                        />
                      </button>
                    )
                  })}
                </div>
                <p className="min-w-0 truncate text-xs text-brand-ink-muted">
                  {corte.articulos[0]?.nombre}
                  {corte.articulos.length > 1 && ` +${corte.articulos.length - 1}`}
                </p>
              </>
            )}
          </div>
        </div>

        {corte.colores.length > 0 && (
          <div className="mt-4 flex items-center gap-2 border-t border-brand-border-subtle pt-3">
            <IconPalette size={14} stroke={1.6} className="shrink-0 text-brand-ink-faint" aria-hidden />
            <div className="flex min-w-0 flex-wrap gap-1.5">
              {corte.colores.slice(0, 3).map((color) => (
                <span key={color.id} className="rounded-full bg-brand-border-subtle px-2 py-0.5 text-[11px] text-brand-ink-muted">
                  {color.color} <strong className="text-brand-ink">×{color.cantidad}</strong>
                </span>
              ))}
              {corte.colores.length > 3 && <span className="text-[11px] text-brand-ink-faint">+{corte.colores.length - 3}</span>}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

function ConfirmDeleteModal({
  onConfirm,
  onCancel,
  deleting,
}: {
  onConfirm: () => void
  onCancel: () => void
  deleting: boolean
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-desc"
    >
      <div className="absolute inset-0 bg-modal-scrim" onClick={onCancel} aria-hidden />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-brand-surface p-6 shadow-2xl ring-1 ring-brand-border">
        <h3 id="confirm-delete-title" className="text-base font-semibold text-brand-ink">¿Eliminar este corte?</h3>
        <p id="confirm-delete-desc" className="mt-2 text-sm text-brand-ink-muted">
          Esta acción no se puede deshacer. Se eliminarán también los artículos y colores vinculados.
        </p>
        <div className="mt-5 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg border border-brand-border px-4 py-2 text-sm font-medium text-brand-ink-muted transition hover:bg-brand-canvas disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
