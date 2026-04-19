import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../../../types/database'
import {
  type PrecioFuenteVenta,
  resolvedCartUnitPrice,
  unitPriceForFuente,
} from '../lib/pricing'

export type CartLine = {
  articulo_id: string
  cantidad: number
  nombre: string
  sku: string
  cover_image_path: string | null
  precio_unitario: number
  /** Default lista. Manual usa `precio_unitario` como valor ingresado. Opcional por persist antiguo. */
  precio_fuente?: PrecioFuenteVenta
}

type CartState = {
  lines: CartLine[]
  addProduct: (product: Product) => string | null
  /** Ajusta cantidad acotada al stock y actualiza precio según fuente y artículo. */
  setLineQuantity: (articuloId: string, cantidad: number, product: Product) => void
  setLinePrecioFuente: (articuloId: string, fuente: PrecioFuenteVenta, product: Product) => void
  setLinePrecioManual: (articuloId: string, value: number) => void
  removeLine: (articuloId: string) => void
  clear: () => void
}

function lineSubtotal(line: CartLine, product: Product | undefined): number {
  const unit = resolvedCartUnitPrice(line, product)
  return line.cantidad * unit
}

/** Total del carrito; si hay mapa de productos, aplica lista/promo/manual correctamente. */
export function cartTotal(lines: CartLine[], productById?: Map<string, Product>): number {
  if (!productById?.size) {
    return lines.reduce((sum, l) => sum + l.cantidad * Math.max(0, Math.floor(l.precio_unitario)), 0)
  }
  return lines.reduce((sum, l) => {
    const p = productById.get(l.articulo_id)
    return sum + lineSubtotal(l, p)
  }, 0)
}

function syncPrecioFromProduct(line: CartLine, product: Product): number {
  const fuente = line.precio_fuente ?? 'lista'
  if (fuente === 'manual') return Math.max(0, Math.floor(line.precio_unitario))
  return unitPriceForFuente(product, fuente, line.precio_unitario)
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],

      addProduct: (product: Product) => {
        if (!product.activo) return 'El artículo no está activo.'
        const stock = product.stock_actual
        if (stock <= 0) return 'Sin stock disponible.'
        const priceLista = Math.max(0, Math.floor(product.precio_lista))
        const lines = get().lines
        const idx = lines.findIndex((l) => l.articulo_id === product.id)
        if (idx >= 0) {
          const next = lines[idx].cantidad + 1
          if (next > stock) return 'No hay más unidades en stock.'
          const copy = [...lines]
          const fuente = copy[idx].precio_fuente ?? 'lista'
          const precio_unitario = syncPrecioFromProduct(
            { ...copy[idx], cantidad: next },
            product,
          )
          copy[idx] = {
            ...copy[idx],
            cantidad: next,
            precio_unitario: fuente === 'manual' ? copy[idx].precio_unitario : precio_unitario,
            nombre: product.name,
            sku: product.sku,
            cover_image_path: product.cover_image_path,
          }
          set({ lines: copy })
          return null
        }
        set({
          lines: [
            ...lines,
            {
              articulo_id: product.id,
              cantidad: 1,
              nombre: product.name,
              sku: product.sku,
              cover_image_path: product.cover_image_path,
              precio_unitario: priceLista,
              precio_fuente: 'lista',
            },
          ],
        })
        return null
      },

      setLineQuantity: (articuloId, cantidad, product) => {
        if (cantidad < 1) {
          get().removeLine(articuloId)
          return
        }
        const max = product.stock_actual
        const next = Math.min(Math.max(1, cantidad), Math.max(0, max))
        if (max <= 0) {
          get().removeLine(articuloId)
          return
        }
        set({
          lines: get().lines.map((l) => {
            if (l.articulo_id !== articuloId) return l
            const fuente = l.precio_fuente ?? 'lista'
            const precio_unitario =
              fuente === 'manual' ? l.precio_unitario : syncPrecioFromProduct(l, product)
            return {
              ...l,
              cantidad: next,
              precio_unitario,
              nombre: product.name,
              sku: product.sku,
              cover_image_path: product.cover_image_path,
            }
          }),
        })
      },

      setLinePrecioFuente: (articuloId, fuente, product) => {
        set({
          lines: get().lines.map((l) => {
            if (l.articulo_id !== articuloId) return l
            const current = resolvedCartUnitPrice(l, product)
            const precio_unitario =
              fuente === 'manual' ? current : unitPriceForFuente(product, fuente, l.precio_unitario)
            return { ...l, precio_fuente: fuente, precio_unitario }
          }),
        })
      },

      setLinePrecioManual: (articuloId, value) => {
        const n = Number(value)
        const v = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
        set({
          lines: get().lines.map((l) =>
            l.articulo_id === articuloId && (l.precio_fuente ?? 'lista') === 'manual'
              ? { ...l, precio_unitario: v }
              : l,
          ),
        })
      },

      removeLine: (articuloId) => {
        set({ lines: get().lines.filter((l) => l.articulo_id !== articuloId) })
      },

      clear: () => set({ lines: [] }),
    }),
    { name: 'jr2-sales-cart' },
  ),
)
