export type AppRole = 'admin' | 'ventas' | 'produccion' | 'inventario'

/** `public.profiles` — extiende auth.users con datos del usuario. */
export interface Profile {
  id: string
  full_name: string | null
  avatar_path: string | null
  role: string | null
  bio: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/** `public.categorias` — ver `database-estructura.sql`. */
export interface CategoriaRow {
  id: string
  nombre: string
  activo: boolean
}

/** `public.temporadas` — ver `database-estructura.sql`. */
export interface TemporadaRow {
  id: string
  nombre: string
  activo: boolean
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

/** `public.patrones` — fila cruda de la tabla. */
export interface PatronRow {
  id: string
  articulo_id: string
  nombre: string
  descripcion: string | null
  storage_path: string
  file_name: string
  file_size: number | null
  file_type: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

/** Modelo de vista para listados y fichas (incluye datos del artículo vinculado). */
export interface Patron extends PatronRow {
  articulo_nombre: string
  articulo_sku: string
  articulo_cover_image_path: string | null
}

// ─── Cortes Textiles ───────────────────────────────────────────────────────────

export type CorteEstado = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'

/** Fila cruda de `public.cortes`. */
export interface CorteRow {
  id: string
  numero_corte: string
  tipo_tela: string
  cantidad_total: number
  costureros: string | null
  estado: CorteEstado
  fecha: string
  descripcion: string | null
  imagen_path: string | null
  created_at: string
  updated_at: string
}

/** Fila de `public.corte_colores`. */
export interface CorteColor {
  id: string
  corte_id: string
  color: string
  cantidad: number
}

/** Artículo embebido dentro de un corte (para listados). */
export interface CorteArticuloEmbed {
  articulo_id: string
  nombre: string
  codigo: string
  cover_image_path: string | null
}

/** Modelo de vista para listados y detalle de cortes (artículos y colores embebidos). */
export interface Corte extends CorteRow {
  articulos: CorteArticuloEmbed[]
  colores: Omit<CorteColor, 'corte_id'>[]
}
