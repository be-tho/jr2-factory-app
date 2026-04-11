import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../../components/ui/PageHeader'
import { StatCard } from '../../../components/ui/StatCard'
import type { TemporadaRow } from '../../../types/database'
import { useDeleteTemporadaMutation, useTemporadasAdminQuery } from '../hooks/useTemporadas'

export function TemporadasPage() {
  const { data: rows = [], isPending, isError, error, refetch } = useTemporadasAdminQuery()
  const deleteMutation = useDeleteTemporadaMutation()
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)

  const loading = isPending
  const errorMessage = isError && error instanceof Error ? error.message : null

  const activas = rows.filter((r) => r.activo).length
  const inactivas = rows.length - activas

  function handleDelete(row: TemporadaRow) {
    const ok = window.confirm(`¿Eliminar la temporada «${row.nombre}»? Solo es posible si no hay artículos asociados.`)
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Temporadas"
          description="Colecciones por campaña o temporada comercial. Las inactivas no aparecen al crear artículos."
        />
        <Link
          to="/inventario/temporadas/nueva"
          className={`shrink-0 rounded-lg border border-brand-primary-hover bg-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-on-primary shadow-sm transition hover:bg-brand-primary-hover ${loading ? 'pointer-events-none opacity-60' : ''}`}
          onClick={(e) => {
            if (loading) e.preventDefault()
          }}
        >
          Nueva temporada
        </Link>
      </div>

      <section className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle">
        <header className="border-b border-brand-border bg-brand-blush/20 px-5 py-3">
          <h3 className="font-medium text-brand-ink">Resumen</h3>
        </header>
        <div className="grid gap-4 px-5 py-4 md:grid-cols-3">
          <StatCard label="Total" value={loading ? '…' : String(rows.length)} />
          <StatCard label="Activas" value={loading ? '…' : String(activas)} />
          <StatCard label="Inactivas" value={loading ? '…' : String(inactivas)} />
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          <p className="font-medium">No se pudieron cargar las temporadas</p>
          <p className="mt-1 text-red-700">{errorMessage}</p>
          <button
            type="button"
            className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-900 transition hover:bg-red-100"
            onClick={() => void refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {deleteMessage ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          {deleteMessage}
        </div>
      ) : null}

      {loading && !errorMessage ? (
        <p className="text-center text-sm text-brand-ink-muted">Cargando temporadas…</p>
      ) : null}

      {!loading && !errorMessage && rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-border bg-brand-surface/80 px-5 py-10 text-center text-sm text-brand-ink-muted">
          No hay temporadas.{' '}
          <Link
            to="/inventario/temporadas/nueva"
            className="font-medium text-brand-ink underline-offset-2 hover:underline"
          >
            Crear la primera
          </Link>
          .
        </p>
      ) : null}

      {!loading && !errorMessage && rows.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-surface shadow-sm shadow-brand-ink/5 ring-1 ring-brand-border-subtle">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="border-b border-brand-border bg-brand-blush/15">
              <tr>
                <th className="px-5 py-3 font-medium text-brand-ink">Nombre</th>
                <th className="px-5 py-3 font-medium text-brand-ink">Estado</th>
                <th className="px-5 py-3 text-right font-medium text-brand-ink">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {rows.map((row) => (
                <tr key={row.id} className="text-brand-ink">
                  <td className="px-5 py-3 font-medium">{row.nombre}</td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        row.activo
                          ? 'rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800'
                          : 'rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-medium text-neutral-700'
                      }
                    >
                      {row.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        to={`/inventario/temporadas/${row.id}/editar`}
                        className="rounded-lg border border-brand-border-strong bg-white px-3 py-1.5 text-xs font-medium text-brand-ink transition hover:bg-brand-blush/30"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === row.id}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
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
      ) : null}
    </div>
  )
}
