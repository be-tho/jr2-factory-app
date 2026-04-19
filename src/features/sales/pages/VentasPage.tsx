import { IconSearch, IconShoppingCart } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ic } from '../../../lib/tabler'
import { useProductsQuery } from '../../inventory/hooks/useProducts'
import { VentasCartModal } from '../components/VentasCartModal'
import { VentaProductCard } from '../components/VentaProductCard'
import { useCartStore } from '../store/cartStore'

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

export function VentasPage() {
  const { data: products = [], isPending: loading } = useProductsQuery()
  const lines = useCartStore((s) => s.lines)
  const addProduct = useCartStore((s) => s.addProduct)

  const [search, setSearch] = useState('')
  const [cartOpen, setCartOpen] = useState(false)

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const ventaProducts = useMemo(() => {
    const q = normalize(search)
    return products.filter((p) => {
      if (!p.activo) return false
      if (!q) return true
      const hay = normalize(`${p.name} ${p.sku} ${p.category} ${p.temporada}`)
      return hay.includes(q)
    })
  }, [products, search])

  const qtyByArticulo = useMemo(() => {
    const m = new Map<string, number>()
    for (const l of lines) m.set(l.articulo_id, l.cantidad)
    return m
  }, [lines])

  const cartBadgeCount = useMemo(() => lines.reduce((sum, l) => sum + l.cantidad, 0), [lines])

  function handleAdd(p: Parameters<typeof addProduct>[0]) {
    const err = addProduct(p)
    if (err) toast.error(err)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink">Ventas</h1>
          <p className="mt-1 text-sm text-brand-ink-muted">
            Catálogo para registrar ventas; tocá el carrito para revisar el pedido y cerrar en checkout.
          </p>
        </div>
        <div className="flex shrink-0 justify-end sm:pt-0.5">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={
              cartBadgeCount > 0 ? `Abrir carrito, ${cartBadgeCount} unidades` : 'Abrir carrito'
            }
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-brand-border-strong bg-brand-surface text-brand-primary shadow-sm ring-1 ring-black/5 transition hover:border-brand-primary/40 hover:bg-brand-primary-ghost active:scale-[0.98]"
          >
            <IconShoppingCart {...ic.header} aria-hidden />
            {cartBadgeCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1 text-[11px] font-bold leading-none text-white shadow-sm tabular-nums">
                {cartBadgeCount > 99 ? '99+' : cartBadgeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <IconSearch
          size={15}
          stroke={1.5}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink-faint"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, SKU, categoría…"
          className="w-full rounded-lg border border-brand-border-strong bg-brand-surface py-2 pl-9 pr-3 text-sm text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-brand-border" />
          ))}
        </div>
      ) : ventaProducts.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-brand-border py-16 text-center">
          <p className="font-semibold text-brand-ink">No hay artículos para mostrar</p>
          <p className="mt-1 text-sm text-brand-ink-faint">
            {search ? 'Probá otra búsqueda.' : 'No hay artículos activos en inventario.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ventaProducts.map((p) => (
            <VentaProductCard
              key={p.id}
              product={p}
              quantityInCart={qtyByArticulo.get(p.id) ?? 0}
              onAdd={() => handleAdd(p)}
            />
          ))}
        </div>
      )}

      <VentasCartModal open={cartOpen} onClose={() => setCartOpen(false)} productById={productById} />
    </div>
  )
}
