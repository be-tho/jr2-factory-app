import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CategoriaRow } from '../../../types/database'
import {
  createCategoria,
  deleteCategoria,
  getCategoriaById,
  listCategorias,
  listCategoriasAdmin,
  updateCategoria,
  type NewCategoriaInput,
  type UpdateCategoriaInput,
} from '../services/categorias.service'

export const categoriasKeys = {
  all: ['categorias'] as const,
  admin: () => [...categoriasKeys.all, 'admin'] as const,
  catalog: () => [...categoriasKeys.all, 'catalog'] as const,
  detail: (id: string) => [...categoriasKeys.all, 'detail', id] as const,
}

export function useCategoriasCatalogQuery() {
  return useQuery({
    queryKey: categoriasKeys.catalog(),
    queryFn: async (): Promise<CategoriaRow[]> => {
      const { data, error } = await listCategorias()
      if (error) throw error
      return data
    },
  })
}

export const useCategoriasQuery = useCategoriasCatalogQuery

export function useCategoriasAdminQuery() {
  return useQuery({
    queryKey: categoriasKeys.admin(),
    queryFn: async (): Promise<CategoriaRow[]> => {
      const { data, error } = await listCategoriasAdmin()
      if (error) throw error
      return data
    },
  })
}

export function useCategoriaQuery(id: string | undefined) {
  return useQuery({
    queryKey: categoriasKeys.detail(id ?? ''),
    queryFn: async (): Promise<CategoriaRow> => {
      if (!id) throw new Error('Falta el identificador de la categoría.')
      const { data, error } = await getCategoriaById(id)
      if (error) throw error
      if (!data) throw new Error('No se encontró la categoría.')
      return data
    },
    enabled: Boolean(id),
  })
}

export function useCreateCategoriaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: NewCategoriaInput) => {
      const { data, error } = await createCategoria(input)
      if (error) throw error
      if (!data) throw new Error('No se pudo crear la categoría.')
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriasKeys.all })
      toast.success('Categoría creada')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear la categoría.')
    },
  })
}

export function useUpdateCategoriaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateCategoriaInput }) => {
      const { data, error } = await updateCategoria(id, input)
      if (error) throw error
      if (!data) throw new Error('No se pudo actualizar la categoría.')
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriasKeys.all })
      toast.success('Categoría actualizada')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar la categoría.')
    },
  })
}

export function useDeleteCategoriaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await deleteCategoria(id)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriasKeys.all })
      toast.success('Categoría eliminada')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar la categoría.')
    },
  })
}
