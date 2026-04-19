import {
  IconArrowLeft,
  IconCash,
  IconClock,
  IconCreditCard,
  IconLoader2,
  IconPlus,
  IconTrash,
  IconUser,
} from '@tabler/icons-react'
import { motion, useReducedMotion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom'
import type { MedioPagoVenta, Product } from '../../../types/database'
import { useProductsQuery } from '../../inventory/hooks/useProducts'
import { OrdenDeleteConfirmDialog } from '../components/OrdenDeleteConfirmDialog'
import {
  useDeleteOrdenVentaPendienteMutation,
  useMarcarOrdenPagadaMutation,
  useOrdenVentaDetailQuery,
  useUpdateOrdenVentaMutation,
} from '../hooks/useOrdenVenta'
import { effectiveSaleUnitPrice, formatARS } from '../lib/pricing'

const inputClass =
  'w-full rounded-xl border-2 border-brand-border bg-brand-surface px-4 py-3 text-sm text-brand-ink shadow-sm outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-4 focus:ring-brand-blush/35 disabled:cursor-not-allowed disabled:opacity-60'

type DraftLine = {
  key: string
  articulo_id: string
  cantidad: number
  precio_unitario: number
}

function PayConfirmDialog({
  totalLabel,
  onConfirm,
  onCancel,
  loading,
}: {
  totalLabel: string
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-100 flex items-center justify-center bg-modal-scrim p-4 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pay-confirm-title"
        className="w-full max-w-md rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-[0_24px_48px_-12px_rgba(44,40,41,0.45)] ring-1 ring-black/5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 id="pay-confirm-title" className="text-base font-bold text-brand-ink">
          ¿Marcar como pagado?
        </h3>
        <p className="mt-2 text-sm text-brand-ink-muted">
          La orden quedará en el historial definitivo de ventas ({totalLabel}). Después podés verla pero no editarla.
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
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary-hover disabled:opacity-60"
          >
            {loading ? <IconLoader2 size={16} className="animate-spin" aria-hidden /> : null}
            Confirmar pago
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function OrdenVentaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()

  const isHistorialRoute = location.pathname.startsWith('/ventas/historial')
  const listHref = isHistorialRoute ? '/ventas/historial' : '/ventas/ordenes'

  const { data, isPending: loading, isError } = useOrdenVentaDetailQuery(id)
  const { data: products = [], isPending: loadingProducts } = useProductsQuery()
  const updateMutation = useUpdateOrdenVentaMutation()
  const pagarMutation = useMarcarOrdenPagadaMutation()
  const deleteMutation = useDeleteOrdenVentaPendienteMutation()

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [medioPago, setMedioPago] = useState<MedioPagoVenta>('efectivo')
  const [lines, setLines] = useState<DraftLine[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [payOpen, setPayOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const orden = data?.orden

  useEffect(() => {
    if (!data) return
    setNombre(data.orden.cliente_nombre)
    setTelefono(data.orden.cliente_telefono ?? '')
    setMedioPago(data.orden.medio_pago)
    setLines(
      data.items.map((it) => ({
        key: it.id,
        articulo_id: it.articulo_id,
        cantidad: it.cantidad,
        precio_unitario: Math.floor(Number(it.precio_unitario)),
      })),
    )
  }, [data])

  const readonly = orden?.estado === 'pagado'

  const { total, itemsPayload } = useMemo(() => {
    let sum = 0
    const out: {
      articulo_id: string
      cantidad: number
      precio_unitario: number
      subtotal: number
    }[] = []

    for (const l of lines) {
      const unit = Math.max(0, Math.floor(l.precio_unitario))
      const qty = Math.max(1, Math.floor(l.cantidad))
      const subtotal = qty * unit
      sum += subtotal
      out.push({
        articulo_id: l.articulo_id,
        cantidad: qty,
        precio_unitario: unit,
        subtotal,
      })
    }

    return { total: sum, itemsPayload: out }
  }, [lines])

  function setArticulo(lineKey: string, articuloId: string) {
    const p = productById.get(articuloId)
    setLines((prev) =>
      prev.map((row) =>
        row.key === lineKey
          ? {
              ...row,
              articulo_id: articuloId,
              precio_unitario: p ? Math.floor(effectiveSaleUnitPrice(p)) : row.precio_unitario,
            }
          : row,
      ),
    )
  }

  function updateLine(lineKey: string, patch: Partial<Pick<DraftLine, 'cantidad' | 'precio_unitario'>>) {
    setLines((prev) => prev.map((row) => (row.key === lineKey ? { ...row, ...patch } : row)))
  }

  function removeLine(lineKey: string) {
    setLines((prev) => prev.filter((r) => r.key !== lineKey))
  }

  function addLine() {
    const first = products[0]
    const precio = first ? Math.floor(effectiveSaleUnitPrice(first)) : 0
    setLines((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        articulo_id: first?.id ?? '',
        cantidad: 1,
        precio_unitario: precio,
      },
    ])
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!id || readonly) return
    const n = nombre.trim()
    if (n.length < 2) {
      setFormError('Ingresá el nombre del cliente.')
      return
    }
    if (!itemsPayload.length) {
      setFormError('Agregá al menos un artículo.')
      return
    }
    if (itemsPayload.some((i) => !i.articulo_id)) {
      setFormError('Seleccioná un artículo en cada línea.')
      return
    }

    updateMutation.mutate({
      id,
      input: {
        cliente_nombre: n,
        cliente_telefono: telefono.trim() || null,
        medio_pago: medioPago,
        items: itemsPayload,
      },
    })
  }

  function handleMarcarPagado() {
    if (!id) return
    pagarMutation.mutate(id, {
      onSuccess: () => {
        setPayOpen(false)
        navigate(`/ventas/historial/${id}`, { replace: true })
      },
    })
  }

  function handleDeleteOrden() {
    if (!id) return
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteOpen(false)
        navigate('/ventas/ordenes', { replace: true })
      },
    })
  }

  if (!id) {
    return <Navigate to={listHref} replace />
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
        <p className="font-semibold text-red-900">No se pudo cargar la orden.</p>
        <Link to={listHref} className="mt-4 inline-block text-sm font-semibold text-brand-primary underline">
          Volver al listado
        </Link>
      </div>
    )
  }

  if (loading || loadingProducts) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-brand-border" />
        <div className="h-96 animate-pulse rounded-2xl bg-brand-border" />
      </div>
    )
  }

  if (!data) {
    return <Navigate to={listHref} replace />
  }

  if (data.orden.estado === 'pagado' && !isHistorialRoute) {
    return <Navigate to={`/ventas/historial/${id}`} replace />
  }

  if (data.orden.estado === 'pendiente' && isHistorialRoute) {
    return <Navigate to={`/ventas/ordenes/${id}`} replace />
  }

  const ordenActualizada = data.orden

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-6xl pb-10"
    >
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to={listHref}
            className="group inline-flex items-center gap-2 text-sm font-medium text-brand-ink-muted transition hover:text-brand-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-canvas ring-1 ring-brand-border transition group-hover:bg-brand-primary-ghost">
              <IconArrowLeft size={16} stroke={1.5} aria-hidden className="transition group-hover:-translate-x-0.5" />
            </span>
            Volver
          </Link>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-brand-ink md:text-[1.75rem]">
            {readonly ? 'Detalle de venta' : 'Editar orden'}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-brand-ink-muted">
            <span className="inline-flex items-center gap-1">
              <IconClock size={14} stroke={1.5} aria-hidden />
              Creada{' '}
              {new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(
                new Date(ordenActualizada.created_at),
              )}
            </span>
            {readonly && ordenActualizada.pagado_at && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-800 ring-1 ring-green-200">
                Pagado{' '}
                {new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(
                  new Date(ordenActualizada.pagado_at),
                )}
              </span>
            )}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid gap-8 lg:grid-cols-[1fr_min(380px,100%)] lg:items-start lg:gap-10">
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-brand-ink-faint">Artículos</h2>

          {lines.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-brand-border px-5 py-8 text-center text-sm text-brand-ink-muted">
              No hay líneas en esta orden.
            </p>
          ) : (
            <div className="space-y-4">
              {lines.map((line, index) => {
                const p = productById.get(line.articulo_id)
                const sub = Math.max(1, Math.floor(line.cantidad)) * Math.max(0, Math.floor(line.precio_unitario))
                return (
                  <motion.article
                    key={line.key}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-[0_2px_28px_-14px_rgba(44,40,41,0.18)] ring-1 ring-black/3"
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-brand-primary via-brand-primary-hover to-brand-blush-deep opacity-90" aria-hidden />

                    <div className="flex flex-col gap-4 p-5 pl-6 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-primary-ghost text-xs font-bold tabular-nums text-brand-primary">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1 space-y-3">
                          <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
                            Artículo
                          </label>
                          <select
                            value={line.articulo_id}
                            disabled={readonly}
                            onChange={(e) => setArticulo(line.key, e.target.value)}
                            className={`${inputClass} max-w-xl`}
                          >
                            <option value="">Seleccioná…</option>
                            {products.map((prod: Product) => (
                              <option key={prod.id} value={prod.id}>
                                {prod.name} ({prod.sku}){!prod.activo ? ' · inactivo' : ''}
                              </option>
                            ))}
                          </select>
                          {p && (
                            <p className="text-xs text-brand-ink-muted">
                              Lista {formatARS(p.precio_lista)}
                              {p.precio_promocional != null ? ` · Promo ${formatARS(p.precio_promocional)}` : ''}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-3">
                            <div className="min-w-28">
                              <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
                                Cantidad
                              </label>
                              <input
                                type="number"
                                min={1}
                                step={1}
                                disabled={readonly}
                                value={line.cantidad}
                                onChange={(e) =>
                                  updateLine(line.key, { cantidad: Math.max(1, Number(e.target.value)) })
                                }
                                className={`${inputClass} mt-1 tabular-nums`}
                              />
                            </div>
                            <div className="min-w-36 flex-1">
                              <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
                                Precio unitario (ARS)
                              </label>
                              <input
                                type="number"
                                min={0}
                                step={1}
                                disabled={readonly}
                                value={line.precio_unitario}
                                onChange={(e) =>
                                  updateLine(line.key, {
                                    precio_unitario: Math.max(0, Math.floor(Number(e.target.value))),
                                  })
                                }
                                className={`${inputClass} mt-1 tabular-nums`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {!readonly && (
                        <button
                          type="button"
                          onClick={() => removeLine(line.key)}
                          disabled={lines.length <= 1}
                          className="flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-xl border border-brand-border text-brand-ink-faint transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Quitar línea"
                        >
                          <IconTrash size={18} stroke={1.5} aria-hidden />
                        </button>
                      )}
                    </div>

                    <div className="border-t border-brand-border-subtle bg-brand-canvas/40 px-5 py-3 text-sm">
                      <span className="text-brand-ink-muted">Subtotal </span>
                      <span className="font-semibold tabular-nums text-brand-ink">{formatARS(sub)}</span>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          )}

          {!readonly && (
            <button
              type="button"
              onClick={addLine}
              disabled={!products.length}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-brand-border-strong bg-brand-canvas/60 px-4 py-3 text-sm font-semibold text-brand-primary transition hover:border-brand-primary hover:bg-brand-primary-ghost disabled:opacity-40"
            >
              <IconPlus size={18} stroke={2} aria-hidden />
              Agregar artículo
            </button>
          )}
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-brand-border bg-brand-surface shadow-[0_20px_50px_-28px_rgba(235,61,99,0.35)] ring-1 ring-black/4">
            <div className="bg-linear-to-br from-brand-primary via-brand-primary to-brand-primary-hover px-6 py-7 text-brand-on-primary">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/85">Total</p>
              <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight md:text-[2.35rem]">{formatARS(total)}</p>
            </div>

            <div className="space-y-5 border-t border-brand-border-subtle bg-brand-canvas/50 px-5 py-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary-ghost text-brand-primary">
                  <IconUser size={18} stroke={1.5} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-brand-ink">Cliente</p>
                  <p className="text-xs text-brand-ink-muted">Datos de contacto</p>
                </div>
              </div>

              <div>
                <label htmlFor="ov-nombre" className="text-xs font-medium text-brand-ink-muted">
                  Nombre
                </label>
                <input
                  id="ov-nombre"
                  type="text"
                  disabled={readonly}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={`${inputClass} mt-1`}
                />
              </div>

              <div>
                <label htmlFor="ov-tel" className="text-xs font-medium text-brand-ink-muted">
                  Teléfono
                </label>
                <input
                  id="ov-tel"
                  type="tel"
                  disabled={readonly}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className={`${inputClass} mt-1`}
                  placeholder="Opcional"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-brand-ink-muted">Medio de pago</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={readonly}
                    onClick={() => setMedioPago('efectivo')}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition ${
                      medioPago === 'efectivo'
                        ? 'border-brand-primary bg-brand-primary-ghost text-brand-primary ring-2 ring-brand-blush/35'
                        : 'border-brand-border bg-brand-surface text-brand-ink-muted hover:border-brand-border-strong'
                    }`}
                  >
                    <IconCash size={18} stroke={1.5} aria-hidden />
                    Efectivo
                  </button>
                  <button
                    type="button"
                    disabled={readonly}
                    onClick={() => setMedioPago('transferencia')}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition ${
                      medioPago === 'transferencia'
                        ? 'border-brand-primary bg-brand-primary-ghost text-brand-primary ring-2 ring-brand-blush/35'
                        : 'border-brand-border bg-brand-surface text-brand-ink-muted hover:border-brand-border-strong'
                    }`}
                  >
                    <IconCreditCard size={18} stroke={1.5} aria-hidden />
                    Transferencia
                  </button>
                </div>
              </div>

              {formError && <p className="text-sm font-medium text-red-600">{formError}</p>}

              {!readonly ? (
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-primary/25 transition hover:bg-brand-primary-hover disabled:opacity-60"
                  >
                    {updateMutation.isPending ? (
                      <IconLoader2 size={18} className="animate-spin" aria-hidden />
                    ) : null}
                    Guardar cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayOpen(true)}
                    disabled={pagarMutation.isPending}
                    className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-green-600 bg-green-50 px-5 py-3.5 text-sm font-semibold text-green-800 transition hover:bg-green-100 disabled:opacity-60"
                  >
                    Marcar como pagado
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteOpen(true)}
                    disabled={deleteMutation.isPending}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    <IconTrash size={18} stroke={1.5} aria-hidden />
                    Eliminar orden (no cobrada)
                  </button>
                </div>
              ) : (
                <p className="rounded-xl bg-brand-canvas px-4 py-3 text-center text-xs text-brand-ink-muted">
                  Esta venta está cerrada en el historial. Para nuevas correcciones, registrá una nota aparte o una nueva
                  orden desde el catálogo.
                </p>
              )}
            </div>
          </div>
        </aside>
      </form>

      {payOpen && (
        <PayConfirmDialog
          totalLabel={formatARS(total)}
          loading={pagarMutation.isPending}
          onCancel={() => setPayOpen(false)}
          onConfirm={handleMarcarPagado}
        />
      )}

      {deleteOpen && ordenActualizada && (
        <OrdenDeleteConfirmDialog
          clienteNombre={ordenActualizada.cliente_nombre}
          loading={deleteMutation.isPending}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDeleteOrden}
        />
      )}
    </motion.div>
  )
}
