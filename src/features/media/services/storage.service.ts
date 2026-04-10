import { supabase } from '../../../lib/supabase/client'

/** Bucket en Supabase Storage (equivalente al segmento `products` en `products/images/...`). */
export const PRODUCTS_BUCKET = 'products'

/** Carpeta dentro del bucket: objetos quedan como `images/<articuloId>/<archivo>`. */
export const PRODUCT_IMAGES_PREFIX = 'images'

const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function sanitizeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120)
  return base || 'imagen'
}

/** Ruta del objeto dentro del bucket (sin nombre de bucket). */
export function buildProductImageObjectPath(articuloId: string, file: File): string {
  const unique = `${Date.now()}-${sanitizeFileName(file.name)}`
  return `${PRODUCT_IMAGES_PREFIX}/${articuloId}/${unique}`
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Usá JPEG, PNG, WebP o GIF.'
  }
  if (file.size > MAX_BYTES) {
    return 'La imagen no puede superar 8 MB.'
  }
  return null
}

/**
 * Sube al Storage de Supabase (API HTTP, misma infra que el endpoint S3-compatible).
 * Requiere bucket `products` y políticas RLS que permitan `insert` al usuario autenticado.
 */
export async function uploadProductImage(articuloId: string, file: File) {
  const err = validateImageFile(file)
  if (err) throw new Error(err)

  const path = buildProductImageObjectPath(articuloId, file)
  const { data, error } = await supabase.storage.from(PRODUCTS_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  })

  if (error) throw error
  return { path: data.path, bucket: PRODUCTS_BUCKET }
}

export function getProductImagePublicUrl(storagePath: string) {
  const { data } = supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

export async function removeProductImage(storagePath: string) {
  const { error } = await supabase.storage.from(PRODUCTS_BUCKET).remove([storagePath])
  if (error) throw error
}
