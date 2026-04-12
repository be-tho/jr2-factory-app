import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSession } from '../../../hooks/useSession'
import type { Profile } from '../../../types/database'
import {
  getProfile,
  upsertProfile,
  type ProfileUpsertInput,
} from '../services/profile.service'

export const profileKeys = {
  own: (userId: string) => ['profile', userId] as const,
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
