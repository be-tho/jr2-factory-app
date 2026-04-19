import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createOrdenVenta, type CreateOrdenVentaInput } from '../services/ordenesVenta.service'

export const ordenesVentaKeys = {
  all: ['ordenes_venta'] as const,
}

export function useCreateOrdenVentaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateOrdenVentaInput) => {
      const { data, error } = await createOrdenVenta(input)
      if (error) throw error
      if (!data) throw new Error('No se registró la venta.')
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ordenesVentaKeys.all })
      toast.success('Venta registrada')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo registrar la venta.')
    },
  })
}
