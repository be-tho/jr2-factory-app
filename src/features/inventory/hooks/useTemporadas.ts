import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { TemporadaRow } from '../../../types/database'
import {
  createTemporada,
  deleteTemporada,
  getTemporadaById,
  listTemporadas,
  listTemporadasAdmin,
  updateTemporada,
  type NewTemporadaInput,
  type UpdateTemporadaInput,
} from '../services/temporadas.service'

/** Claves de caché para temporadas; invalidá `all` tras mutaciones. */
export const temporadasKeys = {
  all: ['temporadas'] as const,
  admin: () => [...temporadasKeys.all, 'admin'] as const,
  catalog: () => [...temporadasKeys.all, 'catalog'] as const,
  detail: (id: string) => [...temporadasKeys.all, 'detail', id] as const,
}

/** Temporadas activas — selects en artículos (comparte invalidación con admin). */
export function useTemporadasCatalogQuery() {
  return useQuery({
    queryKey: temporadasKeys.catalog(),
    queryFn: async (): Promise<TemporadaRow[]> => {
      const { data, error } = await listTemporadas()
      if (error) throw error
      return data
    },
  })
}

export function useTemporadasAdminQuery() {
  return useQuery({
    queryKey: temporadasKeys.admin(),
    queryFn: async (): Promise<TemporadaRow[]> => {
      const { data, error } = await listTemporadasAdmin()
      if (error) throw error
      return data
    },
  })
}

export function useTemporadaQuery(id: string | undefined) {
  return useQuery({
    queryKey: temporadasKeys.detail(id ?? ''),
    queryFn: async (): Promise<TemporadaRow> => {
      if (!id) throw new Error('Falta el identificador de la temporada.')
      const { data, error } = await getTemporadaById(id)
      if (error) throw error
      if (!data) throw new Error('No se encontró la temporada.')
      return data
    },
    enabled: Boolean(id),
  })
}

export function useCreateTemporadaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: NewTemporadaInput) => {
      const { data, error } = await createTemporada(input)
      if (error) throw error
      if (!data) throw new Error('No se pudo crear la temporada.')
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: temporadasKeys.all })
    },
  })
}

export function useUpdateTemporadaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateTemporadaInput }) => {
      const { data, error } = await updateTemporada(id, input)
      if (error) throw error
      if (!data) throw new Error('No se pudo actualizar la temporada.')
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: temporadasKeys.all })
    },
  })
}

export function useDeleteTemporadaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await deleteTemporada(id)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: temporadasKeys.all })
    },
  })
}
