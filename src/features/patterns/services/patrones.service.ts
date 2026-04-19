import { supabase } from '../../../lib/supabase/client'
import type { Patron } from '../../../types/database'

const TABLE = 'patrones'
const BUCKET = 'patrones'
const MAX_BYTES = 50 * 1024 * 1024 // 50 MB

const PATRON_SELECT = `
  *,
  articulos (
    nombre,
    codigo,
    articulo_imagenes ( storage_path, es_principal, orden )
  )
`.trim()

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120) || 'patron'
}

function pickCoverStoragePath(
  imagenes: { storage_path: string; es_principal: boolean; orden: number }[] | null,
): string | null {
  if (!imagenes?.length) return null
  const sorted = [...imagenes].sort((a, b) => {
    if (a.es_principal !== b.es_principal) return a.es_principal ? -1 : 1
    return a.orden - b.orden
  })
  return sorted[0]?.storage_path ?? null
}

function rowToPatron(raw: unknown): Patron | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  const id = r.id
  const articulo_id = r.articulo_id
  const nombre = r.nombre
  const storage_path = r.storage_path
  const file_name = r.file_name

  if (
    typeof id !== 'string' ||
    typeof articulo_id !== 'string' ||
    typeof nombre !== 'string' ||
    typeof storage_path !== 'string' ||
    typeof file_name !== 'string'
  ) {
    return null
  }

  const descripcion = r.descripcion == null ? null : String(r.descripcion)
  const file_size = r.file_size == null ? null : Number(r.file_size)
  const file_type = r.file_type == null ? null : String(r.file_type)
  const activo = typeof r.activo === 'boolean' ? r.activo : Boolean(r.activo)
  const created_at = typeof r.created_at === 'string' ? r.created_at : new Date().toISOString()
  const updated_at = typeof r.updated_at === 'string' ? r.updated_at : created_at

  const art = r.articulos as Record<string, unknown> | null
  const articulo_nombre = art && typeof art.nombre === 'string' ? art.nombre : ''
  const articulo_sku = art && typeof art.codigo === 'string' ? art.codigo : ''
  const imagenes = art && Array.isArray(art.articulo_imagenes)
    ? (art.articulo_imagenes as { storage_path: string; es_principal: boolean; orden: number }[])
    : null
  const articulo_cover_image_path = pickCoverStoragePath(imagenes)

  return {
    id,
    articulo_id,
    nombre,
    descripcion,
    storage_path,
    file_name,
    file_size,
    file_type,
    activo,
    created_at,
    updated_at,
    articulo_nombre,
    articulo_sku,
    articulo_cover_image_path,
  }
}

// ─── Queries ───────────────────────────────────────────────────────────────

export async function listPatrones(): Promise<{ data: Patron[]; error: Error | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(PATRON_SELECT)
    .order('created_at', { ascending: false })

  if (error) return { data: [], error: new Error(error.message) }

  const rows = (data ?? []).map(rowToPatron).filter((x): x is Patron => x != null)
  return { data: rows, error: null }
}

export async function getPatronById(id: string): Promise<{ data: Patron | null; error: Error | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(PATRON_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: rowToPatron(data), error: null }
}

/** Devuelve los IDs de artículos que ya tienen patrón asignado. */
export async function getArticulosConPatron(): Promise<{ data: string[]; error: Error | null }> {
  const { data, error } = await supabase.from(TABLE).select('articulo_id')
  if (error) return { data: [], error: new Error(error.message) }
  return { data: (data ?? []).map((r) => r.articulo_id as string), error: null }
}

// ─── Mutations ─────────────────────────────────────────────────────────────

export type NewPatronInput = {
  articulo_id: string
  nombre: string
  descripcion?: string | null
  file: File
}

export type UpdatePatronInput = {
  nombre: string
  descripcion?: string | null
  /** Artículo vinculado (si cambia sin archivo nuevo, se mueve el archivo en el bucket). */
  articulo_id: string
  /** Si se provee, reemplaza el archivo actual. */
  file?: File | null
}

function getFileExtension(name: string): string {
  const i = name.lastIndexOf('.')
  return i > 0 ? name.slice(i).toLowerCase() : ''
}

function pathTailAfterArticuloFolder(storagePath: string): string {
  const i = storagePath.indexOf('/')
  return i >= 0 ? storagePath.slice(i + 1) : storagePath
}

async function copyPatronFileInBucket(fromPath: string, toPath: string): Promise<void> {
  const { data: blob, error: dlErr } = await supabase.storage.from(BUCKET).download(fromPath)
  if (dlErr || !blob) throw new Error(dlErr?.message ?? 'No se pudo leer el archivo actual.')
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(toPath, blob, {
    upsert: false,
    contentType: blob.type || 'application/octet-stream',
  })
  if (upErr) throw new Error(upErr.message)
}

