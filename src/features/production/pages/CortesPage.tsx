import React from 'react'
import {
  IconEdit,
  IconEye,
  IconPhoto,
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
  flexRender,
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

  const columns = useMemo(() => [
    {
      accessorKey: 'numero_corte',
      header: ({ column }: { column: { getIsSorted: () => string | boolean; toggleSorting: (asc: boolean) => void } }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nº Corte
          {column.getIsSorted() && (column.getIsSorted() === 'asc' ? '↑' : '↓')}
        </div>
      ),
      cell: ({ row }: { row: { original: Corte } }) => (
        <td className="px-5 py-3.5">
          <span className="font-mono text-sm font-semibold text-brand-ink">#{row.original.numero_corte}</span>
        </td>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'articulos',
      header: 'Artículos',
      cell: ({ row, table }: { row: { original: Corte }; table: { meta: { onImageRequest: (target: ImageTargetState) => void } } }) => {
        const corte = row.original
        const { onImageRequest } = table.meta
        return (
          <td className="px-5 py-3.5">
            <div className="flex flex-wrap gap-1.5">
              {corte.articulos.length === 0 ? (
                <span className="text-xs text-brand-ink-faint">—</span>
              ) : (
                corte.articulos.map((art) => {
                  const imgSrc = hasStorageCoverImage(art.cover_image_path)
                    ? getProductImagePublicUrl(art.cover_image_path)
                    : DEFAULT_ARTICLE_IMAGE_PUBLIC_URL
                  const isPlaceholder = !hasStorageCoverImage(art.cover_image_path)
                  return (
                    <button
                      key={art.articulo_id}
                      type="button"
                      aria-label={`Ver imagen de ${art.nombre}`}
                      title={`${art.nombre} · ${art.codigo}`}
                      onClick={() => onImageRequest({ nombre: art.nombre, codigo: art.codigo, cover_image_path: art.cover_image_path })}
                      className="group/art flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-canvas px-2 py-1 text-xs text-brand-ink-muted transition hover:border-brand-blush-deep hover:bg-brand-primary-ghost hover:text-brand-primary"
                    >
                      <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full border border-brand-border bg-white">
                        <img
                          src={imgSrc}
                          alt=""
                          className={`h-full w-full ${isPlaceholder ? 'object-contain' : 'object-cover'}`}
                        />
                      </div>
                      <span className="max-w-[80px] truncate font-medium">{art.nombre}</span>
                      <IconPhoto size={11} stroke={1.5} className="shrink-0 opacity-0 transition group-hover/art:opacity-100" aria-hidden />
                    </button>
                  )
                })
              )}
            </div>
          </td>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'tipo_tela',
      header: ({ column }: { column: { getIsSorted: () => string | boolean; toggleSorting: (asc: boolean) => void } }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Tipo de Tela
          {column.getIsSorted() && (column.getIsSorted() === 'asc' ? '↑' : '↓')}
        </div>
      ),
      cell: ({ row }: { row: { original: Corte } }) => (
        <td className="px-5 py-3.5">
          <span className="text-sm text-brand-ink">{row.original.tipo_tela}</span>
        </td>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'cantidad_total',
      header: ({ column }: { column: { getIsSorted: () => string | boolean; toggleSorting: (asc: boolean) => void } }) => (
        <div
          className="flex items-center justify-end gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Cant.
          {column.getIsSorted() && (column.getIsSorted() === 'asc' ? '↑' : '↓')}
        </div>
      ),
      cell: ({ row }: { row: { original: Corte } }) => (
        <td className="px-5 py-3.5 text-right">
          <span className="font-mono text-sm font-semibold text-brand-ink">{row.original.cantidad_total}</span>
        </td>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'colores',
      header: 'Colores',
      cell: ({ row }: { row: { original: Corte } }) => {
        const corte = row.original
        return (
          <td className="px-5 py-3.5">
            <div className="flex flex-wrap gap-1">
              {corte.colores.length === 0 ? (
                <span className="text-xs text-brand-ink-faint">—</span>
              ) : (
                corte.colores.map((col) => (
                  <span
                    key={col.id}
                    className="inline-flex items-center gap-1 rounded-full bg-brand-border-subtle px-2 py-0.5 text-[11px] text-brand-ink-muted ring-1 ring-brand-border"
                  >
                    {col.color}
                    <span className="font-semibold text-brand-ink">×{col.cantidad}</span>
                  </span>
                ))
              )}
            </div>
          </td>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'estado',
      header: ({ column }: { column: { getIsSorted: () => string | boolean; toggleSorting: (asc: boolean) => void } }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Estado
          {column.getIsSorted() && (column.getIsSorted() === 'asc' ? '↑' : '↓')}
        </div>
      ),
      cell: ({ row }: { row: { original: Corte } }) => (
        <td className="px-5 py-3.5">
          <EstadoBadge estado={row.original.estado} />
        </td>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'fecha',
      header: ({ column }: { column: { getIsSorted: () => string | boolean; toggleSorting: (asc: boolean) => void } }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Fecha
          {column.getIsSorted() && (column.getIsSorted() === 'asc' ? '↑' : '↓')}
        </div>
      ),
      cell: ({ row }: { row: { original: Corte } }) => (
        <td className="px-5 py-3.5">
          <span className="text-sm text-brand-ink-muted">
            {new Date(row.original.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </td>
      ),
      enableSorting: true,
    },
      {
      id: 'actions',
      header: 'Acciones',
      cell: (props: any) => {
        const corte = props.row.original
        return (
          <td className="px-5 py-3.5">
            <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Link
                to={`/produccion/cortes/${corte.id}`}
                aria-label={`Ver corte ${corte.numero_corte}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-brand-canvas hover:text-brand-ink"
              >
                <IconEye size={16} stroke={1.5} aria-hidden />
              </Link>
              <Link
                to={`/produccion/cortes/${corte.id}/editar`}
                aria-label={`Editar corte ${corte.numero_corte}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-brand-canvas hover:text-brand-ink"
              >
                <IconEdit size={16} stroke={1.5} aria-hidden />
              </Link>
              <button
                type="button"
                aria-label={`Eliminar corte ${corte.numero_corte}`}
                onClick={() => setConfirmDeleteId(corte.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-red-50 hover:text-red-500"
              >
                <IconTrash size={16} stroke={1.5} aria-hidden />
              </button>
            </div>
          </td>
        )
      },
      enableSorting: false,
    },
  ] as ColumnDef<Corte>[], [setConfirmDeleteId, setImageTarget])

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
    meta: {
      onDeleteRequest: setConfirmDeleteId,
      onImageRequest: setImageTarget,
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

      {/* Table */}
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

          <div className="overflow-hidden rounded-xl bg-brand-surface shadow-sm ring-1 ring-brand-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] table-auto text-sm">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b border-brand-border-subtle bg-brand-canvas">
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-brand-border-subtle">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="group transition-colors hover:bg-brand-canvas">
                      {row.getVisibleCells().map((cell) => (
                        <React.Fragment key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </React.Fragment>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
