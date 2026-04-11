import { supabase } from '../../../lib/supabase/client'
import type { CategoriaRow } from '../../../types/database'

const TABLE = 'categorias'

function parseCategoriaRow(raw: unknown): CategoriaRow | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const id = r.id
  const nombre = r.nombre
  if (typeof id !== 'string' || typeof nombre !== 'string') return null
  const activo = typeof r.activo === 'boolean' ? r.activo : Boolean(r.activo)
  return { id, nombre, activo }
}

/** Solo categorías activas — para selects en artículos. */
export async function listCategorias(): Promise<{ data: CategoriaRow[]; error: Error | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, nombre, activo')
    .eq('activo', true)
    .order('nombre')

  if (error) return { data: [], error: new Error(error.message) }
  const rows = (data ?? []).map(parseCategoriaRow).filter((x): x is CategoriaRow => x != null)
  return { data: rows, error: null }
}

/** Todas las categorías — para administración. */
export async function listCategoriasAdmin(): Promise<{ data: CategoriaRow[]; error: Error | null }> {
  const { data, error } = await supabase.from(TABLE).select('id, nombre, activo').order('nombre')

  if (error) return { data: [], error: new Error(error.message) }
  const rows = (data ?? []).map(parseCategoriaRow).filter((x): x is CategoriaRow => x != null)
  return { data: rows, error: null }
}

export async function getCategoriaById(id: string): Promise<{ data: CategoriaRow | null; error: Error | null }> {
  const { data, error } = await supabase.from(TABLE).select('id, nombre, activo').eq('id', id).maybeSingle()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: parseCategoriaRow(data), error: null }
}

export type NewCategoriaInput = {
  nombre: string
  activo?: boolean
}

export async function createCategoria(
  input: NewCategoriaInput
): Promise<{ data: CategoriaRow | null; error: Error | null }> {
  const nombre = input.nombre.trim()
  if (!nombre) {
    return { data: null, error: new Error('El nombre es obligatorio.') }
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ nombre, activo: input.activo ?? true })
    .select('id, nombre, activo')
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: parseCategoriaRow(data), error: null }
}

export type UpdateCategoriaInput = NewCategoriaInput

export async function updateCategoria(
  id: string,
  input: UpdateCategoriaInput
): Promise<{ data: CategoriaRow | null; error: Error | null }> {
  const nombre = input.nombre.trim()
  if (!nombre) {
    return { data: null, error: new Error('El nombre es obligatorio.') }
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update({ nombre, activo: input.activo ?? true })
    .eq('id', id)
    .select('id, nombre, activo')
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: parseCategoriaRow(data), error: null }
}

async function countArticulosByCategoria(categoriaId: string): Promise<{ count: number; error: Error | null }> {
  const { count, error } = await supabase
    .from('articulos')
    .select('id', { count: 'exact', head: true })
    .eq('categoria_id', categoriaId)

  if (error) return { count: 0, error: new Error(error.message) }
  return { count: count ?? 0, error: null }
}

export async function deleteCategoria(id: string): Promise<{ error: Error | null }> {
  const { count, error: countErr } = await countArticulosByCategoria(id)
  if (countErr) return { error: countErr }
  if (count > 0) {
    return {
      error: new Error(
        `No se puede eliminar: hay ${count} artículo(s) con esta categoría. Desactivala en su lugar.`,
      ),
    }
  }

  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) return { error: new Error(error.message) }
  return { error: null }
}
