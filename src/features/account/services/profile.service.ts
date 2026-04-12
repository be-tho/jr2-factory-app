import { supabase } from '../../../lib/supabase/client'
import type { Profile } from '../../../types/database'

export const AVATARS_BUCKET = 'avatars'

// 5 MB límite de entrada — tras optimizar siempre queda mucho menos
const AVATAR_MAX_INPUT_BYTES = 5 * 1024 * 1024
const AVATAR_ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

// 256 px = display 128 px a 2× (retina). Suficiente para avatares sin pixelar.
const AVATAR_MAX_EDGE = 256
const AVATAR_WEBP_QUALITY = 0.88

export interface ProfileUpsertInput {
  full_name?: string | null
  avatar_path?: string | null
  role?: string | null
  bio?: string | null
}

export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_ALLOWED_TYPES.has(file.type)) {
    return 'Usá JPEG, PNG o WebP para la foto de perfil.'
  }
  if (file.size > AVATAR_MAX_INPUT_BYTES) {
    return 'La imagen no puede superar 5 MB.'
  }
  return null
}

/**
 * Redimensiona el avatar a máx 256×256 px y lo convierte a WebP.
 * Recorte centrado para que siempre salga cuadrado (ideal para círculos de avatar).
 */
async function prepareAvatarFile(file: File): Promise<File> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('No se pudo leer la imagen. Probá con otro archivo.')
  }

  try {
    const { width: sw, height: sh } = bitmap

    // Recorte cuadrado centrado (crop al lado más corto)
    const side = Math.min(sw, sh)
    const sx = Math.floor((sw - side) / 2)
    const sy = Math.floor((sh - side) / 2)

    // Tamaño de salida: mínimo entre el lado recortado y el máximo permitido
    const out = Math.min(side, AVATAR_MAX_EDGE)

    const canvas = document.createElement('canvas')
    canvas.width = out
    canvas.height = out
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('No se pudo procesar la imagen en este dispositivo.')

    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, out, out)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', AVATAR_WEBP_QUALITY)
    })
    if (!blob) throw new Error('Tu navegador no soporta WebP. Actualizá el navegador o usá Chrome/Firefox.')

    return new File([blob], 'avatar.webp', { type: 'image/webp' })
  } finally {
    bitmap.close()
  }
}

export async function getProfile(userId: string) {
  return supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle<Profile>()
}

export async function upsertProfile(userId: string, input: ProfileUpsertInput) {
  return supabase
    .from('profiles')
    .upsert({ id: userId, ...input }, { onConflict: 'id' })
    .select()
    .maybeSingle<Profile>()
}

/**
 * Sube el avatar optimizado con timestamp en el nombre para cache-busting natural.
 * Si existe un archivo anterior (oldPath), lo elimina después de subir el nuevo.
 */
export async function uploadAvatar(userId: string, file: File, oldPath?: string | null): Promise<string> {
  const optimized = await prepareAvatarFile(file)

  const path = `${userId}/${Date.now()}-avatar.webp`
  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, optimized, { upsert: false, contentType: 'image/webp' })
  if (error) throw new Error(error.message)

  // Borra el avatar anterior (best-effort, no bloquea si falla)
  if (oldPath && oldPath !== path) {
    await supabase.storage.from(AVATARS_BUCKET).remove([oldPath]).catch(() => {})
  }

  return path
}

/**
 * Genera una Signed URL válida por 1 hora (bucket privado).
 * Usá el hook `useAvatarUrl` para cachear el resultado con TanStack Query.
 */
export async function getAvatarSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .createSignedUrl(storagePath, 3600)
  if (error || !data?.signedUrl) throw new Error('No se pudo obtener la URL del avatar.')
  return data.signedUrl
}
