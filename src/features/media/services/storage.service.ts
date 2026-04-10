import {
  DEFAULT_ARTICLE_IMAGE_PUBLIC_URL,
  DEFAULT_ARTICLE_STORAGE_FILE_NAME,
} from '../../../constants/defaultArticleImage'
import { supabase } from '../../../lib/supabase/client'

/** Bucket en Supabase Storage (equivalente al segmento `products` en `products/images/...`). */
export const PRODUCTS_BUCKET = 'products'

/** Carpeta dentro del bucket: objetos quedan como `images/<articuloId>/<archivo>`. */
export const PRODUCT_IMAGES_PREFIX = 'images'

const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])

/** Borde máximo en px (la foto se escala manteniendo proporción antes de WebP). */
const PRODUCT_IMAGE_MAX_EDGE = 1920
const WEBP_QUALITY = 0.82

const TYPES_CONVERTED_TO_WEBP = new Set(['image/jpeg', 'image/png', 'image/webp'])

function sanitizeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120)
  return base || 'imagen'
}

function baseNameWithoutExtension(name: string): string {
  const trimmed = name.trim()
  const i = trimmed.lastIndexOf('.')
  if (i <= 0) return trimmed || 'cover'
  return trimmed.slice(0, i) || 'cover'
}

/**
 * Reduce peso en Storage: JPEG/PNG/WebP → WebP con calidad fija y tamaño acotado.
 * SVG y GIF se dejan igual (vector y animación).
 */
export async function prepareProductImageFileForStorage(file: File): Promise<File> {
  if (!TYPES_CONVERTED_TO_WEBP.has(file.type)) {
    return file
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('No se pudo leer la imagen. Probá con otro archivo.')
  }

  try {
    let w = bitmap.width
    let h = bitmap.height
    if (w < 1 || h < 1) {
      throw new Error('La imagen no tiene un tamaño válido.')
    }
    if (w > PRODUCT_IMAGE_MAX_EDGE || h > PRODUCT_IMAGE_MAX_EDGE) {
      const scale = PRODUCT_IMAGE_MAX_EDGE / Math.max(w, h)
      w = Math.round(w * scale)
      h = Math.round(h * scale)
    }

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('No se pudo preparar la imagen en este dispositivo.')
    }
    ctx.drawImage(bitmap, 0, 0, w, h)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY)
    })
    if (!blob) {
      throw new Error(
        'Tu navegador no puede guardar en WebP. Actualizá el navegador o probá con Chrome o Firefox.'
      )
    }

    const safeBase = sanitizeFileName(baseNameWithoutExtension(file.name))
    return new File([blob], `${safeBase}.webp`, { type: 'image/webp' })
  } finally {
    bitmap.close()
  }
}

/** Ruta del objeto dentro del bucket (sin nombre de bucket). */
export function buildProductImageObjectPath(articuloId: string, file: File): string {
  const unique = `${Date.now()}-${sanitizeFileName(file.name)}`
  return `${PRODUCT_IMAGES_PREFIX}/${articuloId}/${unique}`
}

/** Ruta fija para la imagen por defecto por artículo: `images/<id>/default-articulo.svg`. */
export function buildDefaultArticleStoragePath(articuloId: string): string {
  return `${PRODUCT_IMAGES_PREFIX}/${articuloId}/${DEFAULT_ARTICLE_STORAGE_FILE_NAME}`
}

/** Sube el placeholder con nombre fijo (permite reemplazar si ya existía). */
export async function uploadDefaultArticlePlaceholder(articuloId: string, file: File) {
  const path = buildDefaultArticleStoragePath(articuloId)
  const { data, error } = await supabase.storage.from(PRODUCTS_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || 'image/svg+xml',
  })
  if (error) throw error
  return { path: data.path }
}

/** Carga el archivo desde `/public/default-articulo.svg` para subirlo a Storage. */
export async function loadDefaultArticleImageFile(): Promise<File> {
  const res = await fetch(DEFAULT_ARTICLE_IMAGE_PUBLIC_URL)
  if (!res.ok) throw new Error('No se pudo cargar la imagen por defecto del sitio.')
  const blob = await res.blob()
  return new File([blob], DEFAULT_ARTICLE_STORAGE_FILE_NAME, { type: blob.type || 'image/svg+xml' })
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

  const toUpload = await prepareProductImageFileForStorage(file)
  if (toUpload.size > MAX_BYTES) {
    throw new Error('Tras optimizar, la imagen sigue siendo demasiado grande. Probá otra foto.')
  }

  const path = buildProductImageObjectPath(articuloId, toUpload)
  const { data, error } = await supabase.storage.from(PRODUCTS_BUCKET).upload(path, toUpload, {
    upsert: false,
    contentType: toUpload.type || undefined,
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
