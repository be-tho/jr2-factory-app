import { supabase } from '../../../lib/supabase/client'
import type { Profile } from '../../../types/database'

export const AVATARS_BUCKET = 'avatars'

const AVATAR_MAX_BYTES = 5 * 1024 * 1024
const AVATAR_ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

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
  if (file.size > AVATAR_MAX_BYTES) {
    return 'La imagen no puede superar 5 MB.'
  }
  return null
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

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext =
    file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${userId}/avatar.${ext}`
  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw new Error(error.message)
  return path
}

export function getAvatarPublicUrl(storagePath: string): string {
  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}
