import { IconClipboardList, IconHistory, IconReceipt, IconSearch } from '@tabler/icons-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SimplePagination } from '../../../components/ui/SimplePagination'
import { ic } from '../../../lib/tabler'
import type { OrdenVentaEstado } from '../../../types/database'
import { formatARS } from '../lib/pricing'
import { useOrdenesVentaListQuery } from '../hooks/useOrdenVenta'

const PAGE_SIZE = 12

function formatFecha(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

type VentasOrdenesListPageProps = {
  estado: OrdenVentaEstado
}

export function VentasOrdenesActivasPage() {
  return <VentasOrdenesListPage estado="pendiente" />
}

export function VentasHistorialVentasPage() {
  return <VentasOrdenesListPage estado="pagado" />
}

export function VentasOrdenesListPage({ estado }: VentasOrdenesListPageProps) {
  const reduceMotion = useReducedMotion()
  const { data: rows = [], isPending: loading } = useOrdenesVentaListQuery(estado)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const historial = estado === 'pagado'

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.cliente_nombre.toLowerCase().includes(q) ||
        (r.cliente_telefono?.toLowerCase().includes(q) ?? false),
    )
  }, [rows, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [search])

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  const title = historial ? 'Historial de ventas' : 'Órdenes de venta'
  const subtitle = historial
    ? 'Ventas cerradas y cobradas. Solo lectura.'
    : 'Pedidos pendientes de cobro. Podés editar datos e ítems antes de marcar pagado.'
  const detailBase = historial ? '/ventas/historial' : '/ventas/ordenes'

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
      className="mx-auto max-w-6xl"
    >
      <div className="relative overflow-hidden rounded-3xl border border-brand-border bg-brand-surface shadow-[0_20px_50px_-28px_rgba(235,61,99,0.22)] ring-1 ring-black/4">
        <div className="h-1.5 w-full bg-linear-to-r from-brand-primary via-brand-blush-deep to-brand-primary" aria-hidden />
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary-ghost text-brand-primary shadow-sm ring-1 ring-brand-blush/35">
                {historial ? <IconHistory {...ic.headerSm} aria-hidden /> : <IconClipboardList {...ic.headerSm} aria-hidden />}
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-brand-ink md:text-3xl">{title}</h1>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-brand-ink-muted">{subtitle}</p>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <Link
              to="/ventas"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border-2 border-brand-border-strong bg-brand-surface px-5 text-sm font-semibold text-brand-primary shadow-md transition hover:border-brand-primary/50 hover:bg-brand-primary-ghost hover:shadow-lg active:scale-[0.99]"
            >
              <IconReceipt {...ic.inline} aria-hidden />
              Catálogo
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <label htmlFor="ordenes-buscar" className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
          Buscar por cliente o teléfono
        </label>
        <div className="relative max-w-xl">
          <IconSearch
            size={18}
            stroke={1.5}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink-faint"
            aria-hidden
          />
          <input
            id="ordenes-buscar"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre del cliente…"
            className="w-full rounded-2xl border-2 border-brand-border bg-brand-surface py-3 pl-11 pr-4 text-sm text-brand-ink shadow-sm outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-4 focus:ring-brand-blush/35"
            autoComplete="off"
          />
        </div>
      </div>

      <section className="mt-10 rounded-3xl border border-brand-border-subtle bg-brand-canvas/40 p-5 shadow-inner ring-1 ring-black/3 sm:p-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-brand-ink-faint">
              {historial ? 'Ventas cobradas' : 'Órdenes activas'}
            </h2>
            {!loading && (
              <p className="mt-1 text-sm text-brand-ink-muted">
                {filtered.length === 0
                  ? 'Sin resultados.'
                  : `${filtered.length} orden${filtered.length !== 1 ? 'es' : ''}`}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-brand-border" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-border-strong bg-brand-surface/90 px-8 py-16 text-center ring-1 ring-black/3">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary-ghost text-brand-primary">
              <IconClipboardList size={28} stroke={1.5} aria-hidden />
            </div>
            <p className="font-semibold text-brand-ink">{search ? 'No hay coincidencias' : historial ? 'Todavía no hay ventas en historial' : 'No hay órdenes pendientes'}</p>
            <p className="mt-2 text-sm text-brand-ink-muted">
              {historial
                ? 'Las órdenes aparecen acá cuando las marcás como pagadas.'
                : 'Registrá una venta desde el checkout del catálogo.'}
            </p>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {pageRows.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`${detailBase}/${r.id}`}
                    className="flex flex-col gap-3 rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-sm ring-1 ring-black/3 transition hover:border-brand-primary/35 hover:bg-brand-primary-ghost/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-brand-ink">{r.cliente_nombre}</p>
                      <p className="mt-0.5 text-xs text-brand-ink-muted">
                        {formatFecha(r.created_at)}
                        {r.cliente_telefono ? ` · ${r.cliente_telefono}` : ''}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-brand-canvas px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-ink-muted ring-1 ring-brand-border-subtle">
                          {r.medio_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                        </span>
                        {historial && r.pagado_at && (
                          <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-800 ring-1 ring-green-200">
                            Pagado {formatFecha(r.pagado_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <p className="text-lg font-bold tabular-nums text-brand-ink">{formatARS(r.total)}</p>
                      <span className="text-xs font-semibold text-brand-primary">Ver detalle →</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <SimplePagination
                page={page}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                ariaLabel={historial ? 'Paginación historial de ventas' : 'Paginación de órdenes'}
              />
            )}
          </>
        )}
      </section>
    </motion.div>
  )
}
