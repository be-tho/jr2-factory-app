import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Patron } from '../../../types/database'
import {
  createPatron,
  deletePatron,
  getArticulosConPatron,
  getPatronById,
  listPatrones,
  updatePatron,
  type NewPatronInput,
  type UpdatePatronInput,
} from '../services/patrones.service'

export const patronesKeys = {
  all: ['patrones'] as const,
  lists: () => [...patronesKeys.all, 'list'] as const,
  list: () => [...patronesKeys.lists()] as const,
  details: () => [...patronesKeys.all, 'detail'] as const,
  detail: (id: string) => [...patronesKeys.details(), id] as const,
  articulosConPatron: () => [...patronesKeys.all, 'articulos-con-patron'] as const,
}

export function usePatronesQuery() {
  return useQuery({
    queryKey: patronesKeys.list(),
    queryFn: async (): Promise<Patron[]> => {
      const { data, error } = await listPatrones()
      if (error) throw error
      return data
    },
  })
}

export function usePatronQuery(id: string | undefined) {
  return useQuery({
    queryKey: patronesKeys.detail(id ?? ''),
    queryFn: async (): Promise<Patron> => {
      if (!id) throw new Error('Falta el identificador del patrón.')
      const { data, error } = await getPatronById(id)
      if (error) throw error
      if (!data) throw new Error('No se encontró el patrón.')
      return data
    },
    enabled: Boolean(id),
  })
}

export function useArticulosConPatronQuery() {
  return useQuery({
    queryKey: patronesKeys.articulosConPatron(),
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await getArticulosConPatron()
      if (error) throw error
      return data
    },
  })
}

export function useCreatePatronMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: NewPatronInput) => {
      const { data, error } = await createPatron(input)
      if (error) throw error
      if (!data) throw new Error('No se pudo crear el patrón.')
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: patronesKeys.all })
      toast.success('Patrón creado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear el patrón.')
    },
  })
}

export function useUpdatePatronMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdatePatronInput }) => {
      const { data, error } = await updatePatron(id, input)
      if (error) throw error
      if (!data) throw new Error('No se pudo actualizar el patrón.')
      return data
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: patronesKeys.all })
      void queryClient.invalidateQueries({ queryKey: patronesKeys.detail(variables.id) })
      toast.success('Patrón actualizado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar el patrón.')
    },
  })
}

export function useDeletePatronMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await deletePatron(id)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: patronesKeys.all })
      toast.success('Patrón eliminado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar el patrón.')
    },
  })
}
