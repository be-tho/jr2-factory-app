import {
  IconArrowLeft,
  IconBuildingBank,
  IconCash,
  IconLoader2,
  IconReceipt,
  IconShieldCheck,
  IconUser,
} from '@tabler/icons-react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { MedioPagoVenta, Product } from '../../../types/database'
import { useProductsQuery } from '../../inventory/hooks/useProducts'
import { useCreateOrdenVentaMutation } from '../hooks/useOrdenVenta'
import {
  formatARS,
  type PrecioFuenteVenta,
  resolvedCartUnitPrice,
} from '../lib/pricing'
import type { CartLine } from '../store/cartStore'
import { useCartStore } from '../store/cartStore'

const inputClass =
  'w-full rounded-xl border-2 border-brand-border bg-brand-surface px-4 py-3 text-sm text-brand-ink shadow-sm outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-4 focus:ring-brand-blush/35'

const checkoutSectionVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 },
  },
}

const checkoutLineVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
}

function CheckoutLinePrecio({
  line,
  product,
  index,
  reduceMotion,
  onFuente,
  onManualChange,
}: {
  line: CartLine
  product: Product
  index: number
  reduceMotion: boolean | null
  onFuente: (fuente: PrecioFuenteVenta) => void
  onManualChange: (value: number) => void
}) {
  const fuente = line.precio_fuente ?? 'lista'
  const tienePromo = product.precio_promocional != null
  const unit = resolvedCartUnitPrice(line, product)
  const sub = line.cantidad * unit
  const inputId = `precio-manual-${line.articulo_id}`

  const segment = (active: boolean, extra = '') =>
    `relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2.5 text-center transition sm:min-h-[3.25rem] ${active ? 'bg-white text-brand-primary shadow-md ring-1 ring-brand-border-subtle' : 'text-brand-ink-muted hover:bg-white/60'} ${extra}`

  return (
    <motion.article className="group relative overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-[0_2px_28px_-14px_rgba(44,40,41,0.18)] ring-1 ring-black/[0.03]">
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-brand-primary via-brand-primary-hover to-brand-blush-deep opacity-90" aria-hidden />

      <div className="pl-5 pr-4 pt-4 sm:flex sm:items-start sm:justify-between sm:gap-4 sm:pr-5">
        <div className="flex min-w-0 gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-primary-ghost text-xs font-bold tabular-nums text-brand-primary"
            aria-hidden
          >
            {index + 1}
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold leading-snug text-brand-ink">{line.nombre}</h3>
            <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-brand-ink-faint">{line.sku}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-brand-ink-muted">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-canvas px-2.5 py-1 font-medium text-brand-ink">
                <span className="text-brand-ink-faint">Cant.</span>
                <span className="tabular-nums font-semibold text-brand-primary">{line.cantidad}</span>
              </span>
              <span className="text-brand-ink-faint">·</span>
              <span>
                Subtotal{' '}
                <span className="font-semibold tabular-nums text-brand-ink">{formatARS(sub)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-brand-border-subtle bg-brand-canvas/40 px-4 py-4 sm:px-5">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">Precio unitario</p>
        <div
          className="flex flex-wrap gap-1 rounded-xl bg-brand-canvas p-1 ring-1 ring-brand-border-subtle"
          role="group"
          aria-label="Tipo de precio"
        >
          <button type="button" className={segment(fuente === 'lista')} onClick={() => onFuente('lista')}>
            <span className="text-xs font-semibold sm:text-sm">Lista</span>
            <span className="text-[10px] tabular-nums text-brand-ink-faint sm:text-xs">{formatARS(product.precio_lista)}</span>
          </button>
          <button
            type="button"
            disabled={!tienePromo}
            title={!tienePromo ? 'Sin precio promocional cargado' : undefined}
            className={segment(fuente === 'promo', !tienePromo ? 'cursor-not-allowed opacity-45' : '')}
            onClick={() => tienePromo && onFuente('promo')}
          >
            <span className="text-xs font-semibold sm:text-sm">Promo</span>
            <span className="text-[10px] tabular-nums text-brand-ink-faint sm:text-xs">
              {tienePromo ? formatARS(product.precio_promocional!) : '—'}
            </span>
          </button>
          <button type="button" className={segment(fuente === 'manual')} onClick={() => onFuente('manual')}>
            <span className="text-xs font-semibold sm:text-sm">Manual</span>
            <span className="text-[10px] text-brand-ink-faint sm:text-xs">A medida</span>
          </button>
        </div>

        {fuente === 'manual' && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="overflow-hidden"
          >
            <label htmlFor={inputId} className="mt-4 block text-xs font-medium text-brand-ink-muted">
              Importe unitario (ARS)
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="select-none text-lg font-semibold text-brand-ink-muted">$</span>
              <input
                id={inputId}
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={line.precio_unitario}
                onChange={(e) => onManualChange(Number(e.target.value))}
                className={`${inputClass} max-w-[11rem] font-semibold tabular-nums`}
              />
            </div>
            <p className="mt-2 text-xs text-brand-ink-faint">Se usa este valor como precio por unidad en la orden.</p>
          </motion.div>
        )}
      </div>
    </motion.article>
  )
}

