import type { Product } from '../../../types/database'

/** Precio efectivo para la venta (promo si existe). Catálogo / fichas. */
export function effectiveSaleUnitPrice(product: Product): number {
  return product.precio_promocional != null ? product.precio_promocional : product.precio_lista
}

/** Origen del precio unitario en carrito / checkout. */
export type PrecioFuenteVenta = 'lista' | 'promo' | 'manual'

export function unitPriceForFuente(
  product: Product,
  fuente: PrecioFuenteVenta,
  manualUnit: number,
): number {
  switch (fuente) {
    case 'lista':
      return Math.max(0, Math.floor(product.precio_lista))
    case 'promo':
      return Math.max(0, Math.floor(product.precio_promocional ?? product.precio_lista))
    case 'manual':
      return Math.max(0, Math.floor(manualUnit))
  }
}

/** Precio u. a cobrar según la línea y el artículo actual (lista/promo siempre del producto). */
export function resolvedCartUnitPrice(
  line: { precio_fuente?: PrecioFuenteVenta; precio_unitario: number },
  product: Product | undefined,
): number {
  const fuente = line.precio_fuente ?? 'lista'
  if (!product) return Math.max(0, Math.floor(line.precio_unitario))
  if (fuente === 'manual') return Math.max(0, Math.floor(line.precio_unitario))
  return unitPriceForFuente(product, fuente, line.precio_unitario)
}

export function formatARS(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}
