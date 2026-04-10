export type AppRole = 'admin' | 'ventas' | 'produccion' | 'inventario'

/** `public.categorias` — ver `database-estructura.sql`. */
export interface CategoriaRow {
  id: string
  nombre: string
}

/** `public.temporadas` — ver `database-estructura.sql`. */
export interface TemporadaRow {
  id: string
  nombre: string
}

/**
 * Fila de `articulos` con relaciones embebidas (PostgREST).
 * Los nombres `categorias` / `temporadas` coinciden con las tablas referenciadas por FK.
 */
export interface ArticuloQueryRow {
  id: string
  nombre: string
  slug: string
  codigo: string
  categoria_id: string
  temporada_id: string
  precio_lista: number
  precio_promocional: number | null
  stock_actual: number
  descripcion: string | null
  activo: boolean
  created_at: string
  updated_at: string
  categorias: { nombre: string } | { nombre: string }[] | null
  temporadas: { nombre: string } | { nombre: string }[] | null
  articulo_imagenes: { storage_path: string; es_principal: boolean; orden: number }[] | null
}

/** Modelo de vista para listados y fichas (nombres legibles de categoría/temporada incluidos). */
export interface Product {
  id: string
  name: string
  sku: string
  slug: string
  category: string
  temporada: string
  categoria_id: string
  temporada_id: string
  precio_lista: number
  precio_promocional: number | null
  stock_actual: number
  descripcion: string | null
  activo: boolean
  created_at: string
  updated_at: string
  /** Ruta en bucket `products` hacia la imagen principal; `null` si no hay fila en `articulo_imagenes`. */
  cover_image_path: string | null
}

/** `public.articulo_imagenes` — ver `database-estructura.sql`. */
export interface ProductImage {
  id: string
  articulo_id: string
  storage_path: string
  alt_text: string | null
  orden: number
  es_principal: boolean
  created_at: string
}
