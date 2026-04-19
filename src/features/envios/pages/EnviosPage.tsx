import {
  IconEdit,
  IconEye,
  IconMapPin,
  IconPhone,
  IconPlus,
  IconSearch,
  IconTrash,
  IconTruck,
  IconX,
  IconCheck,
} from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SimplePagination } from '../../../components/ui/SimplePagination'
import { PROVINCIAS_ARGENTINA } from '../../../lib/argentina-provincias'
import { ic } from '../../../lib/tabler'
import {
  useClientesEnvioQuery,
  useDeleteClienteEnvioMutation,
  useToggleClienteEnvioActivoMutation,
} from '../hooks/useClientesEnvio'
import type { ClienteEnvio } from '../../../types/database'

type FiltroActivo = 'activos' | 'todos' | 'inactivos'

const PAGE_SIZE = 12

function DeleteDialog({
  row,
  onConfirm,
  onCancel,
  loading,
}: {
  row: ClienteEnvio
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-modal-scrim p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-base font-bold text-brand-ink">¿Eliminar esta dirección?</h3>
        <p className="mt-2 text-sm text-brand-ink-muted">
          Vas a eliminar el registro de <span className="font-semibold">{row.nombre_empresa}</span>. Esta acción no se
          puede deshacer.
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

export function EnviosPage() {
  const { data: rows = [], isPending: loading } = useClientesEnvioQuery()
  const deleteMutation = useDeleteClienteEnvioMutation()
  const toggleMutation = useToggleClienteEnvioActivoMutation()

  const [search, setSearch] = useState('')
  const [provinciaFiltro, setProvinciaFiltro] = useState<string>('')
  const [filtro, setFiltro] = useState<FiltroActivo>('activos')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<ClienteEnvio | null>(null)

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchFiltro =
        filtro === 'todos' || (filtro === 'activos' && r.activo) || (filtro === 'inactivos' && !r.activo)

      const matchProv = !provinciaFiltro || r.provincia === provinciaFiltro

      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        r.nombre_empresa.toLowerCase().includes(q) ||
        r.direccion.toLowerCase().includes(q) ||
        r.zonas_envio.toLowerCase().includes(q) ||
        r.localidad?.toLowerCase().includes(q) ||
        r.telefono?.toLowerCase().includes(q) ||
        r.observaciones?.toLowerCase().includes(q) ||
        r.horario_atencion?.toLowerCase().includes(q)

      return matchFiltro && matchProv && matchSearch
    })
  }, [rows, filtro, provinciaFiltro, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [search, provinciaFiltro, filtro])

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  const activos = rows.filter((r) => r.activo).length
  const ctcCount = rows.filter((r) => r.catalogo_origen === 'ctc').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
              <IconTruck {...ic.headerSm} aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">Envíos</h1>
          </div>
          <p className="mt-1.5 text-sm text-[#6e6b7b]">
            {loading ? '…' : `${rows.length} transportes · ${activos} activos${ctcCount ? ` · ${ctcCount} CTC` : ''}`}
          </p>
        </div>
        <Link
          to="/envios/nuevo"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover"
        >
          <IconPlus size={15} stroke={2.5} aria-hidden />
          Nueva dirección
        </Link>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
        <div className="relative min-w-0 flex-1 lg:min-w-[200px]">
          <IconSearch
            size={15}
            stroke={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink-faint"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Buscar por empresa, dirección o zonas de envío…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-brand-border-strong bg-brand-surface py-2 pl-9 pr-3 text-sm text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
          />
        </div>
        <label className="flex min-w-0 items-center gap-2 lg:w-64">
          <IconMapPin size={16} stroke={1.5} className="shrink-0 text-brand-ink-faint" aria-hidden />
          <select
            value={provinciaFiltro}
            onChange={(e) => setProvinciaFiltro(e.target.value)}
            className="w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
          >
            <option value="">Todas las provincias</option>
            {PROVINCIAS_ARGENTINA.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
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

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-brand-border" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-brand-border py-16 text-center">
          <IconTruck size={36} stroke={1} className="text-brand-ink-faint" aria-hidden />
          <div>
            <p className="font-semibold text-brand-ink">
              {search || provinciaFiltro ? 'Sin resultados con esos filtros' : 'No hay direcciones cargadas'}
            </p>
            <p className="mt-1 text-sm text-brand-ink-faint">
              {search || provinciaFiltro
                ? 'Probá limpiar la búsqueda o el filtro de provincia.'
                : 'Agregá la primera con el botón de arriba.'}
            </p>
          </div>
          {!search && !provinciaFiltro && (
            <Link
              to="/envios/nuevo"
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary-hover"
            >
              <IconPlus size={14} stroke={2.5} aria-hidden />
              Nueva dirección
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
          <ul className="divide-y divide-brand-border-subtle">
            {pageRows.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-[#faf9fb] sm:flex-row sm:items-center sm:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary-ghost text-brand-primary">
                  <IconMapPin size={20} stroke={1.5} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-brand-ink">{r.nombre_empresa}</p>
                    {r.catalogo_origen === 'ctc' && (
                      <span className="rounded-full bg-brand-primary-ghost px-2 py-0.5 text-[11px] font-semibold text-brand-primary ring-1 ring-brand-primary/20">
                        CTC
                      </span>
                    )}
                    {!r.activo && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500 ring-1 ring-gray-200">
                        Inactivo
                      </span>
                    )}
                  </div>
                  {r.catalogo_origen === 'ctc' ? (
                    <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                      {r.observaciones && (
                        <p className="text-xs text-brand-ink-muted">
                          <IconMapPin size={12} className="mr-0.5 inline -mt-px text-brand-primary" aria-hidden />
                          {r.observaciones}
                        </p>
                      )}
                      {r.telefono && (
                        <p className="text-xs text-brand-ink-faint">
                          <IconPhone size={12} className="mr-0.5 inline -mt-px" aria-hidden />
                          {r.telefono}
                        </p>
                      )}
                      {r.horario_atencion && (
                        <p className="text-xs text-brand-ink-faint">{r.horario_atencion}</p>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="mt-0.5 text-xs text-brand-ink-muted">
                        {[r.direccion, r.localidad, r.provincia].filter(Boolean).join(' · ')}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-brand-ink-faint">Envíos: {r.zonas_envio}</p>
                    </>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1 self-end sm:self-center">
                  <button
                    type="button"
                    aria-label={r.activo ? 'Desactivar' : 'Activar'}
                    onClick={() => toggleMutation.mutate({ id: r.id, activo: !r.activo })}
                    disabled={toggleMutation.isPending}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      r.activo
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-brand-ink-faint hover:bg-brand-primary-ghost hover:text-brand-primary'
                    }`}
                  >
                    {r.activo ? <IconCheck size={15} stroke={2.5} aria-hidden /> : <IconX size={15} stroke={2} aria-hidden />}
                  </button>
                  <Link
                    to={`/envios/${r.id}`}
                    aria-label={`Ver ${r.nombre_empresa}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-brand-primary-ghost hover:text-brand-primary"
                  >
                    <IconEye size={15} stroke={1.5} aria-hidden />
                  </Link>
                  <Link
                    to={`/envios/${r.id}/editar`}
                    aria-label={`Editar ${r.nombre_empresa}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-brand-primary-ghost hover:text-brand-primary"
                  >
                    <IconEdit size={15} stroke={1.5} aria-hidden />
                  </Link>
                  <button
                    type="button"
                    aria-label={`Eliminar ${r.nombre_empresa}`}
                    onClick={() => setDeleteTarget(r)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-red-50 hover:text-red-500"
                  >
                    <IconTrash size={15} stroke={1.5} aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="px-5 pb-5">
              <SimplePagination
                page={page}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                ariaLabel="Paginación de direcciones de envío"
              />
            </div>
          )}
        </div>
      )}

      {deleteTarget && (
        <DeleteDialog
          row={deleteTarget}
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
