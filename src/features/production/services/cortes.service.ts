import { supabase } from '../../../lib/supabase/client'
import type { Corte, CorteArticuloEmbed, CorteColor, CorteEstado, CorteRow } from '../../../types/database'

const TABLE = 'cortes'

const CORTE_SELECT = `
  *,
  corte_articulos (
    articulo_id,
    articulos ( nombre, codigo, articulo_imagenes ( storage_path, es_principal, orden ) )
  ),
  corte_colores ( id, color, cantidad )
`.trim()

// ─── Parsers ────────────────────────────────────────────────────────────────

function pickCoverFromImagenes(
  imagenes: { storage_path: string; es_principal: boolean; orden: number }[] | null | undefined,
): string | null {
  if (!imagenes?.length) return null
  const sorted = [...imagenes].sort((a, b) => {
    if (a.es_principal !== b.es_principal) return a.es_principal ? -1 : 1
    return a.orden - b.orden
  })
  return sorted[0]?.storage_path ?? null
}

function parseCorteArticulos(raw: unknown): CorteArticuloEmbed[] {
  if (!Array.isArray(raw)) return []
  const out: CorteArticuloEmbed[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const r = item as Record<string, unknown>
    const articulo_id = typeof r.articulo_id === 'string' ? r.articulo_id : null
    if (!articulo_id) continue
    const art = r.articulos as Record<string, unknown> | null | undefined
    const nombre = art && typeof art.nombre === 'string' ? art.nombre : ''
    const codigo = art && typeof art.codigo === 'string' ? art.codigo : ''
    const imagenes = Array.isArray(art?.articulo_imagenes) ? art?.articulo_imagenes as { storage_path: string; es_principal: boolean; orden: number }[] : null
    out.push({ articulo_id, nombre, codigo, cover_image_path: pickCoverFromImagenes(imagenes) })
  }
  return out
}

function parseCorteColores(raw: unknown): Omit<CorteColor, 'corte_id'>[] {
  if (!Array.isArray(raw)) return []
  const out: Omit<CorteColor, 'corte_id'>[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const r = item as Record<string, unknown>
    const id = typeof r.id === 'string' ? r.id : ''
    const color = typeof r.color === 'string' ? r.color : ''
    const cantidad = typeof r.cantidad === 'number' ? r.cantidad : Number(r.cantidad)
    if (!color || !Number.isFinite(cantidad) || cantidad <= 0) continue
    out.push({ id, color, cantidad })
  }
  return out
}

function parseCorteRow(raw: unknown): Corte | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  const id = typeof r.id === 'string' ? r.id : null
  const numero_corte = typeof r.numero_corte === 'string' ? r.numero_corte : null
  const tipo_tela = typeof r.tipo_tela === 'string' ? r.tipo_tela : null
  const cantidad_total = typeof r.cantidad_total === 'number' ? r.cantidad_total : Number(r.cantidad_total)
  if (!id || !numero_corte || !tipo_tela || !Number.isFinite(cantidad_total)) return null

  const estadoRaw = typeof r.estado === 'string' ? r.estado : 'pendiente'
  const validEstados: CorteEstado[] = ['pendiente', 'en_proceso', 'completado', 'cancelado']
  const estado: CorteEstado = validEstados.includes(estadoRaw as CorteEstado)
    ? (estadoRaw as CorteEstado)
    : 'pendiente'

  const fecha = typeof r.fecha === 'string' ? r.fecha : new Date().toISOString().slice(0, 10)
  const created_at = typeof r.created_at === 'string' ? r.created_at : new Date().toISOString()
  const updated_at = typeof r.updated_at === 'string' ? r.updated_at : created_at

  const base: CorteRow = {
    id,
    numero_corte,
    tipo_tela,
    cantidad_total,
    costureros: typeof r.costureros === 'string' ? r.costureros : null,
    estado,
    fecha,
    descripcion: typeof r.descripcion === 'string' ? r.descripcion : null,
    imagen_path: typeof r.imagen_path === 'string' ? r.imagen_path : null,
    created_at,
    updated_at,
  }

  return {
    ...base,
    articulos: parseCorteArticulos(r.corte_articulos),
    colores: parseCorteColores(r.corte_colores),
  }
}

// ─── Input types ─────────────────────────────────────────────────────────────

export interface CorteColorInput {
  color: string
  cantidad: number
}

