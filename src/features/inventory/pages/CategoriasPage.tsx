import { IconRefresh, IconTag } from '@tabler/icons-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '../../../components/ui/StatCard'
import { ic } from '../../../lib/tabler'
import type { CategoriaRow } from '../../../types/database'
import { useCategoriasAdminQuery, useDeleteCategoriaMutation } from '../hooks/useCategorias'

export function CategoriasPage() {
  const { data: rows = [], isPending, isError, error, refetch } = useCategoriasAdminQuery()
  const deleteMutation = useDeleteCategoriaMutation()
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)

  const loading = isPending
  const errorMessage = isError && error instanceof Error ? error.message : null

  const activas = rows.filter((r) => r.activo).length
  const inactivas = rows.length - activas

  function handleDelete(row: CategoriaRow) {
    const ok = window.confirm(
      `¿Eliminar la categoría «${row.nombre}»? Solo es posible si no hay artículos asociados.`,
    )
    if (!ok) return
    setDeleteMessage(null)
    deleteMutation.mutate(row.id, {
      onSuccess: () => setDeleteMessage(null),
      onError: (e) => {
        setDeleteMessage(e instanceof Error ? e.message : 'No se pudo eliminar.')
      },
    })
  }

  const deletingId = deleteMutation.isPending ? deleteMutation.variables : null

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
              <IconTag {...ic.headerSm} aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">Categorías</h1>
          </div>
          <p className="mt-1.5 text-sm text-[#6e6b7b]">
            Tipos de prenda y líneas. Las inactivas no aparecen al crear artículos.
          </p>
        </div>
        <Link
          to="/inventario/categorias/nueva"
          className={`inline-flex shrink-0 items-center rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover ${loading ? 'pointer-events-none opacity-60' : ''}`}
          onClick={(e) => { if (loading) e.preventDefault() }}
        >
          Nueva categoría
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total" value={loading ? '…' : String(rows.length)} />
        <StatCard label="Activas" value={loading ? '…' : String(activas)} />
        <StatCard label="Inactivas" value={loading ? '…' : String(inactivas)} />
      </div>

      {/* Error */}
      {errorMessage ? (
        <div className="rounded-xl bg-red-50 px-5 py-4 text-sm ring-1 ring-red-200">
          <p className="font-semibold text-red-800">No se pudieron cargar las categorías</p>
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

      {/* Delete message */}
      {deleteMessage ? (
        <div className="rounded-xl bg-amber-50 px-5 py-4 text-sm text-amber-900 ring-1 ring-amber-200">
          {deleteMessage}
        </div>
      ) : null}

      {/* Loading */}
      {loading && !errorMessage ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-black/4" />
          ))}
        </div>
      ) : null}

      {/* Empty */}
      {!loading && !errorMessage && rows.length === 0 ? (
        <div className="rounded-xl bg-white px-5 py-12 text-center shadow-sm ring-1 ring-black/4">
          <p className="text-sm text-[#6e6b7b]">
            No hay categorías.{' '}
            <Link to="/inventario/categorias/nueva" className="font-semibold text-brand-primary hover:underline">
              Crear la primera
            </Link>
            .
          </p>
        </div>
      ) : null}

      {/* Table island */}
      {!loading && !errorMessage && rows.length > 0 ? (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
          <div className="border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">
              {rows.length} {rows.length === 1 ? 'categoría' : 'categorías'}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-md text-left text-sm">
              <thead className="border-b border-[#f0eef5]">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">Nombre</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">Estado</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eef5]">
                {rows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-[#fdf9fb]">
                    <td className="px-5 py-3.5 font-medium text-[#3d3b4f]">{row.nombre}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={
                          row.activo
                            ? 'inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700'
                            : 'inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-500'
                        }
                      >
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full ${row.activo ? 'bg-emerald-500' : 'bg-stone-400'}`}
                          aria-hidden
                        />
                        {row.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          to={`/inventario/categorias/${row.id}/editar`}
                          className="rounded-lg border border-[#e8e4f0] bg-white px-3 py-1.5 text-xs font-medium text-[#3d3b4f] transition hover:border-brand-primary hover:text-brand-primary"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === row.id}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => handleDelete(row)}
                        >
                          {deletingId === row.id ? 'Eliminando…' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
