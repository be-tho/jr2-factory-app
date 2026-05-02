import { z } from 'zod'

export const ventaClienteFormSchema = z.object({
  cliente_nombre: z.string().trim().min(2, 'Ingresá el nombre completo del cliente.'),
  cliente_telefono: z.string(),
  medio_pago: z.enum(['efectivo', 'transferencia']),
})

export type VentaClienteFormValues = z.infer<typeof ventaClienteFormSchema>
