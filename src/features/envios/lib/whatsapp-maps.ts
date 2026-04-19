import type { ClienteEnvio } from '../../../types/database'

export function buildWhatsappMapsMessage(c: ClienteEnvio): string {
  const partesUbicacion = [c.direccion, c.localidad, c.provincia].filter((x) => x && x.trim().length > 0)
  const lines = [
    `📍 ${c.nombre_empresa}`,
    partesUbicacion.join(', '),
    '',
    `Maps: ${c.maps_url}`,
    '',
  ]
  if (c.telefono?.trim()) lines.push(`Tel.: ${c.telefono.trim()}`, '')
  if (c.horario_atencion?.trim()) lines.push(`Horario: ${c.horario_atencion.trim()}`, '')
  if (c.observaciones?.trim()) lines.push(`Ubicación / obs.: ${c.observaciones.trim()}`, '')
  lines.push(`Envíos / cobertura: ${c.zonas_envio}`)
  return lines.join('\n')
}

export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
