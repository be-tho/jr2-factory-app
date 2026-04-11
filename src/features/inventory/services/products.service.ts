import { supabase } from '../../../lib/supabase/client'
import type { ArticuloQueryRow, Product } from '../../../types/database'
import { removeProductImage } from '../../media/services/storage.service'

const TABLE = 'articulos'

/** Trae artículos con nombre de categoría y temporada vía FK. */
const ARTICULO_SELECT = `
  *,
  categorias ( nombre ),
  temporadas ( nombre ),
  articulo_imagenes ( storage_path, es_principal, orden )
`.trim()

function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return s || 'articulo'
}

function nombreFromEmbed(
  embed: ArticuloQueryRow['categorias'] | ArticuloQueryRow['temporadas']
): string {
  if (embed == null) return ''
  const row = Array.isArray(embed) ? embed[0] : embed
  return row && typeof row.nombre === 'string' ? row.nombre : ''
}

function parseArticuloImagenes(raw: unknown): ArticuloQueryRow['articulo_imagenes'] {
  if (!Array.isArray(raw)) return null
  const out: { storage_path: string; es_principal: boolean; orden: number }[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const storage_path = o.storage_path
    if (typeof storage_path !== 'string') continue
    const es_principal = o.es_principal === true
    const orden = typeof o.orden === 'number' ? o.orden : Number(o.orden) || 0
    out.push({ storage_path, es_principal, orden })
  }
  return out.length ? out : null
}

function pickCoverStoragePath(rows: ArticuloQueryRow['articulo_imagenes']): string | null {
  if (!rows?.length) return null
  const sorted = [...rows].sort((a, b) => {
    if (a.es_principal !== b.es_principal) return a.es_principal ? -1 : 1
    return a.orden - b.orden
  })
  return sorted[0]?.storage_path ?? null
}

function parseArticuloRow(raw: unknown): ArticuloQueryRow | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const id = r.id
  if (typeof id !== 'string') return null
  const nombre = r.nombre
  const slug = r.slug
  const codigo = r.codigo
  const categoria_id = r.categoria_id
  const temporada_id = r.temporada_id
  if (
    typeof nombre !== 'string' ||
    typeof slug !== 'string' ||
    typeof codigo !== 'string' ||
    typeof categoria_id !== 'string' ||
    typeof temporada_id !== 'string'
  ) {
    return null
  }
  const precio_lista = typeof r.precio_lista === 'number' ? r.precio_lista : Number(r.precio_lista)
  const stock_actual = typeof r.stock_actual === 'number' ? r.stock_actual : Number(r.stock_actual)
  if (!Number.isFinite(precio_lista) || !Number.isFinite(stock_actual)) return null

  const pp = r.precio_promocional
  const precio_promocional =
    pp == null ? null : typeof pp === 'number' ? pp : Number(pp)
  const validPromo = precio_promocional != null && Number.isFinite(precio_promocional) ? precio_promocional : null

  const created_at =
    typeof r.created_at === 'string' ? r.created_at : new Date().toISOString()
  const updated_at =
    typeof r.updated_at === 'string' ? r.updated_at : created_at

  const activo = typeof r.activo === 'boolean' ? r.activo : Boolean(r.activo)
  const descripcion = r.descripcion == null ? null : String(r.descripcion)

  return {
    id,
    nombre,
    slug,
    codigo,
    categoria_id,
    temporada_id,
    precio_lista,
    precio_promocional: validPromo,
    stock_actual,
    descripcion,
    activo,
    created_at,
    updated_at,
    categorias: (r.categorias ?? null) as ArticuloQueryRow['categorias'],
    temporadas: (r.temporadas ?? null) as ArticuloQueryRow['temporadas'],
    articulo_imagenes: parseArticuloImagenes(r.articulo_imagenes),
  }
}

function rowToProduct(row: ArticuloQueryRow): Product {
  return {
    id: row.id,
    name: row.nombre,
    sku: row.codigo,
    slug: row.slug,
    category: nombreFromEmbed(row.categorias),
    temporada: nombreFromEmbed(row.temporadas),
    categoria_id: row.categoria_id,
    temporada_id: row.temporada_id,
    precio_lista: row.precio_lista,
    precio_promocional: row.precio_promocional,
    stock_actual: row.stock_actual,
    descripcion: row.descripcion,
    activo: row.activo,
    created_at: row.created_at,
    updated_at: row.updated_at,
    cover_image_path: pickCoverStoragePath(row.articulo_imagenes),
  }
}

