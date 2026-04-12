import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSession } from '../../../hooks/useSession'
import type { Profile } from '../../../types/database'
import {
  getAvatarSignedUrl,
  getProfile,
  upsertProfile,
  type ProfileUpsertInput,
} from '../services/profile.service'

export const profileKeys = {
  own: (userId: string) => ['profile', userId] as const,
  avatar: (path: string) => ['avatar-url', path] as const,
}

export function useProfileQuery() {
  const { session } = useSession()
  const userId = session?.user.id ?? ''

  return useQuery({
    queryKey: profileKeys.own(userId),
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await getProfile(userId)
      if (error) throw error
      return data
    },
    enabled: Boolean(userId),
  })
}

/**
 * Obtiene la Signed URL del avatar y la cachea 55 min (expira en 60).
 * Devuelve `null` si no hay avatar_path.
 */
export function useAvatarUrl(storagePath: string | null | undefined) {
  return useQuery({
    queryKey: profileKeys.avatar(storagePath ?? ''),
    queryFn: () => getAvatarSignedUrl(storagePath!),
    enabled: Boolean(storagePath),
    staleTime: 1000 * 60 * 55,   // 55 min — renueva antes de que expire
    gcTime: 1000 * 60 * 60,      // mantiene en caché 1 hora
    retry: 1,
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  const { session } = useSession()
  const userId = session?.user.id ?? ''

  return useMutation({
    mutationFn: async (input: ProfileUpsertInput) => {
      const { data, error } = await upsertProfile(userId, input)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.own(userId) })
      toast.success('Perfil actualizado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar el perfil.')
    },
  })
}
