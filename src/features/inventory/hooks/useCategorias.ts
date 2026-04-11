import { useQuery } from '@tanstack/react-query'
import type { CategoriaRow } from '../../../types/database'
import { listCategorias } from '../services/products.service'

export const categoriasKeys = {
  all: ['categorias'] as const,
  catalog: () => [...categoriasKeys.all, 'catalog'] as const,
}

export function useCategoriasQuery() {
  return useQuery({
    queryKey: categoriasKeys.catalog(),
    queryFn: async (): Promise<CategoriaRow[]> => {
      const { data, error } = await listCategorias()
      if (error) throw error
      return data
    },
  })
}