export { listCategorias } from './categorias.service'
export { listTemporadas } from './temporadas.service'

export async function listProducts(): Promise<{ data: Product[]; error: Error | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(ARTICULO_SELECT)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: new Error(error.message) }
  }

  const rows = (data ?? []).map(parseArticuloRow).filter((x): x is ArticuloQueryRow => x != null)
  return { data: rows.map(rowToProduct), error: null }
}

export async function getProductById(id: string): Promise<{ data: Product | null; error: Error | null }> {
  const { data, error } = await supabase.from(TABLE).select(ARTICULO_SELECT).eq('id', id).maybeSingle()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  const row = parseArticuloRow(data)
  return { data: row ? rowToProduct(row) : null, error: null }
}

export type NewProductInput = {
  nombre: string
  codigo: string
  categoria_id: string
  temporada_id: string
  precio_lista: number
  precio_promocional?: number | null
  stock_actual: number
  activo?: boolean
  descripcion?: string | null
}

export async function createProduct(input: NewProductInput): Promise<{ data: Product | null; error: Error | null }> {
  const slug = `${slugify(input.nombre)}-${slugify(input.codigo)}`.slice(0, 200)
  const promo =
    input.precio_promocional != null && Number.isFinite(input.precio_promocional)
      ? Math.max(0, Math.floor(input.precio_promocional))
      : null

  const insertRow = {
    nombre: input.nombre.trim(),
    slug,
    codigo: input.codigo.trim(),
    categoria_id: input.categoria_id,
    temporada_id: input.temporada_id,
    precio_lista: Math.max(0, Math.floor(input.precio_lista)),
    precio_promocional: promo,
    stock_actual: Math.max(0, Math.floor(input.stock_actual)),
    activo: input.activo ?? true,
    descripcion: input.descripcion?.trim() || null,
  }

  const { data, error } = await supabase.from(TABLE).insert(insertRow).select(ARTICULO_SELECT).single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  const row = parseArticuloRow(data)
  return { data: row ? rowToProduct(row) : null, error: null }
}

export type UpdateProductInput = NewProductInput

export async function updateProduct(
  id: string,
  input: UpdateProductInput
): Promise<{ data: Product | null; error: Error | null }> {
  const slug = `${slugify(input.nombre)}-${slugify(input.codigo)}`.slice(0, 200)
  const promo =
    input.precio_promocional != null && Number.isFinite(input.precio_promocional)
      ? Math.max(0, Math.floor(input.precio_promocional))
      : null

  const updateRow = {
    nombre: input.nombre.trim(),
    slug,
    codigo: input.codigo.trim(),
    categoria_id: input.categoria_id,
    temporada_id: input.temporada_id,
    precio_lista: Math.max(0, Math.floor(input.precio_lista)),
    precio_promocional: promo,
    stock_actual: Math.max(0, Math.floor(input.stock_actual)),
    activo: input.activo ?? true,
    descripcion: input.descripcion?.trim() || null,
  }

  const { data, error } = await supabase.from(TABLE).update(updateRow).eq('id', id).select(ARTICULO_SELECT).single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  const row = parseArticuloRow(data)
  return { data: row ? rowToProduct(row) : null, error: null }
}

/**
 * Borra filas en `articulo_imagenes`, objetos en Storage y el artículo.
 * (El esquema SQL no garantiza ON DELETE CASCADE en Storage; se limpia desde el cliente.)
 */
export async function deleteProduct(id: string): Promise<{ error: Error | null }> {
  const { data: imagenes, error: listErr } = await supabase
    .from('articulo_imagenes')
    .select('storage_path')
    .eq('articulo_id', id)

  if (listErr) {
    return { error: new Error(listErr.message) }
  }

  for (const row of imagenes ?? []) {
    const path = row && typeof row.storage_path === 'string' ? row.storage_path : null
    if (path) {
      await removeProductImage(path).catch(() => {})
    }
  }

  const { error: delImgErr } = await supabase.from('articulo_imagenes').delete().eq('articulo_id', id)
  if (delImgErr) {
    return { error: new Error(delImgErr.message) }
  }

  const { error: delArtErr } = await supabase.from(TABLE).delete().eq('id', id)
  if (delArtErr) {
    return { error: new Error(delArtErr.message) }
  }

  return { error: null }
}
