import { IconPackage, IconSearch, IconShoppingCart } from '@tabler/icons-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { SimplePagination } from '../../../components/ui/SimplePagination'
import { ic } from '../../../lib/tabler'
import { useProductsQuery } from '../../inventory/hooks/useProducts'
import { VentasCartModal } from '../components/VentasCartModal'
import { VentaProductCard } from '../components/VentaProductCard'
import { useCartStore } from '../store/cartStore'

const PAGE_SIZE = 12

const searchInputClass =
  'w-full rounded-2xl border-2 border-brand-border bg-brand-surface py-3 pl-11 pr-4 text-sm text-brand-ink shadow-sm outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-4 focus:ring-brand-blush/35'

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

export function VentasPage() {
  const reduceMotion = useReducedMotion()
  const catalogRef = useRef<HTMLElement>(null)
  const skipScrollRef = useRef(true)

  const { data: products = [], isPending: loading } = useProductsQuery()
  const lines = useCartStore((s) => s.lines)
  const addProduct = useCartStore((s) => s.addProduct)

  const [search, setSearch] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [page, setPage] = useState(1)

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

  const totalPages = Math.max(1, Math.ceil(ventaProducts.length / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [search])

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  const pageProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return ventaProducts.slice(start, start + PAGE_SIZE)
  }, [ventaProducts, page])

  useEffect(() => {
    if (skipScrollRef.current) {
      skipScrollRef.current = false
      return
    }
    catalogRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }, [page, reduceMotion])

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
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
      className="mx-auto max-w-6xl"
    >
      {/* Franja marca + hero */}
      <div className="relative overflow-hidden rounded-3xl border border-brand-border bg-brand-surface shadow-[0_20px_50px_-28px_rgba(235,61,99,0.22)] ring-1 ring-black/4">
        <div
          className="h-1.5 w-full bg-linear-to-r from-brand-primary via-brand-blush-deep to-brand-primary"
          aria-hidden
        />
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary-ghost text-brand-primary shadow-sm ring-1 ring-brand-blush/35">
                <IconPackage {...ic.headerSm} aria-hidden />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-brand-ink md:text-3xl">Ventas</h1>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-brand-ink-muted">
                  Catálogo para armar pedidos. Abrí el carrito cuando quieras revisar cantidades y seguí al checkout para
                  cerrar la venta.
                </p>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={
                cartBadgeCount > 0 ? `Abrir carrito, ${cartBadgeCount} unidades` : 'Abrir carrito de compras'
              }
              className="relative inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-brand-border-strong bg-brand-surface px-5 text-sm font-semibold text-brand-primary shadow-md transition hover:border-brand-primary/50 hover:bg-brand-primary-ghost hover:shadow-lg active:scale-[0.99] sm:min-w-48"
            >
              <IconShoppingCart {...ic.inline} aria-hidden />
              <span>Carrito</span>
              {cartBadgeCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-primary px-1.5 text-[11px] font-bold leading-none text-white shadow-md tabular-nums">
                  {cartBadgeCount > 99 ? '99+' : cartBadgeCount}
                </span>
              )}
            </button>
            <p className="text-center text-[11px] text-brand-ink-faint sm:text-right">
              {PAGE_SIZE} artículos por página
            </p>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="mt-8">
        <label htmlFor="ventas-buscar" className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
          Buscar en catálogo
        </label>
        <div className="relative max-w-xl">
          <IconSearch
            size={18}
            stroke={1.5}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink-faint"
            aria-hidden
          />
          <input
            id="ventas-buscar"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre, SKU, categoría o temporada…"
            className={searchInputClass}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Catálogo */}
      <section
        ref={catalogRef}
        aria-labelledby="ventas-catalogo-heading"
        className="mt-10 rounded-3xl border border-brand-border-subtle bg-brand-canvas/40 p-5 shadow-inner ring-1 ring-black/3 sm:p-8"
      >
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="ventas-catalogo-heading" className="text-sm font-bold uppercase tracking-[0.14em] text-brand-ink-faint">
              Artículos activos
            </h2>
            {!loading && (
              <p className="mt-1 text-sm text-brand-ink-muted">
                {ventaProducts.length === 0
                  ? 'No hay coincidencias con tu búsqueda.'
                  : `${ventaProducts.length} resultado${ventaProducts.length !== 1 ? 's' : ''}`}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl bg-brand-surface ring-1 ring-brand-border">
                <div className="aspect-4/3 animate-pulse bg-brand-border" />
                <div className="space-y-3 p-4">
                  <div className="h-4 max-w-[90%] animate-pulse rounded bg-brand-border" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-brand-border" />
                  <div className="h-9 w-full animate-pulse rounded-xl bg-brand-border" />
                </div>
              </div>
            ))}
          </div>
        ) : ventaProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-border-strong bg-brand-surface/90 px-8 py-16 text-center ring-1 ring-black/3">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary-ghost text-brand-primary">
              <IconSearch size={28} stroke={1.5} aria-hidden />
            </div>
            <p className="font-semibold text-brand-ink">No hay artículos para mostrar</p>
            <p className="mt-2 text-sm text-brand-ink-muted">
              {search ? 'Probá otra búsqueda o borrá el filtro.' : 'No hay artículos activos en inventario.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pageProducts.map((p) => (
                <VentaProductCard
                  key={p.id}
                  product={p}
                  quantityInCart={qtyByArticulo.get(p.id) ?? 0}
                  onAdd={() => handleAdd(p)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <SimplePagination
                page={page}
                totalPages={totalPages}
                totalItems={ventaProducts.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                ariaLabel="Paginación del catálogo de ventas"
              />
            )}
          </>
        )}
      </section>

      <VentasCartModal open={cartOpen} onClose={() => setCartOpen(false)} productById={productById} />
    </motion.div>
  )
}
