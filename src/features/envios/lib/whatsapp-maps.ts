import type { ClienteEnvio } from '../../../types/database'

export function buildWhatsappMapsMessage(c: ClienteEnvio): string {
  const partesUbicacion = [c.direccion, c.localidad, c.provincia].filter((x) => x && x.trim().length > 0)
  return [
    `📍 ${c.nombre_empresa}`,
    partesUbicacion.join(', '),
    '',
    `Maps: ${c.maps_url}`,
    '',
    `Envíos / cobertura: ${c.zonas_envio}`,
  ].join('\n')
}

export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