export function VentasCheckoutPage() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const { data: products = [], isPending: loadingProducts } = useProductsQuery()
  const lines = useCartStore((s) => s.lines)
  const clear = useCartStore((s) => s.clear)
  const setLinePrecioFuente = useCartStore((s) => s.setLinePrecioFuente)
  const setLinePrecioManual = useCartStore((s) => s.setLinePrecioManual)
  const mutation = useCreateOrdenVentaMutation()

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [medioPago, setMedioPago] = useState<MedioPagoVenta>('efectivo')
  const [formError, setFormError] = useState<string | null>(null)

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const { items, total, warnings } = useMemo(() => {
    const w: string[] = []
    const out: {
      articulo_id: string
      cantidad: number
      precio_unitario: number
      subtotal: number
    }[] = []
    let sum = 0

    for (const line of lines) {
      const p = productById.get(line.articulo_id)
      if (!p || !p.activo) {
        w.push(`«${line.nombre}» ya no está disponible y se omitió.`)
        continue
      }
      const max = p.stock_actual
      const qty = Math.min(line.cantidad, Math.max(0, max))
      if (qty <= 0) {
        w.push(`«${line.nombre}» sin stock; se omitió.`)
        continue
      }
      if (qty < line.cantidad) {
        w.push(`«${line.nombre}»: solo hay ${max} u.; se ajustó la cantidad.`)
      }
      const unit = resolvedCartUnitPrice(line, p)
      const subtotal = qty * unit
      sum += subtotal
      out.push({
        articulo_id: line.articulo_id,
        cantidad: qty,
        precio_unitario: unit,
        subtotal,
      })
    }

    return { items: out, total: sum, warnings: w }
  }, [lines, productById])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const n = nombre.trim()
    if (n.length < 2) {
      setFormError('Ingresá el nombre completo del cliente.')
      return
    }
    if (!items.length) {
      setFormError('No quedaron ítems válidos en el carrito (stock o disponibilidad).')
      return
    }

    mutation.mutate(
      {
        cliente_nombre: n,
        cliente_telefono: telefono.trim() || null,
        medio_pago: medioPago,
        items,
      },
      {
        onSuccess: () => {
          if (warnings.length > 0) toast.message(warnings.join(' · '), { duration: 6000 })
          clear()
          navigate('/ventas', { replace: true })
        },
      },
    )
  }

  if (loadingProducts) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-0">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-brand-border" />
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-2xl bg-brand-border" />
            <div className="h-48 animate-pulse rounded-2xl bg-brand-border" />
          </div>
          <div className="h-96 animate-pulse rounded-2xl bg-brand-border" />
        </div>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-md rounded-3xl border border-brand-border bg-brand-surface px-8 py-14 text-center shadow-[0_24px_60px_-28px_rgba(44,40,41,0.22)] ring-1 ring-black/5"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary-ghost text-brand-primary">
          <IconReceipt size={28} stroke={1.5} aria-hidden />
        </div>
        <p className="text-lg font-semibold text-brand-ink">El carrito está vacío</p>
        <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">Agregá productos desde Ventas para cerrar una venta.</p>
        <Link
          to="/ventas"
          className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-brand-primary px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-primary/25 transition hover:bg-brand-primary-hover"
        >
          Ir al catálogo
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-6xl pb-8"
    >
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/ventas"
            className="group inline-flex items-center gap-2 text-sm font-medium text-brand-ink-muted transition hover:text-brand-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-canvas ring-1 ring-brand-border transition group-hover:bg-brand-primary-ghost group-hover:ring-brand-blush-deep/50">
              <IconArrowLeft size={16} stroke={1.5} aria-hidden className="transition group-hover:-translate-x-0.5" />
            </span>
            Volver al catálogo
          </Link>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-brand-ink md:text-[1.75rem]">
            Cerrar venta
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-brand-ink-muted">
            Revisá precios por ítem, cargá los datos del comprador y el medio de cobro antes de confirmar.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-surface px-4 py-3 text-xs text-brand-ink-muted shadow-sm ring-1 ring-black/[0.03] sm:text-sm">
          <IconShieldCheck size={20} stroke={1.5} className="shrink-0 text-brand-primary" aria-hidden />
          <span>Los importes se guardan tal como figuran acá en la orden de venta.</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_min(400px,100%)] lg:items-start lg:gap-10">
        <motion.section
          aria-labelledby="checkout-items-heading"
          variants={reduceMotion ? undefined : checkoutSectionVariants}
          initial={reduceMotion ? false : 'hidden'}
          animate={reduceMotion ? false : 'show'}
          className="space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="checkout-items-heading" className="text-sm font-bold uppercase tracking-[0.14em] text-brand-ink-faint">
              Pedido
            </h2>
            <span className="rounded-full bg-brand-primary-ghost px-3 py-1 text-xs font-semibold text-brand-primary">
              {lines.length} producto{lines.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-4">
            {lines.map((line, i) => {
              const p = productById.get(line.articulo_id)
              if (!p) {
                return (
                  <div
                    key={line.articulo_id}
                    className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50 to-white px-5 py-4 text-sm text-amber-950 shadow-sm ring-1 ring-amber-100"
                  >
                    «{line.nombre}» no está en catálogo. Volvé a <Link className="font-semibold underline" to="/ventas">Ventas</Link> y quitálo del carrito.
                  </div>
                )
              }
              return (
                <motion.div key={line.articulo_id} variants={reduceMotion ? undefined : checkoutLineVariants}>
                  <CheckoutLinePrecio
                    line={line}
                    product={p}
                    index={i}
                    reduceMotion={reduceMotion}
                    onFuente={(fuente) => setLinePrecioFuente(line.articulo_id, fuente, p)}
                    onManualChange={(v) => setLinePrecioManual(line.articulo_id, v)}
                  />
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            <div className="overflow-hidden rounded-3xl border border-brand-border bg-brand-surface shadow-[0_20px_50px_-28px_rgba(235,61,99,0.35)] ring-1 ring-black/[0.04]">
              <div className="bg-gradient-to-br from-brand-primary via-brand-primary to-brand-primary-hover px-6 py-7 text-brand-on-primary">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/85">Total a cobrar</p>
                <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight md:text-[2.35rem]">{formatARS(total)}</p>
              </div>
              <div className="border-t border-brand-border-subtle bg-brand-canvas/50 px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">Detalle</p>
                <ul className="mt-3 max-h-48 space-y-2.5 overflow-y-auto pr-1 text-sm">
                  {items.map((it) => {
                    const p = productById.get(it.articulo_id)
                    const label = p?.name ?? it.articulo_id
                    return (
                      <li key={it.articulo_id} className="flex justify-between gap-3 border-b border-brand-border-subtle pb-2.5 last:border-0 last:pb-0">
                        <span className="min-w-0 truncate text-brand-ink-muted">
                          <span className="font-medium text-brand-ink">{label}</span>
                          <span className="text-brand-ink-faint"> × {it.cantidad}</span>
                        </span>
                        <span className="shrink-0 tabular-nums font-semibold text-brand-ink">{formatARS(it.subtotal)}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm ring-1 ring-black/[0.03]">
              <div className="mb-5 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary-ghost text-brand-primary">
                  <IconUser size={18} stroke={1.5} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-brand-ink">Cliente</p>
                  <p className="text-xs text-brand-ink-muted">Quién recibe / factura la compra</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-xs font-semibold text-brand-ink">
                    Nombre completo <span className="text-brand-primary">*</span>
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    autoComplete="name"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    maxLength={200}
                    placeholder="Ej. María González"
                    className={`${inputClass} mt-2`}
                  />
                </div>
                <div>
                  <label htmlFor="telefono" className="block text-xs font-semibold text-brand-ink">
                    Teléfono <span className="font-normal text-brand-ink-faint">(opcional)</span>
                  </label>
                  <input
                    id="telefono"
                    type="tel"
                    autoComplete="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    maxLength={40}
                    placeholder="11 · código · número"
                    className={`${inputClass} mt-2`}
                  />
                </div>
              </div>
            </div>

            <fieldset className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm ring-1 ring-black/[0.03]">
              <legend className="mb-4 flex w-full items-center gap-2 px-0 text-sm font-bold text-brand-ink">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-mint/40 text-brand-ink">
                  <IconCash size={18} stroke={1.5} className="opacity-90" aria-hidden />
                </span>
                Medio de cobro
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className={`relative flex cursor-pointer flex-col gap-1 rounded-2xl border-2 px-4 py-4 transition ${
                    medioPago === 'efectivo'
                      ? 'border-brand-primary bg-brand-primary-ghost shadow-md ring-2 ring-brand-blush/50'
                      : 'border-brand-border bg-brand-canvas/30 hover:border-brand-border-strong hover:bg-brand-canvas'
                  }`}
                >
                  <input
                    type="radio"
                    name="medio"
                    checked={medioPago === 'efectivo'}
                    onChange={() => setMedioPago('efectivo')}
                    className="sr-only"
                  />
                  <span className="flex items-center gap-2 font-semibold text-brand-ink">
                    <IconCash size={20} stroke={1.5} className="text-brand-primary" aria-hidden />
                    Efectivo
                  </span>
                  <span className="text-xs text-brand-ink-muted">Cobro en persona</span>
                </label>
                <label
                  className={`relative flex cursor-pointer flex-col gap-1 rounded-2xl border-2 px-4 py-4 transition ${
                    medioPago === 'transferencia'
                      ? 'border-brand-primary bg-brand-primary-ghost shadow-md ring-2 ring-brand-blush/50'
                      : 'border-brand-border bg-brand-canvas/30 hover:border-brand-border-strong hover:bg-brand-canvas'
                  }`}
                >
                  <input
                    type="radio"
                    name="medio"
                    checked={medioPago === 'transferencia'}
                    onChange={() => setMedioPago('transferencia')}
                    className="sr-only"
                  />
                  <span className="flex items-center gap-2 font-semibold text-brand-ink">
                    <IconBuildingBank size={20} stroke={1.5} className="text-brand-primary" aria-hidden />
                    Transferencia
                  </span>
                  <span className="text-xs text-brand-ink-muted">CBU / alias</span>
                </label>
              </div>
            </fieldset>

            {formError && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-100"
              >
                {formError}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={mutation.isPending || items.length === 0}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-primary px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-brand-primary/30 transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none"
              >
                {mutation.isPending && <IconLoader2 size={18} stroke={1.5} className="animate-spin" aria-hidden />}
                Confirmar venta
              </button>
              <Link
                to="/ventas"
                className="inline-flex flex-1 items-center justify-center rounded-2xl border-2 border-brand-border bg-brand-surface px-6 py-4 text-sm font-semibold text-brand-ink-muted transition hover:border-brand-border-strong hover:bg-brand-canvas sm:flex-none"
              >
                Cancelar
              </Link>
            </div>
          </motion.div>
        </aside>
      </form>
    </motion.div>
  )
}
