import { IconChevronRight, IconReceipt, IconShoppingCart, IconX } from '@tabler/icons-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { Product } from '../../../types/database'
import { ic } from '../../../lib/tabler'
import { CartLineRow } from './VentaProductCard'
import { formatARS } from '../lib/pricing'
import { cartTotal, useCartStore } from '../store/cartStore'

type VentasCartModalProps = {
  open: boolean
  onClose: () => void
  /** Mapa de artículos para límites de stock y precios resueltos. */
  productById: Map<string, Product>
}

export function VentasCartModal({ open, onClose, productById }: VentasCartModalProps) {
  const reduceMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const lines = useCartStore((s) => s.lines)
  const setLineQuantity = useCartStore((s) => s.setLineQuantity)
  const removeLine = useCartStore((s) => s.removeLine)

  const total = cartTotal(lines, productById)
  const unidades = useMemo(() => lines.reduce((n, l) => n + l.cantidad, 0), [lines])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    queueMicrotask(() => panelRef.current?.focus({ preventScroll: true }))
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  if (typeof document === 'undefined') return null

  const backdropMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.22 },
      }

  const panelMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 28, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
      }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <motion.div
        {...backdropMotion}
        className="absolute inset-0 bg-modal-scrim"
        onClick={onClose}
        role="presentation"
        aria-hidden
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ventas-cart-title"
        tabIndex={-1}
        {...panelMotion}
        className="relative z-10 flex max-h-[85dvh] w-full max-w-md min-h-0 flex-col overflow-hidden rounded-t-[1.75rem] bg-brand-surface shadow-[0_-20px_60px_-20px_rgba(235,61,99,0.35)] ring-1 ring-brand-border sm:mx-4 sm:max-h-[min(580px,88vh)] sm:rounded-3xl sm:shadow-[0_28px_80px_-32px_rgba(44,40,41,0.35)]"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Indicador tipo sheet (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden" aria-hidden>
          <span className="h-1 w-11 rounded-full bg-brand-border-strong/90" />
        </div>

        {/* Franja marca */}
        <div
          className="h-1 w-full shrink-0 bg-linear-to-r from-brand-primary via-brand-blush-deep to-brand-primary opacity-95"
          aria-hidden
        />

        <header className="relative shrink-0 border-b border-brand-border-subtle bg-brand-canvas/40 px-5 pb-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary-ghost text-brand-primary shadow-sm ring-1 ring-brand-blush/40">
                <IconShoppingCart {...ic.headerSm} aria-hidden />
              </span>
              <div className="min-w-0 pt-0.5">
                <h2 id="ventas-cart-title" className="text-lg font-bold tracking-tight text-brand-ink">
                  Tu carrito
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-brand-ink-muted">
                  {lines.length === 0
                    ? 'Agregá artículos desde el catálogo'
                    : `${lines.length} producto${lines.length !== 1 ? 's' : ''} · ${unidades} unidad${unidades !== 1 ? 'es' : ''}`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar carrito"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-transparent text-brand-ink-muted transition hover:border-brand-border hover:bg-white hover:text-brand-ink hover:shadow-sm"
            >
              <IconX size={20} stroke={1.5} aria-hidden />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-brand-canvas/35 px-5 py-4">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-brand-border-strong bg-brand-surface/80 px-6 py-12 text-center ring-1 ring-black/3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary-ghost text-brand-primary">
                <IconReceipt size={28} stroke={1.5} aria-hidden />
              </span>
              <p className="mt-4 text-sm font-semibold text-brand-ink">Todavía está vacío</p>
              <p className="mt-2 max-w-[240px] text-xs leading-relaxed text-brand-ink-muted">
                Elegí productos en la grilla y tocá <span className="font-semibold text-brand-primary">Agregar</span>.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {lines.map((line) => {
                const p = productById.get(line.articulo_id)
                const maxStock = p?.stock_actual ?? 0
                return (
                  <li key={line.articulo_id}>
                    <CartLineRow
                      line={line}
                      product={p}
                      maxStock={Math.max(maxStock, line.cantidad)}
                      className="rounded-2xl border-brand-border bg-white shadow-[0_4px_20px_-14px_rgba(44,40,41,0.16)] ring-1 ring-black/4"
                      onDec={() => {
                        if (!p) return
                        setLineQuantity(line.articulo_id, line.cantidad - 1, p)
                      }}
                      onInc={() => {
                        if (!p) return
                        setLineQuantity(line.articulo_id, line.cantidad + 1, p)
                      }}
                      onRemove={() => removeLine(line.articulo_id)}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <footer className="shrink-0 border-t border-brand-border-subtle bg-brand-surface px-5 pb-3 pt-4">
          <div className="overflow-hidden rounded-2xl bg-linear-to-br from-brand-primary via-brand-primary to-brand-primary-hover px-5 py-4 text-brand-on-primary shadow-inner ring-1 ring-white/15">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/85">Total estimado</p>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="text-sm text-white/90">{lines.length === 0 ? '—' : `${unidades} u.`}</span>
              <span className="text-3xl font-bold tabular-nums tracking-tight">{formatARS(total)}</span>
            </div>
          </div>

          <Link
            to="/ventas/checkout"
            onClick={(e) => {
              if (lines.length === 0) {
                e.preventDefault()
                return
              }
              onClose()
            }}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold shadow-lg transition sm:py-4 ${
              lines.length === 0
                ? 'pointer-events-none bg-brand-border text-brand-ink-faint shadow-none'
                : 'bg-brand-primary text-white shadow-brand-primary/35 hover:bg-brand-primary-hover hover:shadow-xl active:scale-[0.99]'
            }`}
          >
            Ir a checkout
            <IconChevronRight size={18} stroke={2} aria-hidden />
          </Link>

          <p className="mt-3 text-center text-[11px] text-brand-ink-faint">
            Podés ajustar lista, promo o precio manual en el siguiente paso.
          </p>
        </footer>
      </motion.div>
    </div>,
    document.body,
  )
}
