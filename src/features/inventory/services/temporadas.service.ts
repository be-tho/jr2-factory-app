import { supabase } from '../../../lib/supabase/client'
import type { TemporadaRow } from '../../../types/database'

const TABLE = 'temporadas'

function parseTemporadaRow(raw: unknown): TemporadaRow | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const id = r.id
  const nombre = r.nombre
  if (typeof id !== 'string' || typeof nombre !== 'string') return null
  const activo = typeof r.activo === 'boolean' ? r.activo : Boolean(r.activo)
  return { id, nombre, activo }
}

/** Solo temporadas activas — para selects en artículos. */
export async function listTemporadas(): Promise<{ data: TemporadaRow[]; error: Error | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, nombre, activo')
    .eq('activo', true)
    .order('nombre')

  if (error) return { data: [], error: new Error(error.message) }
  const rows = (data ?? []).map(parseTemporadaRow).filter((x): x is TemporadaRow => x != null)
  return { data: rows, error: null }
}

/** Todas las temporadas — para administración. */
export async function listTemporadasAdmin(): Promise<{ data: TemporadaRow[]; error: Error | null }> {
  const { data, error } = await supabase.from(TABLE).select('id, nombre, activo').order('nombre')

  if (error) return { data: [], error: new Error(error.message) }
  const rows = (data ?? []).map(parseTemporadaRow).filter((x): x is TemporadaRow => x != null)
  return { data: rows, error: null }
}

export async function getTemporadaById(id: string): Promise<{ data: TemporadaRow | null; error: Error | null }> {
  const { data, error } = await supabase.from(TABLE).select('id, nombre, activo').eq('id', id).maybeSingle()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: parseTemporadaRow(data), error: null }
}

export type NewTemporadaInput = {
  nombre: string
  activo?: boolean
}

export async function createTemporada(
  input: NewTemporadaInput
): Promise<{ data: TemporadaRow | null; error: Error | null }> {
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
  return { data: parseTemporadaRow(data), error: null }
}

export type UpdateTemporadaInput = NewTemporadaInput

export async function updateTemporada(
  id: string,
  input: UpdateTemporadaInput
): Promise<{ data: TemporadaRow | null; error: Error | null }> {
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
  return { data: parseTemporadaRow(data), error: null }
}

async function countArticulosByTemporada(temporadaId: string): Promise<{ count: number; error: Error | null }> {
  const { count, error } = await supabase
    .from('articulos')
    .select('id', { count: 'exact', head: true })
    .eq('temporada_id', temporadaId)

  if (error) return { count: 0, error: new Error(error.message) }
  return { count: count ?? 0, error: null }
}

export async function deleteTemporada(id: string): Promise<{ error: Error | null }> {
  const { count, error: countErr } = await countArticulosByTemporada(id)
  if (countErr) return { error: countErr }
  if (count > 0) {
    return {
      error: new Error(
        `No se puede eliminar: hay ${count} artículo(s) con esta temporada. Desactivala en su lugar.`,
      ),
    }
  }

  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) return { error: new Error(error.message) }
  return { error: null }
}