export interface NewCorteInput {
  numero_corte: string
  tipo_tela: string
  cantidad_total: number
  costureros?: string | null
  estado?: CorteEstado
  fecha: string
  descripcion?: string | null
  imagen_path?: string | null
  articulo_ids: string[]
  colores: CorteColorInput[]
}

export type UpdateCorteInput = NewCorteInput

// ─── Service functions ───────────────────────────────────────────────────────

export async function listCortes(): Promise<{ data: Corte[]; error: Error | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(CORTE_SELECT)
    .order('created_at', { ascending: false })

  if (error) return { data: [], error: new Error(error.message) }

  const rows = (data ?? []).map(parseCorteRow).filter((x): x is Corte => x != null)
  return { data: rows, error: null }
}

export async function getCorteById(id: string): Promise<{ data: Corte | null; error: Error | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(CORTE_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) return { data: null, error: new Error(error.message) }

  return { data: parseCorteRow(data), error: null }
}

export async function createCorte(input: NewCorteInput): Promise<{ data: Corte | null; error: Error | null }> {
  const { data: corteData, error: corteError } = await supabase
    .from(TABLE)
    .insert({
      numero_corte: input.numero_corte.trim(),
      tipo_tela: input.tipo_tela.trim(),
      cantidad_total: input.cantidad_total,
      costureros: input.costureros?.trim() || null,
      estado: input.estado ?? 'pendiente',
      fecha: input.fecha,
      descripcion: input.descripcion?.trim() || null,
      imagen_path: input.imagen_path ?? null,
    })
    .select('id')
    .single()

  if (corteError) return { data: null, error: new Error(corteError.message) }

  const corteId = (corteData as { id: string }).id

  if (input.articulo_ids.length > 0) {
    const { error: artError } = await supabase.from('corte_articulos').insert(
      input.articulo_ids.map((articulo_id) => ({ corte_id: corteId, articulo_id })),
    )
    if (artError) {
      await supabase.from(TABLE).delete().eq('id', corteId)
      return { data: null, error: new Error(artError.message) }
    }
  }

  if (input.colores.length > 0) {
    const { error: colError } = await supabase.from('corte_colores').insert(
      input.colores.map((c) => ({ corte_id: corteId, color: c.color.trim(), cantidad: c.cantidad })),
    )
    if (colError) {
      await supabase.from(TABLE).delete().eq('id', corteId)
      return { data: null, error: new Error(colError.message) }
    }
  }

  return getCorteById(corteId)
}

export async function updateCorte(
  id: string,
  input: UpdateCorteInput,
): Promise<{ data: Corte | null; error: Error | null }> {
  const { error: corteError } = await supabase
    .from(TABLE)
    .update({
      numero_corte: input.numero_corte.trim(),
      tipo_tela: input.tipo_tela.trim(),
      cantidad_total: input.cantidad_total,
      costureros: input.costureros?.trim() || null,
      estado: input.estado ?? 'pendiente',
      fecha: input.fecha,
      descripcion: input.descripcion?.trim() || null,
      imagen_path: input.imagen_path ?? null,
    })
    .eq('id', id)

  if (corteError) return { data: null, error: new Error(corteError.message) }

  const { error: delArtError } = await supabase.from('corte_articulos').delete().eq('corte_id', id)
  if (delArtError) return { data: null, error: new Error(delArtError.message) }

  const { error: delColError } = await supabase.from('corte_colores').delete().eq('corte_id', id)
  if (delColError) return { data: null, error: new Error(delColError.message) }

  if (input.articulo_ids.length > 0) {
    const { error: artError } = await supabase.from('corte_articulos').insert(
      input.articulo_ids.map((articulo_id) => ({ corte_id: id, articulo_id })),
    )
    if (artError) return { data: null, error: new Error(artError.message) }
  }

  if (input.colores.length > 0) {
    const { error: colError } = await supabase.from('corte_colores').insert(
      input.colores.map((c) => ({ corte_id: id, color: c.color.trim(), cantidad: c.cantidad })),
    )
    if (colError) return { data: null, error: new Error(colError.message) }
  }

  return getCorteById(id)
}

export async function patchCorteImagePath(
  id: string,
  imagenPath: string,
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from(TABLE)
    .update({ imagen_path: imagenPath })
    .eq('id', id)
  if (error) return { error: new Error(error.message) }
  return { error: null }
}

export async function deleteCorte(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) return { error: new Error(error.message) }
  return { error: null }
}
