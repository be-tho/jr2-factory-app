import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ClienteEnvio } from '../../../types/database'
import {
  createClienteEnvio,
  deleteClienteEnvio,
  getClienteEnvioById,
  listClientesEnvio,
  toggleClienteEnvioActivo,
  updateClienteEnvio,
  type ClienteEnvioInput,
} from '../services/clientesEnvio.service'

export const clientesEnvioKeys = {
  all: ['clientes_envio'] as const,
  lists: () => [...clientesEnvioKeys.all, 'list'] as const,
  list: () => [...clientesEnvioKeys.lists()] as const,
  details: () => [...clientesEnvioKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientesEnvioKeys.details(), id] as const,
}

export function useClientesEnvioQuery() {
  return useQuery({
    queryKey: clientesEnvioKeys.list(),
    queryFn: async (): Promise<ClienteEnvio[]> => {
      const { data, error } = await listClientesEnvio()
      if (error) throw error
      return data
    },
  })
}

export function useClienteEnvioQuery(id: string | undefined) {
  return useQuery({
    queryKey: clientesEnvioKeys.detail(id ?? ''),
    queryFn: async (): Promise<ClienteEnvio> => {
      if (!id) throw new Error('Falta el identificador del cliente.')
      const { data, error } = await getClienteEnvioById(id)
      if (error) throw error
      if (!data) throw new Error('No se encontró el cliente.')
      return data
    },
    enabled: Boolean(id),
  })
}

export function useCreateClienteEnvioMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: ClienteEnvioInput) => {
      const { data, error } = await createClienteEnvio(input)
      if (error) throw error
      if (!data) throw new Error('No se pudo crear el registro.')
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clientesEnvioKeys.all })
      toast.success('Dirección guardada')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar.')
    },
  })
}

export function useUpdateClienteEnvioMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ClienteEnvioInput }) => {
      const { data, error } = await updateClienteEnvio(id, input)
      if (error) throw error
      if (!data) throw new Error('No se pudo actualizar.')
      return data
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: clientesEnvioKeys.all })
      void queryClient.invalidateQueries({ queryKey: clientesEnvioKeys.detail(variables.id) })
      toast.success('Cambios guardados')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar.')
    },
  })
}

export function useToggleClienteEnvioActivoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, activo }: { id: string; activo: boolean }) => {
      const { error } = await toggleClienteEnvioActivo(id, activo)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: clientesEnvioKeys.all })
      void queryClient.invalidateQueries({ queryKey: clientesEnvioKeys.detail(variables.id) })
      toast.success(variables.activo ? 'Cliente activado' : 'Cliente desactivado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo cambiar el estado.')
    },
  })
}

export function useDeleteClienteEnvioMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await deleteClienteEnvio(id)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clientesEnvioKeys.all })
      toast.success('Registro eliminado')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar.')
    },
  })
}
