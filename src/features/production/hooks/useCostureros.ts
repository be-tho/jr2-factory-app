import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Costurero } from '../../../types/database'
import {
  createCosturero,
  deleteCosturero,
  getCostureroById,
  listCostureros,
  toggleCostureroActivo,
  updateCosturero,
  type CostureroInput,
} from '../services/costureros.service'

export const costurerosKeys = {
  all: ['costureros'] as const,
  lists: () => [...costurerosKeys.all, 'list'] as const,
  list: () => [...costurerosKeys.lists()] as const,
  details: () => [...costurerosKeys.all, 'detail'] as const,
  detail: (id: string) => [...costurerosKeys.details(), id] as const,
}

export function useCosturerosQuery() {
  return useQuery({
    queryKey: costurerosKeys.list(),
    queryFn: async (): Promise<Costurero[]> => {
      const { data, error } = await listCostureros()
      if (error) throw error
      return data
    },
  })
}

export function useCostureroQuery(id: string | undefined) {
  return useQuery({
    queryKey: costurerosKeys.detail(id ?? ''),
    queryFn: async (): Promise<Costurero> => {
      if (!id) throw new Error('Falta el identificador del costurero.')
      const { data, error } = await getCostureroById(id)
      if (error) throw error
      if (!data) throw new Error('No se encontró el costurero.')
      return data
    },
    enabled: Boolean(id),
  })
}

export function useCreateCostureroMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CostureroInput) => {
      const { data, error } = await createCosturero(input)
      if (error) throw error
      if (!data) throw new Error('No se pudo crear el costurero.')
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: costurerosKeys.all })
      toast.success('Costurero creado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear el costurero.')
    },
  })
}

export function useUpdateCostureroMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: CostureroInput }) => {
      const { data, error } = await updateCosturero(id, input)
      if (error) throw error
      if (!data) throw new Error('No se pudo actualizar el costurero.')
      return data
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: costurerosKeys.all })
      void queryClient.invalidateQueries({ queryKey: costurerosKeys.detail(variables.id) })
      toast.success('Costurero actualizado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar el costurero.')
    },
  })
}

export function useToggleCostureroActivoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, activo }: { id: string; activo: boolean }) => {
      const { error } = await toggleCostureroActivo(id, activo)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: costurerosKeys.all })
      void queryClient.invalidateQueries({ queryKey: costurerosKeys.detail(variables.id) })
      toast.success(variables.activo ? 'Costurero activado' : 'Costurero desactivado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo cambiar el estado.')
    },
  })
}

export function useDeleteCostureroMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await deleteCosturero(id)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: costurerosKeys.all })
      toast.success('Costurero eliminado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar el costurero.')
    },
  })
}
