import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Product } from '../../../types/database'
import { articuloImagenesKeys } from './useArticuloImagenes'
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
  type NewProductInput,
  type UpdateProductInput,
} from '../services/products.service'

export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: () => [...productsKeys.lists()] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
}

export function useProductsQuery() {
  return useQuery({
    queryKey: productsKeys.list(),
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await listProducts()
      if (error) throw error
      return data
    },
  })
}

export function useProductQuery(id: string | undefined) {
  return useQuery({
    queryKey: productsKeys.detail(id ?? ''),
    queryFn: async (): Promise<Product> => {
      if (!id) throw new Error('Falta el identificador del artículo.')
      const { data, error } = await getProductById(id)
      if (error) throw error
      if (!data) throw new Error('No se encontró el artículo.')
      return data
    },
    enabled: Boolean(id),
  })
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await deleteProduct(productId)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productsKeys.all })
      toast.success('Artículo eliminado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar el artículo.')
    },
  })
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: NewProductInput) => {
      const { data, error } = await createProduct(input)
      if (error) throw error
      if (!data) throw new Error('No se pudo crear el artículo.')
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productsKeys.all })
      toast.success('Artículo creado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear el artículo.')
    },
  })
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateProductInput }) => {
      const { data, error } = await updateProduct(id, input)
      if (error) throw error
      if (!data) throw new Error('No se pudo actualizar el artículo.')
      return data
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: productsKeys.all })
      void queryClient.invalidateQueries({ queryKey: productsKeys.detail(variables.id) })
      void queryClient.invalidateQueries({ queryKey: articuloImagenesKeys.byArticulo(variables.id) })
      toast.success('Artículo actualizado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar el artículo.')
    },
  })
}
