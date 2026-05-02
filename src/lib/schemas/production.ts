import { z } from 'zod'
import type { CorteEstado, TipoDocumento } from '../../types/database'

const corteEstadoValues: [CorteEstado, ...CorteEstado[]] = [
  'pendiente',
  'en_proceso',
  'completado',
  'cancelado',
]

export const corteScalarFormSchema = z.object({
  numero_corte: z.string().trim().min(1, 'El número de corte es obligatorio.'),
  tipo_tela: z.string().trim().min(1, 'El tipo de tela es obligatorio.'),
  cantidad_total: z.string().refine((s) => {
    const n = Number.parseInt(s, 10)
    return Number.isFinite(n) && n >= 1
  }, 'Ingresá una cantidad mayor a 0.'),
  costureros: z.string(),
  estado: z.enum(corteEstadoValues),
  fecha: z.string().min(1, 'La fecha es obligatoria.'),
  descripcion: z.string(),
})

export type CorteScalarFormValues = z.infer<typeof corteScalarFormSchema>

const tipoDocValues: [TipoDocumento, TipoDocumento, TipoDocumento] = ['DNI', 'CUIL', 'CUIT']

export const costureroFormSchema = z
  .object({
    nombre_completo: z.string().trim().min(1, 'El nombre completo es obligatorio.'),
    telefono: z.string(),
    email: z.string(),
    direccion: z.string(),
    tipo_documento: z.enum(tipoDocValues),
    numero_documento: z.string().trim().min(1, 'El número de documento es obligatorio.'),
    cbu_alias: z.string(),
    notas: z.string(),
    activo: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const e = data.email.trim()
    if (e !== '' && !z.string().email().safeParse(e).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Email inválido.', path: ['email'] })
    }
  })

export type CostureroFormValues = z.infer<typeof costureroFormSchema>
