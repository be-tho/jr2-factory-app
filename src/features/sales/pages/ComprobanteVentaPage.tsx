import { IconArrowLeft, IconCheck, IconPrinter, IconShoppingBag } from '@tabler/icons-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { useProductsQuery } from '../../inventory/hooks/useProducts'
import { useOrdenVentaDetailQuery } from '../hooks/useOrdenVenta'
import { formatARS } from '../lib/pricing'

const MEDIO_PAGO_LABEL: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia bancaria',
}

const fmt = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'long',
  timeStyle: 'short',
})

const fmtShort = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase()
}

export function ComprobanteVentaPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const fromCheckout = (location.state as { fromCheckout?: boolean } | null)?.fromCheckout === true

  const { data, isPending: loading, isError } = useOrdenVentaDetailQuery(id)
  const { data: products = [] } = useProductsQuery()

  if (!id) return <Navigate to="/ventas/ordenes" replace />

  if (isError) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
        <p className="font-semibold text-red-900">No se pudo cargar el comprobante.</p>
        <Link to="/ventas/ordenes" className="mt-4 inline-block text-sm font-semibold text-brand-primary underline">
          Volver a órdenes
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-brand-border" />
        <div className="h-[520px] animate-pulse rounded-2xl bg-brand-border" />
      </div>
    )
  }

  if (!data) return <Navigate to="/ventas/ordenes" replace />

  const { orden, items } = data
  const productById = new Map(products.map((p) => [p.id, p]))
  const backHref = orden.estado === 'pagado' ? `/ventas/historial/${id}` : `/ventas/ordenes/${id}`

  const totalItems = items.reduce((s, i) => s + i.cantidad, 0)

  return (
    <>
      {/* Print stylesheet — injected inline to be self-contained */}
      <style>{`
        @media print {
          body > * { visibility: hidden; }
          #comprobante-print-root,
          #comprobante-print-root * { visibility: visible; }
          #comprobante-print-root {
            position: absolute;
            inset: 0;
            padding: 0;
          }
          .comprobante-no-print { display: none !important; }
          .comprobante-card {
            box-shadow: none !important;
            border: 1px solid #f0e4e7 !important;
            max-width: 100% !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      <motion.div
        id="comprobante-print-root"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-2xl pb-12"
      >
        {/* Top action bar — hidden on print */}
        <div className="comprobante-no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to={backHref}
            className="group inline-flex items-center gap-2 text-sm font-medium text-brand-ink-muted transition hover:text-brand-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-canvas ring-1 ring-brand-border transition group-hover:bg-brand-primary-ghost">
              <IconArrowLeft size={16} stroke={1.5} aria-hidden className="transition group-hover:-translate-x-0.5" />
            </span>
            Volver al detalle
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-primary/25 transition hover:bg-brand-primary-hover active:scale-95"
          >
            <IconPrinter size={16} stroke={1.5} aria-hidden />
            Imprimir comprobante
          </button>
        </div>

        {/* Success banner — only shown right after checkout */}
        {fromCheckout && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="comprobante-no-print mb-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-linear-to-r from-green-50 to-emerald-50 px-5 py-4 shadow-sm ring-1 ring-green-100"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white shadow-md">
              <IconCheck size={18} stroke={2.5} aria-hidden />
            </span>
            <div>
              <p className="text-sm font-bold text-green-900">¡Venta registrada con éxito!</p>
              <p className="text-xs text-green-700">La orden quedó guardada. Podés imprimir el comprobante o cerrar esta pantalla.</p>
            </div>
          </motion.div>
        )}

        {/* ── THE RECEIPT CARD ── */}
        <div className="comprobante-card overflow-hidden rounded-3xl border border-brand-border bg-white shadow-[0_24px_64px_-28px_rgba(235,61,99,0.22),0_4px_24px_-8px_rgba(44,40,41,0.12)] ring-1 ring-black/4">

          {/* Header — brand gradient */}
          <div className="relative overflow-hidden bg-linear-to-br from-brand-primary via-brand-primary-hover to-brand-primary-active px-7 py-8 text-white">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/6" aria-hidden />
            <div className="pointer-events-none absolute -bottom-6 right-16 h-28 w-28 rounded-full bg-white/4" aria-hidden />

            <div className="relative flex items-start justify-between gap-4">
              {/* Brand mark */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
                    <span className="text-lg font-extrabold tracking-tighter text-white">JR</span>
                  </div>
                  <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-linear-to-br from-[#f0c84a] to-[#d4960a] shadow-sm" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">JR2-MODA</p>
                  <p className="text-xl font-extrabold tracking-tight">Comprobante de venta</p>
                  <p className="mt-0.5 text-xs font-medium text-white/60">Documento sin validez fiscal</p>
                </div>
              </div>

              {/* Estado badge */}
              <div className="shrink-0 text-right">
                {orden.estado === 'pagado' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                    PAGADA
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                    PENDIENTE
                  </span>
                )}
              </div>
            </div>

            {/* Order number + date row */}
            <div className="relative mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-white/15 pt-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">Nº de orden</p>
                <p className="mt-1 font-mono text-lg font-bold tracking-wider text-white">{shortId(orden.id)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">Fecha de emisión</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {fmtShort.format(new Date(orden.created_at))}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="divide-y divide-brand-border-subtle">

            {/* Customer + payment */}
            <div className="grid gap-5 px-7 py-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-ink-faint">Cliente</p>
                <p className="text-base font-bold text-brand-ink">{orden.cliente_nombre}</p>
                {orden.cliente_telefono && (
                  <p className="mt-1 text-sm text-brand-ink-muted">{orden.cliente_telefono}</p>
                )}
              </div>
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-ink-faint">Medio de pago</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary-ghost px-3 py-1 text-sm font-semibold text-brand-primary ring-1 ring-brand-blush-deep/50">
                  {MEDIO_PAGO_LABEL[orden.medio_pago] ?? orden.medio_pago}
                </span>
                {orden.estado === 'pagado' && orden.pagado_at && (
                  <p className="mt-2 text-xs text-brand-ink-faint">
                    Cobrada: {fmtShort.format(new Date(orden.pagado_at))}
                  </p>
                )}
              </div>
            </div>

            {/* Items table */}
            <div className="px-7 py-6">
              <div className="mb-4 flex items-center gap-2">
                <IconShoppingBag size={14} stroke={1.5} className="text-brand-ink-faint" aria-hidden />
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-ink-faint">
                  Artículos · {totalItems} unidad{totalItems !== 1 ? 'es' : ''}
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-brand-border">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 border-b border-brand-border bg-brand-canvas/70 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-ink-faint">
                  <span>Artículo</span>
                  <span className="text-right">Cant.</span>
                  <span className="text-right">P. Unit.</span>
                  <span className="text-right">Subtotal</span>
                </div>

                {/* Table rows */}
                {items.map((item, index) => {
                  const product = productById.get(item.articulo_id)
                  const nombre = item.nombre_articulo ?? product?.name ?? item.articulo_id
                  const sku = item.sku_articulo ?? product?.sku
                  return (
                    <div
                      key={item.id}
                      className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 px-4 py-3.5 text-sm ${
                        index % 2 === 0 ? 'bg-white' : 'bg-brand-canvas/40'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-brand-ink">{nombre}</p>
                        {sku && (
                          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-brand-ink-faint">{sku}</p>
                        )}
                      </div>
                      <p className="tabular-nums text-right text-brand-ink-muted">{item.cantidad}</p>
                      <p className="tabular-nums text-right text-brand-ink-muted">{formatARS(item.precio_unitario)}</p>
                      <p className="tabular-nums text-right font-semibold text-brand-ink">{formatARS(item.subtotal)}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between gap-6 px-7 py-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-ink-faint">Total abonado</p>
                <p className="mt-1 text-4xl font-extrabold tabular-nums tracking-tight text-brand-ink">
                  {formatARS(orden.total)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-ink-faint">
                  {items.length} ítem{items.length !== 1 ? 's' : ''}
                </p>
                <p className="mt-1 text-xs text-brand-ink-faint">
                  Emitido el {fmt.format(new Date(orden.created_at))}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center gap-1 bg-linear-to-b from-brand-canvas/40 to-brand-canvas px-7 py-6 text-center">
              <p className="text-base font-bold text-brand-primary">¡Gracias por tu compra!</p>
              <p className="max-w-sm text-xs leading-relaxed text-brand-ink-faint">
                Este comprobante es un detalle interno de venta y no tiene validez fiscal.
                Para cualquier consulta contactate con JR2-MODA.
              </p>
              <div className="mt-4 flex items-center gap-2 opacity-50">
                <div className="h-px w-12 bg-brand-border-strong" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-ink-faint">JR2-MODA</p>
                <div className="h-px w-12 bg-brand-border-strong" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom actions — hidden on print */}
        <div className="comprobante-no-print mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/25 transition hover:bg-brand-primary-hover active:scale-95"
          >
            <IconPrinter size={16} stroke={1.5} aria-hidden />
            Imprimir comprobante
          </button>
          <Link
            to={backHref}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-brand-surface px-6 py-3 text-sm font-semibold text-brand-ink-muted transition hover:bg-brand-canvas"
          >
            Volver a la orden
          </Link>
          <Link
            to="/ventas"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-brand-surface px-6 py-3 text-sm font-semibold text-brand-ink-muted transition hover:bg-brand-canvas"
          >
            Ir al catálogo
          </Link>
        </div>
      </motion.div>
    </>
  )
}
