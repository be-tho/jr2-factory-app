import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { OrdenVentaEstado } from '../../../types/database'
import {
  createOrdenVenta,
  getOrdenVentaWithItems,
  listOrdenesVentaByEstado,
  marcarOrdenVentaPagada,
  updateOrdenVenta,
  type CreateOrdenVentaInput,
  type UpdateOrdenVentaInput,
} from '../services/ordenesVenta.service'

export const ordenesVentaKeys = {
  all: ['ordenes_venta'] as const,
  lists: () => [...ordenesVentaKeys.all, 'list'] as const,
  list: (estado: OrdenVentaEstado) => [...ordenesVentaKeys.lists(), estado] as const,
  details: () => [...ordenesVentaKeys.all, 'detail'] as const,
  detail: (id: string) => [...ordenesVentaKeys.details(), id] as const,
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

export function useOrdenesVentaListQuery(estado: OrdenVentaEstado) {
  return useQuery({
    queryKey: ordenesVentaKeys.list(estado),
    queryFn: async () => {
      const { data, error } = await listOrdenesVentaByEstado(estado)
      if (error) throw error
      return data
    },
  })
}

export function useOrdenVentaDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: ordenesVentaKeys.detail(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error('Falta el identificador.')
      const { data, error } = await getOrdenVentaWithItems(id)
      if (error) throw error
      return data
    },
    enabled: Boolean(id),
  })
}

export function useUpdateOrdenVentaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateOrdenVentaInput }) => {
      const { data, error } = await updateOrdenVenta(id, input)
      if (error) throw error
      return data
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ordenesVentaKeys.all })
      void queryClient.invalidateQueries({ queryKey: ordenesVentaKeys.detail(id) })
      toast.success('Orden actualizada')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar.')
    },
  })
}

export function useMarcarOrdenPagadaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await marcarOrdenVentaPagada(id)
      if (error) throw error
      return data
    },
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ordenesVentaKeys.all })
      void queryClient.invalidateQueries({ queryKey: ordenesVentaKeys.detail(id) })
      toast.success('Venta marcada como pagada')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo marcar como pagada.')
    },
  })
}
