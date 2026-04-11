import { useQuery } from '@tanstack/react-query'
import type { ProductImage } from '../../../types/database'
import { listArticuloImagenes } from '../services/articulo-imagenes.service'

export const articuloImagenesKeys = {
  all: ['articulo-imagenes'] as const,
  byArticulo: (id: string) => [...articuloImagenesKeys.all, id] as const,
}

export function useArticuloImagenesQuery(articuloId: string | undefined) {
  return useQuery({
    queryKey: articuloImagenesKeys.byArticulo(articuloId ?? ''),
    queryFn: async (): Promise<ProductImage[]> => {
      if (!articuloId) throw new Error('Falta el identificador del artículo.')
      const { data, error } = await listArticuloImagenes(articuloId)
      if (error) throw error
      return data
    },
    enabled: Boolean(articuloId),
  })
}
