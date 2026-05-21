import {
  loadDefaultArticleImageFile,
  removeProductImage,
  uploadDefaultArticlePlaceholder,
  uploadProductImage,
  validateImageFile,
} from '../../media/services/storage.service'
import { createArticuloImagen } from './articulo-imagenes.service'

export async function attachCustomArticleCover(articuloId: string, file: File): Promise<void> {
  const v = validateImageFile(file)
  if (v) throw new Error(v)
  const { path } = await uploadProductImage(articuloId, file)
  const { error: insErr } = await createArticuloImagen({
    articulo_id: articuloId,
    storage_path: path,
    es_principal: true,
    orden: 0,
  })
  if (insErr) {
    await removeProductImage(path).catch(() => {})
    throw new Error(insErr.message)
  }
}

/** Sube la imagen por defecto (WebP) y registra la fila principal en `articulo_imagenes`. */
export async function attachDefaultArticleCover(articuloId: string): Promise<void> {
  const file = await loadDefaultArticleImageFile()
  const { path } = await uploadDefaultArticlePlaceholder(articuloId, file)
  const { error: insErr } = await createArticuloImagen({
    articulo_id: articuloId,
    storage_path: path,
    es_principal: true,
    orden: 0,
  })
  if (insErr) {
    await removeProductImage(path).catch(() => {})
    throw new Error(insErr.message)
  }
}
