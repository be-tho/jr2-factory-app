import { z } from 'zod'

export const categoriaFormSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  activo: z.boolean(),
})

export type CategoriaFormValues = z.infer<typeof categoriaFormSchema>

export const temporadaFormSchema = categoriaFormSchema

export type TemporadaFormValues = z.infer<typeof temporadaFormSchema>

export const articuloFormSchema = z
  .object({
    name: z.string().trim().min(1, 'El nombre es obligatorio.'),
    sku: z.string().trim().min(1, 'El código (SKU) es obligatorio.'),
    categoria_id: z.string().min(1, 'Elegí una categoría.'),
    temporada_id: z.string().min(1, 'Elegí una temporada.'),
    precioLista: z.string().refine((s) => {
      const n = Number.parseInt(s.replace(/\s/g, ''), 10)
      return Number.isFinite(n) && n >= 0
    }, 'Indicá un precio de lista válido (entero ≥ 0).'),
    precioPromo: z.string(),
    stockActual: z.string().refine((s) => {
      const n = Number.parseInt(s.replace(/\s/g, ''), 10)
      return Number.isFinite(n) && n >= 0
    }, 'Indicá un stock actual válido (entero ≥ 0).'),
    activo: z.boolean(),
    descripcion: z.string(),
  })
  .superRefine((data, ctx) => {
    const promoRaw = data.precioPromo.trim()
    if (promoRaw === '') return
    const p = Number.parseInt(promoRaw.replace(/\s/g, ''), 10)
    if (!Number.isFinite(p) || p < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Precio promocional inválido.',
        path: ['precioPromo'],
      })
    }
  })

export type ArticuloFormValues = z.infer<typeof articuloFormSchema>
