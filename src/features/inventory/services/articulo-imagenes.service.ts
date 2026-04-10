import { supabase } from '../../../lib/supabase/client'
import type { ProductImage } from '../../../types/database'

const TABLE = 'articulo_imagenes'

export async function listArticuloImagenes(
  articuloId: string
): Promise<{ data: ProductImage[]; error: Error | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('articulo_id', articuloId)
    .order('orden', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return { data: [], error: new Error(error.message) }
  return { data: (data ?? []) as ProductImage[], error: null }
}

export async function createArticuloImagen(input: {
  articulo_id: string
  storage_path: string
  es_principal: boolean
  orden: number
  alt_text?: string | null
}): Promise<{ data: ProductImage | null; error: Error | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      articulo_id: input.articulo_id,
      storage_path: input.storage_path,
      es_principal: input.es_principal,
      orden: input.orden,
      alt_text: input.alt_text ?? null,
    })
    .select()
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: data as ProductImage, error: null }
}

export async function deleteArticuloImagen(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) return { error: new Error(error.message) }
  return { error: null }
}
