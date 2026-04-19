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

// ─── Costureros ───────────────────────────────────────────────────────────────

export type TipoDocumento = 'DNI' | 'CUIL' | 'CUIT'

/** Fila de `public.costureros`. */
export interface Costurero {
  id: string
  nombre_completo: string
  telefono: string | null
  email: string | null
  direccion: string | null
  tipo_documento: TipoDocumento
  numero_documento: string
  /** CBU o alias bancario — para pagos futuros. */
  cbu_alias: string | null
  notas: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

// ─── Envíos / direcciones cliente ─────────────────────────────────────────────

/** `public.clientes_envio` — dirección, Maps y zonas de cobertura para logística. */
export interface ClienteEnvio {
  id: string
  nombre_empresa: string
  direccion: string
  localidad: string | null
  provincia: string
  /** Link principal para compartir (WhatsApp, etc.). */
  maps_url: string
  /** Opcional: URL del `src` del iframe de Google Maps, solo para vista previa en la app. */
  maps_embed_url: string | null
  /** A dónde envía el cliente (texto libre: provincias, interior, CABA, etc.). */
  zonas_envio: string
  notas: string | null
  /** Contacto en boca de atención / operador. */
  telefono: string | null
  /** Horario de atención (texto libre). */
  horario_atencion: string | null
  /** Texto libre: p. ej. nave y módulo en CTC. */
  observaciones: string | null
  /** `ctc` = fila del directorio CTC sembrada en DB; `null` = dirección creada en la app. */
  catalogo_origen: 'ctc' | null
  activo: boolean
  created_at: string
  updated_at: string
}

// ─── Ventas (órdenes registradas en checkout) ───────────────────────────────

export type MedioPagoVenta = 'efectivo' | 'transferencia'

/** `public.ordenes_venta` — cabecera de venta desde la sección Ventas. */
export interface OrdenVentaRow {
  id: string
  cliente_nombre: string
  cliente_telefono: string | null
  medio_pago: MedioPagoVenta
  total: number
  estado: string
  created_by: string
  created_at: string
  updated_at: string
}

/** `public.ordenes_venta_items` — líneas con precio snapshot. */
export interface OrdenVentaItemRow {
  id: string
  orden_id: string
  articulo_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}
