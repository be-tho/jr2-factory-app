/**
 * Centro de Transferencia de Cargas (CTC) — referencias comunes del campus.
 * El listado de empresas vive en Supabase (`clientes_envio`, `catalogo_origen = 'ctc'`).
 */
export const CTC_CAMPUS = {
  nombre: 'Centro de Transferencia de Cargas (CTC)',
  direccion: 'Pergamino 3751',
  ciudad: 'Ciudad Autónoma de Buenos Aires',
  pais: 'Argentina',
  urlDirectorioOficial: 'https://www.ctcadministradora.com.ar/empresas',
  telefonoCTC: '011 6089 8600',
} as const

const CTC_UBICACION_GOOGLE_QUERY = encodeURIComponent(
  `${CTC_CAMPUS.direccion}, ${CTC_CAMPUS.ciudad}, ${CTC_CAMPUS.pais}`,
)

/**
 * Link “abrir en Maps” — debe coincidir con la fila `maps_url` de cada empresa CTC en DB
 * (todas iguales: campus único).
 */
export const CTC_GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${CTC_UBICACION_GOOGLE_QUERY}`

/**
 * `src` del iframe — mismo lugar que {@link CTC_GOOGLE_MAPS_URL}; debe coincidir con `maps_embed_url`
 * en cada fila CTC (semilla Supabase y overrides en `updateClienteEnvio`).
 */
export const CTC_GOOGLE_MAPS_EMBED_URL = `https://maps.google.com/maps?q=${CTC_UBICACION_GOOGLE_QUERY}&output=embed`
