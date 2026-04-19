import { IconX } from '@tabler/icons-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { Product } from '../../../types/database'
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
  const lines = useCartStore((s) => s.lines)
  const setLineQuantity = useCartStore((s) => s.setLineQuantity)
  const removeLine = useCartStore((s) => s.removeLine)

  const total = cartTotal(lines, productById)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-brand-ink/45 backdrop-blur-[2px]"
        onClick={onClose}
        role="presentation"
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ventas-cart-title"
        tabIndex={-1}
        className="relative z-10 flex max-h-[85dvh] w-full max-w-md min-h-0 flex-col overflow-hidden rounded-t-3xl bg-brand-surface shadow-2xl ring-1 ring-brand-border sm:mx-4 sm:max-h-[min(560px,85vh)] sm:rounded-3xl"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-brand-border-subtle px-5 py-4">
          <div>
            <h2 id="ventas-cart-title" className="text-lg font-bold text-brand-ink">
              Carrito
            </h2>
            <p className="mt-0.5 text-xs text-brand-ink-muted">
              {lines.length === 0
                ? 'Vacío'
                : `${lines.length} ítem${lines.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-brand-ink-muted transition hover:bg-brand-canvas hover:text-brand-ink"
          >
            <IconX size={20} stroke={1.5} aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-ink-muted">Todavía no agregaste productos.</p>
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

        <div className="shrink-0 border-t border-brand-border-subtle bg-brand-surface px-5 pb-3 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-ink-muted">Total</span>
            <span className="text-xl font-bold text-brand-ink">{formatARS(total)}</span>
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
            className={`mt-4 flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold shadow-sm transition ${
              lines.length === 0
                ? 'pointer-events-none bg-brand-border text-brand-ink-faint'
                : 'bg-brand-primary text-white hover:bg-brand-primary-hover'
            }`}
          >
            Ir a checkout
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  )
}
