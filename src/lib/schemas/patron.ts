import { z } from 'zod'

export const patronMetaFormSchema = z.object({
  articulo_id: z.string().min(1, 'Seleccioná un artículo.'),
  nombre: z.string().trim().min(1, 'El nombre del patrón es requerido.'),
  descripcion: z.string(),
})

export type PatronMetaFormValues = z.infer<typeof patronMetaFormSchema>
