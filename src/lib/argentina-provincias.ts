/** 24 jurisdicciones (INDEC) + "Otro". Debe coincidir con el CHECK de `public.clientes_envio.provincia`. */
export const PROVINCIAS_ARGENTINA = [
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Ciudad Autónoma de Buenos Aires',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego, Antártida e Islas del Atlántico Sur',
  'Tucumán',
  'Otro',
] as const

export type ProvinciaArgentina = (typeof PROVINCIAS_ARGENTINA)[number]

export function isProvinciaArgentina(value: string): value is ProvinciaArgentina {
  return (PROVINCIAS_ARGENTINA as readonly string[]).includes(value)
}
