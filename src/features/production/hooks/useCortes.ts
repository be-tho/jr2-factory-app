import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Corte } from '../../../types/database'
import {
  createCorte,
  deleteCorte,
  getCorteById,
  listCortes,
  updateCorte,
  type NewCorteInput,
  type UpdateCorteInput,
} from '../services/cortes.service'

export const cortesKeys = {
  all: ['cortes'] as const,
  lists: () => [...cortesKeys.all, 'list'] as const,
  list: () => [...cortesKeys.lists()] as const,
  details: () => [...cortesKeys.all, 'detail'] as const,
  detail: (id: string) => [...cortesKeys.details(), id] as const,
}

export function useCortesQuery() {
  return useQuery({
    queryKey: cortesKeys.list(),
    queryFn: async (): Promise<Corte[]> => {
      const { data, error } = await listCortes()
      if (error) throw error
      return data
    },
  })
}

export function useCorteQuery(id: string | undefined) {
  return useQuery({
    queryKey: cortesKeys.detail(id ?? ''),
    queryFn: async (): Promise<Corte> => {
      if (!id) throw new Error('Falta el identificador del corte.')
      const { data, error } = await getCorteById(id)
      if (error) throw error
      if (!data) throw new Error('No se encontró el corte.')
      return data
    },
    enabled: Boolean(id),
  })
}

export function useCreateCorteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: NewCorteInput) => {
      const { data, error } = await createCorte(input)
      if (error) throw error
      if (!data) throw new Error('No se pudo crear el corte.')
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cortesKeys.all })
      toast.success('Corte creado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear el corte.')
    },
  })
}

export function useUpdateCorteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateCorteInput }) => {
      const { data, error } = await updateCorte(id, input)
      if (error) throw error
      if (!data) throw new Error('No se pudo actualizar el corte.')
      return data
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: cortesKeys.all })
      void queryClient.invalidateQueries({ queryKey: cortesKeys.detail(variables.id) })
      toast.success('Corte actualizado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar el corte.')
    },
  })
}

export function useDeleteCorteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await deleteCorte(id)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cortesKeys.all })
      toast.success('Corte eliminado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar el corte.')
    },
  })
}
