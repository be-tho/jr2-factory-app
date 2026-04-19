import { supabase } from '../../../lib/supabase/client'
import type { MedioPagoVenta, OrdenVentaEstado, OrdenVentaItemRow, OrdenVentaRow } from '../../../types/database'

const TABLE_ORDEN = 'ordenes_venta'
const TABLE_ITEMS = 'ordenes_venta_items'

export type CreateOrdenVentaItemInput = {
  articulo_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export type CreateOrdenVentaInput = {
  cliente_nombre: string
  cliente_telefono: string | null
  medio_pago: MedioPagoVenta
  items: CreateOrdenVentaItemInput[]
}

export type UpdateOrdenVentaInput = CreateOrdenVentaInput

export type OrdenVentaWithItems = {
  orden: OrdenVentaRow
  items: OrdenVentaItemRow[]
}

function num(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function parseOrdenRow(raw: Record<string, unknown>): OrdenVentaRow | null {
  const id = raw.id
  if (typeof id !== 'string') return null
  const cliente_nombre = raw.cliente_nombre
  const medio_pago = raw.medio_pago
  const estado = raw.estado
  const created_by = raw.created_by
  const created_at = raw.created_at
  const updated_at = raw.updated_at
  if (
    typeof cliente_nombre !== 'string' ||
    (medio_pago !== 'efectivo' && medio_pago !== 'transferencia') ||
    (estado !== 'pendiente' && estado !== 'pagado') ||
    typeof created_by !== 'string' ||
    typeof created_at !== 'string' ||
    typeof updated_at !== 'string'
  ) {
    return null
  }
  const cliente_telefono =
    raw.cliente_telefono === null || raw.cliente_telefono === undefined
      ? null
      : typeof raw.cliente_telefono === 'string'
        ? raw.cliente_telefono
        : null
  const pagado_at =
    raw.pagado_at === null || raw.pagado_at === undefined
      ? null
      : typeof raw.pagado_at === 'string'
        ? raw.pagado_at
        : null

  return {
    id,
    cliente_nombre,
    cliente_telefono,
    medio_pago,
    total: num(raw.total),
    estado: estado as OrdenVentaEstado,
    pagado_at,
    created_by,
    created_at,
    updated_at,
  }
}

function parseItemRow(raw: Record<string, unknown>): OrdenVentaItemRow | null {
  const id = raw.id
  const orden_id = raw.orden_id
  const articulo_id = raw.articulo_id
  if (typeof id !== 'string' || typeof orden_id !== 'string' || typeof articulo_id !== 'string') return null
  return {
    id,
    orden_id,
    articulo_id,
    cantidad: Math.max(1, Math.floor(num(raw.cantidad))),
    precio_unitario: num(raw.precio_unitario),
    subtotal: num(raw.subtotal),
  }
}

export async function listOrdenesVentaByEstado(
  estado: OrdenVentaEstado,
): Promise<{ data: OrdenVentaRow[]; error: Error | null }> {
  const { data, error } = await supabase
    .from(TABLE_ORDEN)
    .select('*')
    .eq('estado', estado)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: new Error(error.message) }
  }

  const rows = (data ?? []).map((r) => parseOrdenRow(r as Record<string, unknown>)).filter((x): x is OrdenVentaRow => x != null)
  return { data: rows, error: null }
}

export async function getOrdenVentaWithItems(
  id: string,
): Promise<{ data: OrdenVentaWithItems | null; error: Error | null }> {
  const { data: ordenRaw, error: e1 } = await supabase.from(TABLE_ORDEN).select('*').eq('id', id).maybeSingle()

  if (e1) {
    return { data: null, error: new Error(e1.message) }
  }
  if (!ordenRaw) {
    return { data: null, error: null }
  }

  const orden = parseOrdenRow(ordenRaw as Record<string, unknown>)
  if (!orden) {
    return { data: null, error: new Error('Orden inválida.') }
  }

  const { data: itemsRaw, error: e2 } = await supabase.from(TABLE_ITEMS).select('*').eq('orden_id', id)

  if (e2) {
    return { data: null, error: new Error(e2.message) }
  }

  const items = (itemsRaw ?? []).map((r) => parseItemRow(r as Record<string, unknown>)).filter((x): x is OrdenVentaItemRow => x != null)

  return { data: { orden, items }, error: null }
}

