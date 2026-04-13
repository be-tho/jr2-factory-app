import {
  IconChevronLeft,
  IconChevronRight,
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
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '../../../components/ui/StatCard'
import { ic } from '../../../lib/tabler'
import {
  DEFAULT_ARTICLE_IMAGE_PUBLIC_URL,
  hasStorageCoverImage,
} from '../../../constants/defaultArticleImage'
import { getProductImagePublicUrl } from '../../media/services/storage.service'
import type { Corte, CorteEstado } from '../../../types/database'
import { useCortesQuery, useDeleteCorteMutation } from '../hooks/useCortes'
import { ArticuloImageModal } from '../components/ArticuloImageModal'

// ─── Constants ───────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function getPaginationRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const delta = 1
  const pages: (number | '…')[] = []
  let prev: number | null = null
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      if (prev !== null && i - prev > 1) pages.push('…')
      pages.push(i)
      prev = i
    }
  }
  return pages
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── Main page ────────────────────────────────────────────────────────────────

export function CortesPage() {
  const { data: cortes = [], isPending: loading, isError, error, refetch } = useCortesQuery()
  const deleteMutation = useDeleteCorteMutation()
  const errorMessage = isError && error instanceof Error ? error.message : null

  const [query, setQuery] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<CorteEstado | 'todos'>('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [imageTarget, setImageTarget] = useState<ImageTargetState | null>(null)

  // Stats
  const enProceso = cortes.filter((c) => c.estado === 'en_proceso').length
  const completados = cortes.filter((c) => c.estado === 'completado').length
  const pendientes = cortes.filter((c) => c.estado === 'pendiente').length

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return cortes.filter((c) => {
      if (estadoFilter !== 'todos' && c.estado !== estadoFilter) return false
      if (!q) return true
      return (
        normalize(c.numero_corte).includes(q) ||
        normalize(c.tipo_tela).includes(q) ||
        (c.costureros ? normalize(c.costureros).includes(q) : false) ||
        c.articulos.some((a) => normalize(a.nombre).includes(q) || normalize(a.codigo).includes(q))
      )
    })
  }, [cortes, query, estadoFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const hasFilters = query.trim() !== '' || estadoFilter !== 'todos'

  function clearFilters() {
    setQuery('')
    setEstadoFilter('todos')
    setCurrentPage(1)
  }

  async function handleDelete(id: string) {
    await deleteMutation.mutateAsync(id)
    setConfirmDeleteId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
              <IconScissors {...ic.headerSm} aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">Cortes</h1>
          </div>
          <p className="mt-1.5 text-sm text-[#6e6b7b]">Seguimiento de cortes textiles y lotes en taller.</p>
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
              onChange={(e) => { setQuery(e.target.value); setCurrentPage(1) }}
              placeholder="Buscar por número, tela, artículo o costurero…"
              className="w-full rounded-lg border border-[#e8e4f0] bg-[#f8f7fa] py-2 pl-9 pr-3 text-sm text-[#3d3b4f] outline-none transition placeholder:text-[#b9b6c3] focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-blush/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#e8e4f0] bg-[#f8f7fa] p-1">
            {ESTADO_FILTERS.map((op) => (
              <button
                key={op.value}
                type="button"
                onClick={() => { setEstadoFilter(op.value); setCurrentPage(1) }}
                className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                  estadoFilter === op.value
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-[#6e6b7b] hover:text-[#3d3b4f]'
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4f0] px-3 py-2 text-sm text-[#6e6b7b] transition hover:bg-[#f8f7fa] hover:text-[#3d3b4f]"
            >
              <IconX size={14} stroke={2} aria-hidden />
              Limpiar
            </button>
          )}
        </div>
      )}

      {/* Skeleton */}
      {loading && !errorMessage && (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
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
          <IconScissors size={40} stroke={1.25} className="mx-auto text-[#b9b6c3]" aria-hidden />
          <p className="mt-3 text-sm font-medium text-[#3d3b4f]">No hay cortes todavía</p>
          <p className="mt-1 text-sm text-[#6e6b7b]">
            <Link to="/produccion/cortes/nuevo" className="font-semibold text-brand-primary hover:underline">
              Crear el primero
            </Link>
          </p>
        </div>
      )}

      {/* Empty — filtered */}
      {!loading && !errorMessage && cortes.length > 0 && filtered.length === 0 && (
        <div className="rounded-xl bg-white px-5 py-14 text-center shadow-sm ring-1 ring-black/4">
          <p className="text-sm text-[#6e6b7b]">Ningún corte coincide con los filtros aplicados.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4f0] px-3 py-1.5 text-sm text-[#6e6b7b] transition hover:text-[#3d3b4f]"
          >
            <IconX size={14} stroke={2} aria-hidden />
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !errorMessage && filtered.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-brand-ink-faint">
              {filtered.length === cortes.length
                ? `${filtered.length} cortes`
                : `${filtered.length} de ${cortes.length} cortes`}
              {pendientes > 0 && ` · ${pendientes} pendiente${pendientes > 1 ? 's' : ''}`}
            </p>
            {totalPages > 1 && (
              <p className="text-xs font-medium text-brand-ink-faint">
                Página {safePage} de {totalPages}
              </p>
            )}
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] table-auto text-sm">
                <thead>
                  <tr className="border-b border-brand-border-subtle bg-[#f8f7fa]">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">
                      Nº Corte
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">
                      Artículos
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">
                      Tipo de Tela
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">
                      Cant.
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">
                      Colores
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">
                      Estado
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">
                      Fecha
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-brand-ink-faint">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border-subtle">
                  {paginated.map((corte) => (
                    <CorteRow
                      key={corte.id}
                      corte={corte}
                      onDeleteRequest={setConfirmDeleteId}
                      onImageRequest={setImageTarget}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Paginación de cortes" className="flex items-center justify-center gap-1">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                aria-label="Página anterior"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8e4f0] bg-white text-[#6e6b7b] transition hover:bg-[#f8f7fa] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <IconChevronLeft size={16} stroke={1.5} aria-hidden />
              </button>
              {getPaginationRange(safePage, totalPages).map((item, idx) =>
                item === '…' ? (
                  <span key={`e-${idx}`} className="flex h-9 w-9 items-center justify-center text-sm text-[#b9b6c3]">…</span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCurrentPage(item)}
                    aria-current={item === safePage ? 'page' : undefined}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition ${
                      item === safePage
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'border border-[#e8e4f0] bg-white text-[#6e6b7b] hover:bg-[#f8f7fa]'
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                aria-label="Página siguiente"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8e4f0] bg-white text-[#6e6b7b] transition hover:bg-[#f8f7fa] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <IconChevronRight size={16} stroke={1.5} aria-hidden />
              </button>
            </nav>
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

// ─── Table row ────────────────────────────────────────────────────────────────

interface CorteRowProps {
  corte: Corte
  onDeleteRequest: (id: string) => void
  onImageRequest: (target: { nombre: string; codigo: string; cover_image_path: string | null }) => void
}

function CorteRow({ corte, onDeleteRequest, onImageRequest }: CorteRowProps) {
  return (
    <tr className="group transition-colors hover:bg-brand-canvas">
      {/* Nº Corte */}
      <td className="px-5 py-3.5">
        <span className="font-mono text-sm font-semibold text-brand-ink">#{corte.numero_corte}</span>
      </td>

      {/* Artículos */}
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

      {/* Tipo Tela */}
      <td className="px-5 py-3.5">
        <span className="text-sm text-brand-ink">{corte.tipo_tela}</span>
      </td>

      {/* Cantidad */}
      <td className="px-5 py-3.5 text-right">
        <span className="font-mono text-sm font-semibold text-brand-ink">{corte.cantidad_total}</span>
      </td>

      {/* Colores */}
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

      {/* Estado */}
      <td className="px-5 py-3.5">
        <EstadoBadge estado={corte.estado} />
      </td>

      {/* Fecha */}
      <td className="px-5 py-3.5">
        <span className="text-sm text-brand-ink-muted">
          {new Date(corte.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </td>

      {/* Acciones */}
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
            onClick={() => onDeleteRequest(corte.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink-faint transition hover:bg-red-50 hover:text-red-500"
          >
            <IconTrash size={16} stroke={1.5} aria-hidden />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function ConfirmDeleteModal({
  onConfirm,
  onCancel,
  deleting,
}: {
  onConfirm: () => void
  onCancel: () => void
  deleting: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} aria-hidden />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-brand-border">
        <h3 className="text-base font-semibold text-brand-ink">¿Eliminar este corte?</h3>
        <p className="mt-2 text-sm text-brand-ink-muted">
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
