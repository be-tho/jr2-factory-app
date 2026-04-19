import { supabase } from '../../../lib/supabase/client'
import { isProvinciaArgentina, type ProvinciaArgentina } from '../../../lib/argentina-provincias'
import type { ClienteEnvio } from '../../../types/database'

const TABLE = 'clientes_envio'

function parseClienteEnvio(raw: unknown): ClienteEnvio | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  const id = typeof r.id === 'string' ? r.id : null
  const nombre_empresa = typeof r.nombre_empresa === 'string' ? r.nombre_empresa : null
  const direccion = typeof r.direccion === 'string' ? r.direccion : null
  const provinciaRaw = typeof r.provincia === 'string' ? r.provincia : null
  const maps_url = typeof r.maps_url === 'string' ? r.maps_url : null
  const zonas_envio = typeof r.zonas_envio === 'string' ? r.zonas_envio : null

  if (!id || !nombre_empresa || !direccion || !provinciaRaw || !maps_url || !zonas_envio) return null

  const provincia: ProvinciaArgentina = isProvinciaArgentina(provinciaRaw) ? provinciaRaw : 'Otro'

  return {
    id,
    nombre_empresa,
    direccion,
    localidad: typeof r.localidad === 'string' ? r.localidad : null,
    provincia,
    maps_url,
    maps_embed_url: typeof r.maps_embed_url === 'string' ? r.maps_embed_url : null,
    zonas_envio,
    notas: typeof r.notas === 'string' ? r.notas : null,
    activo: typeof r.activo === 'boolean' ? r.activo : true,
    created_at: typeof r.created_at === 'string' ? r.created_at : new Date().toISOString(),
    updated_at: typeof r.updated_at === 'string' ? r.updated_at : new Date().toISOString(),
  }
}

export interface ClienteEnvioInput {
  nombre_empresa: string
  direccion: string
  localidad?: string | null
  provincia: ProvinciaArgentina
  maps_url: string
  maps_embed_url?: string | null
  zonas_envio: string
  notas?: string | null
  activo?: boolean
}

export async function listClientesEnvio(): Promise<{ data: ClienteEnvio[]; error: Error | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('nombre_empresa', { ascending: true })

  if (error) return { data: [], error: new Error(error.message) }
  const rows = (data ?? []).map(parseClienteEnvio).filter((x): x is ClienteEnvio => x != null)
  return { data: rows, error: null }
}

export async function getClienteEnvioById(id: string): Promise<{ data: ClienteEnvio | null; error: Error | null }> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()
  if (error) return { data: null, error: new Error(error.message) }
  return { data: parseClienteEnvio(data), error: null }
}

export async function createClienteEnvio(
  input: ClienteEnvioInput,
): Promise<{ data: ClienteEnvio | null; error: Error | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      nombre_empresa: input.nombre_empresa.trim(),
      direccion: input.direccion.trim(),
      localidad: input.localidad?.trim() || null,
      provincia: input.provincia,
      maps_url: input.maps_url.trim(),
      maps_embed_url: input.maps_embed_url?.trim() || null,
      zonas_envio: input.zonas_envio.trim(),
      notas: input.notas?.trim() || null,
      activo: input.activo ?? true,
    })
    .select('*')
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: parseClienteEnvio(data), error: null }
}

export async function updateClienteEnvio(
  id: string,
  input: ClienteEnvioInput,
): Promise<{ data: ClienteEnvio | null; error: Error | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      nombre_empresa: input.nombre_empresa.trim(),
      direccion: input.direccion.trim(),
      localidad: input.localidad?.trim() || null,
      provincia: input.provincia,
      maps_url: input.maps_url.trim(),
      maps_embed_url: input.maps_embed_url?.trim() || null,
      zonas_envio: input.zonas_envio.trim(),
      notas: input.notas?.trim() || null,
      activo: input.activo ?? true,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: parseClienteEnvio(data), error: null }
}

export async function deleteClienteEnvio(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) return { error: new Error(error.message) }
  return { error: null }
}

export async function toggleClienteEnvioActivo(
  id: string,
  activo: boolean,
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from(TABLE).update({ activo }).eq('id', id)
  if (error) return { error: new Error(error.message) }
  return { error: null }
}