export async function createOrdenVenta(
  input: CreateOrdenVentaInput,
): Promise<{ data: { id: string } | null; error: Error | null }> {
  const nombre = input.cliente_nombre.trim()
  if (nombre.length < 2) return { data: null, error: new Error('Ingresá el nombre del cliente.') }
  if (!input.items.length) return { data: null, error: new Error('El carrito está vacío.') }

  const total = input.items.reduce((s, i) => s + i.subtotal, 0)
  if (total <= 0) return { data: null, error: new Error('El total de la venta no es válido.') }

  const { data: orden, error: e1 } = await supabase
    .from(TABLE_ORDEN)
    .insert({
      cliente_nombre: nombre,
      cliente_telefono: input.cliente_telefono?.trim() || null,
      medio_pago: input.medio_pago,
      total,
      estado: 'pendiente',
    })
    .select('id')
    .single()

  if (e1 || !orden) {
    return { data: null, error: new Error(e1?.message ?? 'No se pudo crear la orden.') }
  }

  const ordenId = (orden as { id: string }).id

  const rows = input.items.map((i) => ({
    orden_id: ordenId,
    articulo_id: i.articulo_id,
    cantidad: i.cantidad,
    precio_unitario: i.precio_unitario,
    subtotal: i.subtotal,
  }))

  const { error: e2 } = await supabase.from(TABLE_ITEMS).insert(rows)

  if (e2) {
    await supabase.from(TABLE_ORDEN).delete().eq('id', ordenId)
    return { data: null, error: new Error(e2.message) }
  }

  return { data: { id: ordenId }, error: null }
}

export async function updateOrdenVenta(
  id: string,
  input: UpdateOrdenVentaInput,
): Promise<{ data: OrdenVentaRow | null; error: Error | null }> {
  const nombre = input.cliente_nombre.trim()
  if (nombre.length < 2) return { data: null, error: new Error('Ingresá el nombre del cliente.') }
  if (!input.items.length) return { data: null, error: new Error('La orden debe tener al menos un artículo.') }

  const total = input.items.reduce((s, i) => s + i.subtotal, 0)
  if (total <= 0) return { data: null, error: new Error('El total de la venta no es válido.') }

  const existing = await getOrdenVentaWithItems(id)
  if (existing.error) return { data: null, error: existing.error }
  if (!existing.data) return { data: null, error: new Error('No se encontró la orden.') }
  if (existing.data.orden.estado !== 'pendiente') {
    return { data: null, error: new Error('Solo se pueden editar órdenes pendientes de cobro.') }
  }

  const { error: e1 } = await supabase
    .from(TABLE_ORDEN)
    .update({
      cliente_nombre: nombre,
      cliente_telefono: input.cliente_telefono?.trim() || null,
      medio_pago: input.medio_pago,
      total,
    })
    .eq('id', id)
    .eq('estado', 'pendiente')

  if (e1) {
    return { data: null, error: new Error(e1.message) }
  }

  const { error: delErr } = await supabase.from(TABLE_ITEMS).delete().eq('orden_id', id)
  if (delErr) {
    return { data: null, error: new Error(delErr.message) }
  }

  const rows = input.items.map((i) => ({
    orden_id: id,
    articulo_id: i.articulo_id,
    cantidad: i.cantidad,
    precio_unitario: i.precio_unitario,
    subtotal: i.subtotal,
  }))

  const { error: insErr } = await supabase.from(TABLE_ITEMS).insert(rows)
  if (insErr) {
    return { data: null, error: new Error(insErr.message) }
  }

  const refreshed = await getOrdenVentaWithItems(id)
  return { data: refreshed.data?.orden ?? null, error: refreshed.error }
}

export async function marcarOrdenVentaPagada(
  id: string,
): Promise<{ data: OrdenVentaRow | null; error: Error | null }> {
  const existing = await getOrdenVentaWithItems(id)
  if (existing.error) return { data: null, error: existing.error }
  if (!existing.data) return { data: null, error: new Error('No se encontró la orden.') }
  if (existing.data.orden.estado !== 'pendiente') {
    return { data: null, error: new Error('La orden ya no está pendiente.') }
  }

  const now = new Date().toISOString()
  const { data: upd, error: e1 } = await supabase
    .from(TABLE_ORDEN)
    .update({
      estado: 'pagado',
      pagado_at: now,
    })
    .eq('id', id)
    .eq('estado', 'pendiente')
    .select('*')
    .maybeSingle()

  if (e1) return { data: null, error: new Error(e1.message) }
  const row = upd ? parseOrdenRow(upd as Record<string, unknown>) : null
  return { data: row, error: null }
}
