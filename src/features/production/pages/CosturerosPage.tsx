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
import { useState } from 'react'
import { Link } from 'react-router-dom'
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

  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState<FiltroActivo>('activos')
  const [deleteTarget, setDeleteTarget] = useState<Costurero | null>(null)

  // Filtrar
  const filtered = costureros.filter((c) => {
    const matchFiltro =
      filtro === 'todos' ||
      (filtro === 'activos' && c.activo) ||
      (filtro === 'inactivos' && !c.activo)

    const q = search.trim().toLowerCase()
    const matchSearch =
      !q ||
      c.nombre_completo.toLowerCase().includes(q) ||
      c.numero_documento.toLowerCase().includes(q) ||
      (c.telefono?.toLowerCase().includes(q) ?? false)

    return matchFiltro && matchSearch
  })

  const activos = costureros.filter((c) => c.activo).length

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
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-brand-border-strong bg-brand-surface py-2 pl-9 pr-3 text-sm text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
          />
        </div>
        <div className="flex overflow-hidden rounded-lg border border-brand-border bg-brand-canvas text-sm font-medium">
          {(['activos', 'todos', 'inactivos'] as FiltroActivo[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
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

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-brand-border" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
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
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
          <ul className="divide-y divide-brand-border-subtle">
            {filtered.map((c) => (
              <li key={c.id} className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#faf9fb]">
                <AvatarInitials nombre={c.nombre_completo} />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-brand-ink">{c.nombre_completo}</p>
                    {!c.activo && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500 ring-1 ring-gray-200">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-brand-ink-faint">
                    <span>{c.tipo_documento} {c.numero_documento}</span>
                    {c.telefono && <span>{c.telefono}</span>}
                    {c.direccion && <span>{c.direccion}</span>}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {/* Toggle activo */}
                  <button
                    type="button"
                    aria-label={c.activo ? 'Desactivar' : 'Activar'}
                    onClick={() => toggleMutation.mutate({ id: c.id, activo: !c.activo })}
                    disabled={toggleMutation.isPending}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      c.activo
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-brand-ink-faint hover:bg-brand-primary-ghost hover:text-brand-primary'
                    }`}
                  >
                    {c.activo ? <IconCheck size={15} stroke={2.5} aria-hidden /> : <IconX size={15} stroke={2} aria-hidden />}
                  </button>

                  <Link
                    to={`/produccion/costureros/${c.id}`}
                    aria-label={`Ver detalle de ${c.nombre_completo}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-brand-primary-ghost hover:text-brand-primary"
                  >
                    <IconEye size={15} stroke={1.5} aria-hidden />
                  </Link>

                  <Link
                    to={`/produccion/costureros/${c.id}/editar`}
                    aria-label={`Editar ${c.nombre_completo}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-brand-primary-ghost hover:text-brand-primary"
                  >
                    <IconEdit size={15} stroke={1.5} aria-hidden />
                  </Link>

                  <button
                    type="button"
                    aria-label={`Eliminar ${c.nombre_completo}`}
                    onClick={() => setDeleteTarget(c)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-red-50 hover:text-red-500"
                  >
                    <IconTrash size={15} stroke={1.5} aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
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
