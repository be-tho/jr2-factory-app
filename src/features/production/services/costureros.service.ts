import { supabase } from '../../../lib/supabase/client'
import type { Costurero, TipoDocumento } from '../../../types/database'

const TABLE = 'costureros'

const VALID_TIPOS: TipoDocumento[] = ['DNI', 'CUIL', 'CUIT']

function parseCosturero(raw: unknown): Costurero | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  const id = typeof r.id === 'string' ? r.id : null
  const nombre_completo = typeof r.nombre_completo === 'string' ? r.nombre_completo : null
  const numero_documento = typeof r.numero_documento === 'string' ? r.numero_documento : null
  if (!id || !nombre_completo || !numero_documento) return null

  const tipoRaw = typeof r.tipo_documento === 'string' ? r.tipo_documento : 'DNI'
  const tipo_documento: TipoDocumento = VALID_TIPOS.includes(tipoRaw as TipoDocumento)
    ? (tipoRaw as TipoDocumento)
    : 'DNI'

  return {
    id,
    nombre_completo,
    telefono: typeof r.telefono === 'string' ? r.telefono : null,
    email: typeof r.email === 'string' ? r.email : null,
    direccion: typeof r.direccion === 'string' ? r.direccion : null,
    tipo_documento,
    numero_documento,
    cbu_alias: typeof r.cbu_alias === 'string' ? r.cbu_alias : null,
    notas: typeof r.notas === 'string' ? r.notas : null,
    activo: typeof r.activo === 'boolean' ? r.activo : true,
    created_at: typeof r.created_at === 'string' ? r.created_at : new Date().toISOString(),
    updated_at: typeof r.updated_at === 'string' ? r.updated_at : new Date().toISOString(),
  }
}

// ─── Input types ─────────────────────────────────────────────────────────────

export interface CostureroInput {
  nombre_completo: string
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  tipo_documento: TipoDocumento
  numero_documento: string
  cbu_alias?: string | null
  notas?: string | null
  activo?: boolean
}

// ─── Service functions ───────────────────────────────────────────────────────

export async function listCostureros(): Promise<{ data: Costurero[]; error: Error | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('nombre_completo', { ascending: true })

  if (error) return { data: [], error: new Error(error.message) }
  const rows = (data ?? []).map(parseCosturero).filter((x): x is Costurero => x != null)
  return { data: rows, error: null }
}

export async function getCostureroById(id: string): Promise<{ data: Costurero | null; error: Error | null }> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()
  if (error) return { data: null, error: new Error(error.message) }
  return { data: parseCosturero(data), error: null }
}

export async function createCosturero(
  input: CostureroInput,
): Promise<{ data: Costurero | null; error: Error | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      nombre_completo: input.nombre_completo.trim(),
      telefono: input.telefono?.trim() || null,
      email: input.email?.trim() || null,
      direccion: input.direccion?.trim() || null,
      tipo_documento: input.tipo_documento,
      numero_documento: input.numero_documento.trim(),
      cbu_alias: input.cbu_alias?.trim() || null,
      notas: input.notas?.trim() || null,
      activo: input.activo ?? true,
    })
    .select('*')
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: parseCosturero(data), error: null }
}

export async function updateCosturero(
  id: string,
  input: CostureroInput,
): Promise<{ data: Costurero | null; error: Error | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      nombre_completo: input.nombre_completo.trim(),
      telefono: input.telefono?.trim() || null,
      email: input.email?.trim() || null,
      direccion: input.direccion?.trim() || null,
      tipo_documento: input.tipo_documento,
      numero_documento: input.numero_documento.trim(),
      cbu_alias: input.cbu_alias?.trim() || null,
      notas: input.notas?.trim() || null,
      activo: input.activo ?? true,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: parseCosturero(data), error: null }
}

export async function deleteCosturero(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) return { error: new Error(error.message) }
  return { error: null }
}

export async function toggleCostureroActivo(
  id: string,
  activo: boolean,
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from(TABLE).update({ activo }).eq('id', id)
  if (error) return { error: new Error(error.message) }
  return { error: null }
}
