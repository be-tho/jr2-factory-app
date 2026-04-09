export type AppRole = 'admin' | 'ventas' | 'produccion' | 'inventario'

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  path: string
  created_at: string
}
