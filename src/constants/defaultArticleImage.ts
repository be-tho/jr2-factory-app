/** Nombre del objeto en Storage: `images/<articuloId>/default-articulo.svg`. */
export const DEFAULT_ARTICLE_STORAGE_FILE_NAME = 'default-articulo.svg'

/**
 * URL del asset en `public/` (sirve para `<img>` y para `fetch` al subir el placeholder).
 * Respeta `import.meta.env.BASE_URL` (p. ej. deploy en subcarpeta).
 */
export const DEFAULT_ARTICLE_IMAGE_PUBLIC_URL = `${import.meta.env.BASE_URL}default-articulo.svg`

export function hasStorageCoverImage(path: string | null | undefined): path is string {
  return typeof path === 'string' && path.trim().length > 0
}
