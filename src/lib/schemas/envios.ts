import { z } from 'zod'
import { isGoogleMapsEmbedUrl } from '../maps-embed'
import type { ProvinciaArgentina } from '../argentina-provincias'
import { isProvinciaArgentina } from '../argentina-provincias'

function normalizeMapsUrl(raw: string): string {
  const t = raw.trim()
  if (!t) return t
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

export function createClienteEnvioFormSchema(isCtcCatalog: boolean) {
  return z
    .object({
      nombreEmpresa: z.string().trim().min(1, 'El nombre de la empresa es obligatorio.'),
      direccion: z.string().trim().min(1, 'La dirección es obligatoria.'),
      localidad: z.string(),
      provincia: z.custom<ProvinciaArgentina>((val): val is ProvinciaArgentina => {
        return typeof val === 'string' && isProvinciaArgentina(val)
      }),
      mapsUrl: z.string(),
      mapsEmbedUrl: z.string(),
      telefono: z.string(),
      horarioAtencion: z.string(),
      observaciones: z.string(),
      zonasEnvio: z.string().trim().min(1, 'Indicá a dónde envía el cliente (zonas, provincias, etc.).'),
      notas: z.string(),
      activo: z.boolean(),
    })
    .superRefine((data, ctx) => {
      if (isCtcCatalog) return

      const urlNormalized = normalizeMapsUrl(data.mapsUrl)
      if (!data.mapsUrl.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El link de Google Maps es obligatorio.',
          path: ['mapsUrl'],
        })
        return
      }
      try {
        const u = new URL(urlNormalized)
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Usá un link http o https válido.',
            path: ['mapsUrl'],
          })
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'No es un link válido. Pegá la URL que copiás de Google Maps (Compartir).',
          path: ['mapsUrl'],
        })
      }

      const embedTrim = data.mapsEmbedUrl.trim()
      if (embedTrim && !isGoogleMapsEmbedUrl(embedTrim)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Si completás el embed, tiene que ser la URL del iframe de Google Maps (https://www.google.com/maps/embed?… o maps.google.com/…).',
          path: ['mapsEmbedUrl'],
        })
      }
    })
}

export type ClienteEnvioFormValues = z.infer<ReturnType<typeof createClienteEnvioFormSchema>>

export function normalizeClienteMapsUrl(raw: string): string {
  return normalizeMapsUrl(raw)
}