async function uploadPatronFile(articuloId: string, file: File): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error(`El archivo supera el límite de 50 MB (${(file.size / 1024 / 1024).toFixed(1)} MB).`)
  }

  const safeName = sanitizeFileName(file.name)
  const unique = `${Date.now()}-${safeName}`
  const path = `${articuloId}/${unique}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || 'application/octet-stream',
  })
  if (error) throw new Error(error.message)
  return path
}

export async function createPatron(input: NewPatronInput): Promise<{ data: Patron | null; error: Error | null }> {
  let storagePath: string
  try {
    storagePath = await uploadPatronFile(input.articulo_id, input.file)
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error('Error al subir el archivo.') }
  }

  const insertRow = {
    articulo_id: input.articulo_id,
    nombre: input.nombre.trim(),
    descripcion: input.descripcion?.trim() || null,
    storage_path: storagePath,
    file_name: input.file.name,
    file_size: input.file.size,
    file_type: getFileExtension(input.file.name) || null,
    activo: true,
  }

  const { data, error } = await supabase.from(TABLE).insert(insertRow).select(PATRON_SELECT).single()

  if (error) {
    // rollback: remove uploaded file
    await supabase.storage.from(BUCKET).remove([storagePath]).catch(() => {})
    return { data: null, error: new Error(error.message) }
  }

  return { data: rowToPatron(data), error: null }
}

export async function updatePatron(
  id: string,
  input: UpdatePatronInput,
): Promise<{ data: Patron | null; error: Error | null }> {
  const { data: existingRow, error: fetchErr } = await supabase
    .from(TABLE)
    .select('articulo_id, storage_path')
    .eq('id', id)
    .maybeSingle()

  if (fetchErr) return { data: null, error: new Error(fetchErr.message) }
  if (!existingRow) return { data: null, error: new Error('No se encontró el patrón.') }

  const prevArticuloId = String((existingRow as { articulo_id: unknown }).articulo_id ?? '')
  const prevStoragePath = String((existingRow as { storage_path: unknown }).storage_path ?? '')
  const targetArticuloId = input.articulo_id.trim()

  if (!targetArticuloId) return { data: null, error: new Error('Seleccioná un artículo.') }

  const { data: conflicto } = await supabase
    .from(TABLE)
    .select('id')
    .eq('articulo_id', targetArticuloId)
    .neq('id', id)
    .maybeSingle()

  if (conflicto)
    return { data: null, error: new Error('Ese artículo ya tiene otro patrón asignado.') }

  let newStoragePath = prevStoragePath
  let newFileName: string | undefined
  let newFileSize: number | undefined
  let newFileType: string | undefined
  let uploadedTempPath: string | null = null
  let copiedTempPath: string | null = null

  if (input.file) {
    try {
      newStoragePath = await uploadPatronFile(targetArticuloId, input.file)
      uploadedTempPath = newStoragePath
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error('Error al subir el archivo.') }
    }

    newFileName = input.file.name
    newFileSize = input.file.size
    newFileType = getFileExtension(input.file.name) || undefined
  } else if (targetArticuloId !== prevArticuloId) {
    const tail = pathTailAfterArticuloFolder(prevStoragePath)
    newStoragePath = `${targetArticuloId}/${tail}`
    try {
      await copyPatronFileInBucket(prevStoragePath, newStoragePath)
      copiedTempPath = newStoragePath
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error('No se pudo mover el archivo al nuevo artículo.') }
    }
  }

  const updateRow: Record<string, unknown> = {
    nombre: input.nombre.trim(),
    descripcion: input.descripcion?.trim() || null,
    articulo_id: targetArticuloId,
    storage_path: newStoragePath,
  }
  if (newFileName !== undefined) {
    updateRow.file_name = newFileName
    updateRow.file_size = newFileSize ?? null
    updateRow.file_type = newFileType ?? null
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(updateRow)
    .eq('id', id)
    .select(PATRON_SELECT)
    .single()

  if (error) {
    if (uploadedTempPath) await supabase.storage.from(BUCKET).remove([uploadedTempPath]).catch(() => {})
    if (copiedTempPath) await supabase.storage.from(BUCKET).remove([copiedTempPath]).catch(() => {})
    return { data: null, error: new Error(error.message) }
  }

  const replacedOldPath =
    newStoragePath !== prevStoragePath && prevStoragePath.length > 0 ? prevStoragePath : null
  if (replacedOldPath) {
    await supabase.storage.from(BUCKET).remove([replacedOldPath]).catch(() => {})
  }

  return { data: rowToPatron(data), error: null }
}

export async function deletePatron(id: string): Promise<{ error: Error | null }> {
  const { data: row, error: fetchErr } = await supabase
    .from(TABLE)
    .select('storage_path')
    .eq('id', id)
    .maybeSingle()

  if (fetchErr) return { error: new Error(fetchErr.message) }

  const { error: delErr } = await supabase.from(TABLE).delete().eq('id', id)
  if (delErr) return { error: new Error(delErr.message) }

  const path = (row as Record<string, unknown> | null)?.storage_path
  if (typeof path === 'string') {
    await supabase.storage.from(BUCKET).remove([path]).catch(() => {})
  }

  return { error: null }
}

// ─── Download ──────────────────────────────────────────────────────────────

/** Genera una Signed URL válida por 1 hora y dispara la descarga. */
export async function downloadPatronFile(storagePath: string, fileName: string): Promise<void> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600, { download: fileName })

  if (error || !data?.signedUrl) {
    throw new Error('No se pudo generar el enlace de descarga. Intentá de nuevo.')
  }

  const anchor = document.createElement('a')
  anchor.href = data.signedUrl
  anchor.download = fileName
  anchor.rel = 'noopener noreferrer'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}
