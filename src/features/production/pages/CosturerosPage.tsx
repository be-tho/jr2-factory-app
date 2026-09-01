import React from 'react'
import {
  IconCheck,
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUser,
  IconUsers,
  IconX,
} from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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
} from '@tanstack/react-table'
import { ic } from '../../../lib/tabler'
import { useDeleteCostureroMutation, useToggleCostureroActivoMutation, useCosturerosQuery } from '../hooks/useCostureros'
import type { Costurero } from '../../../types/database'

type FiltroActivo = 'todos' | 'activos' | 'inactivos'

function AvatarInitials({ nombre }: { nombre: string }) {
  const initials = nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary-ghost text-sm font-bold text-brand-primary">
      {initials}
    </div>
  )
}

function DeleteDialog({
  costurero,
  onConfirm,
  onCancel,
  loading,
}: {
  costurero: Costurero
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-modal-scrim p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-base font-bold text-brand-ink">¿Eliminar costurero?</h3>
        <p className="mt-2 text-sm text-brand-ink-muted">
          Vas a eliminar a <span className="font-semibold">{costurero.nombre_completo}</span>. Esta acción no se puede deshacer.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-brand-border px-4 py-2 text-sm font-medium text-brand-ink-muted transition hover:bg-brand-canvas disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? (
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <IconTrash size={13} stroke={2} aria-hidden />
            )}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export function CosturerosPage() {
  const { data: costureros = [], isPending: loading } = useCosturerosQuery()
  const deleteMutation = useDeleteCostureroMutation()
  const toggleMutation = useToggleCostureroActivoMutation()
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('q') ?? ''
  const filtro = (searchParams.get('estado') as FiltroActivo) ?? 'activos'
  const [deleteTarget, setDeleteTarget] = useState<Costurero | null>(null)

  const updateFilters = (next: Partial<{ q: string; estado: FiltroActivo }>) => {
    const params = new URLSearchParams(searchParams)
    const nextSearch = next.q ?? search
    if (nextSearch.trim()) params.set('q', nextSearch.trim())
    else params.delete('q')

    const nextEstado = next.estado ?? filtro
    if (nextEstado === 'activos') params.delete('estado')
    else params.set('estado', nextEstado)

    setSearchParams(params, { replace: true })
  }

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  })

  const activos = costureros.filter((c) => c.activo).length

  const columns = useMemo(() => [
    {
      id: 'avatar',
      header: '',
      cell: (props: any) => (
        <td className="px-5 py-3.5">
          <AvatarInitials nombre={props.row.original.nombre_completo} />
        </td>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'nombre_completo',
      header: (props: any) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => props.column.toggleSorting(props.column.getIsSorted() === 'asc')}
        >
          Nombre completo
          {props.column.getIsSorted() && (props.column.getIsSorted() === 'asc' ? '↑' : '↓')}
        </div>
      ),
      cell: (props: any) => (
        <td className="px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-brand-ink">{props.row.original.nombre_completo}</span>
            {!props.row.original.activo && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500 ring-1 ring-gray-200">
                Inactivo
              </span>
            )}
          </div>
        </td>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'numero_documento',
      header: (props: any) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => props.column.toggleSorting(props.column.getIsSorted() === 'asc')}
        >
          Documento
          {props.column.getIsSorted() && (props.column.getIsSorted() === 'asc' ? '↑' : '↓')}
        </div>
      ),
      cell: (props: any) => (
        <td className="px-5 py-3.5">
          <span className="text-sm text-brand-ink">
            {props.row.original.tipo_documento} {props.row.original.numero_documento}
          </span>
        </td>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'telefono',
      header: 'Teléfono',
      cell: (props: any) => (
        <td className="px-5 py-3.5">
          <span className="text-sm text-brand-ink-muted">
            {props.row.original.telefono || '—'}
          </span>
        </td>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'direccion',
      header: 'Dirección',
      cell: (props: any) => (
        <td className="px-5 py-3.5">
          <span className="text-sm text-brand-ink-muted truncate max-w-[200px] block">
            {props.row.original.direccion || '—'}
          </span>
        </td>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'activo',
      header: (props: any) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => props.column.toggleSorting(props.column.getIsSorted() === 'asc')}
        >
          Estado
          {props.column.getIsSorted() && (props.column.getIsSorted() === 'asc' ? '↑' : '↓')}
        </div>
      ),
      cell: (props: any) => (
        <td className="px-5 py-3.5">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            props.row.original.activo
              ? 'bg-green-50 ring-1 ring-green-200 text-green-700'
              : 'bg-gray-100 ring-1 ring-gray-200 text-gray-500'
          }`}>
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              props.row.original.activo ? 'bg-green-400' : 'bg-gray-400'
            }`} />
            {props.row.original.activo ? 'Activo' : 'Inactivo'}
          </span>
        </td>
      ),
      enableSorting: true,
    },
      {
      id: 'actions',
      header: 'Acciones',
      cell: (props: any) => {
        const costurero = props.row.original
        return (
          <td className="px-5 py-3.5">
            <div className="flex shrink-0 items-center gap-1 justify-end">
              <button
                type="button"
                aria-label={costurero.activo ? 'Desactivar' : 'Activar'}
                onClick={() => toggleMutation.mutate({ id: costurero.id, activo: !costurero.activo })}
                disabled={toggleMutation.isPending}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                  costurero.activo
                    ? 'text-green-600 hover:bg-green-50'
                    : 'text-brand-ink-faint hover:bg-brand-primary-ghost hover:text-brand-primary'
                }`}
              >
                {costurero.activo ? <IconCheck size={15} stroke={2.5} aria-hidden /> : <IconX size={15} stroke={2} aria-hidden />}
              </button>

              <Link
                to={`/produccion/costureros/${costurero.id}`}
                aria-label={`Ver detalle de ${costurero.nombre_completo}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-brand-primary-ghost hover:text-brand-primary"
              >
                <IconEye size={15} stroke={1.5} aria-hidden />
              </Link>

              <Link
                to={`/produccion/costureros/${costurero.id}/editar`}
                aria-label={`Editar ${costurero.nombre_completo}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-brand-primary-ghost hover:text-brand-primary"
              >
                <IconEdit size={15} stroke={1.5} aria-hidden />
              </Link>

              <button
                type="button"
                aria-label={`Eliminar ${costurero.nombre_completo}`}
                onClick={() => setDeleteTarget(costurero)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-red-50 hover:text-red-500"
              >
                <IconTrash size={15} stroke={1.5} aria-hidden />
              </button>
            </div>
          </td>
        )
      },
      enableSorting: false,
    },
  ], [deleteTarget, toggleMutation])

  const table = useReactTable({
    data: costureros,
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
      const q = (filterValue as string).toLowerCase()
      if (!q) return true
      const c = row.original
      return (
        c.nombre_completo.toLowerCase().includes(q) ||
        c.numero_documento.toLowerCase().includes(q) ||
        (c.telefono?.toLowerCase().includes(q) ?? false)
      )
    },
    meta: {
      onDeleteRequest: (costurero: Costurero) => setDeleteTarget(costurero),
      onToggleActivo: (id: string, activo: boolean) => toggleMutation.mutate({ id, activo }),
    },
  })

  // Apply filters
  useEffect(() => {
    setGlobalFilter(search)
  }, [search])

  useEffect(() => {
    if (filtro === 'todos') {
      setColumnFilters((prev) => prev.filter((f) => f.id !== 'activo'))
    } else {
      const isActive = filtro === 'activos'
      setColumnFilters((prev) => {
        const existing = prev.find((f) => f.id === 'activo')
        if (existing) {
          return prev.map((f) => f.id === 'activo' ? { id: 'activo', value: isActive } : f)
        } else {
          return [...prev, { id: 'activo', value: isActive }]
        }
      })
    }
  }, [filtro])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
              <IconUsers {...ic.headerSm} aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">Costureros</h1>
          </div>
          <p className="mt-1.5 text-sm text-[#6e6b7b]">
            {loading ? '…' : `${activos} activo${activos !== 1 ? 's' : ''} de ${costureros.length} total`}
          </p>
        </div>
        <Link
          to="/produccion/costureros/nuevo"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover"
        >
          <IconPlus size={15} stroke={2.5} aria-hidden />
          Nuevo costurero
        </Link>
      </div>

      {/* Barra de búsqueda + filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <IconSearch
            size={15}
            stroke={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink-faint"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Buscar por nombre, documento o teléfono…"
            value={search}
            onChange={(e) => updateFilters({ q: e.target.value })}
            className="w-full rounded-lg border border-brand-border-strong bg-brand-surface py-2 pl-9 pr-3 text-sm text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
          />
        </div>
        <div className="flex overflow-hidden rounded-lg border border-brand-border bg-brand-canvas text-sm font-medium">
          {(['activos', 'todos', 'inactivos'] as FiltroActivo[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => updateFilters({ estado: f })}
              className={`px-4 py-2 transition capitalize ${
                filtro === f
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-ink-muted hover:bg-brand-primary-ghost hover:text-brand-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="overflow-hidden rounded-xl bg-brand-surface shadow-sm ring-1 ring-brand-border">
          <div className="divide-y divide-brand-border-subtle">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
                <div className="h-10 w-10 rounded-full bg-brand-border" />
                <div className="h-4 flex-1 rounded bg-brand-border" />
                <div className="h-4 w-32 rounded bg-brand-border" />
                <div className="h-4 w-24 rounded bg-brand-border" />
              </div>
            ))}
          </div>
        </div>
      ) : table.getFilteredRowModel().rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-brand-border py-16 text-center">
          <IconUser size={36} stroke={1} className="text-brand-ink-faint" aria-hidden />
          <div>
            <p className="font-semibold text-brand-ink">
              {search ? 'Sin resultados para esa búsqueda' : 'No hay costureros aún'}
            </p>
            <p className="mt-1 text-sm text-brand-ink-faint">
              {search ? 'Probá con otro nombre o número de documento.' : 'Agregá el primero con el botón de arriba.'}
            </p>
          </div>
          {!search && (
            <Link
              to="/produccion/costureros/nuevo"
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary-hover"
            >
              <IconPlus size={14} stroke={2.5} aria-hidden />
              Nuevo costurero
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Table info */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-brand-ink-faint">
              {table.getFilteredRowModel().rows.length} costurero{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
            </p>
            {table.getPageCount() > 1 && (
              <p className="text-xs font-medium text-brand-ink-faint">
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
              </p>
            )}
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] table-auto text-sm">
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
                    <tr key={row.id} className="transition-colors hover:bg-[#faf9fb]">
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

          {/* Pagination */}
          {table.getPageCount() > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="rounded-lg border border-brand-border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-sm text-brand-ink-faint">
                {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="rounded-lg border border-brand-border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Dialog eliminar */}
      {deleteTarget && (
        <DeleteDialog
          costurero={deleteTarget}
          loading={deleteMutation.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteMutation.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            })
          }}
        />
      )}
    </div>
  )
}
