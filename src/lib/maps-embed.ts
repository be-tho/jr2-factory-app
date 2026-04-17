/** Solo URLs de embed de Google Maps (iframe src) para previsualizar en la app. */
export function isGoogleMapsEmbedUrl(url: string): boolean {
  try {
    const u = new URL(url.trim())
    if (u.protocol !== 'https:') return false
    const host = u.hostname.toLowerCase()
    if (host === 'www.google.com' && u.pathname.startsWith('/maps/embed')) return true
    if (host === 'maps.google.com') return true
    return false
  } catch {
    return false
  }
}
