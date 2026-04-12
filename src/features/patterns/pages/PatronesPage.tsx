import {
  IconChevronLeft,
  IconChevronRight,
  IconFile,
  IconPlus,
  IconRefresh,
  IconRuler,
  IconSearch,
  IconX,
} from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '../../../components/ui/StatCard'
import { ic } from '../../../lib/tabler'
import { usePatronesQuery } from '../hooks/usePatrones'
import { PatronCard } from '../components/PatronCard'
import type { Patron } from '../../../types/database'

const PAGE_SIZE = 12

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function filterPatrones(patrones: Patron[], query: string): Patron[] {
  const q = normalize(query.trim())
  if (!q) return patrones
  return patrones.filter(
    (p) =>
      normalize(p.nombre).includes(q) ||
      normalize(p.articulo_nombre).includes(q) ||
      normalize(p.articulo_sku).includes(q) ||
      normalize(p.file_name).includes(q),
  )
}

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
    <nav aria-label="Paginación de patrones" className="flex items-center justify-center gap-1">
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

export function PatronesPage() {
  const { data: patrones = [], isPending: loading, isError, error, refetch } = usePatronesQuery()
  const errorMessage = isError && error instanceof Error ? error.message : null

  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [query])

  const filtered = useMemo(() => filterPatrones(patrones, query), [patrones, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const hasFilters = query.trim() !== ''

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
              <IconRuler {...ic.headerSm} aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">Patrones</h1>
          </div>
          <p className="mt-1.5 text-sm text-[#6e6b7b]">Archivos de moldería vinculados a artículos del catálogo.</p>
        </div>
        <Link
          to="/produccion/patrones/nuevo"
          className={`inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover ${loading ? 'pointer-events-none opacity-60' : ''}`}
          onClick={(e) => { if (loading) e.preventDefault() }}
        >
          <IconPlus {...ic.btn} aria-hidden />
          Nuevo patrón
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Patrones registrados"
          value={loading ? '…' : String(patrones.length)}
          icon={<IconRuler {...ic.stat} aria-hidden />}
        />
        <StatCard
          label="Archivos almacenados"
          value={loading ? '…' : String(patrones.filter((p) => p.activo).length)}
          icon={<IconFile {...ic.stat} aria-hidden />}
        />
      </div>

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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, artículo, código o archivo…"
              className="w-full rounded-lg border border-[#e8e4f0] bg-[#f8f7fa] py-2 pl-9 pr-3 text-sm text-[#3d3b4f] outline-none transition placeholder:text-[#b9b6c3] focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-blush/50"
            />
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={() => setQuery('')}
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
          <p className="font-semibold text-red-800">No se pudieron cargar los patrones</p>
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
        <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-black/4">
              <div className="aspect-4/3 rounded-t-xl bg-[#f8f7fa]" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-1/3 rounded bg-[#f0eef5]" />
                <div className="h-4 w-3/4 rounded bg-[#f0eef5]" />
                <div className="h-3 w-1/2 rounded bg-[#f0eef5]" />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Empty — no patrones */}
      {!loading && !errorMessage && patrones.length === 0 ? (
        <div className="rounded-xl bg-white px-5 py-14 text-center shadow-sm ring-1 ring-black/4">
          <IconRuler size={40} stroke={1.25} className="mx-auto text-[#b9b6c3]" aria-hidden />
          <p className="mt-3 text-sm font-medium text-[#3d3b4f]">No hay patrones todavía</p>
          <p className="mt-1 text-sm text-[#6e6b7b]">
            <Link to="/produccion/patrones/nuevo" className="font-semibold text-brand-primary hover:underline">
              Cargar el primero
            </Link>
          </p>
        </div>
      ) : null}

      {/* Empty — filtered */}
      {!loading && !errorMessage && patrones.length > 0 && filtered.length === 0 ? (
        <div className="rounded-xl bg-white px-5 py-14 text-center shadow-sm ring-1 ring-black/4">
          <p className="text-sm text-[#6e6b7b]">Ningún patrón coincide con la búsqueda.</p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4f0] px-3 py-1.5 text-sm text-[#6e6b7b] transition hover:text-[#3d3b4f]"
          >
            <IconX size={14} stroke={2} aria-hidden />
            Limpiar búsqueda
          </button>
        </div>
      ) : null}

      {/* Results */}
      {!loading && !errorMessage && filtered.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-[#b9b6c3]">
              {filtered.length === patrones.length
                ? `${filtered.length} patrones`
                : `${filtered.length} de ${patrones.length} patrones`}
            </p>
            {totalPages > 1 && (
              <p className="text-sm text-[#b9b6c3]">
                Página {safePage} de {totalPages}
              </p>
            )}
          </div>
          <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginated.map((patron) => (
              <li key={patron.id}>
                <PatronCard patron={patron} />
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
