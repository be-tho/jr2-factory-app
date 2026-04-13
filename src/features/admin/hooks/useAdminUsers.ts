import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getAllUsers, updateUserRole, setUserActive } from '../services/adminUsers.service'

export const adminUsersKeys = {
  all: ['admin-users'] as const,
}

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: adminUsersKeys.all,
    queryFn: async () => {
      const { data, error } = await getAllUsers()
      if (error) throw error
      return data ?? []
    },
  })
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string | null }) => {
      const { data, error } = await updateUserRole(userId, role)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.all })
      toast.success('Rol actualizado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar el rol.')
    },
  })
}

export function useSetUserActiveMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, is_active }: { userId: string; is_active: boolean }) => {
      const { data, error } = await setUserActive(userId, is_active)
      if (error) throw error
      return data
    },
    onSuccess: (_, { is_active }) => {
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.all })
      toast.success(is_active ? 'Usuario activado' : 'Usuario desactivado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo cambiar el estado del usuario.')
    },
  })
}
