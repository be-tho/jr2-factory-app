import { supabase } from '../../../lib/supabase/client'

const PRODUCTS_BUCKET = 'products'

export async function uploadProductImage(file: File, filePath: string) {
  const { data, error } = await supabase.storage
    .from(PRODUCTS_BUCKET)
    .upload(filePath, file, { upsert: false })

  if (error) throw error
  return data
}

export function getProductImagePublicUrl(path: string) {
  const { data } = supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
